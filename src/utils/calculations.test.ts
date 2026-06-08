import { describe, expect, it } from "vitest";
import type { FinanceState, Transaction } from "../types";
import { getBalance, getBudgetProgress, getDailySpendLimit, getDueRecurringTransactions, getEndOfMonthForecast } from "./calculations";
import { filterDuplicateTransactions } from "./imports";
import { todayISO } from "./format";

const baseState = (transactions: Transaction[] = []): FinanceState => ({
  accounts: [{ id: "a1", name: "Основной", type: "card", balance: 10000, currency: "RUB", color: "#60a5fa" }],
  transactions,
  subscriptions: [],
  debts: [],
  goals: [],
  budgets: [],
});

describe("finance calculations", () => {
  it("calculates balance from transactions", () => {
    expect(getBalance([
      { id: "1", type: "income", amount: 1000, category: "зарплата", date: todayISO() },
      { id: "2", type: "expense", amount: 350, category: "еда", date: todayISO() },
    ])).toBe(650);
  });

  it("calculates daily spend limit", () => {
    const state = baseState([
      { id: "1", type: "income", amount: 30000, category: "зарплата", date: todayISO(), accountId: "a1" },
      { id: "2", type: "expense", amount: 6000, category: "еда", date: todayISO(), accountId: "a1" },
    ]);
    expect(getDailySpendLimit(state).dailyLimit).toBeGreaterThan(0);
  });

  it("calculates end of month forecast", () => {
    const state = baseState([
      { id: "1", type: "income", amount: 50000, category: "зарплата", date: todayISO(), accountId: "a1", isRecurring: true },
      { id: "2", type: "expense", amount: 2000, category: "еда", date: todayISO(), accountId: "a1" },
    ]);
    expect(getEndOfMonthForecast(state).forecast).toBeGreaterThan(0);
  });

  it("calculates budget progress", () => {
    const progress = getBudgetProgress([{ id: "b1", category: "еда", monthlyLimit: 10000 }], [
      { id: "1", type: "expense", amount: 8500, category: "еда", date: todayISO() },
    ]);
    expect(progress[0].status).toBe("warning");
  });

  it("finds due recurring transactions", () => {
    const due = getDueRecurringTransactions([
      { id: "r1", type: "expense", amount: 500, category: "подписки", date: todayISO(), isRecurring: true, recurringFrequency: "monthly", nextRunDate: todayISO() },
    ]);
    expect(due).toHaveLength(1);
  });

  it("filters possible duplicate imports", () => {
    const existing: Transaction[] = [{ id: "1", type: "expense", amount: 250, category: "еда", date: todayISO(), comment: "кофе" }];
    const incoming: Transaction[] = [
      { id: "2", type: "expense", amount: 250, category: "еда", date: todayISO(), comment: "кофе в кафе" },
      { id: "3", type: "expense", amount: 700, category: "транспорт", date: todayISO(), comment: "такси" },
    ];
    expect(filterDuplicateTransactions(existing, incoming)).toHaveLength(1);
  });
});
