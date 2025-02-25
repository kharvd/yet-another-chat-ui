import { ChatCompletionChunk, ChatCompletionMessage } from "~/lib/schema";

export type CompletionFunction = (args: {
  model: string;
  messages: ChatCompletionMessage[];
  enableThinking?: boolean;
  thinkingBudget?: number;
}) => AsyncIterable<ChatCompletionChunk>;
