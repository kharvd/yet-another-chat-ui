import { ChatHistorySchema } from "~/lib/schema";
import { useLocalStorage } from "./use_local_storage";

export function useChatHistory() {
  const [chats] = useLocalStorage("chats", [], ChatHistorySchema);
  chats.sort((a, b) => b.timestamp - a.timestamp);
  return chats;
}
