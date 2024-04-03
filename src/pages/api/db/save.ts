import { SupaBaseDatabase } from "@/database/database";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const body = JSON.parse(req.body);
    const payload = body.payload
    await SupaBaseDatabase.getInstance().insertData(payload);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
