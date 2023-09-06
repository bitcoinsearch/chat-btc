import { NextApiRequest, NextApiResponse } from "next";

import LND_NODE from "@/utils/node";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const body = JSON.parse(req.body);
    const { r_hash } = body;
    const buffer = Buffer.from(r_hash, "base64");
    const hex = buffer.toString("hex");
    const response = await LND_NODE.get(`/v1/invoice/${hex}`);
    if (response.status === 200) {
      const { settled } = response.data;
      return res.status(200).json({ settled });
    }
  } catch (error) {
    res.status(500).json({ error: "could not verify invoice status" });
  }
}
