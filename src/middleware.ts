import { NextResponse } from "next/server";

import { ENV } from "./config/env";
import { isValidPaymentToken } from "./utils/token";
import {
  generateInvoice,
  getIp,
  getNewUrl,
  ratelimit,
  rateLimitHeaders,
  verifyRHash,
} from "./utils/token-api";

import type { NextRequest } from "next/server";
export async function middleware(request: NextRequest) {
  const requestUrl = request.url;
  const reqBody = await request.json();
  const ip = getIp(request);
  const { success, remaining, reset, limit } = await ratelimit.limit(ip);
  const authHeader = request.headers.get("Authorization");

  try {
    if (ENV.PRODUCTION) {
      if (!authHeader) {
        if (!success || remaining === 0) {
          return generateInvoice({
            reqUrl: getNewUrl(requestUrl, "/invoice"),
            reqBody: reqBody,
            headers: rateLimitHeaders({ remaining, reset, limit }),
          });
        }
        return NextResponse.next({
          headers: rateLimitHeaders({ remaining, reset, limit }),
        });
      }

      const token = authHeader.split(" ")[1];
      const jwt = token.split(":")[0];
      const r_hash = token.split(":")[1];

      const isTokenValid = await isValidPaymentToken(jwt);
      const isRHashValid = await verifyRHash({
        r_hash,
        reqUrl: getNewUrl(requestUrl, "/invoice/status"),
      });

      if (!isTokenValid || !isRHashValid) {
        return generateInvoice({
          reqUrl: getNewUrl(requestUrl, "/invoice"),
          reqBody: reqBody,
          headers: rateLimitHeaders({ remaining, reset, limit }),
        });
      }
    }
    return NextResponse.next();
  } catch (err) {
    console.log(err);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export const config = {
  matcher: ["/api/server"],
};
