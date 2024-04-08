import { SupaBaseDatabase } from "@/database/database";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const body = JSON.parse(req.body);
      const payload = body.payload
      const dbRes = await SupaBaseDatabase.getInstance().insertData(payload);
      return res.status(200).json({isSuccessful: dbRes})
    } catch (err: any) {
      return res.status(500).json({message: err?.message || "something went wrong"})
    }

  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
