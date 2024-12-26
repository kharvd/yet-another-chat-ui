import { z } from "zod";

export const ChatCompletionDeltaSchema = z.object({
  id: z.string().optional(),
  role: z.string().optional(),
  content: z.string().optional(),
});
export type ChatCompletionDelta = z.infer<typeof ChatCompletionDeltaSchema>;

export const ChatCompletionMessageSchema = z.object({
  id: z.string(),
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

export const ChatSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  title: z.string(),
  messages: z.array(ChatCompletionMessageSchema),
  streamedMessage: z.nullable(ChatCompletionMessageSchema),
});
export type Chat = z.infer<typeof ChatSchema>;

export const ChatHistorySchema = z.array(ChatSchema);
export type ChatHistory = z.infer<typeof ChatHistorySchema>;
