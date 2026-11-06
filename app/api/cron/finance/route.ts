import { NextResponse } from "next/server";
import { FinanceEngine } from "@/lib/finance/engine";
import {
  getFinanceRepository,
  isDurableFinanceStore,
} from "@/lib/finance/repository";
import {
  budgetNeedsWarning,
  cronAuthorized,
  dayKey,
  inQuietHours,
  isPreferredWeeklyDigestDay,
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
 * Vercel Cron entrypoint (daily 14:00 UTC per vercel.json).
 *
 * Cadence limitations (honest):
 * - Not a true weekly-only / due-time job — cron fires daily.
 * - Weekly digests: Monday-local preference + weekKey dedupe.
 * - Budget alerts: dayKey dedupe + ≥80% threshold.
 * - Recurring: only when nextDueOn is within 3 local days; dayKey dedupe.
 * - Quiet hours respected. Sends ONLY to explicit opt-in users.
 * - Requires CRON_SECRET Bearer auth.
 */
export async function GET(request: Request): Promise<Response> {
  if (!cronAuthorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // No durable consent/prefs/idempotency store → never send unsolicited digests.
  if (!isDurableFinanceStore()) {
    return NextResponse.json(
      {
        ok: false,
        error: "scheduler_disabled_demo_mode",
        message:
          "Automated outbound digests require Postgres (PENNY_DATABASE_URL|DATABASE_URL|POSTGRES_URL) for durable opt-in prefs and digest dedupe. Demo/memory mode keeps scheduler OFF.",
      },
      { status: 503 },
    );
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
    if (!isPreferredWeeklyDigestDay(profile.timezone)) {
      results.push({ userId, kind: "weekly", status: "skipped_not_preferred_day" });
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
    const dueText = await engine.recurringDueSoon(userId, 3);
    if (dueText.includes("no recurring charges due")) {
      results.push({ userId, kind: "recurring", status: "skipped_none_due" });
      continue;
    }
    await deliver(
      userId,
      "recurring",
      dayKey(profile.timezone),
      `Recurring charges reminder (opt-in)\n\n${dueText}`,
    );
  }

  return NextResponse.json({
    ok: true,
    cadence:
      "daily_cron_14utc; weekly=Mon+weekKey; budget=dayKey+80pct; recurring=due_within_3d+dayKey",
    results,
  });
}
