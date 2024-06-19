import { useLiveQuery } from 'dexie-react-hooks';
import ChatRepository from '@/database/indexedDB/ChatRepository';

const useThreads = ({page}: {page?: number}) => {
  const getThreads = useLiveQuery(() => ChatRepository.getThreads({page}));
  return getThreads;
}

export default useThreads;