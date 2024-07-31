import { ChatCompletionDelta, ChatCompletionMessage } from "./schema";

export function accumulateMessage(
  prev: ChatCompletionDelta | null,
  delta: ChatCompletionDelta
): ChatCompletionDelta {
  const role = (prev?.role ?? "") + (delta.role ?? "");
  const content = (prev?.content ?? "") + (delta.content ?? "");

  return {
    role,
    content,
  };
}

export function deltaToAssistantMessage(
  delta: ChatCompletionDelta
): ChatCompletionMessage {
  return {
    role: "assistant",
    content: delta.content ?? "",
  };
}
