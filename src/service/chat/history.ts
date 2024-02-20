import { Message } from "@/components/message/message";
import { separateLinksFromApiMessage } from "@/utils/links";
import { guidelines } from "@/config/chatAPI-config";
import { ChatHistory } from "@/types";

const buildSystemMessage = (question: string, context: string) => {
  const {
    BASE_INSTRUCTION,
    NO_ANSWER,
    UNRELATED_QUESTION,
    FOLLOW_UP_QUESTIONS,
    LINKING,
  } = guidelines;
  return `${BASE_INSTRUCTION}\n${NO_ANSWER}\n${UNRELATED_QUESTION}\n${context}\n${LINKING}\n${FOLLOW_UP_QUESTIONS}`;
};

export const buildChatMessages = async ({
  question,
  context,
  oldContext,
  messages,
}: {
  question: string;
  context: string;
  oldContext?: string;
  messages: ChatHistory[];
}) => {
  const systemMessage = buildSystemMessage(question, context);
  return [
    {
      role: "system",
      content: systemMessage,
    },
    ...messages
  ];
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

export const constructMessageHistory = (messages: Message[]) => {
  const list: ChatHistory[] = [];
  for (let index = 0; index < messages.length; index++) {
    const message = messages[index];
    const chat = formatMessageToChatHistory(message);
    if (chat) list.push(chat);
  }
  return list;
};
