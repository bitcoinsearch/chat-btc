import * as jose from "jose";

import { ENV } from "@/config/env";

export async function generateToken(invoice: string) {
  const jwt = await new jose.SignJWT({ invoice })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("720h")
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
