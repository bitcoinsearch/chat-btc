import { SupaBaseDatabase } from "@/database/database";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const body = JSON.parse(req.body);
      const payload = body.payload
      await SupaBaseDatabase.getInstance().insertData(payload);
      res.status(200)
    } catch (err: any) {
      res.status(500).json({message: err?.message || "something went wrong"})
    }

  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
