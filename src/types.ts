declare global {
  interface Window {
    webln: any;
  }
}

export const AnswerQuality = {
  inaccurate: "Inaccurate information",
  poor: "Poorly worded",
  inappropriate: "Inappropriate content",
  other: "Other",
};

export const GeneratingErrorMessages = {
  abortTyping: "Operation was aborted",
  resetChat: "Chat was reset",
  stopGenerating: "User stopped generating",
} as const

export type AnswerQualityType = (typeof AnswerQuality)[keyof typeof AnswerQuality];

export enum Ratings {
    POSITIVE = 1,
    NEGATIVE = -1,
    NEUTRAL = 0
}

export type FeedbackPayload = {
  answerQuality?: AnswerQualityType | null;
  timestamp: string;
  rating: Ratings;
  feedbackId: string;
};

export type AuthorConfig = {
  name: string;
  title: string;
  introduction?: string;
  slug: string;
  value: string;
  imgURL: string;
  questions: string[];
};

export type Invoice = {
  payment_request: string;
  r_hash: string;
};

type PromptOptions = {
  startChat?: boolean
}

export type PromptAction = (input: string, author: string, options?: PromptOptions ) => void;

export type Payload = {
  uniqueId: string,
  question: string,
  answer: string | null,
  author_name?: string,
  rating: Ratings | null,
  createdAt: string,
  updatedAt: null,
  releasedAt: string,
}
