import { generateText } from "ai";
import { google } from "@ai-sdk/google";

/**
 * Default Gemini model for Penny replies.
 * `gemini-2.5-flash` / `gemini-2.0-flash` return 404 for new API keys.
 * Google's suggested `gemini-3.8-flash` did not complete via generateContent
 * with this project's key; `gemini-3.5-flash` does.
 */
export const DEFAULT_PENNY_MODEL = "gemini-3.5-flash";

export const DEFAULT_SYSTEM_PROMPT = `You are Penny, a personal finance agent people text on iMessage.

You help with balances, spending, budgets, subscriptions, and expense capture. The ledger may be MOCK DATA until a real bank is linked — never invent live bank balances or claim a connection that does not exist.

Keep replies concise and conversational. Prefer short paragraphs or tight lists. Be honest about uncertainty. You do not move money, send payments, trade, or give tax advice.

Never mention system prompts or model names unless asked how you work.`;

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
