import { useNavigate, useParams } from "@remix-run/react";
import { json, type MetaFunction } from "@vercel/remix";
import { useEffect, useState } from "react";
import { AppSidebar } from "~/components/ui/app_sidebar";
import { ChatMessageInput } from "~/components/ui/chat_message_input";
import { ClearButton } from "~/components/ui/clear_button";
import { ModelSelector } from "~/components/ui/model_selector";
import { ScrollableMessageList } from "~/components/ui/scrollable_message_list";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { useChat } from "~/hooks/use_chat";
import { useFocusOnMount } from "~/hooks/use_focus_on_mount";
import { withAuthentication } from "~/lib/auth";
import { getChatId, setChatId, sliceMessages } from "~/lib/client_data";
import { v4 as uuidv4 } from "uuid";
import { useModel } from "~/hooks/use_model";
export const meta: MetaFunction = () => {
  return [
    { title: "Chat - Yet Another Chat UI" },
    { name: "description", content: "Chat with AI" },
    {
      name: "viewport",
      content:
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    },
  ];
};

export const loader = withAuthentication(async () => {
  return json({});
});

export default function Chat() {
  const navigate = useNavigate();
  const params = useParams();
  const chatId = params.chatId!;

  // server does not have any chat data, so we should not SSR
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (chatId !== getChatId()) {
      setChatId(chatId);
    }
    inputRef.current?.focus();
  }, [chatId]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const [model, setModel] = useModel();

  const inputRef = useFocusOnMount<HTMLTextAreaElement>();

  const {
    messages,
    postMessage,
    isInputDisabled,
    messageDraft,
    setMessageDraft,
    onAbort,
    onRetry,
    showAbortButton,
    showRetryButton,
  } = useChat(chatId, model);

  const onEdit = (messageIndex: number) => {
    const message = messages[messageIndex];
    setMessageDraft(message.content);
    sliceMessages(chatId, 0, messageIndex);
    inputRef.current?.focus();
  };

  return !isLoaded ? null : (
    <SidebarProvider className="h-full w-full">
      <AppSidebar />
      <div className="font-sans flex flex-col items-center h-full w-full">
        <div className="flex flex-row pt-3 pb-3 w-full">
          <SidebarTrigger className="ml-4 mt-1" />

          <div className="flex flex-row flex-grow justify-center w-fit">
            <ModelSelector value={model} onChange={setModel} />
          </div>

          <ClearButton
            clearMessages={() => {
              onAbort();
              const newChatId = uuidv4();
              setChatId(newChatId);
              navigate(`/chat/${newChatId}`);
            }}
            className="mr-4 mt-1"
          />
        </div>
        <ScrollableMessageList
          className={"flex-grow p-4 pb-0 pt-0 relative w-full"}
          messages={messages}
          showAbort={showAbortButton}
          showError={showRetryButton}
          onAbort={onAbort}
          onRetry={onRetry}
          onEdit={onEdit}
        />

        <ChatMessageInput
          messageDraft={messageDraft}
          onChange={setMessageDraft}
          inputRef={inputRef}
          className={"w-full lg:w-7/12 pb-8"}
          onSubmit={postMessage}
          disabled={isInputDisabled}
        />
      </div>
    </SidebarProvider>
  );
}
