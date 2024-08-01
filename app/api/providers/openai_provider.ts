import OpenAI from "openai";
import { CompletionFunction } from "./provider_types";

export const DEFAULT_SYSTEM_PROMPT = `
You are ChatGPT, a large language model trained by OpenAI, based on the GPT-4 architecture.
Knowledge cutoff: 2023-10
Current date: {current_date}

Image input capabilities: Disabled
Personality: v2
`.trim();

export const completeOpenAi: CompletionFunction = async function* ({
  messages,
  model,
}) {
  const client = new OpenAI();

  if (messages[0].role !== "system") {
    messages.unshift({
      role: "system",
      content: DEFAULT_SYSTEM_PROMPT.replace(
        "{current_date}",
        new Date().toDateString()
      ),
    });
  }

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
