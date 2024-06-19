import { Message } from "@/components/message/message";
import ChatRepository from "@/database/indexedDB/ChatRepository";
import { ChatMessage } from "@/types";
import { useLiveQuery } from "dexie-react-hooks";

const useThreadMessages = ({threadId}: {threadId?: number}) => {
  const threadMessages = useLiveQuery(() => {
    if (threadId) {
      return ChatRepository.getThreadMessages({id: threadId});
    }
    return [] as ChatMessage[];
  }, [threadId]);

  const addMessageToThread = ({threadId, message}: {threadId?: number, message: Message}) => {
    console.log("threadId in useThreads", threadId);
    const data = ChatRepository.createMessage({threadId, type: message.type, message: message.message, uniqueId: message.uniqueId});
    return data;
  }

  return {
    threadMessages,
    addMessageToThread
  };
}

export default useThreadMessages;