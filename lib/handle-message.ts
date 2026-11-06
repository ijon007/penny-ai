import { attachment, poll, type Message, type Space } from "spectrum-ts";
import { imessage } from "spectrum-ts/providers/imessage";
import { renderSpendChartPng } from "@/lib/finance/chart";
import { FinanceEngine } from "@/lib/finance/engine";
import {
  HELP_TEXT,
  parseCorrection,
  parseFinanceIntent,
  type FinanceIntent,
} from "@/lib/finance/intents";
import { formatMoney } from "@/lib/finance/money";
import {
  DEMO_MODE_DISCLAIMER,
  getFinanceRepository,
  isDurableFinanceStore,
} from "@/lib/finance/repository";
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

function needsFinanceStore(intent: FinanceIntent): boolean {
  return intent.type !== "unknown" && intent.type !== "help";
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
        `${DEMO_MODE_DISCLAIMER}\nFinance persistence hit an unexpected configuration error.`,
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
  opts?: { replyTargetId?: string },
): Promise<void> {
  // Threaded / keyword corrections against a specific pending draft
  if (
    text.toLowerCase().includes("category") ||
    text.toLowerCase().startsWith("amount") ||
    text.toLowerCase().startsWith("merchant") ||
    opts?.replyTargetId
  ) {
    const correction = parseCorrection(text);
    if (correction || opts?.replyTargetId) {
      await withEngine(space, async (eng) => {
        let pending = opts?.replyTargetId
          ? await eng.findPendingByConfirmPrompt(userId, opts.replyTargetId)
          : null;
        pending = pending ?? (await eng.latestPending(userId));
        if (!pending) {
          if (correction) {
            await message.reply(
              "No pending expense to correct. Add one first (e.g. spent $12 at …).",
            );
          }
          return;
        }
        if (correction) {
          const updated = await eng.correctPending(userId, pending.id, correction);
          if (updated) await message.reply(eng.pendingPrompt(updated));
          return;
        }
        // Threaded reply without parseable correction — remind how to correct
        await message.reply(
          `Still drafting ${formatMoney(Math.abs(pending.amountMinor))} at ${pending.merchant}. Reply "amount 12.50" / "category groceries" / "merchant Name", or 👍 to confirm.`,
        );
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
          ? `Recorded (MOCK${isDurableFinanceStore() ? "" : " demo — not durable"}): ${formatMoney(Math.abs(txn.amountMinor))} at ${txn.merchant}.`
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

  // Help + natural chat must work without finance DB.
  if (!needsFinanceStore(intent)) {
    if (intent.type === "help") {
      await message.reply(HELP_TEXT);
      return;
    }
    const reply = await generatePennyReply(
      `User message: ${text}\n\nYou are a personal finance iMessage agent. Answer briefly. If they greet you, greet back and mention you can track MOCK spending once storage is configured. Never invent live bank balances. Do not claim you moved money.`,
    );
    await message.reply(reply);
    return;
  }

  await withEngine(space, async (eng) => {
    switch (intent.type) {
      case "help":
      case "unknown":
        return;
      case "balances":
        await message.reply(await eng.balances(userId));
        return;
      case "spend":
        await message.reply(await eng.spendByCategory(userId));
        return;
      case "budget": {
        await message.reply(await eng.budgetStatus(userId));
        await space.send(
          poll(
            "Budget alerts?",
            "Opt in budget alerts",
            "Keep alerts off",
            "Show dining budget",
            "Show groceries budget",
          ),
        );
        return;
      }
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
        await getFinanceRepository().updateProfile(userId, patch);
        if (on && !isDurableFinanceStore()) {
          await message.reply(
            `Noted ${intent.flag} opt-in for this demo session only — automated digests stay OFF until Postgres + CRON_SECRET are configured (prefs don't survive restarts).`,
          );
        } else {
          await message.reply(
            on
              ? `Opted in to ${intent.flag} notices. I'll only message when you've opted in.`
              : `Opted out of ${intent.flag} notices.`,
          );
        }
        return;
      }
      case "set_timezone": {
        await getFinanceRepository().updateProfile(userId, {
          timezone: intent.timezone,
        });
        await message.reply(
          `Timezone set to ${intent.timezone} (used for digests/quiet hours).`,
        );
        return;
      }
      case "set_quiet_hours": {
        await getFinanceRepository().updateProfile(userId, {
          quietHoursStart: intent.start,
          quietHoursEnd: intent.end,
        });
        await message.reply(
          `Quiet hours set to ${intent.start}:00–${intent.end}:00 local. Opt-in digests skip that window.`,
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
          await getFinanceRepository().updatePending(pending);
        }
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
        if (sentPoll?.content.type === "poll" && sentPoll.content.pollMessageGuid) {
          pending.pollMessageGuid = sentPoll.content.pollMessageGuid;
          await getFinanceRepository().updatePending(pending);
        }
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
      const spectrum = await import("@/lib/spectrum").then((m) => m.getSpectrumApp());
      const im = imessage(await spectrum);
      const fetched = await im.getAttachment(content.id);
      if (!fetched) throw new Error("attachment unavailable");
      bytes = new Uint8Array(await fetched.read());
    }

    const extracted = await extractReceiptFromImage({ bytes, mimeType: mime });
    if (extracted.amountMinor === null || !extracted.merchant) {
      await message.reply(
        `I couldn't confidently read amount/merchant${extracted.rejectedReason ? ` (${extracted.rejectedReason})` : ""}. Reply like: spent $12.50 at Merchant`,
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
  const targetId = message.content.target?.id;

  await withEngine(space, async (engine) => {
    let pending = targetId
      ? await engine.findPendingByConfirmPrompt(userId, targetId)
      : null;
    // Safe default: only fall back to latest when we have no target match
    // and the reaction is a documented confirm/cancel emoji.
    if (!pending && (CONFIRM_TAPBACKS.has(emoji) || CANCEL_TAPBACKS.has(emoji))) {
      pending = await engine.latestPending(userId);
    }
    if (!pending) return;

    // If we know the prompt id and reaction targeted something else, ignore.
    if (
      targetId &&
      pending.confirmPromptMessageId &&
      pending.confirmPromptMessageId !== targetId
    ) {
      return;
    }

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
  }, userId);
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
  const pollGuid =
    message.content.pollMessageGuid ?? message.content.poll?.pollMessageGuid;

  if (title === "Opt in budget alerts") {
    await withEngine(space, async () => {
      await getFinanceRepository().updateProfile(userId, {
        optInBudgetAlerts: true,
      });
      await space.send(
        "Opted in to budget alerts. I'll only message when a category hits ~80%+.",
      );
    }, userId);
    return;
  }
  if (title === "Keep alerts off") {
    await withEngine(space, async () => {
      await getFinanceRepository().updateProfile(userId, {
        optInBudgetAlerts: false,
      });
      await space.send("Budget alerts stay off.");
    }, userId);
    return;
  }
  if (title === "Show dining budget" || title === "Show groceries budget") {
    await withEngine(space, async (eng) => {
      await space.send(await eng.budgetStatus(userId));
    }, userId);
    return;
  }

  const category = title ? POLL_CATEGORY[title] : undefined;
  if (!category) return;

  await withEngine(space, async (eng) => {
    let pending = pollGuid
      ? await eng.findPendingByPollGuid(userId, pollGuid)
      : null;
    pending = pending ?? (await eng.latestPending(userId));
    if (!pending) return;
    if (pollGuid && pending.pollMessageGuid && pending.pollMessageGuid !== pollGuid) {
      return;
    }
    const updated = await eng.correctPending(userId, pending.id, { category });
    if (updated) {
      await space.send(
        `Category set to ${CATEGORY_LABELS[category]}.\n${eng.pendingPrompt(updated)}`,
      );
    }
  }, userId);
}

function unwrapReply(message: Message): {
  text?: string;
  replyTargetId?: string;
  attachment?: boolean;
} {
  const c = message.content;
  if (c.type === "reply") {
    const targetId = c.target?.id;
    const inner = c.content;
    if (inner && typeof inner === "object" && "type" in inner) {
      if (inner.type === "text" && "text" in inner) {
        return { text: String(inner.text), replyTargetId: targetId };
      }
      if (inner.type === "attachment") {
        return { attachment: true, replyTargetId: targetId };
      }
    }
  }
  return {};
}

export async function handlePennyMessage(
  space: Space,
  message: Message,
): Promise<void> {
  if (message.content.type === "read") {
    return;
  }

  const userId = senderUserId(message);
  if (!userId) return;

  try {
    void message.read().catch(() => undefined);

    // Durable idempotency when DB configured.
    try {
      const repo = getFinanceRepository();
      if (await repo.claimEvent(message.id)) return;
    } catch (error) {
      if (!(error instanceof PersistenceUnavailableError)) throw error;
    }

    await space.responding(async () => {
      const replyMeta = unwrapReply(message);
      if (replyMeta.text !== undefined) {
        await handleText(space, message, userId, replyMeta.text.trim(), {
          replyTargetId: replyMeta.replyTargetId,
        });
        return;
      }

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
        case "reply":
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

/** Test seam: classify whether an intent needs durable finance storage. */
export { needsFinanceStore, unwrapReply };
