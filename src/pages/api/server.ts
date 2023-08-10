import type { PageConfig } from "next";
// import { fetchESResult } from "@/utils/fetchESResult";
import ERROR_MESSAGES from "@/config/error-config";
import { processInput } from "@/utils/openaiChat";

export const config: PageConfig = {
  runtime: "edge",
};

export const fetchESResult = async (query: string, author?: string) : Promise<any[] | null> => {
  const response = await fetch("http://localhost:3000/api/search", {
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
    return null
  }

  return await response.json();
};

export default async function handler(req: Request) {
  if (req.method === "POST") {
    const { inputs } = await req.json();
    const { query, author }: {query: string, author: string} = inputs;

    const esResults = await fetchESResult(query, author);
    
    if (!esResults || !esResults.length) {
      console.log("no results")
      return new Response(ERROR_MESSAGES.NO_ANSWER)
    }

    try {
      const result = await processInput(esResults, query);
      // console.log("🚀 ~ file: server.ts:64 ~ handler ~ result:", result)
      return new Response(result)
    } catch (error: any) {
      console.log("🚀 ~ file: server.ts:68 ~ handler ~ error:", error)
      
      const errMessage = error?.message ? error.message : ERROR_MESSAGES.UNKNOWN
      return new Response(JSON.stringify({error: errMessage}), { status: 400 })
    }

  } else {
    return new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405 })
  }
}
