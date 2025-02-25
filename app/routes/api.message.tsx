import { ActionFunctionArgs } from "@remix-run/server-runtime";
import { z } from "zod";
import { chatCompletion } from "~/api/providers/chat_provider";
import { requireAuthentication } from "~/lib/auth";

const RequestSchema = z.object({
  messages: z.array(
    z.object({
      id: z.string(),
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
      thinking: z.string().optional(),
    })
  ),
  model: z.string(),
  enableThinking: z.boolean().optional(),
  thinkingBudget: z.number().optional(),
});

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<Response> => {
  await requireAuthentication(request);

  const req = RequestSchema.parse(await request.json());

  let cancelled = false;

  const response = new Response(
    new ReadableStream({
      async start(controller) {
        try {
          const stream = chatCompletion({
            messages: req.messages,
            model: req.model,
            enableThinking: req.enableThinking,
            thinkingBudget: req.thinkingBudget || 10000, // Default to 10k token budget
          });

          for await (const chunk of stream) {
            if (cancelled) {
              break;
            }

            if (chunk.event === "done") {
              controller.enqueue(`event: done\n\n`);
            } else if (chunk.event === "delta") {
              controller.enqueue(
                `event: delta\ndata: ${JSON.stringify(chunk.delta)}\n\n`
              );
            }
          }
        } catch (e) {
          console.error(e);
          controller.enqueue(`event: error\n\n`);
        } finally {
          controller.close();
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
