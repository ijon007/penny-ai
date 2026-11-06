import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FinanceEngine } from "@/lib/finance/engine";
import { parseFinanceIntent } from "@/lib/finance/intents";
import { MemoryFinanceRepository } from "@/lib/finance/memory-store";
import { formatMoney } from "@/lib/finance/money";

describe("finance engine with mock store", () => {
  it("isolates users and labels mock balances", async () => {
    const repo = new MemoryFinanceRepository();
    const engine = new FinanceEngine(repo);
    const a = await engine.balances("user_a");
    const bText = await engine.balances("user_b");
    assert.match(a, /MOCK DATA/);
    assert.match(bText, /MOCK DATA/);

    const pending = await engine.createPendingExpense({
      userId: "user_a",
      amountMinor: 1250,
      merchant: "Starbucks",
      category: "dining",
      postedAt: "2026-11-06",
      originMessageId: "msg1",
    });
    const txn = await engine.confirmPending("user_a", pending.id);
    assert.ok(txn);
    assert.equal(txn!.amountMinor, -1250);

    const snapA = await repo.getSnapshot("user_a");
    const snapB = await repo.getSnapshot("user_b");
    assert.equal(snapA.transactions.some((t) => t.id === txn!.id), true);
    assert.equal(snapB.transactions.some((t) => t.id === txn!.id), false);
  });

  it("dedupes events", async () => {
    const repo = new MemoryFinanceRepository();
    assert.equal(await repo.claimEvent("e1"), false);
    assert.equal(await repo.claimEvent("e1"), true);
  });

  it("parses expense intents deterministically", () => {
    const intent = parseFinanceIntent("spent $12.50 at Starbucks for coffee");
    assert.equal(intent.type, "expense");
    if (intent.type === "expense") {
      assert.equal(intent.amountMinor, 1250);
      assert.match(intent.merchant, /Starbucks/i);
      assert.equal(formatMoney(intent.amountMinor), "$12.50");
    }
  });

  it("requires opt-in digest recording to prevent duplicates", async () => {
    const repo = new MemoryFinanceRepository();
    await repo.getOrCreateProfile("u1");
    await repo.updateProfile("u1", { optInWeeklySummary: true });
    assert.equal(await repo.recordDigestSent("u1", "weekly", "2026-W45"), false);
    assert.equal(await repo.recordDigestSent("u1", "weekly", "2026-W45"), true);
  });
});
