import {
  type MetaFunction,
  json,
  HeadersFunction,
  LinksFunction,
} from "@vercel/remix";
import React from "react";
import { ScrollableMessageList } from "~/components/ui/scrollable_message_list";
import { ChatMessageInput } from "~/components/ui/chat_message_input";
import { useDelayedFlag } from "~/hooks/use_delayed_flag";
import {
  ChatCompletionMessage,
  ChatCompletionMessageSchema,
} from "~/lib/schema";
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
import { z } from "zod";
import { useToast } from "~/components/ui/use-toast";

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

const emptyArray: ChatCompletionMessage[] = [];

function useChat(model: string) {
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

  const isLastMessageUser =
    messages.length > 0 && messages[messages.length - 1].role === "user";
  const showRetryButton = !isLastMessageUser && showRetry;

  React.useEffect(() => {
    // restore message draft if it wasn't submitted
    if (!streamedMessage && !abortFunc && isLastMessageUser) {
      setMessageDraft(messages[messages.length - 1].content);
      setMessages((prev) => prev.slice(0, -1));
    }
  }, [streamedMessage, messages, isLastMessageUser, abortFunc]);

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

  const onError = (error: Error) => {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
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
      onError(e as Error);
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

  const shouldShowAbortButton = abortFunc !== null && showAbort;

  return {
    messages,
    streamedMessage,
    postMessage,
    isLastMessageUser,
    clearMessages,
    messageDraft,
    setMessageDraft,
    onAbort,
    onRetry,
    shouldShowAbortButton,
    showRetryButton,
  };
}

export default function Index() {
  useLoaderData<typeof loader>();

  const [model, setModel] = useLocalStorage(
    "model",
    "claude-3-5-sonnet-20240620",
    z.string()
  );
  const inputRef = useFocusOnMount<HTMLTextAreaElement>();

  const {
    messages,
    streamedMessage,
    postMessage,
    isLastMessageUser,
    clearMessages,
    messageDraft,
    setMessageDraft,
    onAbort,
    onRetry,
    shouldShowAbortButton,
    showRetryButton,
  } = useChat(model);

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
          clearMessages={() => {
            clearMessages();
            inputRef.current?.focus();
          }}
          className="p-0 absolute right-8"
        />
      </div>
      <ScrollableMessageList
        className={"flex-grow p-4 relative w-full"}
        messages={allMessages}
        showAbort={shouldShowAbortButton}
        showError={showRetryButton}
        onAbort={onAbort}
        onRetry={onRetry}
      />

      <ChatMessageInput
        messageDraft={messageDraft}
        onChange={setMessageDraft}
        inputRef={inputRef}
        className={"w-full lg:w-7/12"}
        onSubmit={postMessage}
        disabled={isLastMessageUser}
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
