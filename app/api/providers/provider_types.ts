import { ChatCompletionChunk, ChatCompletionMessage } from "~/lib/schema";

export type CompletionFunction = (args: {
  model: string;
  messages: ChatCompletionMessage[];
}) => AsyncIterable<ChatCompletionChunk>;
