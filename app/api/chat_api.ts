import { fetchEventSource } from "@microsoft/fetch-event-source";
import { accumulateMessage, deltaToAssistantMessage } from "~/lib/messages";
import {
  ChatCompletionDelta,
  ChatCompletionDeltaSchema,
  ChatCompletionMessage,
} from "~/lib/schema";

export function chatCompletion({
  messages,
  onMessageUpdate,
  onDone,
}: {
  messages: ChatCompletionMessage[];
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
    }),
    signal: abortController.signal,
    openWhenHidden: true,
    onmessage(e) {
      console.log(e.data);
      if (e.event === "done") {
        onDone();
        return;
      }

      const delta = ChatCompletionDeltaSchema.parse(JSON.parse(e.data));
      streamedMessage = accumulateMessage(streamedMessage, delta);

      onMessageUpdate(deltaToAssistantMessage(streamedMessage));
    },
    onclose() {
      onDone();
    },
    onerror(e) {
      console.error(e);
      onDone();
    },
  });

  return {
    abort: () => {
      abortController.abort();
    },
    promise,
  };
}
