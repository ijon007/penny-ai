import { attachment, poll, type Message, type Space } from "spectrum-ts";
import { imessage } from "spectrum-ts/providers/imessage";
import { renderSpendChartPng } from "@/lib/finance/chart";
import { FinanceEngine } from "@/lib/finance/engine";
import {
  HELP_TEXT,
  parseCorrection,
  parseFinanceIntent,
} from "@/lib/finance/intents";
import { formatMoney } from "@/lib/finance/money";
import { getFinanceRepository } from "@/lib/finance/repository";
import { extractReceiptFromImage } from "@/lib/finance/receipt";
import {
  CANCEL_TAPBACKS,
  CATEGORY_LABELS,
  CONFIRM_TAPBACKS,
  type CategoryId,
} from "@/lib/finance/types";
import { PersistenceUnavailableError } from "@/lib/finance/store";
import { generatePennyReply } from "@/lib/penny";

function senderUserId(message: Message): string | null {
  if (message.direction === "outbound") return null;
  if (message.sender?.kind === "agent") return null;
  const id = message.sender?.id?.trim();
  return id && id.length > 0 ? id : null;
}

async function withEngine<T>(
  space: Space,
  fn: (engine: FinanceEngine, userId: string) => Promise<T>,
  userId: string,
): Promise<T | null> {
  try {
    const engine = new FinanceEngine(getFinanceRepository());
    await engine.ensureUser(userId);
    return await fn(engine, userId);
  } catch (error) {
    if (error instanceof PersistenceUnavailableError) {
      await space.send(
        "Finance storage isn't configured yet (need PENNY_DATABASE_URL / DATABASE_URL). I can't safely keep your ledger without it.",
      );
      return null;
    }
    throw error;
  }
}

async function handleText(
  space: Space,
  message: Message,
  userId: string,
  text: string,
): Promise<void> {
  const repo = getFinanceRepository();
  const engine = new FinanceEngine(repo);

  // Corrections (threaded or keyword) against latest pending
  if (
    text.toLowerCase().includes("category") ||
    text.toLowerCase().startsWith("amount") ||
    text.toLowerCase().startsWith("merchant")
  ) {
    const correction = parseCorrection(text);
    if (correction) {
      await withEngine(space, async (eng) => {
        const pending = await eng.latestPending(userId);
        if (!pending) {
          await message.reply("No pending expense to correct. Add one first (e.g. spent $12 at …).");
          return;
        }
        const updated = await eng.correctPending(userId, pending.id, correction);
        if (updated) await message.reply(eng.pendingPrompt(updated));
      }, userId);
      return;
    }
  }

  if (/^(confirm|yes|👍)$/i.test(text.trim())) {
    await withEngine(space, async (eng) => {
      const pending = await eng.latestPending(userId);
      if (!pending) {
        await message.reply("Nothing pending to confirm.");
        return;
      }
      const txn = await eng.confirmPending(userId, pending.id);
      await message.reply(
        txn
          ? `Saved (MOCK ledger): ${formatMoney(Math.abs(txn.amountMinor))} at ${txn.merchant}.`
          : "Couldn't confirm that draft.",
      );
    }, userId);
    return;
  }

  if (/^(cancel|no|👎)$/i.test(text.trim())) {
    await withEngine(space, async (eng) => {
      const pending = await eng.latestPending(userId);
      if (!pending) {
        await message.reply("Nothing pending to cancel.");
        return;
      }
      await eng.cancelPending(userId, pending.id);
      await message.reply("Cancelled — nothing saved.");
    }, userId);
    return;
  }

  const intent = parseFinanceIntent(text);

  await withEngine(space, async (eng) => {
    switch (intent.type) {
      case "help":
        await message.reply(HELP_TEXT);
        return;
      case "balances":
        await message.reply(await eng.balances(userId));
        return;
      case "spend":
        await message.reply(await eng.spendByCategory(userId));
        return;
      case "budget":
        await message.reply(await eng.budgetStatus(userId));
        return;
      case "recurring":
        await message.reply(await eng.recurringList(userId));
        return;
      case "chart": {
        const profile = await eng.ensureUser(userId);
        const month = new Intl.DateTimeFormat("en-CA", {
          timeZone: profile.timezone,
          year: "numeric",
          month: "2-digit",
        })
          .format(new Date())
          .slice(0, 7);
        const bars = await eng.categorySpendForChart(userId, month);
        if (bars.length === 0) {
          await message.reply("No MOCK spending to chart this month.");
          return;
        }
        const png = await renderSpendChartPng(bars);
        await space.send(
          attachment(png, {
            name: "spending-mock.png",
            mimeType: "image/png",
          }),
        );
        return;
      }
      case "opt_in":
      case "opt_out": {
        const on = intent.type === "opt_in";
        const patch =
          intent.flag === "weekly"
            ? { optInWeeklySummary: on }
            : intent.flag === "budget"
              ? { optInBudgetAlerts: on }
              : { optInRecurringReminders: on };
        await repo.updateProfile(userId, patch);
        await message.reply(
          on
            ? `Opted in to ${intent.flag} notices. I'll only message when you've opted in.`
            : `Opted out of ${intent.flag} notices.`,
        );
        return;
      }
      case "expense": {
        const profile = await eng.ensureUser(userId);
        const postedAt = new Intl.DateTimeFormat("en-CA", {
          timeZone: profile.timezone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date());
        const pending = await eng.createPendingExpense({
          userId,
          amountMinor: intent.amountMinor,
          merchant: intent.merchant,
          category: intent.category,
          postedAt,
          originMessageId: message.id,
        });
        const prompt = await message.reply(eng.pendingPrompt(pending));
        if (prompt) {
          pending.confirmPromptMessageId = prompt.id;
          await repo.updatePending(pending);
        }
        // Offer category poll
        const sentPoll = await space.send(
          poll(
            "Category?",
            "Dining",
            "Groceries",
            "Transport",
            "Subscriptions",
            "Shopping",
            "Other",
          ),
        );
        if (sentPoll) {
          const guid =
            sentPoll.content.type === "poll"
              ? sentPoll.content.pollMessageGuid
              : undefined;
          if (guid) {
            pending.pollMessageGuid = guid;
            await repo.updatePending(pending);
          }
        }
        return;
      }
      case "unknown": {
        // Light LLM assist for natural questions, constrained by finance system prompt
        const reply = await generatePennyReply(
          `User message: ${text}\n\nIf this is a finance question, answer briefly and remind that balances may be MOCK DATA. If unrelated to personal finance, politely steer back.`,
        );
        await message.reply(reply);
        return;
      }
    }
  }, userId);
}

async function handleAttachment(
  space: Space,
  message: Message,
  userId: string,
): Promise<void> {
  if (message.content.type !== "attachment") return;
  const mime = message.content.mimeType || "application/octet-stream";
  if (!mime.startsWith("image/")) {
    await message.reply("Send an image of a receipt or transaction screenshot.");
    return;
  }

  const content = message.content;
  await withEngine(space, async (eng, uid) => {
      await space.send("Got it — reading the image (MOCK ledger)…");
      let bytes: Uint8Array;
      try {
        bytes = new Uint8Array(await content.read());
      } catch {
        const app = await import("@/lib/spectrum").then((m) => m.getSpectrumApp());
        const spectrum = await app;
        const im = imessage(spectrum);
        const fetched = await im.getAttachment(content.id);
        if (!fetched) throw new Error("attachment unavailable");
        bytes = new Uint8Array(await fetched.read());
      }

      const extracted = await extractReceiptFromImage({ bytes, mimeType: mime });
      if (extracted.amountMinor === null || !extracted.merchant) {
        await message.reply(
          "I couldn't confidently read amount/merchant. Reply like: spent $12.50 at Merchant",
        );
        return;
      }

      const profile = await eng.ensureUser(uid);
      const postedAt =
        extracted.postedAt ??
        new Intl.DateTimeFormat("en-CA", {
          timeZone: profile.timezone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date());

      const pending = await eng.createPendingExpense({
        userId: uid,
        amountMinor: extracted.amountMinor,
        merchant: extracted.merchant,
        category: extracted.category,
        postedAt,
        originMessageId: message.id,
        kind: "receipt",
        note: `receipt confidence=${extracted.confidence}`,
      });

      const warn =
        extracted.confidence === "low"
          ? "\n(Low confidence — please correct before confirming.)"
          : "";
      const prompt = await message.reply(eng.pendingPrompt(pending) + warn);
      if (prompt) {
        pending.confirmPromptMessageId = prompt.id;
        await getFinanceRepository().updatePending(pending);
      }
  }, userId);
}

async function handleReaction(
  space: Space,
  message: Message,
  userId: string,
): Promise<void> {
  if (message.content.type !== "reaction") return;
  const emoji = message.content.emoji;
  const engine = new FinanceEngine(getFinanceRepository());
  const pending = await engine.latestPending(userId);
  if (!pending) return;

  if (CONFIRM_TAPBACKS.has(emoji)) {
    const txn = await engine.confirmPending(userId, pending.id);
    await space.send(
      txn
        ? `Saved (MOCK): ${formatMoney(Math.abs(txn.amountMinor))} at ${txn.merchant}.`
        : "Nothing to confirm.",
    );
    return;
  }
  if (CANCEL_TAPBACKS.has(emoji)) {
    await engine.cancelPending(userId, pending.id);
    await space.send("Cancelled — nothing saved.");
  }
}

const POLL_CATEGORY: Record<string, CategoryId> = {
  Dining: "dining",
  Groceries: "groceries",
  Transport: "transport",
  Subscriptions: "subscriptions",
  Shopping: "shopping",
  Other: "other",
};

async function handlePollVote(
  space: Space,
  message: Message,
  userId: string,
): Promise<void> {
  if (message.content.type !== "poll_option") return;
  if (!message.content.selected) return;
  const title = message.content.option?.title ?? message.content.title;
  const category = title ? POLL_CATEGORY[title] : undefined;
  if (!category) return;

  await withEngine(space, async (eng) => {
    const pending = await eng.latestPending(userId);
    if (!pending) return;
    const updated = await eng.correctPending(userId, pending.id, { category });
    if (updated) {
      await space.send(
        `Category set to ${CATEGORY_LABELS[category]}.\n${eng.pendingPrompt(updated)}`,
      );
    }
  }, userId);
}

export async function handlePennyMessage(
  space: Space,
  message: Message,
): Promise<void> {
  if (message.content.type === "read") {
    // Never auto-reply to read receipts.
    return;
  }

  const userId = senderUserId(message);
  if (!userId) return;

  try {
    // Durable idempotency when DB configured; memory in test.
    try {
      const repo = getFinanceRepository();
      if (await repo.claimEvent(message.id)) return;
    } catch (error) {
      if (!(error instanceof PersistenceUnavailableError)) throw error;
      // Without DB we still process but warn on finance paths.
    }

    await space.responding(async () => {
      switch (message.content.type) {
        case "text": {
          const text = message.content.text.trim();
          if (!text) return;
          await handleText(space, message, userId, text);
          return;
        }
        case "attachment":
          await handleAttachment(space, message, userId);
          return;
        case "reaction":
          await handleReaction(space, message, userId);
          return;
        case "poll_option":
          await handlePollVote(space, message, userId);
          return;
        case "poll":
          return;
        default:
          return;
      }
    });
  } catch (error) {
    console.error("Penny failed to reply", error);
    try {
      await space.send(
        "Something went sideways on my side. Mind sending that again in a moment?",
      );
    } catch (sendError) {
      console.error("Penny failed to send fallback", sendError);
    }
  }
}
