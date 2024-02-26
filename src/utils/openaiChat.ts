import ERROR_MESSAGES from "@/config/error-config";
import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";
import { createReadableStream } from "./stream";

interface ElementType {
  type: "paragraph" | "heading";
  text: string;
}

interface CustomContent {
  title: string;
  snippet: string;
  link: string;
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

const _example = (question: string, summaries: SummaryData[]): string => {
  let prompt = `QUESTION: ${question}\n`;
  prompt += "CONTENT:\n";
  prompt += '"""\n';
  summaries.forEach((d: SummaryData, i: number) => {
    if (i > 0) {
      prompt += "\n";
    }
    prompt += `link [${i}]: ${d.link}\n`;
    prompt += `content: ${d.cleaned_text.replaceAll("\n", " ")}\n`;
  });
  prompt += '"""\n';
  return prompt;
};


  async function SummaryGenerate(
    question: string,
    ans: string,
    link: SummaryData[],
    retry: number = 0
  ): Promise<ReadableStream<any>> {
    try {
      const payload = {
        model: process.env.OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an AI assistant providing helpful answers.",
          },
          {
            role: "user",
            content: `You are given the following extracted parts of a long document and a question. Provide a conversational detailed answer in the same writing style as based on the context provided. DO NOT include any external references or links in the answers. If you are absolutely certain that the answer cannot be found in the context below, just say '${ERROR_MESSAGES.NO_ANSWER_WITH_LINKS}' Don't try to make up an answer. If the question is not related to the context, politely respond that '${ERROR_MESSAGES.NO_ANSWER}'Question: ${question} ========= ${ans}=========. In addition, generate four follow up questions related to the answer generated. Each question should be in this format -{question_iterator}-{{QUESTION_HERE}} and each question should be seperated by a new line. DO NOT ADD AN INTRODUCTORY TEXT TO THE FOLLOW UP QUESTIONS`,
          },
        ],
        temperature: 0.7,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 1,
        max_tokens: 700,
        stream: true,
      };
      const payloadJSON = JSON.stringify(payload)
      
      const response = await fetch("https://api.openai.com/v1/chat/completions",{
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_KEY ?? ""}`,
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
                  text = getFinalAnswer("", link).data
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
        return SummaryGenerate(question, ans, link, retry + 1);
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

function getFinalAnswer(
  summary: string,
  content: SummaryData[]
) {
  let data = summary.trim() + "\n\n";

  content.forEach((d: SummaryData, i: number) => {
    data += `[${i}]: ${d.link}\n`;
  });

  return { data };
}

export async function processInput(
  searchResults: Result[] | undefined,
  question: string
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

      const slicedTextWithLink: SummaryData[] = deduplicatedContent.slice(0, 6).map(
        (content) => ({
          cleaned_text: cleanText(content.snippet).slice(0, 2000),
          link: content.link,
        })
      );

      const prompt = _example(question, slicedTextWithLink);

      const summary = await SummaryGenerate(question, prompt, slicedTextWithLink);
      return summary
    }
  } catch (error: any) {
    const errMessage = error?.message ? error.message : ERROR_MESSAGES.OVERLOAD
    throw new Error(errMessage)
  }
}
