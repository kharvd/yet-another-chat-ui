import { ChatCompletionChunk, ChatCompletionMessage } from "~/lib/schema";
import { Provider, providerForModel } from "../model_defs";
import { completeHyperbolic, completeOpenAi } from "./openai_provider";
import { completeAnthropic } from "./anthropic_provider";
import { CompletionFunction } from "./provider_types";

const completionForProvider: Record<
  Provider,
  (args: {
    model: string;
    messages: ChatCompletionMessage[];
  }) => AsyncIterable<ChatCompletionChunk>
> = {
  openai: completeOpenAi,
  anthropic: completeAnthropic,
  hyperbolic: completeHyperbolic,
};

export const chatCompletion: CompletionFunction = ({
  messages,
  model,
}): AsyncIterable<ChatCompletionChunk> => {
  return completionForProvider[providerForModel(model)]({
    model,
    messages,
  });
};
