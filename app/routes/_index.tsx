import {
  type MetaFunction,
  type LoaderFunctionArgs,
  json,
  HeadersFunction,
} from "@remix-run/node";
import React from "react";
import { ScrollableMessageList } from "~/components/ui/scrollable_message_list";
import { ChatMessageInput } from "~/components/ui/chat_message_input";
import { useDelayedFlag } from "~/hooks/use_delayed_flag";
import { ChatCompletionMessage } from "~/lib/schema";
import { deltaToAssistantMessage } from "~/lib/messages";
import { chatCompletion } from "~/api/chat_api";
import { ModelSelector } from "~/components/ui/model_selector";
import { useLoaderData } from "@remix-run/react";
import { isAuthenticated } from "~/lib/auth";

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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (!isAuthenticated(request)) {
    return json({ authorized: false }, { status: 401 });
  }

  return json({ authorized: true });
};

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  return {
    "WWW-Authenticate": "Basic",
    ...loaderHeaders,
  };
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  if (!data.authorized) {
    return <div>Unauthorized</div>;
  }

  const [messages, setMessages] = React.useState<ChatCompletionMessage[]>([]);
  const [streamedMessage, setStreamedMessage] =
    React.useState<ChatCompletionMessage | null>(null);
  const [abortFunc, setAbortFunc] = React.useState<(() => void) | null>(null);
  const [showAbort, setShowAbortDelayed, resetShowAbort] = useDelayedFlag();
  const [model, setModel] = React.useState("gpt-4o-mini-2024-07-18");

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
      model,
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
    <div className="font-sans flex flex-col h-[calc(100dvh)]">
      <div className="flex justify-center pt-4">
        <ModelSelector value={model} onChange={setModel} />
      </div>
      <ScrollableMessageList
        messages={allMessages}
        showAbort={shouldShowAbortButton}
        onAbort={onAbort}
      />

      <ChatMessageInput onSubmit={postMessage} disabled={!!streamedMessage} />
    </div>
  );
}
