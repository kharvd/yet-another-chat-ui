import Anthropic from "@anthropic-ai/sdk";
import { ChatCompletionChunk, ChatCompletionMessage } from "~/lib/schema";
import { CompletionFunction } from "./provider_types";

export const completeAnthropic: CompletionFunction = async function* ({
  model,
  messages,
}) {
  const client = new Anthropic();

  const { system, messages: anthropicMessages } = toAnthropicMessages(messages);
  const stream = await client.messages.create({
    max_tokens: 1024,
    system,
    messages: anthropicMessages,
    model,
    stream: true,
  });

  for await (const event of stream) {
    switch (event.type) {
      case "message_start":
        yield {
          event: "delta",
          delta: {
            role: event.message.role,
          },
        };
        break;
      case "message_stop":
        yield { event: "done" };
        break;
      case "content_block_start":
        break;
      case "content_block_delta":
        if (event.delta.type === "text_delta") {
          yield {
            event: "delta",
            delta: {
              content: event.delta.text,
            },
          };
        }
      case "content_block_stop":
        break;
    }
  }
};

function toAnthropicMessages(messages: ChatCompletionMessage[]): {
  system: string | undefined;
  messages: Anthropic.MessageParam[];
} {
  let systemMessage: string | undefined;
  if (messages[0].role === "system") {
    systemMessage = messages[0].content;
    messages = messages.slice(1);
  }

  const anthropicMessages = messages.map(
    (message) =>
      ({
        role: message.role === "system" ? "user" : message.role,
        content: message.content,
      } satisfies Anthropic.MessageParam)
  );

  return { system: systemMessage, messages: anthropicMessages };
}
