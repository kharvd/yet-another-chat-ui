import { Alert, AlertDescription } from "~/components/ui/alert";
import { ChatCompletionMessage } from "~/lib/schema";
import Markdown from "react-markdown";
import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";
import { Pencil } from "lucide-react";
import { Button } from "./button";

const messageVariants = cva("border-0", {
  variants: {
    variant: {
      assistant: "",
      user: "bg-gray-100 border-0 rounded-2xl w-fit max-w-[90%]",
    },
  },
  defaultVariants: {
    variant: "user",
  },
});

export const Message = React.memo(
  ({
    message,
    onEdit,
  }: {
    message: ChatCompletionMessage;
    onEdit: () => void;
  }) => {
    const maybeAddEditButton = (children: React.ReactNode) => {
      return message.role === "user" ? (
        <div className="flex flex-row relative group/message">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2 invisible group-hover/message:visible p-2 rounded-xl"
            onClick={onEdit}
          >
            <Pencil size={16} />
          </Button>
          {children}
        </div>
      ) : (
        children
      );
    };
    return (
      <div className="flex flex-col items-end">
        {maybeAddEditButton(
          <Alert
            className={cn(
              messageVariants({
                variant: message.role === "assistant" ? "assistant" : "user",
              })
            )}
          >
            <AlertDescription>
              <Markdown className="prose prose-sm max-w-none lg:prose-base">
                {message.content}
              </Markdown>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }
);
