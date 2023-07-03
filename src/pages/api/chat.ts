// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// import { DustStream } from "@/utils/dustStream";
// import { processInput } from "@/utils/langchain_btc";
import { processInput } from "@/utils/openaiChat";
import type { PageConfig } from "next";

export const config: PageConfig = {
  runtime: "edge",
};

export default async function handler(req: Request): Promise<Response> {
  const { inputs } = (await req.json()) as {
    inputs?: { question: string; searchResults: any[] | undefined }[];
  };

  if (!inputs || !inputs[0]) {
    return new Response(JSON.stringify({ error: "Invalid input" }), {
      status: 400,
    });
  }

  try {
    const question = inputs[0].question;
    const searchResults = inputs[0].searchResults;

    if (!question) {
      return new Response(JSON.stringify({ error: "Question not provided" }), {
        status: 400,
      });
    }

    // const keywords = await extractKeywords(question);

    const result = await processInput(searchResults, question);
    return new Response(result);
  } catch (err) {
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
    });
  }
}
