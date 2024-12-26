import React from "react";
import { chatCompletion } from "~/api/chat_api";
import { useToast } from "~/components/ui/use-toast";
import { useDelayedFlag } from "~/hooks/use_delayed_flag";
import { deltaToAssistantMessage } from "~/lib/messages";
import {
  addMessage,
  popMessage,
  setMessages,
  setStreamedMessage,
} from "~/lib/client_data";
import { ChatCompletionMessage } from "~/lib/schema";
import { useChatMessages, useStreamedMessage } from "./use_chat_messages";
import { v4 as uuidv4 } from "uuid";

function streamCompletion({
  chatId,
  messages,
  model,
  onMessageUpdate,
  onDone,
}: {
  chatId: string;
  messages: ChatCompletionMessage[];
  model: string;
  onMessageUpdate: (message: ChatCompletionMessage) => void;
  onDone: () => void;
}) {
  let streamedMessage: ChatCompletionMessage | null = null;
  const onFinishStreaming = () => {
    setStreamedMessage(chatId, null);
    if (streamedMessage) {
      addMessage(chatId, streamedMessage);
    }
    streamedMessage = null;
  };
  const { abort, promise } = chatCompletion({
    messages,
    model,
    onMessageUpdate: (message) => {
      streamedMessage = message;
      setStreamedMessage(chatId, message);
      onMessageUpdate(message);
    },
    onDone: () => {
      onFinishStreaming();
      onDone();
    },
  });

  const wrappedAbort = () => {
    abort();
    onFinishStreaming();
  };

  return { abort: wrappedAbort, promise };
}

export function useChat(chatId: string, model: string) {
  const messages = useChatMessages(chatId);
  const streamedMessage = useStreamedMessage(chatId);
  const { toast, dismiss } = useToast();
  const isStreamingRef = React.useRef(false);

  const [abortFunc, setAbortFunc] = React.useState<(() => void) | null>(null);
  const [showAbort, setShowAbortDelayed, resetShowAbort] = useDelayedFlag();
  const [showRetry, setShowRetry] = React.useState(false);
  const [messageDraft, setMessageDraft] = React.useState("");

  const isLastCommittedMessageUser =
    messages.length > 0 && messages[messages.length - 1].role === "user";
  const isStreaming = streamedMessage || abortFunc;
  const isInvalidState = !isStreaming && isLastCommittedMessageUser;

  // restore message draft if it wasn't submitted
  React.useEffect(() => {
    if (isInvalidState) {
      setMessageDraft(messages[messages.length - 1].content);
      popMessage(chatId);
    }
  }, [isInvalidState, messages]);

  const finishStreaming = () => {
    isStreamingRef.current = false;
    setAbortFunc(null);
    resetShowAbort();
  };

  const dismissError = () => {
    dismiss();
    setShowRetry(false);
  };

  const submit = async (messages: ChatCompletionMessage[]) => {
    dismissError();

    const { abort, promise } = streamCompletion({
      chatId,
      messages,
      model,
      onMessageUpdate: () => {
        isStreamingRef.current = true;
      },
      onDone: finishStreaming,
    });

    setMessageDraft("");
    setAbortFunc(() => abort);
    setShowAbortDelayed(1000);

    try {
      await promise;
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });

      if (isStreamingRef.current) {
        finishStreaming();
        setShowRetry(true);
      } else {
        setAbortFunc(null);
        resetShowAbort();
      }
    }
  };

  const postMessage = async (message: string) => {
    const userMessage: ChatCompletionMessage = {
      id: uuidv4(),
      role: "user",
      content: message,
    };

    const newMessages = [...messages, userMessage];
    setMessages(chatId, newMessages);
    submit(newMessages);
  };

  const onAbort = () => {
    abortFunc?.();
    finishStreaming();
  };

  const onRetry = () => {
    const newMessages = [...messages];
    while (
      newMessages.length > 1 &&
      newMessages[newMessages.length - 1].role === "assistant"
    ) {
      newMessages.pop();
    }

    submit(newMessages);
    setMessages(chatId, newMessages);
  };

  return {
    messages: streamedMessage ? [...messages, streamedMessage] : messages,
    postMessage,
    isInputDisabled: isLastCommittedMessageUser,
    messageDraft,
    setMessageDraft,
    onAbort,
    onRetry,
    showAbortButton: abortFunc !== null && showAbort,
    showRetryButton: !isLastCommittedMessageUser && showRetry,
  };
}
