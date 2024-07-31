import { ActionFunctionArgs } from "@remix-run/server-runtime";
import OpenAI from "openai";
import { z } from "zod";

const RequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
  model: z.string(),
});

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<Response> => {
  const client = new OpenAI({
    apiKey: process.env["OPENAI_API_KEY"],
  });
  const req = RequestSchema.parse(await request.json());

  let cancelled = false;

  const response = new Response(
    new ReadableStream({
      async start(controller) {
        const stream = await client.chat.completions.create({
          messages: req.messages,
          model: req.model,
          stream: true,
        });

        for await (const chunk of stream) {
          if (cancelled) {
            break;
          }

          if (chunk.choices[0].finish_reason === "stop") {
            controller.enqueue(`event: done\n\n`);
          } else if (chunk.choices[0].finish_reason === null) {
            controller.enqueue(
              `data: ${JSON.stringify(chunk.choices[0].delta)}\n\n`
            );
          }
        }
      },
      async cancel() {
        cancelled = true;
      },
    }),
    {}
  );
  response.headers.set("Content-Type", "text/event-stream");
  response.headers.set("Cache-Control", "no-cache");
  return response;
};
