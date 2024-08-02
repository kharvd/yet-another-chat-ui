import {
  type MetaFunction,
  type LoaderFunctionArgs,
  json,
  HeadersFunction,
  LinksFunction,
} from "@vercel/remix";
import React from "react";
import { ScrollableMessageList } from "~/components/ui/scrollable_message_list";
import { ChatMessageInput } from "~/components/ui/chat_message_input";
import { useDelayedFlag } from "~/hooks/use_delayed_flag";
import { ChatCompletionMessage } from "~/lib/schema";
import { deltaToAssistantMessage } from "~/lib/messages";
import { chatCompletion } from "~/api/chat_api";
import { ModelSelector } from "~/components/ui/model_selector";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { withAuthentication } from "~/lib/auth";
import { useLocalStorage } from "~/hooks/use_local_storage";
import { ClearButton } from "~/components/ui/clear_button";
import { useFocusOnMount } from "~/hooks/use_focus_on_mount";

export const meta: MetaFunction = () => {
  return [
    { title: "Yet Another Chat UI" },
    { name: "description", content: "Yet Another Chat UI" },
    {
      name: "viewport",
      content:
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    },
  ];
};

export const links: LinksFunction = () => {
  return [
    { rel: "icon", href: "/favicon.ico" },
    { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
  ];
};

export const loader = withAuthentication(async () => {
  return json({});
});

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  const headers = new Headers();
  const settableHeaders = ["WWW-Authenticate"];

  for (const header of settableHeaders) {
    if (loaderHeaders.has(header)) {
      headers.set(header, loaderHeaders.get(header)!);
    }
  }

  return headers;
};

export default function Index() {
  useLoaderData<typeof loader>();

  const [messages, setMessages] = React.useState<ChatCompletionMessage[]>([]);
  const [streamedMessage, setStreamedMessage] =
    React.useState<ChatCompletionMessage | null>(null);
  const [abortFunc, setAbortFunc] = React.useState<(() => void) | null>(null);
  const [showAbort, setShowAbortDelayed, resetShowAbort] = useDelayedFlag();
  const [model, setModel] = useLocalStorage(
    "model",
    "claude-3-5-sonnet-20240620"
  );
  const inputRef = useFocusOnMount<HTMLTextAreaElement>();

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

  const clearMessages = () => {
    onAbort();
    setMessages([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const shouldShowAbortButton = abortFunc !== null && showAbort;

  const allMessages = streamedMessage
    ? [...messages, deltaToAssistantMessage(streamedMessage)]
    : messages;

  return (
    <div className="font-sans flex flex-col items-center h-[calc(100dvh)]">
      <div className="flex flex-row pt-4">
        <div className="flex flex-row flex-grow justify-center">
          <ModelSelector value={model} onChange={setModel} />
        </div>

        <ClearButton
          clearMessages={clearMessages}
          className="p-0 absolute right-8"
        />
      </div>
      <ScrollableMessageList
        className={"flex-grow p-4 relative w-full"}
        messages={allMessages}
        showAbort={shouldShowAbortButton}
        onAbort={onAbort}
      />

      <ChatMessageInput
        inputRef={inputRef}
        className={"w-full lg:w-7/12"}
        onSubmit={postMessage}
        disabled={!!streamedMessage}
      />
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 401:
        return <div>Unauthorized</div>;
      default:
        return <div>Error</div>;
    }
  }
}
