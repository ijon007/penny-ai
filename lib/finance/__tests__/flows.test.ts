import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FinanceEngine } from "@/lib/finance/engine";
import { parseCorrection, parseFinanceIntent } from "@/lib/finance/intents";
import { MemoryFinanceRepository } from "@/lib/finance/memory-store";
import { MockFinanceDataProvider } from "@/lib/finance/provider";

describe("finance confirmation flows", () => {
  it("corrects pending then confirms without touching other users", async () => {
    const repo = new MemoryFinanceRepository();
    const engine = new FinanceEngine(repo);
    await engine.ensureUser("alice");
    await engine.ensureUser("bob");

    const pending = await engine.createPendingExpense({
      userId: "alice",
      amountMinor: 1000,
      merchant: "Cafe",
      category: "dining",
      postedAt: "2026-11-06",
      originMessageId: "m1",
    });
    const corrected = await engine.correctPending("alice", pending.id, {
      amountMinor: 1550,
      category: "groceries",
      merchant: "Market",
    });
    assert.ok(corrected);
    assert.equal(corrected!.amountMinor, -1550);
    assert.equal(corrected!.category, "groceries");

    const txn = await engine.confirmPending("alice", pending.id);
    assert.ok(txn);
    assert.equal(txn!.merchant, "Market");
    assert.equal(await engine.latestPending("bob"), null);
  });

  it("cancel leaves snapshot unchanged", async () => {
    const repo = new MemoryFinanceRepository();
    const engine = new FinanceEngine(repo);
    const before = await engine.balances("u");
    const pending = await engine.createPendingExpense({
      userId: "u",
      amountMinor: 500,
      merchant: "X",
      category: "other",
      postedAt: "2026-11-06",
      originMessageId: "m",
    });
    assert.equal(await engine.cancelPending("u", pending.id), true);
    assert.equal(await engine.confirmPending("u", pending.id), null);
    assert.equal(await engine.balances("u"), before);
  });

  it("opt-in lists only consented users", async () => {
    const repo = new MemoryFinanceRepository();
    await repo.getOrCreateProfile("a");
    await repo.getOrCreateProfile("b");
    await repo.updateProfile("a", { optInWeeklySummary: true });
    assert.deepEqual(await repo.listUsersWithOptIn("optInWeeklySummary"), ["a"]);
  });

  it("parses timezone and quiet hours", () => {
    assert.deepEqual(parseFinanceIntent("timezone Europe/Paris"), {
      type: "set_timezone",
      timezone: "Europe/Paris",
    });
    const quiet = parseFinanceIntent("quiet hours 22-7");
    assert.equal(quiet.type, "set_quiet_hours");
    if (quiet.type === "set_quiet_hours") {
      assert.equal(quiet.start, 22);
      assert.equal(quiet.end, 7);
    }
  });

  it("parses corrections", () => {
    assert.deepEqual(parseCorrection("category groceries"), { category: "groceries" });
    assert.equal(parseCorrection("amount 12.50")?.amountMinor, 1250);
    assert.equal(parseCorrection("merchant Whole Foods")?.merchant, "Whole Foods");
  });

  it("mock provider always labels MOCK_DATA", () => {
    const snap = new MockFinanceDataProvider().createInitialSnapshot();
    assert.equal(snap.label, "MOCK_DATA");
    assert.ok(snap.accounts.every((a) => a.mock === true));
  });
});
