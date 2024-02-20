import { NextApiRequest, NextApiResponse } from "next";
import { extractESresults, extractKeywords } from "@/utils/fetchESResult";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { inputs } = req.body;
    const { question: query, author, keywords } = inputs;

    const extractedKeywords = await extractKeywords(query);
    
    const keywordsToSearch = keywords ? keywords : extractedKeywords ? extractedKeywords: query;

    const searchResults = await extractESresults(keywordsToSearch, query, author);
    
    if (!searchResults) {
      res.status(200).json({ message: "I am not able to find an answer to this question. So please rephrase your question and ask again." });
      return;
    }

    res.status(200).json(searchResults);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
