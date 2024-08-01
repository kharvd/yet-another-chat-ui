import OpenAI from "openai";
import { ChatCompletionChunk, ChatCompletionMessage } from "~/lib/schema";
import { CompletionFunction } from "./provider_types";

export const completeOpenAiGeneric = async function* ({
  messages,
  model,
  baseURL,
  apiKey,
  max_tokens,
  temperature,
  top_p,
}: {
  model: string;
  messages: ChatCompletionMessage[];
  baseURL: string | undefined;
  apiKey: string | undefined;
  max_tokens: number;
  temperature: number;
  top_p: number;
}): AsyncIterable<ChatCompletionChunk> {
  const client = new OpenAI({
    apiKey,
    baseURL,
  });

  try {
    const stream = await client.chat.completions.create({
      messages,
      model,
      max_tokens,
      temperature,
      top_p,
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
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const CHAT_GPT_SYSTEM_PROMPT = `
You are ChatGPT, a large language model trained by OpenAI, based on the GPT-4 architecture.
Knowledge cutoff: 2023-10
Current date: {current_date}

Image input capabilities: Disabled
Personality: v2
`.trim();
export const completeOpenAi: CompletionFunction = ({ messages, model }) => {
  if (messages[0].role !== "system") {
    messages = [
      {
        role: "system" as const,
        content: CHAT_GPT_SYSTEM_PROMPT.replace(
          "{current_date}",
          new Date().toDateString()
        ),
      },
      ...messages,
    ];
  }

  return completeOpenAiGeneric({
    model,
    messages,
    max_tokens: 4096,
    temperature: 0.7,
    top_p: 1,
    baseURL: undefined, // default
    apiKey: process.env.OPENAI_API_KEY,
  });
};

export const completeHyperbolic: CompletionFunction = ({ messages, model }) => {
  return completeOpenAiGeneric({
    model,
    messages,
    max_tokens: 2048,
    temperature: 0.7,
    top_p: 0.9,
    baseURL: "https://api.hyperbolic.xyz/v1",
    apiKey: process.env.HYPERBOLIC_API_KEY,
  });
};
