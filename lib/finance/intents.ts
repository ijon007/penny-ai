import { parseMoneyToMinor } from "@/lib/finance/money";
import type { CategoryId } from "@/lib/finance/types";

export type FinanceIntent =
  | { type: "balances" }
  | { type: "spend" }
  | { type: "budget" }
  | { type: "recurring" }
  | { type: "chart" }
  | { type: "opt_in"; flag: "weekly" | "budget" | "recurring" }
  | { type: "opt_out"; flag: "weekly" | "budget" | "recurring" }
  | { type: "set_timezone"; timezone: string }
  | { type: "set_quiet_hours"; start: number; end: number }
  | {
      type: "expense";
      amountMinor: number;
      merchant: string;
      category: CategoryId;
    }
  | { type: "help" }
  | { type: "unknown" };

const CATEGORY_ALIASES: Record<string, CategoryId> = {
  groceries: "groceries",
  grocery: "groceries",
  food: "groceries",
  dining: "dining",
  restaurant: "dining",
  coffee: "dining",
  uber: "transport",
  transport: "transport",
  gas: "transport",
  rent: "housing",
  housing: "housing",
  utilities: "utilities",
  electric: "utilities",
  subscription: "subscriptions",
  subscriptions: "subscriptions",
  netflix: "subscriptions",
  shopping: "shopping",
  amazon: "shopping",
  health: "health",
  income: "income",
  paycheck: "income",
  other: "other",
};

export function resolveCategory(raw: string | undefined): CategoryId {
  if (!raw) return "other";
  return CATEGORY_ALIASES[raw.trim().toLowerCase()] ?? "other";
}

/** Heuristic parser for finance commands; engine remains source of truth. */
export function parseFinanceIntent(text: string): FinanceIntent {
  const t = text.trim();
  const lower = t.toLowerCase();

  if (/^(help|what can you do)\b/.test(lower)) return { type: "help" };
  if (/\b(balance|balances|how much.*(have|left)|net worth)\b/.test(lower)) {
    return { type: "balances" };
  }
  if (/\b(budget|budgets)\b/.test(lower)) return { type: "budget" };
  if (/\b(subscription|subscriptions|recurring)\b/.test(lower)) {
    return { type: "recurring" };
  }
  if (/\b(chart|graph|breakdown)\b/.test(lower)) return { type: "chart" };

  if (/opt[ -]?in .*weekly|weekly summary on/.test(lower)) {
    return { type: "opt_in", flag: "weekly" };
  }
  if (/opt[ -]?out .*weekly|weekly summary off/.test(lower)) {
    return { type: "opt_out", flag: "weekly" };
  }
  if (/opt[ -]?in .*budget|budget alerts on/.test(lower)) {
    return { type: "opt_in", flag: "budget" };
  }
  if (/opt[ -]?out .*budget|budget alerts off/.test(lower)) {
    return { type: "opt_out", flag: "budget" };
  }
  if (/opt[ -]?in .*recurring|recurring reminders on/.test(lower)) {
    return { type: "opt_in", flag: "recurring" };
  }
  if (/opt[ -]?out .*recurring|recurring reminders off/.test(lower)) {
    return { type: "opt_out", flag: "recurring" };
  }

  const tz = t.match(/timezone\s+([A-Za-z_\/]+)/i);
  if (tz) {
    return { type: "set_timezone", timezone: tz[1]! };
  }
  const quiet = lower.match(/quiet hours?\s+(\d{1,2})\s*-\s*(\d{1,2})/);
  if (quiet) {
    return {
      type: "set_quiet_hours",
      start: Math.min(23, Number(quiet[1])),
      end: Math.min(23, Number(quiet[2])),
    };
  }

  // "spent $12.50 at Starbucks on coffee" / "$12.50 Starbucks"
  const moneyMatch = t.match(/\$?\d+(?:\.\d{1,2})?/);
  if (
    moneyMatch &&
    (/\b(spent|spend|paid|bought|expense|add)\b/i.test(t) || /\bat\b/i.test(t))
  ) {
    const amountMinor = parseMoneyToMinor(moneyMatch[0]);
    if (amountMinor !== null && amountMinor !== 0) {
      const at = t.match(/\bat\s+([^,.]+)/i);
      const merchant = (at?.[1] ?? "Unknown").trim().slice(0, 80);
      const catWord = t.match(/\b(?:for|on|category)\s+([a-zA-Z]+)/i)?.[1];
      return {
        type: "expense",
        amountMinor: Math.abs(amountMinor),
        merchant,
        category: resolveCategory(catWord ?? merchant.split(/\s+/)[0]),
      };
    }
  }

  if (/\b(spend|spent|spending)\b/.test(lower)) return { type: "spend" };

  return { type: "unknown" };
}

export function parseCorrection(text: string): {
  amountMinor?: number;
  merchant?: string;
  category?: CategoryId;
} | null {
  const lower = text.toLowerCase().trim();
  const out: { amountMinor?: number; merchant?: string; category?: CategoryId } = {};
  const amount = text.match(/(?:amount|to)\s*\$?(\d+(?:\.\d{1,2})?)/i) || text.match(/^\$?(\d+(?:\.\d{1,2})?)$/);
  if (amount) {
    const minor = parseMoneyToMinor(amount[1] ?? amount[0]!);
    if (minor !== null) out.amountMinor = Math.abs(minor);
  }
  const merchant = text.match(/merchant\s+(.+)$/i);
  if (merchant) out.merchant = merchant[1]!.trim().slice(0, 80);
  const category = text.match(/categor(?:y|ies)\s+([a-zA-Z]+)/i);
  if (category) out.category = resolveCategory(category[1]);
  if (Object.keys(out).length === 0) {
    if (/^(confirm|yes|y)$/i.test(lower)) return null;
    return null;
  }
  return out;
}

export const HELP_TEXT = `I'm Penny — personal finance in iMessage.

⚠️ DEMO / MOCK DATA mode: seeded accounts & budgets. Without a database, anything you "save" (expenses, opt-ins) is session-only and will not survive restarts. Automated digests are disabled until durable storage + CRON_SECRET exist.

Try:
• "balances" / "spending" / "budget" / "subscriptions"
• "spent $12.50 at Starbucks"
• send a receipt photo (confirm before save)
• "chart"
• "opt in weekly summary" (demo note only without DB)

Confirm: 👍 / ❤️ / ✅ · Cancel: 👎 / ❌
Corrections: "amount 12.50" / "category groceries" / "merchant Name"`;
