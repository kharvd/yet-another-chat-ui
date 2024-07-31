import { Textarea } from "./textarea";
import { Button } from "./button";
import React from "react";

export function ChatMessageInput({
  onSubmit,
  disabled,
}: {
  onSubmit: (message: string) => Promise<void>;
  disabled: boolean;
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
    <div className="border-t p-4 bg-white">
      <div className="flex flex-row">
        <Textarea
          className="flex-1 resize-none h-[60px]"
          placeholder="Your message here..."
          value={messageDraft}
          onChange={(e) => setMessageDraft(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              console.log("onKeyDown");
              await submit();
            } else if (e.key === "Enter" && e.shiftKey) {
              setMessageDraft((prev) => prev + "\n");
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
