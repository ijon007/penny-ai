import { MemoryFinanceRepository } from "@/lib/finance/memory-store";
import {
  isFinanceDbConfigured,
  PostgresFinanceRepository,
} from "@/lib/finance/postgres-store";
import type { FinanceRepository } from "@/lib/finance/store";

const globalForFinance = globalThis as typeof globalThis & {
  pennyFinanceRepo?: FinanceRepository;
  pennyFinanceMemory?: MemoryFinanceRepository;
};

export type FinancePersistenceMode = "postgres" | "demo_memory";

/**
 * Mock-first: without Postgres, use an explicit per-process demo memory store.
 * Mutations are NOT durable across serverless invocations / restarts and must
 * never be described as saved permanently. Opt-in prefs for cron also do not
 * survive without Postgres — automated outbound digests stay disabled.
 */
export function getFinancePersistenceMode(): FinancePersistenceMode {
  return isFinanceDbConfigured() ? "postgres" : "demo_memory";
}

export function isDurableFinanceStore(): boolean {
  return getFinancePersistenceMode() === "postgres";
}

export function getFinanceRepository(): FinanceRepository {
  if (globalForFinance.pennyFinanceRepo) return globalForFinance.pennyFinanceRepo;

  if (isFinanceDbConfigured()) {
    globalForFinance.pennyFinanceRepo = new PostgresFinanceRepository();
    return globalForFinance.pennyFinanceRepo;
  }

  if (!globalForFinance.pennyFinanceMemory) {
    globalForFinance.pennyFinanceMemory = new MemoryFinanceRepository();
  }
  return globalForFinance.pennyFinanceMemory;
}

export function setFinanceRepositoryForTests(repo: FinanceRepository | null): void {
  globalForFinance.pennyFinanceRepo = repo ?? undefined;
  if (!repo) globalForFinance.pennyFinanceMemory = undefined;
}

export const DEMO_MODE_DISCLAIMER =
  "⚠️ DEMO / MOCK DATA — seeded ledger; session changes are not durable without a database.";
