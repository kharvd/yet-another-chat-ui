import type { MetaFunction } from "@remix-run/node";
import React from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { ScrollableMessageList } from "~/components/ui/scrollable_message_list";
import { ChatMessageInput } from "~/components/ui/chat_message_input";
import { useDelayedFlag } from "~/hooks/use_delayed_flag";
import {
  ChatCompletionDelta,
  ChatCompletionDeltaSchema,
  ChatCompletionMessage,
} from "~/lib/schema";
import { accumulateMessage, deltaToAssistantMessage } from "~/lib/messages";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const [messages, setMessages] = React.useState<ChatCompletionMessage[]>([]);
  const [streamedMessage, setStreamedMessage] =
    React.useState<ChatCompletionDelta | null>(null);
  const [abortController, setAbortController] =
    React.useState<AbortController | null>(null);

  const [showAbort, setShowAbortDelayed, resetShowAbort] = useDelayedFlag();

  const finishStreaming = () => {
    setStreamedMessage((lastMessage) => {
      if (lastMessage) {
        setMessages((prev) => [...prev, deltaToAssistantMessage(lastMessage)]);
      }
      return null;
    });
    if (abortController) {
      abortController.abort();
    }
    setAbortController(null);
    resetShowAbort();
  };

  const postMessage = async (message: string) => {
    console.log("postMessage");
    const userMessage: ChatCompletionMessage = {
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);

    const ctrl = new AbortController();
    setAbortController(ctrl);

    setShowAbortDelayed(1000);

    await fetchEventSource("/api/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [...messages, userMessage],
      }),
      signal: ctrl.signal,
      openWhenHidden: true,
      onmessage(e) {
        console.log(e.data);
        if (e.event === "done") {
          finishStreaming();
          return;
        }

        const delta = ChatCompletionDeltaSchema.parse(JSON.parse(e.data));
        setStreamedMessage((prev) => accumulateMessage(prev, delta));
      },
      onclose() {
        finishStreaming();
      },
      onerror(e) {
        console.error(e);
        finishStreaming();
      },
    });
  };

  const abort = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      finishStreaming();
    }
  };

  const shouldShowAbortButton = abortController !== null && showAbort;

  const allMessages = streamedMessage
    ? [...messages, deltaToAssistantMessage(streamedMessage)]
    : messages;

  return (
    <div className="font-sans flex flex-col h-screen">
      <ScrollableMessageList
        messages={allMessages}
        showAbort={shouldShowAbortButton}
        onAbort={abort}
      />

      <ChatMessageInput onSubmit={postMessage} disabled={!!streamedMessage} />
    </div>
  );
}
