import type {
  FinanceSnapshot,
  PendingEntry,
  UserFinanceProfile,
} from "@/lib/finance/types";

export interface FinanceRepository {
  getOrCreateProfile(userId: string): Promise<UserFinanceProfile>;
  updateProfile(
    userId: string,
    patch: Partial<
      Pick<
        UserFinanceProfile,
        | "timezone"
        | "currency"
        | "quietHoursStart"
        | "quietHoursEnd"
        | "optInWeeklySummary"
        | "optInBudgetAlerts"
        | "optInRecurringReminders"
      >
    >,
  ): Promise<UserFinanceProfile>;
  getSnapshot(userId: string): Promise<FinanceSnapshot>;
  saveSnapshot(userId: string, snapshot: FinanceSnapshot): Promise<void>;
  savePending(entry: PendingEntry): Promise<void>;
  getPending(userId: string, pendingId: string): Promise<PendingEntry | null>;
  listPending(userId: string, status?: PendingEntry["status"]): Promise<PendingEntry[]>;
  updatePending(entry: PendingEntry): Promise<void>;
  /** Durable idempotency for webhook / cron event ids. Returns true if already seen. */
  claimEvent(eventId: string, ttlSeconds?: number): Promise<boolean>;
  listUsersWithOptIn(
    flag: "optInWeeklySummary" | "optInBudgetAlerts" | "optInRecurringReminders",
  ): Promise<string[]>;
  recordDigestSent(userId: string, kind: string, periodKey: string): Promise<boolean>;
}

export class PersistenceUnavailableError extends Error {
  constructor(message = "Finance persistence is not configured (set PENNY_DATABASE_URL or DATABASE_URL or POSTGRES_URL)") {
    super(message);
    this.name = "PersistenceUnavailableError";
  }
}
