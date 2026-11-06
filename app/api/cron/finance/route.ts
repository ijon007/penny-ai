import { NextResponse } from "next/server";
import { FinanceEngine } from "@/lib/finance/engine";
import { getFinanceRepository } from "@/lib/finance/repository";
import { PersistenceUnavailableError } from "@/lib/finance/store";
import { getSpectrumApp } from "@/lib/spectrum";
import { imessage } from "spectrum-ts/providers/imessage";

export const maxDuration = 60;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}

function weekKey(timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value ?? "0000";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  const date = new Date(`${y}-${m}-${d}T12:00:00Z`);
  const onejan = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((date.getTime() - onejan.getTime()) / 86_400_000 + onejan.getUTCDay() + 1) / 7,
  );
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function inQuietHours(timezone: string, start: number, end: number): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
  );
  if (start === end) return false;
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}

/**
 * Vercel Cron / external scheduler entrypoint.
 * Requires CRON_SECRET Bearer auth. Sends ONLY to users with explicit opt-in.
 */
export async function GET(request: Request): Promise<Response> {
  if (!authorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let repo;
  try {
    repo = getFinanceRepository();
  } catch (error) {
    if (error instanceof PersistenceUnavailableError) {
      return NextResponse.json({
        ok: false,
        error: "persistence_unconfigured",
        message: error.message,
      }, { status: 503 });
    }
    throw error;
  }

  const app = await getSpectrumApp();
  const im = imessage(app);
  const engine = new FinanceEngine(repo);
  const results: { userId: string; kind: string; status: string }[] = [];

  const weeklyUsers = await repo.listUsersWithOptIn("optInWeeklySummary");
  for (const userId of weeklyUsers) {
    const profile = await repo.getOrCreateProfile(userId);
    if (inQuietHours(profile.timezone, profile.quietHoursStart, profile.quietHoursEnd)) {
      results.push({ userId, kind: "weekly", status: "quiet_hours" });
      continue;
    }
    const key = weekKey(profile.timezone);
    if (await repo.recordDigestSent(userId, "weekly", key)) {
      results.push({ userId, kind: "weekly", status: "duplicate" });
      continue;
    }
    try {
      const body = await engine.weeklySummaryText(userId);
      const user = await im.user(userId);
      const dm = await im.space.create(user);
      await dm.send(`Weekly spending summary (opt-in)\n\n${body}`);
      results.push({ userId, kind: "weekly", status: "sent" });
    } catch (error) {
      console.error("weekly digest failed", userId, error);
      results.push({ userId, kind: "weekly", status: "error" });
    }
  }

  // Budget warnings: only opted-in users, once per day key
  const budgetUsers = await repo.listUsersWithOptIn("optInBudgetAlerts");
  for (const userId of budgetUsers) {
    const profile = await repo.getOrCreateProfile(userId);
    if (inQuietHours(profile.timezone, profile.quietHoursStart, profile.quietHoursEnd)) {
      results.push({ userId, kind: "budget", status: "quiet_hours" });
      continue;
    }
    const dayKey = new Intl.DateTimeFormat("en-CA", {
      timeZone: profile.timezone,
    }).format(new Date());
    if (await repo.recordDigestSent(userId, "budget", dayKey)) {
      results.push({ userId, kind: "budget", status: "duplicate" });
      continue;
    }
    try {
      const status = await engine.budgetStatus(userId);
      if (!status.includes("100%") && !/\(([8-9]\d|100)%\)/.test(status)) {
        results.push({ userId, kind: "budget", status: "skipped_under_threshold" });
        continue;
      }
      const user = await im.user(userId);
      const dm = await im.space.create(user);
      await dm.send(`Budget warning (opt-in)\n\n${status}`);
      results.push({ userId, kind: "budget", status: "sent" });
    } catch (error) {
      console.error("budget alert failed", userId, error);
      results.push({ userId, kind: "budget", status: "error" });
    }
  }

  const recurringUsers = await repo.listUsersWithOptIn("optInRecurringReminders");
  for (const userId of recurringUsers) {
    const profile = await repo.getOrCreateProfile(userId);
    if (inQuietHours(profile.timezone, profile.quietHoursStart, profile.quietHoursEnd)) {
      results.push({ userId, kind: "recurring", status: "quiet_hours" });
      continue;
    }
    const dayKey = new Intl.DateTimeFormat("en-CA", {
      timeZone: profile.timezone,
    }).format(new Date());
    if (await repo.recordDigestSent(userId, "recurring", dayKey)) {
      results.push({ userId, kind: "recurring", status: "duplicate" });
      continue;
    }
    try {
      const list = await engine.recurringList(userId);
      const user = await im.user(userId);
      const dm = await im.space.create(user);
      await dm.send(`Recurring charges reminder (opt-in)\n\n${list}`);
      results.push({ userId, kind: "recurring", status: "sent" });
    } catch (error) {
      console.error("recurring reminder failed", userId, error);
      results.push({ userId, kind: "recurring", status: "error" });
    }
  }

  return NextResponse.json({ ok: true, results });
}
