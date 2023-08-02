import * as jose from "jose";

import { ENV } from "@/config/env";

const NUMBER_OF_FREE_CHAT = 3;

export async function generateToken(invoice: string, expiresIn = "720h") {
  const expiresAt = expiresIn + "h"
  const jwt = await new jose.SignJWT({ invoice })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(Buffer.from(ENV.JWT_SECRET));

  return jwt;
}

export async function isValidPaymentToken(token: string) {
  let jwt = null;
  try {
    jwt = await jose.jwtVerify(token, Buffer.from(ENV.JWT_SECRET), {});

    if (!jwt.payload || !jwt.payload.exp) {
      return false;
    }
    if (Math.floor(Date.now() / 1000) > jwt.payload.exp) {
      return false; // expired
    }

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function saveAutoPayToken (invoice: string) {
  const token = await generateToken(invoice)
  window.localStorage.setItem("paymentToken", token)
}

export function shouldUserPay(numberOfUserMessage: number) {
  const hasExceededLimit = window.localStorage.getItem("hasExceededLimit") === "true";
  if (hasExceededLimit) {
    const paymentToken = window.localStorage.getItem("paymentToken");
    const isValidToken = paymentToken ? isValidPaymentToken(paymentToken) : false
    if (isValidToken) {
      return false
    }
    return true
  } else {
    if (numberOfUserMessage >= NUMBER_OF_FREE_CHAT) {
      localStorage.setItem("hasExceededLimit", "true")
      return true;
    }
    return false
  }
}
