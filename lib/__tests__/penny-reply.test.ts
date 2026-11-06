import assert from "node:assert/strict";
import test from "node:test";
import { generatePennyReply } from "../penny";

test("generatePennyReply returns a non-empty reply for a simple greeting", async () => {
  const reply = await generatePennyReply("Hey Penny");
  assert.equal(typeof reply, "string");
  assert.ok(reply.trim().length > 0, "expected a non-empty Gemini reply");
});
