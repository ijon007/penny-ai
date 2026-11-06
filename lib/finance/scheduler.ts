export function weekKey(timeZone: string, now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
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

export function inQuietHours(
  timezone: string,
  start: number,
  end: number,
  now = new Date(),
): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    }).format(now),
  );
  if (start === end) return false;
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}

export function dayKey(timeZone: string, now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(now);
}

/** True when any budget line is at least 80% used. */
export function budgetNeedsWarning(statusText: string): boolean {
  return /\(([8-9]\d|100)%\)/.test(statusText);
}

export function cronAuthorized(request: Request, secret = process.env.CRON_SECRET): boolean {
  const trimmed = secret?.trim();
  if (!trimmed) return false;
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${trimmed}`;
}
