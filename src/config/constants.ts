export type PaymentTier = {
  id: number;
  priceInSats: number;
  timeInHours: string;
};

export const PRICE_PER_PROMPT = 50 as const;

export const MAX_REQUESTS_PER_SESSION = 5 as const;

export const SLIDING_WINDOW_IN_SECONDS = "300 s" as const;

export const DEFAULT_TOKEN_EXPIRY_TIME = "360s" as const;

export const paymentTierList: PaymentTier[] = [
  { id: 1, priceInSats: 500, timeInHours: "6" },
  { id: 2, priceInSats: 1000, timeInHours: "24" },
  { id: 3, priceInSats: 5000, timeInHours: "168" },
];
