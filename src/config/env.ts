const MACAROON = process.env.MACAROON;
const LND_URL = process.env.LND_URL;
const JWT_SECRET = process.env.JWT_SECRET;
if (!MACAROON) {
  throw new Error("Macaroon environment variable not set");
}
if (!LND_URL) {
  throw new Error("LND url environment variable not set");
}
if (!JWT_SECRET) {
  throw new Error("JWT secret environment variable not set");
}

export const ENV = {
  LND_URL,
  MACAROON,
  JWT_SECRET,
};
