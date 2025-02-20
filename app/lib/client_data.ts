import { Chat, ChatCompletionMessage } from "./schema";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Draft, produce } from "immer";

type ChatStore = Readonly<{
  chats: readonly Chat[];
  getChat: (chatId: string) => Chat | null;
  addChatIfNotExists: (chat: Chat) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  deleteChat: (chatId: string) => void;

  getMessages: (chatId: string) => ChatCompletionMessage[] | null;
  setMessages: (chatId: string, messages: ChatCompletionMessage[]) => void;
  addMessage: (chatId: string, message: ChatCompletionMessage) => void;
  sliceMessages: (chatId: string, start: number, end: number) => void;
  popMessage: (chatId: string) => void;

  getStreamedMessage: (chatId: string) => ChatCompletionMessage | null;
  setStreamedMessage: (
    chatId: string,
    message: ChatCompletionMessage | null
  ) => void;

  currentChatId: string | null;
  setCurrentChatId: (chatId: string) => void;
}>;

const findChat = (chats: readonly Chat[], chatId: string) => {
  return chats.find((c) => c.id === chatId) ?? null;
};

const updateChat = (
  state: Draft<ChatStore>,
  chatId: string,
  updater: (chat: Chat) => void
) => {
  const chat = findChat(state.chats, chatId);
  if (chat) {
    updater(chat);
  }
};

const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,

      getChat: (chatId) => {
        return findChat(get().chats, chatId);
      },

      addChatIfNotExists: (chat) => {
        if (get().getChat(chat.id) === null) {
          set(
            produce((state: Draft<ChatStore>) => {
              state.chats.push(chat);
            })
          );
        }
      },

      updateChatTitle: (chatId, title) => {
        set(
          produce((state: Draft<ChatStore>) => {
            updateChat(state, chatId, (chat) => {
              chat.title = title;
            });
          })
        );
      },

      deleteChat: (chatId) => {
        set(
          produce((state: Draft<ChatStore>) => {
            const index = state.chats.findIndex((c) => c.id === chatId);
            if (index !== -1) {
              state.chats.splice(index, 1);
            }
          })
        );
      },

      getMessages: (chatId) => {
        const chat = get().getChat(chatId);
        return chat?.messages ?? null;
      },

      setMessages: (chatId, messages) => {
        set(
          produce((state: Draft<ChatStore>) => {
            updateChat(state, chatId, (chat) => {
              chat.messages = messages;
            });
          })
        );
      },

      addMessage: (chatId, message) => {
        set(
          produce((state: Draft<ChatStore>) => {
            updateChat(state, chatId, (chat) => {
              chat.messages.push(message);
            });
          })
        );
      },

      sliceMessages: (chatId, start, end) => {
        set(
          produce((state: Draft<ChatStore>) => {
            updateChat(state, chatId, (chat) => {
              chat.messages = chat.messages.slice(start, end);
            });
          })
        );
      },

      popMessage: (chatId) => {
        set(
          produce((state: Draft<ChatStore>) => {
            updateChat(state, chatId, (chat) => {
              chat.messages.pop();
            });
          })
        );
      },

      getStreamedMessage: (chatId) => {
        const chat = get().getChat(chatId);
        return chat?.streamedMessage ?? null;
      },

      setStreamedMessage: (chatId, message) => {
        set(
          produce((state: Draft<ChatStore>) => {
            updateChat(state, chatId, (chat) => {
              chat.streamedMessage = message;
            });
          })
        );
      },

      setCurrentChatId: (chatId) => {
        set(
          produce((state: Draft<ChatStore>) => {
            state.currentChatId = chatId;
          })
        );
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
  return [...chats].sort((a, b) => b.timestamp - a.timestamp);
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

export const sliceMessages = (chatId: string, start: number, end: number) => {
  useChatStore.getState().sliceMessages(chatId, start, end);
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

export const updateChatTitle = (chatId: string, title: string) => {
  useChatStore.getState().updateChatTitle(chatId, title);
};
