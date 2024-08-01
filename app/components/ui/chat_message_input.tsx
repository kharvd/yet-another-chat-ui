import { Textarea } from "./textarea";
import { Button } from "./button";
import React, { forwardRef } from "react";
import { cn } from "~/lib/utils";

export function ChatMessageInput({
  onSubmit,
  disabled,
  className,
  inputRef,
}: {
  onSubmit: (message: string) => Promise<void>;
  disabled: boolean;
  className?: string;
  inputRef?: React.Ref<HTMLTextAreaElement>;
}) {
  const [messageDraft, setMessageDraft] = React.useState("");

  const submit = async () => {
    if (disabled || messageDraft.trim() === "") {
      return;
    }

    setMessageDraft("");
    await onSubmit(messageDraft.trim());
  };

  return (
    <div className={cn("p-4 bg-white", className)}>
      <div className="flex flex-row">
        <Textarea
          className="flex-1 resize-none h-[60px]"
          ref={inputRef}
          placeholder="Your message here..."
          value={messageDraft}
          onChange={(e) => setMessageDraft(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              await submit();
            }
          }}
        />
        <Button
          className="ml-2"
          onClick={async () => {
            await submit();
          }}
          disabled={messageDraft.trim() === "" || disabled}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
