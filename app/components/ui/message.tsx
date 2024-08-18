import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { ChatCompletionMessage } from "~/lib/schema";
import Markdown from "react-markdown";
import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";

const messageVariants = cva("mt-4 border-0", {
  variants: {
    variant: {
      assistant: "",
      user: "bg-gray-50 border-0 rounded-2xl w-fit max-w-[90%]",
    },
  },
  defaultVariants: {
    variant: "user",
  },
});
export const Message = React.memo(
  ({ message }: { message: ChatCompletionMessage }) => {
    const variant = message.role === "user" ? "user" : "assistant";
    return (
      <div className="flex flex-col items-end">
        <Alert
          className={cn(
            messageVariants({
              variant: message.role === "assistant" ? "assistant" : "user",
            })
          )}
        >
          {/* <AlertTitle>{message.role}</AlertTitle> */}
          <AlertDescription>
            <Markdown className="prose prose-sm max-w-none lg:prose-base">
              {message.content}
            </Markdown>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
);
