import React from "react";
import { z } from "zod";
import { chatCompletion } from "~/api/chat_api";
import { useToast } from "~/components/ui/use-toast";
import { useDelayedFlag } from "~/hooks/use_delayed_flag";
import { useLocalStorage } from "~/hooks/use_local_storage";
import { deltaToAssistantMessage } from "~/lib/messages";
import {
  ChatCompletionMessage,
  ChatCompletionMessageSchema,
} from "~/lib/schema";

const emptyArray: ChatCompletionMessage[] = [];

export function useChat(model: string) {
  const [messages, setMessages] = useLocalStorage(
    "messages",
    emptyArray,
    z.array(ChatCompletionMessageSchema)
  );
  const { toast, dismiss } = useToast();
  const isStreamingRef = React.useRef(false);
  const [streamedMessage, setStreamedMessage] =
    React.useState<ChatCompletionMessage | null>(null);
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
      setMessages((prev) => prev.slice(0, -1));
    }
  }, [isInvalidState, messages]);

  const finishStreaming = () => {
    isStreamingRef.current = false;
    setStreamedMessage((lastMessage) => {
      if (lastMessage) {
        setMessages((prev) => [...prev, lastMessage]);
      }
      return null;
    });

    setAbortFunc(null);
    resetShowAbort();
  };

  const dismissError = () => {
    dismiss();
    setShowRetry(false);
  };

  const submit = async (messages: ChatCompletionMessage[]) => {
    dismissError();

    const { abort, promise } = chatCompletion({
      messages,
      model,
      onMessageUpdate: (message) => {
        setStreamedMessage(message);
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
      role: "user",
      content: message,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

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
    setMessages(newMessages);
  };

  const clearMessages = () => {
    onAbort();
    setMessages([]);
  };

  return {
    messages: streamedMessage
      ? [...messages, deltaToAssistantMessage(streamedMessage)]
      : messages,
    postMessage,
    isInputDisabled: isLastCommittedMessageUser,
    clearMessages,
    messageDraft,
    setMessageDraft,
    onAbort,
    onRetry,
    showAbortButton: abortFunc !== null && showAbort,
    showRetryButton: !isLastCommittedMessageUser && showRetry,
  };
}
