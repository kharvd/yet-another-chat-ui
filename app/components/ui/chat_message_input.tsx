import { Textarea } from "./textarea";
import { Button } from "./button";
import React from "react";
import { cn } from "~/lib/utils";
import { SendHorizonal } from "lucide-react";

export function ChatMessageInput({
  messageDraft,
  onSubmit,
  onChange,
  disabled,
  className,
  inputRef,
}: {
  messageDraft: string;
  onSubmit: (message: string) => Promise<void>;
  onChange: (message: string) => void;
  disabled: boolean;
  className?: string;
  inputRef?: React.Ref<HTMLTextAreaElement>;
}) {
  const submit = async () => {
    if (disabled || messageDraft.trim() === "") {
      return;
    }
    await onSubmit(messageDraft.trim());
  };

  return (
    <div className={cn("p-4 bg-white", className)}>
      <div className="flex flex-row items-center gap-2">
        <Textarea
          className="flex-1 resize-none h-10 py-2"
          ref={inputRef}
          placeholder="Your message here..."
          value={messageDraft}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              await submit();
            }
          }}
        />
        <Button
          className="h-12"
          variant="ghost"
          onClick={async () => {
            await submit();
          }}
          disabled={messageDraft.trim() === "" || disabled}
        >
          <SendHorizonal />
        </Button>
      </div>
    </div>
  );
}
