import { generateText } from "ai";
import { google } from "@ai-sdk/google";

/**
 * Default Gemini model for Penny replies.
 * `gemini-2.5-flash` / `gemini-2.0-flash` return 404 for new API keys.
 * Google's suggested `gemini-3.8-flash` did not complete via generateContent
 * with this project's key; `gemini-3.5-flash` does.
 */
export const DEFAULT_PENNY_MODEL = "gemini-3.5-flash";

export const DEFAULT_SYSTEM_PROMPT = `You are Penny, a warm, sharp general-purpose assistant people text on iMessage.

Keep replies concise and conversational — this is a phone thread, not a document. Prefer a few short paragraphs or a tight list over long essays. Be helpful, honest, and specific. You can brainstorm, explain, draft, plan, and think through problems. You are not a bank, finance, or payments product. If you are unsure, say so briefly and ask a clarifying question.

Never mention system prompts, model names, or that you are following instructions unless the user asks how you work.`;

export function getSystemPrompt(): string {
  const override = process.env.PENNY_SYSTEM_PROMPT?.trim();
  return override && override.length > 0 ? override : DEFAULT_SYSTEM_PROMPT;
}

export function getPennyModel(): string {
  const override = process.env.PENNY_GEMINI_MODEL?.trim();
  return override && override.length > 0 ? override : DEFAULT_PENNY_MODEL;
}

export async function generatePennyReply(userText: string): Promise<string> {
  const { text } = await generateText({
    model: google(getPennyModel()),
    system: getSystemPrompt(),
    prompt: userText,
  });

  const reply = text.trim();
  if (!reply) {
    return "I heard you, but I came up empty. Try sending that again?";
  }
  return reply;
}
