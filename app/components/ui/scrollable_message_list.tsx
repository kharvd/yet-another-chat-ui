import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { ScrollArea } from "./scroll-area";
import { useScrollToBottom } from "~/hooks/use_scroll_to_bottom";
import { AbortButton } from "./abort_button";
import { Message } from "./message";

export function ScrollableMessageList({
  messages,
  showAbort,
  onAbort,
}: {
  messages: ChatCompletionMessageParam[];
  showAbort: boolean;
  onAbort: () => void;
}) {
  const scrollToBottomDeps = [messages, showAbort];
  const { scrollAreaRef } = useScrollToBottom(scrollToBottomDeps);

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-grow p-4 relative">
      <div className={showAbort ? "pb-16" : ""}>
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
      </div>
      {showAbort ? <AbortButton onAbort={onAbort} /> : null}
    </ScrollArea>
  );
}
