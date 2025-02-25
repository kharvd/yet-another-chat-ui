import { Alert, AlertDescription } from "~/components/ui/alert";
import { ChatCompletionMessage } from "~/lib/schema";
import Markdown from "react-markdown";
import React, { useState } from "react";
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";
import { ChevronDown, ChevronRight, Pencil } from "lucide-react";
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
    const [isThinkingCollapsed, setIsThinkingCollapsed] = useState(false);
    
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
    
    const hasThinking = message.thinking && message.thinking.trim() !== "" && message.role === "assistant";
    
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
              {hasThinking && (
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-2 cursor-pointer" onClick={() => setIsThinkingCollapsed(!isThinkingCollapsed)}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0" 
                    >
                      {isThinkingCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                    </Button>
                    <p className="text-sm text-muted-foreground font-medium">Thinking:</p>
                  </div>
                  {!isThinkingCollapsed && (
                    <Markdown className="prose prose-sm max-w-none lg:prose-base italic text-muted-foreground">
                      {message.thinking}
                    </Markdown>
                  )}
                </div>
              )}
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
