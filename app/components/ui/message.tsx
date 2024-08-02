import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { ChatCompletionMessage } from "~/lib/schema";
import Markdown from "react-markdown";
import React from "react";

export const Message = React.memo(
  ({ message }: { message: ChatCompletionMessage }) => {
    return (
      <Alert className="mt-4">
        <AlertTitle>{message.role}</AlertTitle>
        <AlertDescription>
          <Markdown className="prose prose-sm max-w-none lg:prose-base">
            {message.content}
          </Markdown>
        </AlertDescription>
      </Alert>
    );
  }
);
