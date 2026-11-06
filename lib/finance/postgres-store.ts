import { cloneSnapshot, createMockSeed } from "@/lib/finance/mock-seed";
import {
  PersistenceUnavailableError,
  type FinanceRepository,
} from "@/lib/finance/store";
import type {
  FinanceSnapshot,
  PendingEntry,
  UserFinanceProfile,
} from "@/lib/finance/types";

type SqlClient = {
  query: (
    text: string,
    params?: unknown[],
  ) => Promise<{ rows: Record<string, unknown>[] }>;
};

function databaseUrl(): string | null {
  return (
    process.env.PENNY_DATABASE_URL?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    null
  );
}

export function isFinanceDbConfigured(): boolean {
  return Boolean(databaseUrl());
}

export const FINANCE_MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS penny_finance_profiles (
  user_id TEXT PRIMARY KEY,
  currency TEXT NOT NULL DEFAULT 'USD',
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  quiet_hours_start INT NOT NULL DEFAULT 21,
  quiet_hours_end INT NOT NULL DEFAULT 8,
  opt_in_weekly_summary BOOLEAN NOT NULL DEFAULT FALSE,
  opt_in_budget_alerts BOOLEAN NOT NULL DEFAULT FALSE,
  opt_in_recurring_reminders BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS penny_finance_snapshots (
  user_id TEXT PRIMARY KEY REFERENCES penny_finance_profiles(user_id) ON DELETE CASCADE,
  snapshot JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS penny_finance_pending (
  user_id TEXT NOT NULL,
  pending_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, pending_id)
);

CREATE TABLE IF NOT EXISTS penny_finance_events (
  event_id TEXT PRIMARY KEY,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS penny_finance_digests (
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  period_key TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, kind, period_key)
);
`;

async function createClient(url: string): Promise<SqlClient> {
  // Dynamic import so unit tests without pg still load.
  const pg = await import("pg");
  const pool = new pg.Pool({ connectionString: url, max: 2 });
  return {
    query: (text, params) => pool.query(text, params),
  };
}

export class PostgresFinanceRepository implements FinanceRepository {
  readonly kind = "postgres" as const;
  private clientPromise: Promise<SqlClient>;
  private migrated = false;

  constructor(url = databaseUrl()) {
    if (!url) throw new PersistenceUnavailableError();
    this.clientPromise = createClient(url);
  }

  private async db(): Promise<SqlClient> {
    const client = await this.clientPromise;
    if (!this.migrated) {
      await client.query(FINANCE_MIGRATION_SQL);
      this.migrated = true;
    }
    return client;
  }

  async getOrCreateProfile(userId: string): Promise<UserFinanceProfile> {
    const db = await this.db();
    const existing = await db.query(
      `SELECT * FROM penny_finance_profiles WHERE user_id = $1`,
      [userId],
    );
    if (existing.rows[0]) return rowToProfile(existing.rows[0]);

    await db.query(
      `INSERT INTO penny_finance_profiles (user_id) VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId],
    );
    await db.query(
      `INSERT INTO penny_finance_snapshots (user_id, snapshot)
       VALUES ($1, $2::jsonb)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId, JSON.stringify(cloneSnapshot(createMockSeed()))],
    );
    const created = await db.query(
      `SELECT * FROM penny_finance_profiles WHERE user_id = $1`,
      [userId],
    );
    return rowToProfile(created.rows[0]!);
  }

  async updateProfile(
    userId: string,
    patch: Partial<UserFinanceProfile>,
  ): Promise<UserFinanceProfile> {
    await this.getOrCreateProfile(userId);
    const db = await this.db();
    const current = await this.getOrCreateProfile(userId);
    const next = { ...current, ...patch, userId, updatedAt: new Date().toISOString() };
    await db.query(
      `UPDATE penny_finance_profiles SET
        currency = $2,
        timezone = $3,
        quiet_hours_start = $4,
        quiet_hours_end = $5,
        opt_in_weekly_summary = $6,
        opt_in_budget_alerts = $7,
        opt_in_recurring_reminders = $8,
        updated_at = NOW()
       WHERE user_id = $1`,
      [
        userId,
        next.currency,
        next.timezone,
        next.quietHoursStart,
        next.quietHoursEnd,
        next.optInWeeklySummary,
        next.optInBudgetAlerts,
        next.optInRecurringReminders,
      ],
    );
    return next;
  }

  async getSnapshot(userId: string): Promise<FinanceSnapshot> {
    await this.getOrCreateProfile(userId);
    const db = await this.db();
    const res = await db.query(
      `SELECT snapshot FROM penny_finance_snapshots WHERE user_id = $1`,
      [userId],
    );
    return res.rows[0]!.snapshot as FinanceSnapshot;
  }

  async saveSnapshot(userId: string, snapshot: FinanceSnapshot): Promise<void> {
    const db = await this.db();
    await db.query(
      `INSERT INTO penny_finance_snapshots (user_id, snapshot, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (user_id) DO UPDATE SET snapshot = EXCLUDED.snapshot, updated_at = NOW()`,
      [userId, JSON.stringify(snapshot)],
    );
  }

  async savePending(entry: PendingEntry): Promise<void> {
    const db = await this.db();
    await db.query(
      `INSERT INTO penny_finance_pending (user_id, pending_id, payload, status, updated_at)
       VALUES ($1, $2, $3::jsonb, $4, NOW())
       ON CONFLICT (user_id, pending_id) DO UPDATE
         SET payload = EXCLUDED.payload, status = EXCLUDED.status, updated_at = NOW()`,
      [entry.userId, entry.id, JSON.stringify(entry), entry.status],
    );
  }

  async getPending(userId: string, pendingId: string): Promise<PendingEntry | null> {
    const db = await this.db();
    const res = await db.query(
      `SELECT payload FROM penny_finance_pending WHERE user_id = $1 AND pending_id = $2`,
      [userId, pendingId],
    );
    return (res.rows[0]?.payload as PendingEntry) ?? null;
  }

  async listPending(
    userId: string,
    status?: PendingEntry["status"],
  ): Promise<PendingEntry[]> {
    const db = await this.db();
    const res = status
      ? await db.query(
          `SELECT payload FROM penny_finance_pending WHERE user_id = $1 AND status = $2`,
          [userId, status],
        )
      : await db.query(
          `SELECT payload FROM penny_finance_pending WHERE user_id = $1`,
          [userId],
        );
    return res.rows.map((r) => r.payload as PendingEntry);
  }

  async updatePending(entry: PendingEntry): Promise<void> {
    await this.savePending(entry);
  }

  async claimEvent(eventId: string, ttlSeconds = 86_400): Promise<boolean> {
    const db = await this.db();
    await db.query(`DELETE FROM penny_finance_events WHERE expires_at < NOW()`);
    const res = await db.query(
      `INSERT INTO penny_finance_events (event_id, expires_at)
       VALUES ($1, NOW() + ($2 || ' seconds')::interval)
       ON CONFLICT (event_id) DO NOTHING
       RETURNING event_id`,
      [eventId, String(ttlSeconds)],
    );
    return res.rows.length === 0;
  }

  async listUsersWithOptIn(
    flag: "optInWeeklySummary" | "optInBudgetAlerts" | "optInRecurringReminders",
  ): Promise<string[]> {
    const column =
      flag === "optInWeeklySummary"
        ? "opt_in_weekly_summary"
        : flag === "optInBudgetAlerts"
          ? "opt_in_budget_alerts"
          : "opt_in_recurring_reminders";
    const db = await this.db();
    const res = await db.query(
      `SELECT user_id FROM penny_finance_profiles WHERE ${column} = TRUE`,
    );
    return res.rows.map((r) => String(r.user_id));
  }

  async recordDigestSent(
    userId: string,
    kind: string,
    periodKey: string,
  ): Promise<boolean> {
    const db = await this.db();
    const res = await db.query(
      `INSERT INTO penny_finance_digests (user_id, kind, period_key)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING
       RETURNING user_id`,
      [userId, kind, periodKey],
    );
    return res.rows.length === 0;
  }
}

function rowToProfile(row: Record<string, unknown>): UserFinanceProfile {
  return {
    userId: String(row.user_id),
    currency: (row.currency as UserFinanceProfile["currency"]) || "USD",
    timezone: String(row.timezone || "America/New_York"),
    quietHoursStart: Number(row.quiet_hours_start ?? 21),
    quietHoursEnd: Number(row.quiet_hours_end ?? 8),
    optInWeeklySummary: Boolean(row.opt_in_weekly_summary),
    optInBudgetAlerts: Boolean(row.opt_in_budget_alerts),
    optInRecurringReminders: Boolean(row.opt_in_recurring_reminders),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}
