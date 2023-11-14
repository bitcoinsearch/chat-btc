import * as jose from "jose";

import { ENV } from "@/config/env";

export async function generateToken({
  invoice,
  r_hash,
  expiresIn = "1",
}: {
  invoice: string;
  r_hash: string;
  expiresIn?: string | number;
}) {
  const jwt = await new jose.SignJWT({ invoice, r_hash })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(new TextEncoder().encode(ENV.JWT_SECRET));

  return jwt;
}

export async function isValidPaymentToken(token: string) {
  let jwt = null;
  try {
    jwt = await jose.jwtVerify(token, new TextEncoder().encode(ENV.JWT_SECRET));
    console.log({ jwt });

    if (!jwt.payload || !jwt.payload.exp) {
      console.log("token invalid");
      return false;
    }

    if (Math.floor(Date.now() / 1000) > jwt.payload.exp) {
      console.log("token expired");
      return false; // expired
    }

    console.log("token valid");
    return true;
  } catch (e) {
    console.log("token invalid", e);
    return false;
  }
}

export const getLSATDetailsFromHeader = (
  input: string
): { invoice: string; token: string; r_hash: string } | null => {
  const regex = /macaroon="([^"]+)", invoice="([^"]+)"/;
  const matches = input.match(regex);
  let token = "";
  let invoice = "";
  let r_hash = "";

  if (matches) {
    token = matches[1];
    invoice = matches[2];
    const decodedToken = jose.decodeJwt(token);
    r_hash = decodedToken.r_hash as string;
  }
  return { token, invoice, r_hash };
};

export const constructTokenHeader = ({ token }: { token: string }) => {
  try {
    const decodedToken = jose.decodeJwt(token);
    return `L402 ${token}:${decodedToken.r_hash}`;
  } catch (e) {
    return "";
  }
};
