import { SupaBaseDatabase } from "@/database/database";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const body = JSON.parse(req.body);
    const { status, error } = await SupaBaseDatabase.getInstance().addFeedback(body.payload);
    return res.status(200).json({status, error})
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
