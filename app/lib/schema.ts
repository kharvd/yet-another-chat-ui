import { z } from "zod";

export const ChatCompletionDeltaSchema = z.object({
  role: z.string().optional(),
  content: z.string().optional(),
});
export type ChatCompletionDelta = z.infer<typeof ChatCompletionDeltaSchema>;

export const ChatCompletionMessageSchema = z.object({
  role: z.union([
    z.literal("user"),
    z.literal("assistant"),
    z.literal("system"),
  ]),
  content: z.string(),
});

export type ChatCompletionMessage = z.infer<typeof ChatCompletionMessageSchema>;

export type ChatCompletionChunk =
  | {
      event: "delta";
      delta: ChatCompletionDelta;
    }
  | {
      event: "done";
    };
