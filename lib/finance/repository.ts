import { MemoryFinanceRepository } from "@/lib/finance/memory-store";
import {
  isFinanceDbConfigured,
  PostgresFinanceRepository,
} from "@/lib/finance/postgres-store";
import {
  PersistenceUnavailableError,
  type FinanceRepository,
} from "@/lib/finance/store";

const globalForFinance = globalThis as typeof globalThis & {
  pennyFinanceRepo?: FinanceRepository;
  pennyFinanceMemory?: MemoryFinanceRepository;
};

/**
 * Production path requires Postgres. Tests may inject MemoryFinanceRepository.
 * Set PENNY_ALLOW_MEMORY_STORE=1 only for explicit local demos — never claim it as production.
 */
export function getFinanceRepository(): FinanceRepository {
  if (globalForFinance.pennyFinanceRepo) return globalForFinance.pennyFinanceRepo;

  if (isFinanceDbConfigured()) {
    globalForFinance.pennyFinanceRepo = new PostgresFinanceRepository();
    return globalForFinance.pennyFinanceRepo;
  }

  if (process.env.PENNY_ALLOW_MEMORY_STORE === "1" || process.env.NODE_ENV === "test") {
    if (!globalForFinance.pennyFinanceMemory) {
      globalForFinance.pennyFinanceMemory = new MemoryFinanceRepository();
    }
    return globalForFinance.pennyFinanceMemory;
  }

  throw new PersistenceUnavailableError();
}

export function setFinanceRepositoryForTests(repo: FinanceRepository | null): void {
  globalForFinance.pennyFinanceRepo = repo ?? undefined;
  if (!repo) globalForFinance.pennyFinanceMemory = undefined;
}
