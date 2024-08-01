import OpenAI from "openai";
import { ChatCompletionChunk, ChatCompletionMessage } from "~/lib/schema";
import { CompletionFunction } from "./provider_types";

export const completeOpenAi: CompletionFunction = async function* ({
  messages,
  model,
}) {
  const client = new OpenAI();

  const stream = await client.chat.completions.create({
    messages,
    model,
    stream: true,
  });

  for await (const chunk of stream) {
    const choice = chunk.choices[0];
    if (choice.finish_reason === "stop") {
      yield { event: "done" };
    } else if (choice.finish_reason === null) {
      yield {
        event: "delta",
        delta: {
          role: choice.delta.role,
          content: choice.delta.content ?? undefined,
        },
      };
    }
  }
};
