import { z } from "zod";

export const ChatCompletionDeltaSchema = z.object({
  role: z.string().optional(),
  content: z.string().optional(),
});
export type ChatCompletionDelta = z.infer<typeof ChatCompletionDeltaSchema>;

export type ChatCompletionMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};
