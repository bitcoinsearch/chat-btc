import LND_NODE from "@/utils/node";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";

type InvoiceResponse = {
  payment_request: string;
  r_hash: string;
  amountInSatoshis: number;
};

export async function convertUSDToSats(usd: number) {
  const amountInBTC = await fetch(
    `https://blockchain.info/tobtc?currency=USD&value=${usd}`
  )
    .then((res) => res.text())
    .then((res) => Number(res));

  return amountInBTC * 100_000_000;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<InvoiceResponse | void> {
  try {
    const hasAutoPayment = Boolean(Number(req.body.autoPayment))
    let finalAmountInSatoshis: number
    if (hasAutoPayment) {
      finalAmountInSatoshis = Number(req.body.autoPayment)
    } else {
      finalAmountInSatoshis = 50
    }
    const response = await LND_NODE.post("/v1/invoices", {
      value: finalAmountInSatoshis,
    });
    if (response.status === 200) {
      const { payment_request, r_hash } = response.data;
      console.log({payment_request})
      //Todo! save the r_hash in the database
      // fs.appendFileSync("payment.txt", r_hash + "\n", "utf-8");
      return res
        .status(200)
        .json({ payment_request, r_hash, finalAmountInSatoshis });
    }
  } catch (error) {
    res.status(500).json({ error: "Error generating invoice" });
  }
}
