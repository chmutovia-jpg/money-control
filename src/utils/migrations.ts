import type { Account, FinanceState } from "../types";

export const CURRENT_SCHEMA_VERSION = 2;

export const createDefaultAccount = (): Account => ({
  id: "default-account",
  name: "Основной",
  type: "card",
  balance: 0,
  currency: "RUB",
  color: "#60a5fa",
});

export const emptyFinanceState = (): FinanceState => ({
  schemaVersion: CURRENT_SCHEMA_VERSION,
  transactions: [],
  subscriptions: [],
  debts: [],
  goals: [],
  budgets: [],
  accounts: [createDefaultAccount()],
});

export const migrateFinanceState = (rawState: Partial<FinanceState> | null | undefined): FinanceState => {
  const defaultAccount = createDefaultAccount();
  const source = rawState ?? {};
  const accounts = source.accounts?.length
    ? source.accounts.map((account, index) => ({
        ...account,
        type: account.type ?? "card",
        currency: "RUB" as const,
        color: account.color ?? ["#60a5fa", "#34d399", "#a78bfa", "#fb7185", "#fbbf24"][index % 5],
      }))
    : [defaultAccount];
  const fallbackAccountId = accounts[0]?.id ?? defaultAccount.id;

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    transactions: (source.transactions ?? []).map((item) => ({ ...item, accountId: item.accountId ?? fallbackAccountId })),
    subscriptions: (source.subscriptions ?? []).map((item) => ({ ...item, usageStatus: item.usageStatus ?? "using" })),
    debts: source.debts ?? [],
    goals: source.goals ?? [],
    budgets: source.budgets ?? [],
    accounts,
  };
};
