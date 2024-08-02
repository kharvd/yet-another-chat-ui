import { fetchEventSource } from "@microsoft/fetch-event-source";
import { accumulateMessage, deltaToAssistantMessage } from "~/lib/messages";
import {
  ChatCompletionDelta,
  ChatCompletionDeltaSchema,
  ChatCompletionMessage,
} from "~/lib/schema";

export function chatCompletion({
  messages,
  model,
  onMessageUpdate,
  onDone,
}: {
  messages: ChatCompletionMessage[];
  model: string;
  onMessageUpdate: (message: ChatCompletionMessage) => void;
  onDone: () => void;
}): { abort: () => void; promise: Promise<void> } {
  const abortController = new AbortController();
  let streamedMessage: ChatCompletionDelta | null = null;

  const promise = fetchEventSource("/api/message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      model,
    }),
    signal: abortController.signal,
    openWhenHidden: true,
    onmessage(e) {
      if (e.event === "done") {
        onDone();
        return;
      }

      if (e.event === "delta") {
        const delta = ChatCompletionDeltaSchema.parse(JSON.parse(e.data));
        streamedMessage = accumulateMessage(streamedMessage, delta);

        onMessageUpdate(deltaToAssistantMessage(streamedMessage));
      }

      if (e.event === "error") {
        throw new Error("ChatCompletionStream error");
      }
    },
    onclose() {
      onDone();
    },
    onerror(e) {
      console.error(e);
      throw e;
    },
  });

  return {
    abort: () => {
      abortController.abort();
    },
    promise,
  };
}
