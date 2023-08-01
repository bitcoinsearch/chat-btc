import LND_NODE from "@/utils/node";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { r_hash } = req.body;
    const buffer = Buffer.from(r_hash, "base64");
    const hex = buffer.toString("hex");
    const response = await LND_NODE.get(`/v1/invoice/${hex}`);
    if (response.status === 200) {
      const { settled } = response.data;
      return res.status(200).json({ settled });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "could not verify invoice status" });
  }
}
