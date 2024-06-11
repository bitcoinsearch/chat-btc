import { THREADS_LENGTH } from "@/config/ui-config";
import { MessageType } from "@/types";
import { ChatMessage, ChatThread } from "@/types";
import db from "./db";
import { RepositoryError } from "./error";

const getThreads = async ({ page = 0 }: { page?: number }) => {
  return await db.chatThreads
    .limit(THREADS_LENGTH)
    .offset(page * THREADS_LENGTH)
    .toArray();
};

const getThreadMessages = async ({
  id,
}: {
  id: number;
}) => {
  try {
    return await db.chatMessages.where("threadId").equals(id).toArray();
  } catch (error) {
    return [] as ChatMessage[];
  }
};

const createThread = async ({ title }: { title?: string }) => {
  try {
    title = title || "New Thread";
    const dateCreated = new Date();
    const threadId = await db.chatThreads.add({
      title,
      dateCreated,
      dateUpdated: dateCreated,
    });
    return threadId;
  } catch (error) {
    return new RepositoryError(error);
  }
};

const createMessage = async ({
  threadId,
  type,
  message,
  uniqueId = crypto.randomUUID(),
}: {
  threadId?: number;
  type: MessageType;
  message: string;
  uniqueId?: string;
}) => {
  try {
    let dataThreadId = threadId ?? (await createThread({}));

    if (dataThreadId instanceof RepositoryError) return dataThreadId;
    const dateCreated = new Date();
    
    const newMessageId = await db.chatMessages.add({
      uniqueId,
      threadId: dataThreadId,
      message,
      type,
      dateCreated,
    });
    return {
      id: newMessageId,
      threadId,
    };
  } catch (error) {
    return new RepositoryError(error);
  }
};

const updateThread = async ({ id, title }: { id: number; title: string }) => {
  const dateUpdated = new Date();
  return await db.chatThreads.update(id, { title, dateUpdated });
};

const updateMessage = async ({
  id,
  message,
  type,
}: {
  id: number;
  message: string;
  type: MessageType;
}) => {
  try {
    return await db.chatMessages.update(id, { message, type });
  } catch (error) {
    return new RepositoryError(error);
  }
};

const deleteThread = async ({ id }: { id: number }) => {
  try {
    await db.chatThreads.delete(id);
    await db.chatMessages.where("threadId").equals(id).delete();
    return true;
  } catch (error) {
    return new RepositoryError(error);
  }
};

const deleteMessageByUUID = async ({ uniqueId }: { uniqueId: string }) => {
  try {
    await db.chatMessages.where("uniqueId").equals(uniqueId).delete();
    return true;
  } catch (error) {
    return new RepositoryError(error);
  }
};

const ChatRepository = {
  getThreads,
  getThreadMessages,
  createThread,
  createMessage,
  updateThread,
  updateMessage,
  deleteThread,
  deleteMessageByUUID,
};

export default ChatRepository;
