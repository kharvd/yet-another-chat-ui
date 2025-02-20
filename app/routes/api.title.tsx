import { ActionFunctionArgs } from "@remix-run/server-runtime";
import { z } from "zod";
import { requireAuthentication } from "~/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const RequestSchema = z.object({
  message: z.string(),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireAuthentication(request);

  const req = RequestSchema.parse(await request.json());

  const client = new Anthropic();

  const completion = await client.messages.create({
    messages: [
      {
        role: "user",
        content: `Generate a 2-4 word title for this message:\n<message>${req.message}</message>`,
      },
    ],
    model: "claude-3-5-haiku-20241022",
    temperature: 0,
    max_tokens: 30,
    system: "Your task is to generate chat titles. You will receive a message wrapped in XML tags. Generate a 2-4 word title that captures the main topic. Output ONLY the title - no quotes, punctuation, or explanations. Focus on key nouns and concepts.",
  });

  if (!completion.content || completion.content.length === 0) {
    return { title: "" };
  }
  
  // Get the first text block's content
  const textBlock = completion.content[0];
  if (textBlock.type !== 'text') {
    return { title: "" };
  }
  
  return { title: textBlock.text };
};
