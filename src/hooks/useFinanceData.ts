import { useEffect, useMemo, useState } from "react";
import type { Account, CategoryBudget, Debt, FinanceState, SavingGoal, Subscription, Transaction } from "../types";
import { getDueRecurringTransactions, getNextRecurringDate, makeRecurringOccurrence } from "../utils/calculations";
import { demoData } from "../utils/demoData";
import { safeGetItem, safeRemoveItem, safeSetItem } from "../utils/storage";

const LEGACY_STORAGE_KEY = "money-control-state";

const getStorageKey = (userId: string | null) =>
  userId ? `money-control-state-${userId}` : "money-control-state-guest";

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const defaultAccount: Account = { id: "default-account", name: "Основной", type: "card", balance: 0, currency: "RUB", color: "#60a5fa" };
const emptyState: FinanceState = { transactions: [], subscriptions: [], debts: [], goals: [], budgets: [], accounts: [defaultAccount] };

const normalizeState = (state: Partial<FinanceState>): FinanceState => {
  const accounts = state.accounts?.length
    ? state.accounts.map((account, index) => ({
        ...account,
        type: account.type ?? "card",
        currency: "RUB" as const,
        color: account.color ?? ["#60a5fa", "#34d399", "#a78bfa", "#fb7185", "#fbbf24"][index % 5],
      }))
    : [defaultAccount];
  const fallbackAccountId = accounts[0]?.id ?? defaultAccount.id;
  return {
    transactions: (state.transactions ?? []).map((item) => ({ ...item, accountId: item.accountId ?? fallbackAccountId })),
    subscriptions: (state.subscriptions ?? []).map((item) => ({ ...item, usageStatus: item.usageStatus ?? "using" })),
    debts: state.debts ?? [],
    goals: state.goals ?? [],
    budgets: state.budgets ?? [],
    accounts,
  };
};

const loadInitialState = (userId: string | null): FinanceState => {
  const storageKey = getStorageKey(userId);
  const stored = safeGetItem(storageKey);
  if (!stored) {
    if (userId === "demo-user") {
      safeSetItem(storageKey, JSON.stringify(demoData));
      return demoData;
    }
    const legacy = safeGetItem(LEGACY_STORAGE_KEY);
    if (userId && legacy) {
      try {
        const parsedLegacy = normalizeState(JSON.parse(legacy) as Partial<FinanceState>);
        safeSetItem(storageKey, JSON.stringify(parsedLegacy));
        return parsedLegacy;
      } catch {
        safeRemoveItem(LEGACY_STORAGE_KEY);
      }
    }
    safeSetItem(storageKey, JSON.stringify(emptyState));
    return emptyState;
  }

  try {
    return normalizeState(JSON.parse(stored) as Partial<FinanceState>);
  } catch {
    safeSetItem(storageKey, JSON.stringify(demoData));
    return demoData;
  }
};

export const useFinanceData = (userId: string | null) => {
  const [state, setState] = useState<FinanceState>(() => (userId ? loadInitialState(userId) : emptyState));

  useEffect(() => {
    setState(userId ? loadInitialState(userId) : emptyState);
  }, [userId]);

  useEffect(() => {
    if (userId) safeSetItem(getStorageKey(userId), JSON.stringify(state));
  }, [state, userId]);

  const api = useMemo(
    () => ({
      addTransaction: (transaction: Omit<Transaction, "id">) =>
        setState((current) => ({
          ...current,
          transactions: [{ ...transaction, id: createId() }, ...current.transactions],
        })),
      updateTransaction: (transaction: Transaction) =>
        setState((current) => ({
          ...current,
          transactions: current.transactions.map((item) => (item.id === transaction.id ? transaction : item)),
        })),
      deleteTransaction: (id: string) =>
        setState((current) => ({
          ...current,
          transactions: current.transactions.filter((item) => item.id !== id),
        })),
      addSubscription: (subscription: Omit<Subscription, "id">) =>
        setState((current) => ({
          ...current,
          subscriptions: [{ ...subscription, id: createId() }, ...current.subscriptions],
        })),
      updateSubscription: (subscription: Subscription) =>
        setState((current) => ({
          ...current,
          subscriptions: current.subscriptions.map((item) => (item.id === subscription.id ? subscription : item)),
        })),
      deleteSubscription: (id: string) =>
        setState((current) => ({
          ...current,
          subscriptions: current.subscriptions.filter((item) => item.id !== id),
        })),
      addDebt: (debt: Omit<Debt, "id">) =>
        setState((current) => ({
          ...current,
          debts: [{ ...debt, id: createId() }, ...current.debts],
        })),
      updateDebt: (debt: Debt) =>
        setState((current) => ({
          ...current,
          debts: current.debts.map((item) => (item.id === debt.id ? debt : item)),
        })),
      deleteDebt: (id: string) =>
        setState((current) => ({
          ...current,
          debts: current.debts.filter((item) => item.id !== id),
        })),
      addGoal: (goal: Omit<SavingGoal, "id">) =>
        setState((current) => ({
          ...current,
          goals: [{ ...goal, id: createId() }, ...current.goals],
        })),
      updateGoal: (goal: SavingGoal) =>
        setState((current) => ({
          ...current,
          goals: current.goals.map((item) => (item.id === goal.id ? goal : item)),
        })),
      deleteGoal: (id: string) =>
        setState((current) => ({
          ...current,
          goals: current.goals.filter((item) => item.id !== id),
        })),
      addBudget: (budget: Omit<CategoryBudget, "id">) =>
        setState((current) => ({
          ...current,
          budgets: [{ ...budget, id: createId() }, ...current.budgets.filter((item) => item.category !== budget.category)],
        })),
      updateBudget: (budget: CategoryBudget) =>
        setState((current) => ({
          ...current,
          budgets: current.budgets.map((item) => (item.id === budget.id ? budget : item)),
        })),
      deleteBudget: (id: string) =>
        setState((current) => ({
          ...current,
          budgets: current.budgets.filter((item) => item.id !== id),
        })),
      addAccount: (account: Omit<Account, "id" | "currency">) =>
        setState((current) => ({
          ...current,
          accounts: [{ ...account, id: createId(), currency: "RUB" }, ...current.accounts],
        })),
      updateAccount: (account: Account) =>
        setState((current) => ({
          ...current,
          accounts: current.accounts.map((item) => (item.id === account.id ? account : item)),
        })),
      deleteAccount: (id: string) =>
        setState((current) => {
          const nextAccounts = current.accounts.filter((item) => item.id !== id);
          const fallback = nextAccounts[0]?.id ?? defaultAccount.id;
          return {
            ...current,
            accounts: nextAccounts.length ? nextAccounts : [defaultAccount],
            transactions: current.transactions.map((item) => (item.accountId === id ? { ...item, accountId: fallback } : item)),
          };
        }),
      applyDueRecurring: () =>
        setState((current) => {
          const due = getDueRecurringTransactions(current.transactions);
          if (!due.length) return current;
          const occurrences = due.map((item) => ({ ...makeRecurringOccurrence(item), id: createId() }));
          return {
            ...current,
            transactions: [
              ...occurrences,
              ...current.transactions.map((item) =>
                due.some((dueItem) => dueItem.id === item.id)
                  ? { ...item, lastRunDate: item.nextRunDate ?? item.date, nextRunDate: getNextRecurringDate({ ...item, nextRunDate: item.nextRunDate ?? item.date }, new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)) }
                  : item,
              ),
            ],
          };
        }),
      replaceAll: (nextState: FinanceState) => setState(normalizeState(nextState)),
      resetAll: () => setState(emptyState),
      restoreDemo: () => setState(demoData),
    }),
    [],
  );

  return { state, ...api };
};
