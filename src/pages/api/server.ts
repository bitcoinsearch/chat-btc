import type { PageConfig } from "next";
import ERROR_MESSAGES from "@/config/error-config";
import { processInput } from "@/utils/openaiChat";
import { createReadableStream } from "@/utils/stream";
import { getNewUrl } from "@/utils/token-api";

export const config: PageConfig = {
  runtime: "edge",
};

export const internalFetch = async (
  url: string,
  query: string,
  author?: string
): Promise<any[] | null> => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: {
        question: query,
        author: author,
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

    let esResults;
    let userQuery;

    try {
      const fetchUrl = getNewUrl(requesturl, "/search");
      const inputs = reqBody?.inputs;
      const { query, author }: { query: string; author: string } = inputs;

      esResults = await internalFetch(fetchUrl, query, author);
      userQuery = query;

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
      const result = await processInput(esResults, userQuery);
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
