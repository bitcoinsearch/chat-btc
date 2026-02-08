import { Message } from "@/components/message/message";
import { separateLinksFromApiMessage } from "@/utils/links";
import { CONTEXT_WINDOW_MESSAGES, guidelines } from "@/config/chatAPI-config";
import { ChatHistory } from "@/types";

const buildSystemMessage = (question: string, context: string, fallback?: boolean) => {
  const {
    BASE_INSTRUCTION,
    NO_ANSWER,
    UNRELATED_QUESTION,
    FOLLOW_UP_QUESTIONS,
    LINKING,
    FALLBACK_INSTRUCTION,
  } = guidelines;

  if (fallback) {
    return `${FALLBACK_INSTRUCTION}`;
  }

  return `${BASE_INSTRUCTION}\n${NO_ANSWER}\n${UNRELATED_QUESTION}\n${context}\n${LINKING}\n${FOLLOW_UP_QUESTIONS}`;
};

export const buildChatMessages = ({
  question,
  context,
  oldContext,
  messages,
  fallback,
}: {
  question: string;
  context: string;
  oldContext?: string;
  messages: ChatHistory[];
  fallback?: boolean;
}) => {
  const systemMessage = buildSystemMessage(question, context, fallback);
  return [
    {
      role: "system",
      content: systemMessage,
    },
    ...messages
  ] as ChatHistory[];
};

const formatMessageToChatHistory = (message: Message) => {
  try {
    let role, content;
    if (message.type === "errorMessage" || message.type === "apiStream") {
      return undefined;
    }
    switch (message.type) {
      case "apiMessage": {
        role = "assistant";
        content = separateLinksFromApiMessage(message.message).messageBody;
        break;
      }
      case "authorMessage": {
        role = "system";
        content = message.message;
        break;
      }
      case "userMessage": {
        role = "user";
        content = message.message;
        break;
      }
      default:
        return undefined;
    }
    return {
      role,
      content,
    } as ChatHistory;
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

/**
 * Constructs a chat history array from the last N messages, where N is determined by CONTEXT_WINDOW_MESSAGES.
 * This function focuses on recent messages for context relevance.
 */
export const constructMessageHistory = (messages: Message[]) => {
  return messages
    .slice(-CONTEXT_WINDOW_MESSAGES) // Focus on the last N messages
    .map(formatMessageToChatHistory) // Transform each message
    .filter(Boolean); // Remove any null or undefined entries
};
