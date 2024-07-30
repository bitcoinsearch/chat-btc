import { ChatHistory } from "@/types";

export const chatHistory: ChatHistory[] = [
  {
    role: "system",
    content: "You are a helpful assistant.",
  },
  { role: 'user', content: 'what is the main idea behind taproot' },
  { role: 'user', content: 'what are OP_CODES' },
  {
    role: 'user',
    content: 'What role do OP_CODES play in Bitcoin\'s scripting language?'
  }
];

export const chatHistoryContextAware: ChatHistory[] = [
  {
    role: "system",
    content: "You are a helpful assistant.",
  },
  { role: 'user', content: 'what is the main idea behind segwit' },
  { role: 'user', content: 'what where the controversies' },
  {
    role: 'user',
    content: 'When was it activated?'
  },
  {
    role: 'user',
    content: 'Who proposed it?'
  },
];

export const chatHistorySwitchContext: ChatHistory[] = [
  {
    role: "system",
    content: "You are a helpful assistant.",
  },
  { role: 'user', content: 'what is the main idea behind segwit' },
  { role: 'user', content: 'what where the controversies' },
  {
    role: 'user',
    content: 'When was it activated?'
  },
  {
    role: 'user',
    content: 'Are mining pools decentralized?'
  },
];