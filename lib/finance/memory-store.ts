import { getFinanceDataProvider } from "@/lib/finance/provider";
import type { FinanceRepository } from "@/lib/finance/store";
import type {
  FinanceSnapshot,
  PendingEntry,
  UserFinanceProfile,
} from "@/lib/finance/types";

/** Test-only / local-dev ephemeral store. Not safe for production serverless. */
export class MemoryFinanceRepository implements FinanceRepository {
  readonly kind = "memory" as const;
  private profiles = new Map<string, UserFinanceProfile>();
  private snapshots = new Map<string, FinanceSnapshot>();
  private pending = new Map<string, PendingEntry>();
  private events = new Map<string, number>();
  private digests = new Set<string>();

  async getOrCreateProfile(userId: string): Promise<UserFinanceProfile> {
    const existing = this.profiles.get(userId);
    if (existing) return existing;
    const now = new Date().toISOString();
    const profile: UserFinanceProfile = {
      userId,
      currency: "USD",
      timezone: "America/New_York",
      quietHoursStart: 21,
      quietHoursEnd: 8,
      optInWeeklySummary: false,
      optInBudgetAlerts: false,
      optInRecurringReminders: false,
      createdAt: now,
      updatedAt: now,
    };
    this.profiles.set(userId, profile);
    this.snapshots.set(userId, getFinanceDataProvider().createInitialSnapshot());
    return profile;
  }

  async updateProfile(
    userId: string,
    patch: Partial<UserFinanceProfile>,
  ): Promise<UserFinanceProfile> {
    const profile = await this.getOrCreateProfile(userId);
    const next = {
      ...profile,
      ...patch,
      userId,
      updatedAt: new Date().toISOString(),
    };
    this.profiles.set(userId, next);
    return next;
  }

  async getSnapshot(userId: string): Promise<FinanceSnapshot> {
    await this.getOrCreateProfile(userId);
    return this.snapshots.get(userId)!;
  }

  async saveSnapshot(userId: string, snapshot: FinanceSnapshot): Promise<void> {
    this.snapshots.set(userId, snapshot);
  }

  async savePending(entry: PendingEntry): Promise<void> {
    this.pending.set(`${entry.userId}:${entry.id}`, entry);
  }

  async getPending(userId: string, pendingId: string): Promise<PendingEntry | null> {
    return this.pending.get(`${userId}:${pendingId}`) ?? null;
  }

  async listPending(
    userId: string,
    status?: PendingEntry["status"],
  ): Promise<PendingEntry[]> {
    return [...this.pending.values()].filter(
      (p) => p.userId === userId && (!status || p.status === status),
    );
  }

  async updatePending(entry: PendingEntry): Promise<void> {
    this.pending.set(`${entry.userId}:${entry.id}`, entry);
  }

  async claimEvent(eventId: string, ttlSeconds = 86_400): Promise<boolean> {
    const now = Date.now();
    for (const [id, exp] of this.events) {
      if (exp < now) this.events.delete(id);
    }
    if (this.events.has(eventId)) return true;
    this.events.set(eventId, now + ttlSeconds * 1000);
    return false;
  }

  async listUsersWithOptIn(
    flag: "optInWeeklySummary" | "optInBudgetAlerts" | "optInRecurringReminders",
  ): Promise<string[]> {
    return [...this.profiles.values()].filter((p) => p[flag]).map((p) => p.userId);
  }

  async recordDigestSent(
    userId: string,
    kind: string,
    periodKey: string,
  ): Promise<boolean> {
    const key = `${userId}:${kind}:${periodKey}`;
    if (this.digests.has(key)) return true;
    this.digests.add(key);
    return false;
  }
}
