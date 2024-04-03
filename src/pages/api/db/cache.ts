import { SupaBaseDatabase } from "@/database/database";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const question = req.query?.question as string | undefined
    const author = req.query?.author as string | undefined
    if (!question) return res.status(405).json("sd")
    const answers = await SupaBaseDatabase.getInstance().getAnswerByQuestion(
      question.toString(),
      author
    );
    return res.status(200).json(answers);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
