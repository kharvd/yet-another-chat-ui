import { ScrollArea } from "./scroll-area";
import { useScrollToBottom } from "~/hooks/use_scroll_to_bottom";
import { FloatingButton } from "./floating_button";
import { Message } from "./message";
import { ChatCompletionMessage } from "~/lib/schema";
import { cn } from "~/lib/utils";

export function ScrollableMessageList({
  messages,
  showAbort,
  showError,
  onAbort,
  onRetry,
  className,
}: {
  messages: ChatCompletionMessage[];
  showAbort: boolean;
  showError: boolean;
  onAbort: () => void;
  onRetry: () => void;
  className?: string;
}) {
  const scrollToBottomDeps = [messages, showAbort];
  const { scrollAreaRef } = useScrollToBottom(scrollToBottomDeps);

  return (
    <ScrollArea ref={scrollAreaRef} className={cn("", className)}>
      <div
        className={cn("flex flex-col items-center", showAbort ? "pb-16" : "")}
      >
        <div className="w-full lg:w-7/12">
          {messages.map((message, index) => (
            <Message key={index} message={message} />
          ))}
        </div>
      </div>
      {showAbort ? (
        <FloatingButton onClick={onAbort}>Stop</FloatingButton>
      ) : null}
      {showError ? (
        <FloatingButton onClick={onRetry} variant="destructive">
          Retry
        </FloatingButton>
      ) : null}
    </ScrollArea>
  );
}
