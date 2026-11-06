import { randomUUID } from "node:crypto";
import { formatMoney, percentOf, sumMinor } from "@/lib/finance/money";
import type { FinanceRepository } from "@/lib/finance/store";
import {
  CATEGORY_LABELS,
  type CategoryId,
  type PendingEntry,
  type Transaction,
} from "@/lib/finance/types";

function monthPrefix(isoDate: string): string {
  return isoDate.slice(0, 7);
}

function todayInTz(timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export class FinanceEngine {
  constructor(private readonly repo: FinanceRepository) {}

  async ensureUser(userId: string) {
    return this.repo.getOrCreateProfile(userId);
  }

  async balances(userId: string): Promise<string> {
    const snap = await this.repo.getSnapshot(userId);
    const lines = [
      "⚠️ MOCK DATA — not linked to a real bank.",
      ...snap.accounts.map(
        (a) =>
          `• ${a.name}: ${formatMoney(a.balanceMinor, a.currency)}`,
      ),
    ];
    return lines.join("\n");
  }

  async spendByCategory(
    userId: string,
    month = monthPrefix(todayInTz("America/New_York")),
  ): Promise<string> {
    const snap = await this.repo.getSnapshot(userId);
    const expenses = snap.transactions.filter(
      (t) => t.amountMinor < 0 && t.postedAt.startsWith(month),
    );
    const byCat = new Map<CategoryId, number>();
    for (const t of expenses) {
      byCat.set(t.category, (byCat.get(t.category) ?? 0) + Math.abs(t.amountMinor));
    }
    const lines = [
      `⚠️ MOCK DATA spend for ${month}:`,
      ...[...byCat.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([cat, minor]) => `• ${CATEGORY_LABELS[cat]}: ${formatMoney(minor)}`),
    ];
    if (byCat.size === 0) lines.push("• No expenses in this period.");
    return lines.join("\n");
  }

  async budgetStatus(userId: string): Promise<string> {
    const profile = await this.repo.getOrCreateProfile(userId);
    const month = monthPrefix(todayInTz(profile.timezone));
    const snap = await this.repo.getSnapshot(userId);
    const lines = ["⚠️ MOCK DATA budget status:"];
    for (const b of snap.budgets) {
      const spent = sumMinor(
        snap.transactions
          .filter(
            (t) =>
              t.category === b.category &&
              t.amountMinor < 0 &&
              t.postedAt.startsWith(month),
          )
          .map((t) => Math.abs(t.amountMinor)),
      );
      const pct = percentOf(spent, b.limitMinor);
      lines.push(
        `• ${CATEGORY_LABELS[b.category]}: ${formatMoney(spent)} / ${formatMoney(b.limitMinor)} (${pct}%)`,
      );
    }
    return lines.join("\n");
  }

  async recurringList(userId: string): Promise<string> {
    const snap = await this.repo.getSnapshot(userId);
    return [
      "⚠️ MOCK DATA recurring charges:",
      ...snap.recurring.map(
        (r) =>
          `• ${r.merchant}: ${formatMoney(Math.abs(r.amountMinor))} ${r.cadence} (next ${r.nextDueOn})`,
      ),
    ].join("\n");
  }

  async createPendingExpense(input: {
    userId: string;
    amountMinor: number;
    merchant: string;
    category: CategoryId;
    postedAt: string;
    originMessageId: string;
    kind?: PendingEntry["kind"];
    note?: string;
  }): Promise<PendingEntry> {
    const entry: PendingEntry = {
      id: `pend_${randomUUID()}`,
      userId: input.userId,
      kind: input.kind ?? "expense",
      amountMinor: -Math.abs(input.amountMinor),
      currency: "USD",
      merchant: input.merchant,
      category: input.category,
      postedAt: input.postedAt,
      note: input.note,
      originMessageId: input.originMessageId,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    await this.repo.savePending(entry);
    return entry;
  }

  pendingPrompt(entry: PendingEntry): string {
    return [
      "Draft expense (MOCK ledger — confirm to save):",
      `• ${formatMoney(Math.abs(entry.amountMinor))} at ${entry.merchant}`,
      `• Category: ${CATEGORY_LABELS[entry.category]}`,
      `• Date: ${entry.postedAt}`,
      "",
      "Reply 👍 or react 👍 to confirm. 👎 to cancel.",
      "Or reply in-thread with a correction (e.g. \"category groceries\" / \"amount 12.50\").",
    ].join("\n");
  }

  async confirmPending(userId: string, pendingId: string): Promise<Transaction | null> {
    const pending = await this.repo.getPending(userId, pendingId);
    if (!pending || pending.status !== "pending") return null;
    const snap = await this.repo.getSnapshot(userId);
    const txn: Transaction = {
      id: `txn_user_${randomUUID()}`,
      accountId: snap.accounts.find((a) => a.kind === "checking")?.id ?? snap.accounts[0]!.id,
      postedAt: pending.postedAt,
      merchant: pending.merchant,
      category: pending.category,
      amountMinor: pending.amountMinor,
      currency: pending.currency,
      source: pending.kind === "receipt" ? "receipt" : "user_text",
      mock: true,
      note: pending.note,
      pendingId: pending.id,
    };
    snap.transactions.unshift(txn);
    const acct = snap.accounts.find((a) => a.id === txn.accountId);
    if (acct) acct.balanceMinor += txn.amountMinor;
    await this.repo.saveSnapshot(userId, snap);
    pending.status = "confirmed";
    await this.repo.updatePending(pending);
    return txn;
  }

  async cancelPending(userId: string, pendingId: string): Promise<boolean> {
    const pending = await this.repo.getPending(userId, pendingId);
    if (!pending || pending.status !== "pending") return false;
    pending.status = "cancelled";
    await this.repo.updatePending(pending);
    return true;
  }

  async correctPending(
    userId: string,
    pendingId: string,
    patch: Partial<Pick<PendingEntry, "amountMinor" | "merchant" | "category" | "postedAt">>,
  ): Promise<PendingEntry | null> {
    const pending = await this.repo.getPending(userId, pendingId);
    if (!pending || pending.status !== "pending") return null;
    if (patch.amountMinor !== undefined) {
      pending.amountMinor = -Math.abs(patch.amountMinor);
    }
    if (patch.merchant) pending.merchant = patch.merchant;
    if (patch.category) pending.category = patch.category;
    if (patch.postedAt) pending.postedAt = patch.postedAt;
    await this.repo.updatePending(pending);
    return pending;
  }

  async latestPending(userId: string): Promise<PendingEntry | null> {
    const list = await this.repo.listPending(userId, "pending");
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
  }

  categorySpendForChart(userId: string, month: string) {
    return this.repo.getSnapshot(userId).then((snap) => {
      const map = new Map<string, number>();
      for (const t of snap.transactions) {
        if (t.amountMinor >= 0 || !t.postedAt.startsWith(month)) continue;
        map.set(
          CATEGORY_LABELS[t.category],
          (map.get(CATEGORY_LABELS[t.category]) ?? 0) + Math.abs(t.amountMinor),
        );
      }
      return [...map.entries()].map(([label, minor]) => ({ label, minor }));
    });
  }

  weeklySummaryText(userId: string): Promise<string> {
    return this.spendByCategory(userId);
  }
}
