import { NextApiRequest } from "next";
import { NextRequest } from "next/server";

import {
  DEFAULT_TOKEN_EXPIRY_TIME,
  MAX_REQUESTS_PER_SESSION,
  paymentTierList,
  DEFAULT_PAYMENT_PRICE,
  SLIDING_WINDOW_IN_SECONDS,
} from "@/config/constants";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

import { generateToken } from "./token";

export const ratelimit = new Ratelimit({
  redis: kv,

  // free chat: 5 requests from the same IP in 30 minutes
  limiter: Ratelimit.slidingWindow(
    MAX_REQUESTS_PER_SESSION,
    SLIDING_WINDOW_IN_SECONDS
  ),
});

export const getIp = (request: Request | NextApiRequest | NextRequest) => {
  const ip =
    request instanceof Request
      ? request.headers.get("x-real-ip") ||
        request.headers.get("x-forwarded-for")
      : request.headers["x-forwarded-for"];
  return ip ? (Array.isArray(ip) ? ip[0] : ip.split(",")[0]) : "127.0.0.1";
};

export const getNewUrl = (url: string, newUrl: string) => {
  const reqUrl = url.split("/");
  reqUrl.pop();
  return reqUrl.join("/") + newUrl;
};

export const verifyRHash = async ({
  r_hash,
  reqUrl,
}: {
  r_hash: string;
  reqUrl: string;
}): Promise<boolean> => {
  const response = await fetch(reqUrl, {
    method: "POST",
    body: JSON.stringify({ r_hash: r_hash }),
  });
  if (!response.ok) {
    return false;
  }
  const { settled } = await response.json();
  return settled;
};

export async function generateInvoice({
  reqUrl,
  reqBody,
  headers = {},
}: {
  reqUrl: string;
  reqBody: any;
  headers?: Record<string, string>;
}) {
  const { autoPayment } = reqBody;
  const hasAutoPayment = Boolean(Number(autoPayment));
  const finalAmountInSatoshis = hasAutoPayment
    ? Number(autoPayment)
    : DEFAULT_PAYMENT_PRICE;

  const response = await fetch(reqUrl, {
    method: "POST",
    body: JSON.stringify({ amount: finalAmountInSatoshis }),
  });

  if (!response.ok || response.status !== 200) {
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }

  const { payment_request, r_hash } = await response.json();

  const paymentTier = paymentTierList.find(
    (tier) => tier.priceInSats === finalAmountInSatoshis
  );
  const expiresIn = paymentTier
    ? `${paymentTier.timeInHours}h`
    : DEFAULT_TOKEN_EXPIRY_TIME;
  const token = await generateToken({
    invoice: payment_request,
    r_hash,
    expiresIn: expiresIn,
  });

  const L402Header = `L402 macaroon="${token}", invoice="${payment_request}"`;
  return new Response(JSON.stringify({ message: "Payment Required" }), {
    status: 402,
    headers: {
      ...headers,
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Expose-Headers": "WWW-Authenticate",
      "WWW-Authenticate": L402Header,
    },
  });
}

export const rateLimitHeaders = ({
  limit,
  remaining,
  reset,
}: {
  limit: number;
  remaining: number;
  reset: number;
}) => {
  return {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": reset.toString(),
  };
};
