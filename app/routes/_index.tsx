import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import {
  HeadersFunction,
  LinksFunction,
  type MetaFunction,
  json,
} from "@vercel/remix";
import { z } from "zod";
import { ChatMessageInput } from "~/components/ui/chat_message_input";
import { ClearButton } from "~/components/ui/clear_button";
import { ModelSelector } from "~/components/ui/model_selector";
import { ScrollableMessageList } from "~/components/ui/scrollable_message_list";
import { useChat } from "~/hooks/use_chat";
import { useFocusOnMount } from "~/hooks/use_focus_on_mount";
import { useLocalStorage } from "~/hooks/use_local_storage";
import { withAuthentication } from "~/lib/auth";

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

  const [model, setModel] = useLocalStorage(
    "model",
    "claude-3-5-sonnet-20240620",
    z.string()
  );
  const inputRef = useFocusOnMount<HTMLTextAreaElement>();

  const {
    messages,
    postMessage,
    isInputDisabled,
    clearMessages,
    messageDraft,
    setMessageDraft,
    onAbort,
    onRetry,
    showAbortButton,
    showRetryButton,
  } = useChat(model);

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
        messages={messages}
        showAbort={showAbortButton}
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
        disabled={isInputDisabled}
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
