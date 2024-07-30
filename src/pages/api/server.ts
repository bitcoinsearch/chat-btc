import ERROR_MESSAGES from "@/config/error-config";
import { processInput } from "@/utils/openaiChat";
import { createReadableStream } from "@/utils/stream";
import { getNewUrl } from "@/utils/token-api";
import { GPTKeywordExtractor } from "@/service/chat/extractor";
import { ChatHistory } from "@/types";

interface InternalFetchParams {
  url: string;
  query: string;
  author?: string;
  keywords?: string;
}

// use only US edge server
export const config = {
  runtime: "edge",
  regions: ["iad1", "cle1", "pdx1", "sfo1"],
};

export const internalFetch = async ({
  url,
  query,
  author,
  keywords,
}: InternalFetchParams): Promise<any[] | null> => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: {
        question: query,
        author: author,
        keywords: keywords
      },
    }),
  });

  if (!response.ok) {
    return null;
  }

  return await response.json();
};

export default async function handler(req: Request) {
  if (req.method === "POST") {
    const requesturl = req.url;
    const reqBody = await req.json();

    let esResults: any[] | null;
    let userQuery;

    const inputs = reqBody?.inputs;
    const { query, author }: { query: string; author: string } = inputs;

    if (!query) {
      return new Response(
        JSON.stringify({ message: "no query present in request body input" }),
        { status: 500 }
      );
    }

    const chatHistory = reqBody?.chatHistory ?? ([] as ChatHistory[]);

    try {
      const fetchUrl = getNewUrl(requesturl, "/search");

      const gptKeywords = (await GPTKeywordExtractor([...chatHistory]))?.join(" ");

      esResults = await internalFetch({url: fetchUrl, query, author, keywords: gptKeywords});

      // FOR logging purposes
      const loggedResultsURLs = esResults?.map(result => result?._source.url)
      console.log(`query: ${query}\n gptKeywords: ${gptKeywords} \n results: ${loggedResultsURLs}`)

      if (!esResults || !esResults.length) {
        const error = createReadableStream(ERROR_MESSAGES.NO_ANSWER);
        console.log(error);
        return new Response(error);
      }
    } catch (error) {
      console.log(error);
      return new Response(
        JSON.stringify({ message: "internal server error" }),
        { status: 500 }
      );
    }

    try {
      const result = await processInput(esResults, query, chatHistory);
      return new Response(result);
    } catch (error: any) {
      const errMessage = error?.message
        ? error.message
        : ERROR_MESSAGES.UNKNOWN;
      return new Response(JSON.stringify({ error: errMessage }), {
        status: 400,
      });
    }
  } else {
    return new Response(JSON.stringify({ message: "Method not allowed" }), {
      status: 405,
    });
  }
}
