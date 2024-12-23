import { Chat, ChatCompletionMessage, ChatHistorySchema } from "./schema";
import { mutate } from "swr";

export const chatKey = (chatId: string) => `chat-${chatId}-messages`;

const getMessages = (chatId: string): ChatCompletionMessage[] => {
  const messages = JSON.parse(
    window.localStorage.getItem(chatKey(chatId)) || "[]"
  );
  return messages;
};

export const addMessage = (chatId: string, message: ChatCompletionMessage) => {
  const messages = getMessages(chatId);
  const messageIdx = messages.findIndex((m) => m.id === message.id);
  if (messageIdx !== -1) {
    messages[messageIdx] = message;
  } else {
    messages.push(message);
  }
  setMessages(chatId, messages);
};

export const popMessage = (chatId: string) => {
  const messages = getMessages(chatId);
  const newMessages = messages.slice(0, -1);
  setMessages(chatId, newMessages);
};

export const setMessages = (
  chatId: string,
  messages: ChatCompletionMessage[]
) => {
  window.localStorage.setItem(chatKey(chatId), JSON.stringify(messages));

  addChatIfNotExists({
    id: chatId,
    timestamp: Date.now(),
    title: messages[0]?.content.slice(0, 30) ?? "Untitled Chat",
  });
  mutate(chatKey(chatId), messages);
};

const getChats = () => {
  const chats = ChatHistorySchema.parse(
    JSON.parse(window.localStorage.getItem("chats") || "[]")
  );
  return chats;
};

const addChatIfNotExists = (chat: Chat) => {
  const chats = getChats();
  if (chats.find((c) => c.id === chat.id)) {
    return;
  }
  setChats([...chats, chat]);
};

export const deleteChat = (chatId: string) => {
  const chats = getChats();
  const newChats = chats.filter((c) => c.id !== chatId);
  setChats(newChats);
};

const setChats = (chats: Chat[]) => {
  window.localStorage.setItem("chats", JSON.stringify(chats));
  mutate("chats", chats);
};

export const getChatId = () => {
  return window.localStorage.getItem("chatId");
};

export const setChatId = (chatId: string) => {
  window.localStorage.setItem("chatId", chatId);
  mutate("chatId", chatId);
};
