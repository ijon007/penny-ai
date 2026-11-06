import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { parseMoneyToMinor } from "@/lib/finance/money";
import { resolveCategory } from "@/lib/finance/intents";
import type { CategoryId } from "@/lib/finance/types";
import { CATEGORY_LABELS } from "@/lib/finance/types";
import { getPennyModel } from "@/lib/penny";

export interface ReceiptExtract {
  amountMinor: number | null;
  merchant: string | null;
  postedAt: string | null;
  category: CategoryId;
  confidence: "high" | "low";
  raw: string;
  rejectedReason?: string;
}

const MAX_AMOUNT_MINOR = 10_000_00; // $10,000.00 hard cap for mock capture
const MIN_AMOUNT_MINOR = 1;

const CATEGORY_IDS = new Set(Object.keys(CATEGORY_LABELS));

/** Validate model extraction before creating a pending draft. Never trust raw LLM output. */
export function validateReceiptExtract(parsed: Record<string, unknown>, raw: string): ReceiptExtract {
  let amountMinor: number | null = null;
  if (typeof parsed.amount === "string" || typeof parsed.amount === "number") {
    amountMinor = parseMoneyToMinor(String(parsed.amount));
  }
  if (amountMinor !== null) amountMinor = Math.abs(amountMinor);

  let merchant: string | null =
    typeof parsed.merchant === "string" && parsed.merchant.trim()
      ? parsed.merchant.trim().slice(0, 80)
      : null;
  if (merchant && /^(null|undefined|n\/a|unknown)$/i.test(merchant)) {
    merchant = null;
  }

  const postedAt =
    typeof parsed.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date)
      ? parsed.date
      : null;

  const catRaw = typeof parsed.category === "string" ? parsed.category.trim().toLowerCase() : "";
  const category: CategoryId = CATEGORY_IDS.has(catRaw)
    ? (catRaw as CategoryId)
    : resolveCategory(catRaw || "other");

  let confidence: "high" | "low" = parsed.confidence === "high" ? "high" : "low";
  let rejectedReason: string | undefined;

  if (amountMinor === null) {
    rejectedReason = "missing_or_invalid_amount";
    confidence = "low";
  } else if (amountMinor < MIN_AMOUNT_MINOR || amountMinor > MAX_AMOUNT_MINOR) {
    rejectedReason = "amount_out_of_bounds";
    amountMinor = null;
    confidence = "low";
  }

  if (!merchant) {
    rejectedReason = rejectedReason ?? "missing_merchant";
    confidence = "low";
  }

  // Model cannot invent high confidence without amount+merchant.
  if ((!amountMinor || !merchant) && confidence === "high") {
    confidence = "low";
  }

  return {
    amountMinor,
    merchant,
    postedAt,
    category,
    confidence,
    raw,
    rejectedReason,
  };
}

export async function extractReceiptFromImage(input: {
  bytes: Uint8Array;
  mimeType: string;
}): Promise<ReceiptExtract> {
  const { text } = await generateText({
    model: google(getPennyModel()),
    system:
      'Extract receipt fields as JSON only: {"amount":"12.34","merchant":"Name","date":"YYYY-MM-DD","category":"groceries|dining|transport|housing|utilities|subscriptions|shopping|health|income|other","confidence":"high|low"}. If unclear, use nulls and confidence low. Never invent a bank balance. Never fabricate amount or merchant.',
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

  return validateReceiptExtract(parsed, raw);
}
