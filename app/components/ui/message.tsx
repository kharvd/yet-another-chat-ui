import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export function Message({ message }: { message: ChatCompletionMessageParam }) {
  const formattedText = (message.content as string)
    .split("\n")
    .map((line, index) => (
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
