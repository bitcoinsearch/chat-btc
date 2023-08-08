import { NextApiRequest, NextApiResponse } from "next";
import { extractESresults, extractKeywords } from "@/utils/fetchESResult";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { inputs } = req.body;
    const { question: query, author } = inputs;

    const extractedKeywords = await extractKeywords(query);
    const keywords = extractedKeywords === "" ? query : extractedKeywords;

    const searchResults = await extractESresults(keywords, query, author);
    
    if (!searchResults) {
      res.status(200).json({ message: "I am not able to find an answer to this question. So please rephrase your question and ask again." });
      return;
    }

    res.status(200).json(searchResults);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
