import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  budgetNeedsWarning,
  cronAuthorized,
  inQuietHours,
  weekKey,
} from "@/lib/finance/scheduler";

describe("scheduler helpers", () => {
  it("authorizes only bearer CRON_SECRET", () => {
    const secret = "test-cron-secret";
    assert.equal(
      cronAuthorized(
        new Request("http://localhost/api/cron/finance", {
          headers: { authorization: `Bearer ${secret}` },
        }),
        secret,
      ),
      true,
    );
    assert.equal(
      cronAuthorized(
        new Request("http://localhost/api/cron/finance", {
          headers: { authorization: "Bearer wrong" },
        }),
        secret,
      ),
      false,
    );
    assert.equal(cronAuthorized(new Request("http://localhost/api/cron/finance"), secret), false);
    assert.equal(
      cronAuthorized(
        new Request("http://localhost/api/cron/finance", {
          headers: { authorization: `Bearer ${secret}` },
        }),
        undefined,
      ),
      false,
    );
  });

  it("detects overnight quiet hours", () => {
    const evening = new Date("2026-11-06T03:00:00Z");
    assert.equal(inQuietHours("America/New_York", 21, 8, evening), true);
    const noon = new Date("2026-11-06T17:00:00Z");
    assert.equal(inQuietHours("America/New_York", 21, 8, noon), false);
  });

  it("flags budgets at 80%+", () => {
    assert.equal(budgetNeedsWarning("• Dining: $80.00 / $100.00 (80%)"), true);
    assert.equal(budgetNeedsWarning("• Dining: $79.00 / $100.00 (79%)"), false);
    assert.equal(budgetNeedsWarning("• Dining: $100.00 / $100.00 (100%)"), true);
  });

  it("builds stable week keys", () => {
    assert.match(weekKey("UTC", new Date("2026-11-06T12:00:00Z")), /^2026-W\d{2}$/);
  });
});
