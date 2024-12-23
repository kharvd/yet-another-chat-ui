import { chatKey } from "~/lib/client_data";
import { useLocalStorage } from "./use_local_storage";
import { ChatCompletionMessageSchema } from "~/lib/schema";
import { z } from "zod";

export function useChatMessages(chatId: string) {
  const [messages] = useLocalStorage(
    chatKey(chatId),
    [],
    z.array(ChatCompletionMessageSchema)
  );
  return messages;
}
