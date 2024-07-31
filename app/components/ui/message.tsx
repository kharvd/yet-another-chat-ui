import React from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { ChatCompletionMessage } from "~/lib/schema";

export function Message({ message }: { message: ChatCompletionMessage }) {
  const formattedText = message.content.split("\n").map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));

  return (
    <Alert className="mt-4">
      <AlertTitle>{message.role}</AlertTitle>
      <AlertDescription>{formattedText}</AlertDescription>
    </Alert>
  );
}
