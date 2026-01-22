import { NextApiRequest, NextApiResponse } from "next";

import LND_NODE from "@/utils/node";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await LND_NODE.get("/v1/getinfo");
    
    if (response.status === 200) {
      const { alias, num_active_channels, synced_to_chain, version } = response.data;
      return res.status(200).json({
        status: "ok",
        node: {
          alias,
          version,
          num_active_channels,
          synced_to_chain,
        },
      });
    }
    
    return res.status(500).json({ status: "error", message: "Unexpected response from LND" });
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      message: error?.message || "Could not connect to LND node",
    });
  }
}
