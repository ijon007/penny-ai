import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addMinor,
  formatMoney,
  parseMoneyToMinor,
  percentOf,
  sumMinor,
} from "@/lib/finance/money";

describe("money minor units", () => {
  it("parses dollars and cents to integer minor units", () => {
    assert.equal(parseMoneyToMinor("$12.34"), 1234);
    assert.equal(parseMoneyToMinor("12"), 1200);
    assert.equal(parseMoneyToMinor("0.99"), 99);
    assert.equal(parseMoneyToMinor("-4.50"), -450);
  });

  it("rejects ambiguous amounts", () => {
    assert.equal(parseMoneyToMinor("twelve"), null);
    assert.equal(parseMoneyToMinor(""), null);
    assert.equal(parseMoneyToMinor("12.345"), null);
  });

  it("adds and sums without floating error", () => {
    assert.equal(addMinor(10, 20), 30);
    assert.equal(sumMinor([199, 299, 1]), 499);
    assert.throws(() => addMinor(0.1 as unknown as number, 0.2 as unknown as number));
  });

  it("formats USD by default", () => {
    assert.equal(formatMoney(1234, "USD"), "$12.34");
    assert.equal(formatMoney(-50, "USD"), "-$0.50");
  });

  it("computes integer percent of budget", () => {
    assert.equal(percentOf(2500, 10000), 25);
    assert.equal(percentOf(1, 3), 33);
  });
});
