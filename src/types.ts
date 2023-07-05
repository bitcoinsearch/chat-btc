export const AnswerQuality = {
  inaccurate: "Inaccurate information",
  poor: "Poorly worded",
  inappropriate: "Inappropriate content",
  other: "Other",
} as const;

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
  slug: string;
  value: string;
  imgURL: string;
  questions: string[];
};

export type PromptAction = (input: string, author: string ) => void;
