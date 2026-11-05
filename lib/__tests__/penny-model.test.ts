import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_PENNY_MODEL, getPennyModel } from "../penny.ts";

const RETIRED_FLASH_MODELS = new Set([
  "gemini-2.5-flash",
  "gemini-2.0-flash",
]);

test("DEFAULT_PENNY_MODEL is not a retired Gemini flash id", () => {
  assert.equal(RETIRED_FLASH_MODELS.has(DEFAULT_PENNY_MODEL), false);
  assert.match(DEFAULT_PENNY_MODEL, /^gemini-/);
});

test("getPennyModel returns DEFAULT_PENNY_MODEL when env unset", () => {
  const previous = process.env.PENNY_GEMINI_MODEL;
  delete process.env.PENNY_GEMINI_MODEL;
  try {
    assert.equal(getPennyModel(), DEFAULT_PENNY_MODEL);
  } finally {
    if (previous === undefined) {
      delete process.env.PENNY_GEMINI_MODEL;
    } else {
      process.env.PENNY_GEMINI_MODEL = previous;
    }
  }
});
