export type PaymentTier = {
  id: number;
  priceInSats: number;
  timeInHours: string;
  timeForDisplay: string;
};

export const DEFAULT_PAYMENT_PRICE = 50 as const;

export const MAX_REQUESTS_PER_SESSION = 5 as const;

export const SLIDING_WINDOW_IN_SECONDS = "1800 s" as const;

export const DEFAULT_TOKEN_EXPIRY_TIME = "660s" as const;

export const DATABASE_VALIDITY_IN_DAYS = 1 as const;

export const paymentTierList: PaymentTier[] = [
  { id: 1, priceInSats: DEFAULT_PAYMENT_PRICE, timeInHours: "0.167", timeForDisplay: "10 mins" },
  { id: 2, priceInSats: 1000, timeInHours: "24", timeForDisplay: "1 day" },
  { id: 3, priceInSats: 5000, timeInHours: "168", timeForDisplay: "7 days" },
];
