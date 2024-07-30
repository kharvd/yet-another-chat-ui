import { ActionFunctionArgs } from "@remix-run/server-runtime";
import OpenAI from "openai";

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<Response> => {
  const client = new OpenAI({
    apiKey: process.env["OPENAI_API_KEY"],
  });
  const req = await request.json();

  let cancelled = false;

  const response = new Response(
    new ReadableStream({
      async start(controller) {
        const stream = await client.chat.completions.create({
          messages: req.messages,
          model: "gpt-4o-mini",
          stream: true,
        });

        for await (const chunk of stream) {
          if (cancelled) {
            break;
          }
          controller.enqueue(`data: ${JSON.stringify(chunk)}\n\n`);
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
