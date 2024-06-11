import { ChatMessage, ChatThread } from '@/types';
import Dexie, { EntityTable} from 'dexie';

const db = new Dexie('ChatDB') as Dexie & {
  chatThreads: EntityTable<ChatThread, "id">,
  chatMessages: EntityTable<ChatMessage, "id">
};
db.version(1).stores({
  chatThreads: '++id,title,dateCreated,dateUpdated',
  chatMessages: '++id,threadId,uniqueId,message,type,dateCreated'
});

export default db;