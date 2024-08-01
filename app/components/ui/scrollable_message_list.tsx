import { ScrollArea } from "./scroll-area";
import { useScrollToBottom } from "~/hooks/use_scroll_to_bottom";
import { AbortButton } from "./abort_button";
import { Message } from "./message";
import { ChatCompletionMessage } from "~/lib/schema";
import { cn } from "~/lib/utils";

export function ScrollableMessageList({
  messages,
  showAbort,
  onAbort,
  className,
}: {
  messages: ChatCompletionMessage[];
  showAbort: boolean;
  onAbort: () => void;
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
      {showAbort ? <AbortButton onAbort={onAbort} /> : null}
    </ScrollArea>
  );
}
