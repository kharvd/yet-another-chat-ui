import { ChatCompletionDelta, ChatCompletionMessage } from "./schema";
import { v4 as uuidv4 } from "uuid";

export function accumulateMessage(
  prev: ChatCompletionDelta | null,
  delta: ChatCompletionDelta
): ChatCompletionDelta {
  const id = prev?.id ?? uuidv4();
  const role = (prev?.role ?? "") + (delta.role ?? "");
  const content = (prev?.content ?? "") + (delta.content ?? "");
  const thinking = delta.thinking ? 
    (prev?.thinking ? prev.thinking + delta.thinking : delta.thinking) : 
    prev?.thinking ?? "";

  return {
    id,
    role,
    content,
    thinking,
  };
}

export function deltaToAssistantMessage(
  delta: ChatCompletionDelta
): ChatCompletionMessage {
  return {
    id: delta.id ?? uuidv4(),
    role: "assistant",
    content: delta.content ?? "",
    thinking: delta.thinking,
  };
}
