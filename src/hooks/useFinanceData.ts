import { useEffect, useMemo, useState } from "react";
import type { CategoryBudget, Debt, FinanceState, SavingGoal, Subscription, Transaction } from "../types";
import { demoData } from "../utils/demoData";

const LEGACY_STORAGE_KEY = "money-control-state";

const getStorageKey = (userId: string | null) =>
  userId ? `money-control-state-${userId}` : "money-control-state-guest";

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const emptyState: FinanceState = { transactions: [], subscriptions: [], debts: [], goals: [], budgets: [] };

const normalizeState = (state: Partial<FinanceState>): FinanceState => ({
  transactions: state.transactions ?? [],
  subscriptions: state.subscriptions ?? [],
  debts: state.debts ?? [],
  goals: state.goals ?? [],
  budgets: state.budgets ?? [],
});

const loadInitialState = (userId: string | null): FinanceState => {
  const storageKey = getStorageKey(userId);
  const stored = localStorage.getItem(storageKey);
  if (!stored) {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (userId && legacy) {
      try {
        const parsedLegacy = normalizeState(JSON.parse(legacy) as Partial<FinanceState>);
        localStorage.setItem(storageKey, JSON.stringify(parsedLegacy));
        return parsedLegacy;
      } catch {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }
    localStorage.setItem(storageKey, JSON.stringify(demoData));
    return demoData;
  }

  try {
    return normalizeState(JSON.parse(stored) as Partial<FinanceState>);
  } catch {
    localStorage.setItem(storageKey, JSON.stringify(demoData));
    return demoData;
  }
};

export const useFinanceData = (userId: string | null) => {
  const [state, setState] = useState<FinanceState>(() => (userId ? loadInitialState(userId) : emptyState));

  useEffect(() => {
    setState(userId ? loadInitialState(userId) : emptyState);
  }, [userId]);

  useEffect(() => {
    if (userId) localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
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
      replaceAll: (nextState: FinanceState) => setState(normalizeState(nextState)),
      resetAll: () => setState(emptyState),
      restoreDemo: () => setState(demoData),
    }),
    [],
  );

  return { state, ...api };
};
