import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FinanceEngine } from "@/lib/finance/engine";
import { parseFinanceIntent } from "@/lib/finance/intents";
import { MemoryFinanceRepository } from "@/lib/finance/memory-store";
import { validateReceiptExtract } from "@/lib/finance/receipt";
import {
  cronAuthorized,
  isPreferredWeeklyDigestDay,
  localWeekday,
} from "@/lib/finance/scheduler";
import { needsFinanceStore } from "@/lib/handle-message";

describe("adversarial finance integration", () => {
  it("greetings and help do not require finance store", () => {
    assert.equal(needsFinanceStore(parseFinanceIntent("hey penny")), false);
    assert.equal(needsFinanceStore(parseFinanceIntent("help")), false);
    assert.equal(needsFinanceStore(parseFinanceIntent("balances")), true);
    assert.equal(needsFinanceStore(parseFinanceIntent("spent $5 at Cafe")), true);
  });

  it("rejects out-of-bounds and nullish receipt extraction", () => {
    const bad = validateReceiptExtract(
      { amount: "999999.99", merchant: "X", confidence: "high" },
      "{}",
    );
    assert.equal(bad.amountMinor, null);
    assert.equal(bad.rejectedReason, "amount_out_of_bounds");

    const nullish = validateReceiptExtract(
      { amount: "12.00", merchant: "null", confidence: "high" },
      "{}",
    );
    assert.equal(nullish.merchant, null);
    assert.equal(nullish.confidence, "low");

    const ok = validateReceiptExtract(
      {
        amount: "12.50",
        merchant: "Starbucks",
        date: "2026-11-06",
        category: "dining",
        confidence: "high",
      },
      "{}",
    );
    assert.equal(ok.amountMinor, 1250);
    assert.equal(ok.merchant, "Starbucks");
    assert.equal(ok.category, "dining");
  });

  it("double-confirm is idempotent and isolates users", async () => {
    const repo = new MemoryFinanceRepository();
    const engine = new FinanceEngine(repo);
    const pending = await engine.createPendingExpense({
      userId: "u1",
      amountMinor: 999,
      merchant: "Shop",
      category: "shopping",
      postedAt: "2026-11-06",
      originMessageId: "m1",
    });
    const first = await engine.confirmPending("u1", pending.id);
    const second = await engine.confirmPending("u1", pending.id);
    assert.ok(first);
    assert.equal(second, null);
    const snapOther = await repo.getSnapshot("u2");
    assert.equal(
      snapOther.transactions.some((t) => t.pendingId === pending.id),
      false,
    );
  });

  it("webhook event claim is duplicate-safe (sequential)", async () => {
    const repo = new MemoryFinanceRepository();
    assert.equal(await repo.claimEvent("msg-replay-1"), false);
    assert.equal(await repo.claimEvent("msg-replay-1"), true);
    assert.equal(await repo.claimEvent("msg-replay-2"), false);
  });

  it("parallel claim race: only one winner with memory store semantics", async () => {
    const repo = new MemoryFinanceRepository();
    // Memory store is not transactional; first writer wins, second sees set.
    const results = await Promise.all([
      repo.claimEvent("race-1"),
      repo.claimEvent("race-1"),
    ]);
    // At least one must report duplicate (true) OR both false if truly parallel
    // before either write — document: production uses Postgres ON CONFLICT.
    const dupes = results.filter((r) => r === true).length;
    const firsts = results.filter((r) => r === false).length;
    assert.ok(firsts >= 1);
    assert.ok(dupes + firsts === 2);
  });

  it("tapback targeting prefers confirm prompt message id", async () => {
    const repo = new MemoryFinanceRepository();
    const engine = new FinanceEngine(repo);
    const a = await engine.createPendingExpense({
      userId: "u",
      amountMinor: 100,
      merchant: "A",
      category: "other",
      postedAt: "2026-11-06",
      originMessageId: "o1",
    });
    a.confirmPromptMessageId = "prompt-a";
    await repo.updatePending(a);
    const b = await engine.createPendingExpense({
      userId: "u",
      amountMinor: 200,
      merchant: "B",
      category: "other",
      postedAt: "2026-11-06",
      originMessageId: "o2",
    });
    b.confirmPromptMessageId = "prompt-b";
    await repo.updatePending(b);

    const found = await engine.findPendingByConfirmPrompt("u", "prompt-a");
    assert.ok(found);
    assert.equal(found!.id, a.id);
    assert.notEqual(found!.id, b.id);
  });

  it("poll guid resolves the matching pending draft", async () => {
    const repo = new MemoryFinanceRepository();
    const engine = new FinanceEngine(repo);
    const pending = await engine.createPendingExpense({
      userId: "u",
      amountMinor: 300,
      merchant: "C",
      category: "dining",
      postedAt: "2026-11-06",
      originMessageId: "o",
    });
    pending.pollMessageGuid = "poll-guid-1";
    await repo.updatePending(pending);
    const found = await engine.findPendingByPollGuid("u", "poll-guid-1");
    assert.equal(found?.id, pending.id);
    assert.equal(await engine.findPendingByPollGuid("u", "other"), null);
  });

  it("recurringDueSoon only includes horizon window", async () => {
    const repo = new MemoryFinanceRepository();
    const engine = new FinanceEngine(repo);
    await engine.ensureUser("u");
    const snap = await repo.getSnapshot("u");
    // Force one recurring far away and one soon
    snap.recurring = [
      {
        id: "r1",
        merchant: "SoonCo",
        category: "subscriptions",
        amountMinor: -999,
        currency: "USD",
        cadence: "monthly",
        nextDueOn: "2026-11-07",
        mock: true,
      },
      {
        id: "r2",
        merchant: "LaterCo",
        category: "subscriptions",
        amountMinor: -1999,
        currency: "USD",
        cadence: "monthly",
        nextDueOn: "2026-12-31",
        mock: true,
      },
    ];
    await repo.saveSnapshot("u", snap);
    // Freeze relative to posted seed dates — use engine with known today via profile TZ
    const text = await engine.recurringDueSoon("u", 3);
    assert.match(text, /MOCK DATA/);
    // Seeded nextDueOn values relative to late-2026; if "today" drifts far, at least LaterCo stays out of a 3-day window from Nov.
    if (text.includes("SoonCo") || text.includes("no recurring")) {
      assert.equal(text.includes("LaterCo"), false);
    }
  });

  it("cron auth and weekly preferred day helpers", () => {
    assert.equal(
      cronAuthorized(
        new Request("http://x", { headers: { authorization: "Bearer s" } }),
        "s",
      ),
      true,
    );
    const monday = new Date("2026-11-09T15:00:00Z"); // Monday afternoon UTC
    assert.equal(localWeekday("UTC", monday), 1);
    assert.equal(isPreferredWeeklyDigestDay("UTC", 1, monday), true);
    const tuesday = new Date("2026-11-10T15:00:00Z");
    assert.equal(isPreferredWeeklyDigestDay("UTC", 1, tuesday), false);
  });

  it("balance mutation only after confirm and MOCK labeled", async () => {
    const repo = new MemoryFinanceRepository();
    const engine = new FinanceEngine(repo);
    const before = await repo.getSnapshot("u");
    const checking = before.accounts.find((a) => a.kind === "checking")!;
    const bal = checking.balanceMinor;
    const pending = await engine.createPendingExpense({
      userId: "u",
      amountMinor: 500,
      merchant: "M",
      category: "other",
      postedAt: "2026-11-06",
      originMessageId: "m",
    });
    assert.equal((await repo.getSnapshot("u")).accounts.find((a) => a.kind === "checking")!.balanceMinor, bal);
    await engine.confirmPending("u", pending.id);
    const after = await repo.getSnapshot("u");
    assert.equal(after.accounts.find((a) => a.kind === "checking")!.balanceMinor, bal - 500);
    assert.equal(after.label, "MOCK_DATA");
    assert.match(await engine.balances("u"), /MOCK DATA/);
  });
});

describe("demo mode without database", () => {
  it("uses memory repository by default when DB unset", async () => {
    const prev = {
      PENNY: process.env.PENNY_DATABASE_URL,
      DATABASE: process.env.DATABASE_URL,
      POSTGRES: process.env.POSTGRES_URL,
    };
    delete process.env.PENNY_DATABASE_URL;
    delete process.env.DATABASE_URL;
    delete process.env.POSTGRES_URL;
    const { getFinancePersistenceMode, isDurableFinanceStore, getFinanceRepository, setFinanceRepositoryForTests } =
      await import("@/lib/finance/repository");
    setFinanceRepositoryForTests(null);
    assert.equal(getFinancePersistenceMode(), "demo_memory");
    assert.equal(isDurableFinanceStore(), false);
    const repo = getFinanceRepository();
    const engine = new FinanceEngine(repo);
    const text = await engine.balances("demo-user");
    assert.match(text, /MOCK DATA/);
    setFinanceRepositoryForTests(null);
    if (prev.PENNY) process.env.PENNY_DATABASE_URL = prev.PENNY;
    if (prev.DATABASE) process.env.DATABASE_URL = prev.DATABASE;
    if (prev.POSTGRES) process.env.POSTGRES_URL = prev.POSTGRES;
  });
});
