import type { FinanceSnapshot } from "@/lib/finance/types";
import { cloneSnapshot, createMockSeed } from "@/lib/finance/mock-seed";

/**
 * Replaceable financial data source. Mock is the only implemented provider.
 * Future bank sync should implement this without changing FinanceEngine.
 */
export interface FinanceDataProvider {
  readonly id: string;
  /** Human-visible label; mock must stay MOCK_DATA. */
  readonly label: FinanceSnapshot["label"] | "LIVE_BANK";
  createInitialSnapshot(): FinanceSnapshot;
}

export class MockFinanceDataProvider implements FinanceDataProvider {
  readonly id = "mock";
  readonly label = "MOCK_DATA" as const;

  createInitialSnapshot(): FinanceSnapshot {
    return cloneSnapshot(createMockSeed());
  }
}

let activeProvider: FinanceDataProvider = new MockFinanceDataProvider();

export function getFinanceDataProvider(): FinanceDataProvider {
  return activeProvider;
}

/** Tests / future wiring only. */
export function setFinanceDataProvider(provider: FinanceDataProvider): void {
  activeProvider = provider;
}
