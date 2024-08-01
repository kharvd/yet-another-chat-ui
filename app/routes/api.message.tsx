import { ActionFunctionArgs, HeadersFunction } from "@remix-run/server-runtime";
import OpenAI from "openai";
import { z } from "zod";
import { chatCompletion } from "~/api/providers/chat_provider";
import { isAuthenticated } from "~/lib/auth";

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
  if (!isAuthenticated(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const req = RequestSchema.parse(await request.json());

  let cancelled = false;

  const response = new Response(
    new ReadableStream({
      async start(controller) {
        const stream = chatCompletion({
          messages: req.messages,
          model: req.model,
        });

        for await (const chunk of stream) {
          if (cancelled) {
            break;
          }

          if (chunk.event === "done") {
            controller.enqueue(`event: done\n\n`);
          } else if (chunk.event === "delta") {
            controller.enqueue(`data: ${JSON.stringify(chunk.delta)}\n\n`);
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
