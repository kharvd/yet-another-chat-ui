import { Chat, ChatCompletionMessage } from "./schema";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type ChatStore = {
  chats: Chat[];
  getChat: (chatId: string) => Chat | null;
  setChat: (chat: Chat) => void;
  addChatIfNotExists: (chat: Chat) => void;
  deleteChat: (chatId: string) => void;

  getMessages: (chatId: string) => ChatCompletionMessage[] | null;
  setMessages: (chatId: string, messages: ChatCompletionMessage[]) => void;
  addMessage: (chatId: string, message: ChatCompletionMessage) => void;
  popMessage: (chatId: string) => void;

  getStreamedMessage: (chatId: string) => ChatCompletionMessage | null;
  setStreamedMessage: (
    chatId: string,
    message: ChatCompletionMessage | null
  ) => void;

  currentChatId: string;
  setCurrentChatId: (chatId: string) => void;
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: "",

      getChat: (chatId) => {
        const existing = get().chats.find((c) => c.id === chatId);
        if (existing) {
          return existing;
        }
        return null;
      },

      setChat: (chat) => {
        set((state) => ({
          chats: state.chats.map((c) => (c.id === chat.id ? chat : c)),
        }));
      },

      addChatIfNotExists: (chat) => {
        if (get().getChat(chat.id) === null) {
          set((state) => ({
            chats: [...state.chats, chat],
          }));
        }
      },

      deleteChat: (chatId) => {
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== chatId),
        }));
      },

      getMessages: (chatId) => {
        const chat = get().getChat(chatId);
        return chat?.messages ?? null;
      },

      setMessages: (chatId, messages) => {
        const chat = get().getChat(chatId);
        if (chat) {
          get().setChat({
            ...chat,
            messages,
          });
        }
      },

      addMessage: (chatId, message) => {
        get().setMessages(chatId, [
          ...(get().getMessages(chatId) ?? []),
          message,
        ]);
      },

      popMessage: (chatId) => {
        get().setMessages(
          chatId,
          (get().getMessages(chatId) ?? []).slice(0, -1)
        );
      },

      getStreamedMessage: (chatId) => {
        const chat = get().getChat(chatId);
        return chat?.streamedMessage ?? null;
      },

      setStreamedMessage: (chatId, message) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, streamedMessage: message } : chat
          ),
        }));
      },

      setCurrentChatId: (chatId) => {
        set({ currentChatId: chatId });
      },
    }),
    {
      name: "chat-store",
      storage: createJSONStorage(() => window.localStorage),
    }
  )
);

export const useChatMessages = (chatId: string) => {
  const messages = useChatStore((state) => state.getMessages(chatId));
  return messages ?? [];
};

export const useStreamedMessage = (chatId: string) => {
  return useChatStore((state) => state.getStreamedMessage(chatId));
};

export const useChatHistory = () => {
  const chats = useChatStore((state) => state.chats);
  chats.sort((a, b) => b.timestamp - a.timestamp);
  return chats;
};

export const addChatIfNotExists = (chatId: string, title: string) => {
  useChatStore.getState().addChatIfNotExists({
    id: chatId,
    timestamp: Date.now(),
    title,
    messages: [],
    streamedMessage: null,
  });
};

export const addMessage = (chatId: string, message: ChatCompletionMessage) => {
  useChatStore.getState().addMessage(chatId, message);
};

export const popMessage = (chatId: string) => {
  useChatStore.getState().popMessage(chatId);
};

export const setMessages = (
  chatId: string,
  messages: ChatCompletionMessage[]
) => {
  useChatStore.getState().setMessages(chatId, messages);
};

export const setStreamedMessage = (
  chatId: string,
  message: ChatCompletionMessage | null
) => {
  useChatStore.getState().setStreamedMessage(chatId, message);
};

export const deleteChat = (chatId: string) => {
  useChatStore.getState().deleteChat(chatId);
};

export const getChatId = () => {
  return useChatStore.getState().currentChatId;
};

export const setChatId = (chatId: string) => {
  useChatStore.getState().setCurrentChatId(chatId);
};
