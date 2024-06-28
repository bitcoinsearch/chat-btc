import { COMPLETION_URL, TOKEN_UPPER_LIMIT } from "@/config/chatAPI-config";
import ERROR_MESSAGES from "@/config/error-config";
import { buildChatMessages } from "@/service/chat/history";
import { ChatHistory } from "@/types";
import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";
import { createReadableStream } from "./stream";
import { promptTokensEstimate } from "openai-chat-tokens"

interface ElementType {
  type: "paragraph" | "heading";
  text: string;
}

interface CustomContent {
  title: string;
  snippet: string;
  link: string;
}

interface EnforceTokenParams {
  question: string;
  slicedTextWithLink: SummaryData[];
  chatHistory: ChatHistory[]
}

interface EnforceTokenLimitReturnType {
  slicedTextWithLink: SummaryData[];
  messages: ChatHistory[];
  tokenLength: number;
}
export interface Result {
  _source: {
    title: string;
    body: string;
    url: string;
    body_type: string;
    type?: string; // Added the 'type' property as optional
    summary?: string;
  };
}

interface SummaryData {
  link: string;
  cleaned_text: string;
}

function concatenateTextFields(data: string | ElementType[]): string {
  let concatenatedText = "";

  let elementArray: ElementType[];

  // Check whether data is JSON string
  if(typeof data === "string") {
    try {
      elementArray = JSON.parse(data);
    }
    catch(e) {
      // If it's not a JSON string. Then, consider the whole string as text.
      return data;
    }
  } else {
    // If data is already an array
    elementArray = data;
  }

  // If data is an array of `ElementType`
  elementArray.forEach((element: ElementType) => {
    if(element.type === "paragraph") {
        concatenatedText += element.text + " ";
    } else if(element.type === "heading") {
        concatenatedText += "\n\n" + element.text + "\n\n";
    }
  });
    return concatenatedText.trim();
  }


function cleanText(text: string): string {
  text = text.replace(/[^\w\s.]/g, "").replace(/\s+/g, " ");
  return text;
}

const generateContextBlock = (summaries: SummaryData[]): string => {
  let prompt = `===== START CONTEXT BLOCK ===== \n`;

  summaries.forEach((d: SummaryData, i: number) => {
    if (i > 0) {
      prompt += "\n";
    }
    prompt += `link [${i}]: ${(d.link).trim()}\n`;
    prompt += `content: ${d.cleaned_text.replaceAll("\n", " ")}\n`;
  });
  prompt += `===== END CONTEXT BLOCK =====`;
  return prompt;
};


  async function SummaryGenerate(
    link: SummaryData[],
    messages: ChatHistory[],
    retry: number = 0
  ): Promise<ReadableStream<any>> {
    try {
      const payload = {
        model: process.env.OPENAI_MODEL,
        messages,
        temperature: 0.7,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 1,
        max_tokens: 700,
        stream: true,
      };
      const payloadJSON = JSON.stringify(payload)
      
      const response = await fetch(COMPLETION_URL,{
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
          },
          method: "POST",
          body: payloadJSON,
        }
        );
      
      if (!response.ok) {
        return createReadableStream(ERROR_MESSAGES.NO_RESPONSE);
      }

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      const stream = new ReadableStream({
        async start(controller) {
          function onParse(event: ParsedEvent | ReconnectInterval) {
            if (event.type === "event") {
              const data = event.data;
              let text = ""
              try {
                if (data === "[DONE]") {
                  text = formatLinksToSourcesList(link)
                  const queue = encoder.encode(text);
                  controller.enqueue(queue);
                  controller.close()
                  return;
                }
                const jsonData = JSON.parse(data)
                text = jsonData?.choices[0]?.delta?.content || ''
                
                const queue = encoder.encode(text);
                controller.enqueue(queue);
              } catch (e) {
                controller.close()
              }
            }
          }
          const parser = createParser(onParse);
          // https://web.dev/streams/#asynchronous-iteration
          for await (const chunk of response.body as any) {
            parser.feed(decoder.decode(chunk));
          }
        }
      })

      return stream

    } catch (error) {
      if (retry < 2) {
        return SummaryGenerate(link, messages, retry + 1);
      } else {
        return createReadableStream(ERROR_MESSAGES.OVERLOAD);
      }
    }
  }

function removeDuplicatesByID(arr: CustomContent[]): CustomContent[] {
  const seen = new Set();
  const filteredArr = arr.filter((item) => {
    const isDuplicate = seen.has(item.link);
    if (!isDuplicate) {
      seen.add(item.link);
    }
    return !isDuplicate;
  });
  return filteredArr;
}

function formatLinksToSourcesList(
  content: SummaryData[]
) {
  let sourcesListString = "\n\n";

  content.forEach((d: SummaryData, i: number) => {
    sourcesListString += `[${i}]: ${d.link}\n`;
  });

  return sourcesListString;
}

export async function processInput(
  searchResults: Result[] | undefined,
  question: string,
  chatHistory: ChatHistory[]
) {
  try {
    if (!searchResults?.length) {
      let output_string: string = ERROR_MESSAGES.NO_ANSWER;
      return createReadableStream(output_string);
    } else {
      const intermediateContent: CustomContent[] = []

      for (const result of searchResults) {
        let { _source: source} = result
        const isQuestionOnStackExchange =
        source.type === "question" &&
        source.url.includes("stackexchange");
        if (!isQuestionOnStackExchange) {
          const isMarkdown = source.body_type === "markdown";
          const snippet = isMarkdown
          ? concatenateTextFields(source.body)
          : source.body;
          intermediateContent.push({
            title: source.title,
            snippet: snippet,
            link: source.url,
          });
        }
      }

      const deduplicatedContent = removeDuplicatesByID(intermediateContent);

      if (!deduplicatedContent.length) {
        throw new Error(ERROR_MESSAGES.NO_ANSWER)
      }

      const slicedTextWithLink: SummaryData[] = deduplicatedContent.map(
        (content) => ({
          cleaned_text: cleanText(content.snippet),
          link: content.link,
        })
      );

      const {messages, slicedTextWithLink: finalSources} = enforceTokenLimit({question, slicedTextWithLink, chatHistory})

      // call test endpoint
      await fetch('https://moving-classic-civet.ngrok-free.app/ping/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const summary = await SummaryGenerate(finalSources, messages);
      return summary
    }
  } catch (error: any) {
    const errMessage = error?.message ? error.message : ERROR_MESSAGES.OVERLOAD
    throw new Error(errMessage)
  }
}

function enforceTokenLimit ({question, slicedTextWithLink, chatHistory}: EnforceTokenParams): EnforceTokenLimitReturnType {
  const messages = buildChatMessages({question, context: generateContextBlock(slicedTextWithLink), messages: chatHistory })
  let tokenLength = promptTokensEstimate({messages})
  console.log({tokenLength})
  if (tokenLength > TOKEN_UPPER_LIMIT) {
    slicedTextWithLink.pop()
    chatHistory.length>4 && chatHistory.shift()
    return enforceTokenLimit({question, slicedTextWithLink, chatHistory})
  }
  return {slicedTextWithLink, messages, tokenLength}
}