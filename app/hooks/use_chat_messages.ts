import { chatKey, streamedMessageKey } from "~/lib/client_data";
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

export function useStreamedMessage(chatId: string) {
  const [streamedMessage] = useLocalStorage(
    streamedMessageKey(chatId),
    null,
    ChatCompletionMessageSchema
  );
  return streamedMessage;
}
