import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { parseMoneyToMinor } from "@/lib/finance/money";
import { resolveCategory } from "@/lib/finance/intents";
import type { CategoryId } from "@/lib/finance/types";
import { getPennyModel } from "@/lib/penny";

export interface ReceiptExtract {
  amountMinor: number | null;
  merchant: string | null;
  postedAt: string | null;
  category: CategoryId;
  confidence: "high" | "low";
  raw: string;
}

export async function extractReceiptFromImage(input: {
  bytes: Uint8Array;
  mimeType: string;
}): Promise<ReceiptExtract> {
  const { text } = await generateText({
    model: google(getPennyModel()),
    system:
      "Extract receipt fields as JSON only: {\"amount\":\"12.34\",\"merchant\":\"Name\",\"date\":\"YYYY-MM-DD\",\"category\":\"groceries|dining|transport|housing|utilities|subscriptions|shopping|health|income|other\",\"confidence\":\"high|low\"}. If unclear, use nulls and confidence low. Never invent a bank balance.",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract the purchase amount, merchant, date, and best category from this receipt or transaction screenshot.",
          },
          {
            type: "image",
            image: input.bytes,
            mediaType: input.mimeType,
          },
        ],
      },
    ],
  });

  const raw = text.trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  let parsed: Record<string, unknown> = {};
  try {
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]!) : {};
  } catch {
    parsed = {};
  }

  const amountMinor =
    typeof parsed.amount === "string" || typeof parsed.amount === "number"
      ? parseMoneyToMinor(String(parsed.amount))
      : null;

  return {
    amountMinor: amountMinor !== null ? Math.abs(amountMinor) : null,
    merchant:
      typeof parsed.merchant === "string" && parsed.merchant.trim()
        ? parsed.merchant.trim().slice(0, 80)
        : null,
    postedAt:
      typeof parsed.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date)
        ? parsed.date
        : null,
    category: resolveCategory(
      typeof parsed.category === "string" ? parsed.category : "other",
    ),
    confidence: parsed.confidence === "high" ? "high" : "low",
    raw,
  };
}
