export type CurrencyCode = "USD";

export type CategoryId =
  | "groceries"
  | "dining"
  | "transport"
  | "housing"
  | "utilities"
  | "subscriptions"
  | "shopping"
  | "health"
  | "income"
  | "other";

export interface MoneyAmount {
  /** Integer minor units (cents). */
  minor: number;
  currency: CurrencyCode;
}

export interface Account {
  id: string;
  name: string;
  kind: "checking" | "savings" | "credit";
  /** Labeled mock balances — never presented as live bank data. */
  balanceMinor: number;
  currency: CurrencyCode;
  mock: true;
}

export interface Transaction {
  id: string;
  accountId: string;
  postedAt: string; // ISO date YYYY-MM-DD
  merchant: string;
  category: CategoryId;
  amountMinor: number; // expenses negative, income positive
  currency: CurrencyCode;
  source: "mock_seed" | "user_text" | "receipt" | "correction";
  mock: boolean;
  note?: string;
  pendingId?: string;
}

export interface Budget {
  id: string;
  category: CategoryId;
  limitMinor: number;
  currency: CurrencyCode;
  period: "monthly";
  mock: true;
}

export interface RecurringCharge {
  id: string;
  merchant: string;
  category: CategoryId;
  amountMinor: number;
  currency: CurrencyCode;
  cadence: "weekly" | "monthly" | "yearly";
  nextDueOn: string;
  mock: true;
}

export interface UserFinanceProfile {
  userId: string;
  currency: CurrencyCode;
  timezone: string;
  quietHoursStart: number; // 0-23 local
  quietHoursEnd: number;
  optInWeeklySummary: boolean;
  optInBudgetAlerts: boolean;
  optInRecurringReminders: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PendingKind = "expense" | "receipt" | "correction";

export interface PendingEntry {
  id: string;
  userId: string;
  kind: PendingKind;
  amountMinor: number;
  currency: CurrencyCode;
  merchant: string;
  category: CategoryId;
  postedAt: string;
  note?: string;
  relatedTransactionId?: string;
  originMessageId: string;
  confirmPromptMessageId?: string;
  pollMessageGuid?: string;
  createdAt: string;
  status: "pending" | "confirmed" | "cancelled";
}

export interface FinanceSnapshot {
  label: "MOCK_DATA";
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  recurring: RecurringCharge[];
}

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  groceries: "Groceries",
  dining: "Dining",
  transport: "Transport",
  housing: "Housing",
  utilities: "Utilities",
  subscriptions: "Subscriptions",
  shopping: "Shopping",
  health: "Health",
  income: "Income",
  other: "Other",
};

export const CONFIRM_TAPBACKS = new Set(["👍", "❤️", "✅"]);
export const CANCEL_TAPBACKS = new Set(["👎", "❌", "❎"]);
