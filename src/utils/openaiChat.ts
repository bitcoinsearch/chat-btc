interface ElementType {
  type: "paragraph" | "heading";
  text: string;
}

interface Content {
  title: string;
  snippet: string;
  link: string;
}

interface CustomContent {
  title: string;
  snippet: string;
  link: string;
}

interface Result {
  _source: {
    title: string;
    body: string;
    url: string;
    body_type: string;
    type?: string; // Added the 'type' property as optional
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

async function SummaryGenerate(question: string, ans: string): Promise<string> {
  async function SummaryGenerateCall(
    question: string,
    ans: string,
    retry: number = 0
  ): Promise<string> {
    try {
      const payload = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant providing helpful answers.",
          },
          {
            role: "user",
            content: `You are given the following extracted parts of a long document and a question. Provide a conversational detailed answer based on the context provided. DO NOT include any external references or links in the answers. If you are absolutely certain that the answer cannot be found in the context below, just say 'I cannot find the proper answer to your question. Although I'm not entirely certain, further research on the topic may provide you with more accurate information.' Don't try to make up an answer. If the question is not related to the context, politely respond that 'There is no answer to the question you asked based on the given context, but further research on the topic may help you find the information you're seeking.'Question: ${question} ========= ${ans}=========`,
          },
        ],
        temperature: 0.7,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 1,
        max_tokens: 700,
        stream: false,
      };
      const response = await fetch("https://api.openai.com/v1/chat/completions",{
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
          },
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        // if response is not ok (status code is not 2xx), throw an error to handle it in the catch block
        console.log(response);
        return "I am not able to provide you with a proper answer to the question, but you can follow up with the links provided to find the answer on your own. Sorry for the inconvenience.";
      }
      const jsonResponse = await response.json();
      return jsonResponse?.choices?.[0]?.message?.content || "";
    } catch (error) {
      if (retry < 2) {
        return SummaryGenerateCall(question, ans, retry + 1);
      } else {
        return "Currently server is overloaded with API calls, please try again later.";
      }
    }
  }

  return SummaryGenerateCall(question, ans);
}

function removeDuplicatesByID(arr: (CustomContent | null)[]): (CustomContent | null)[] {
  const seen = new Set();
  const filteredArr = arr.filter((item) => {
    if (item === null) return false;
    const isDuplicate = seen.has(item.link);
    seen.add(item.link);
    return !isDuplicate;
  });
  return filteredArr;
}

async function getFinalAnswer(
  question: string,
  summary: string,
  content: SummaryData[]
): Promise<{ question: string; data: string }> {
  let data = summary.trim() + "\n\n";

  content.forEach((d: SummaryData, i: number) => {
    data += `[${i}]: ${d.link}\n`;
  });

  return { question: question, data };
}

export async function processInput(
  searchResults: any[] | undefined,
  question: string
): Promise<string> {
  try {
    if (!searchResults) {
      let output_string: string = `I am not able to find an answer to this question. So please rephrase your question and ask again.`;
      return output_string;
    } else {
      const intermediateContent: (CustomContent | null)[] = searchResults
      .map((result: Result) => {
        let results = result._source
        const isQuestionOnStackExchange =
        results.type === "question" &&
        results.url.includes("stackexchange");
        const isMarkdown = results.body_type === "markdown";
        const snippet = isMarkdown
        ? concatenateTextFields(results.body)
        : results.body;
        return isQuestionOnStackExchange
        ? null
        : {
          title: results.title,
          snippet: snippet,
          link: results.url,
        };
      });

      const deduplicatedContent = removeDuplicatesByID(intermediateContent);

      const extractedContent: CustomContent[] = deduplicatedContent.filter(
        (item: CustomContent | null) => item !== null
        ) as CustomContent[];

      const cleanedContent = extractedContent
        .slice(0, 6)
        .map((content) => ({
          title: cleanText(content.title),
          snippet: cleanText(content.snippet),
          link: content.link,
        }));

      const cleanedTextWithLink = cleanedContent.map((content: Content) => ({
        cleaned_text: content.snippet,
        link: content.link,
      }));

      const slicedTextWithLink = cleanedTextWithLink.map(
        (content: SummaryData) => ({
          cleaned_text: content.cleaned_text.slice(0, 2000),
          link: content.link,
        })
      );

      const prompt = _example(question, slicedTextWithLink);

      const summary = await SummaryGenerate(question, prompt);

      const finalAnswer = await getFinalAnswer(
        question,
        summary,
        slicedTextWithLink
      );

      return finalAnswer.data;
    }
  } catch (error) {
    return "The system is overloaded with requests, can you please ask your question in 5 seconds again? Thank you!";
  }
}
