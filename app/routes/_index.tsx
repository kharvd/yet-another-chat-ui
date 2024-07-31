import type { MetaFunction } from "@remix-run/node";
import React from "react";
import { ScrollableMessageList } from "~/components/ui/scrollable_message_list";
import { ChatMessageInput } from "~/components/ui/chat_message_input";
import { useDelayedFlag } from "~/hooks/use_delayed_flag";
import { ChatCompletionMessage } from "~/lib/schema";
import { deltaToAssistantMessage } from "~/lib/messages";
import { chatCompletion } from "~/api/chat_api";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
    {
      name: "viewport",
      content:
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    },
  ];
};

export default function Index() {
  const [messages, setMessages] = React.useState<ChatCompletionMessage[]>([]);
  const [streamedMessage, setStreamedMessage] =
    React.useState<ChatCompletionMessage | null>(null);
  const [abortFunc, setAbortFunc] = React.useState<(() => void) | null>(null);

  const [showAbort, setShowAbortDelayed, resetShowAbort] = useDelayedFlag();

  const finishStreaming = () => {
    setStreamedMessage((lastMessage) => {
      if (lastMessage) {
        setMessages((prev) => [...prev, lastMessage]);
      }
      return null;
    });

    setAbortFunc(null);
    resetShowAbort();
  };

  const postMessage = async (message: string) => {
    console.log("postMessage");
    const userMessage: ChatCompletionMessage = {
      role: "user",
      content: message,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    const { abort, promise } = chatCompletion({
      messages: newMessages,
      onMessageUpdate: setStreamedMessage,
      onDone: finishStreaming,
    });

    setAbortFunc(() => abort);
    setShowAbortDelayed(1000);

    await promise;
  };

  const onAbort = () => {
    abortFunc?.();
    finishStreaming();
  };

  const shouldShowAbortButton = abortFunc !== null && showAbort;

  const allMessages = streamedMessage
    ? [...messages, deltaToAssistantMessage(streamedMessage)]
    : messages;

  return (
    <div className="font-sans flex flex-col h-[calc(100dvh)] overflow-hidden">
      <ScrollableMessageList
        messages={allMessages}
        showAbort={shouldShowAbortButton}
        onAbort={onAbort}
      />

      <ChatMessageInput onSubmit={postMessage} disabled={!!streamedMessage} />
    </div>
  );
}
