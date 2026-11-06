import { NextResponse } from "next/server";
import { FinanceEngine } from "@/lib/finance/engine";
import { getFinanceRepository } from "@/lib/finance/repository";
import {
  budgetNeedsWarning,
  cronAuthorized,
  dayKey,
  inQuietHours,
  weekKey,
} from "@/lib/finance/scheduler";
import {
  PersistenceUnavailableError,
  type FinanceRepository,
} from "@/lib/finance/store";
import { getSpectrumApp } from "@/lib/spectrum";
import { imessage } from "spectrum-ts/providers/imessage";

export const maxDuration = 60;

/**
 * Vercel Cron / external scheduler entrypoint.
 * Requires CRON_SECRET Bearer auth. Sends ONLY to users with explicit opt-in.
 */
export async function GET(request: Request): Promise<Response> {
  if (!cronAuthorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let repo: FinanceRepository;
  try {
    repo = getFinanceRepository();
  } catch (error) {
    if (error instanceof PersistenceUnavailableError) {
      return NextResponse.json(
        {
          ok: false,
          error: "persistence_unconfigured",
          message: error.message,
        },
        { status: 503 },
      );
    }
    throw error;
  }

  const app = await getSpectrumApp();
  const im = imessage(app);
  const engine = new FinanceEngine(repo);
  const results: { userId: string; kind: string; status: string }[] = [];

  async function deliver(
    userId: string,
    kind: "weekly" | "budget" | "recurring",
    period: string,
    body: string,
  ): Promise<void> {
    // Claim period only after content is ready; duplicate => skip send.
    if (await repo.recordDigestSent(userId, kind, period)) {
      results.push({ userId, kind, status: "duplicate" });
      return;
    }
    try {
      const user = await im.user(userId);
      const dm = await im.space.create(user);
      await dm.send(body);
      results.push({ userId, kind, status: "sent" });
    } catch (error) {
      console.error(`${kind} digest failed`, userId, error);
      results.push({ userId, kind, status: "error" });
    }
  }

  const weeklyUsers = await repo.listUsersWithOptIn("optInWeeklySummary");
  for (const userId of weeklyUsers) {
    const profile = await repo.getOrCreateProfile(userId);
    if (inQuietHours(profile.timezone, profile.quietHoursStart, profile.quietHoursEnd)) {
      results.push({ userId, kind: "weekly", status: "quiet_hours" });
      continue;
    }
    const body = `Weekly spending summary (opt-in)\n\n${await engine.weeklySummaryText(userId)}`;
    await deliver(userId, "weekly", weekKey(profile.timezone), body);
  }

  const budgetUsers = await repo.listUsersWithOptIn("optInBudgetAlerts");
  for (const userId of budgetUsers) {
    const profile = await repo.getOrCreateProfile(userId);
    if (inQuietHours(profile.timezone, profile.quietHoursStart, profile.quietHoursEnd)) {
      results.push({ userId, kind: "budget", status: "quiet_hours" });
      continue;
    }
    const status = await engine.budgetStatus(userId);
    if (!budgetNeedsWarning(status)) {
      results.push({ userId, kind: "budget", status: "skipped_under_threshold" });
      continue;
    }
    await deliver(
      userId,
      "budget",
      dayKey(profile.timezone),
      `Budget warning (opt-in)\n\n${status}`,
    );
  }

  const recurringUsers = await repo.listUsersWithOptIn("optInRecurringReminders");
  for (const userId of recurringUsers) {
    const profile = await repo.getOrCreateProfile(userId);
    if (inQuietHours(profile.timezone, profile.quietHoursStart, profile.quietHoursEnd)) {
      results.push({ userId, kind: "recurring", status: "quiet_hours" });
      continue;
    }
    const list = await engine.recurringList(userId);
    await deliver(
      userId,
      "recurring",
      dayKey(profile.timezone),
      `Recurring charges reminder (opt-in)\n\n${list}`,
    );
  }

  return NextResponse.json({ ok: true, results });
}
