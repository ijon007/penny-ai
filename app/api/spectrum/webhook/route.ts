import { after } from "next/server";
import { handlePennyMessage } from "@/lib/handle-message";
import { getSpectrumApp } from "@/lib/spectrum";

export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  const body = await request.arrayBuffer();
  const rawRequest = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body,
  });

  let app;
  try {
    app = await getSpectrumApp();
  } catch (error) {
    console.error("Spectrum is not configured", error);
    return new Response("Spectrum is not configured", { status: 503 });
  }

  const pending: Promise<unknown>[] = [];

  const response = await app.webhook(rawRequest, (space, message) => {
    const job = handlePennyMessage(space, message);
    pending.push(job);
    return job;
  });

  after(async () => {
    for (let i = 0; i < 8 && pending.length === 0; i += 1) {
      await new Promise<void>((resolve) => {
        setImmediate(resolve);
      });
    }
    await Promise.allSettled(pending);
  });

  return response;
}
