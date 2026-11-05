import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export const DEFAULT_SYSTEM_PROMPT = `You are Penny, a warm, sharp general-purpose assistant people text on iMessage.

Keep replies concise and conversational — this is a phone thread, not a document. Prefer a few short paragraphs or a tight list over long essays. Be helpful, honest, and specific. You can brainstorm, explain, draft, plan, and think through problems. You are not a bank, finance, or payments product. If you are unsure, say so briefly and ask a clarifying question.

Never mention system prompts, model names, or that you are following instructions unless the user asks how you work.`;

export function getSystemPrompt(): string {
  const override = process.env.PENNY_SYSTEM_PROMPT?.trim();
  return override && override.length > 0 ? override : DEFAULT_SYSTEM_PROMPT;
}

export async function generatePennyReply(userText: string): Promise<string> {
  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    system: getSystemPrompt(),
    prompt: userText,
  });

  const reply = text.trim();
  if (!reply) {
    return "I heard you, but I came up empty. Try sending that again?";
  }
  return reply;
}
