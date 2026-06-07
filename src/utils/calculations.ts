import type { CategoryBudget, Debt, FinanceState, SavingGoal, Subscription, Transaction } from "../types";
import { daysBetween, monthKey, todayISO } from "./format";

export const currentMonth = () => todayISO().slice(0, 7);

export const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export const monthlySubscriptionAmount = (subscription: Subscription) =>
  subscription.isActive ? (subscription.period === "yearly" ? subscription.amount / 12 : subscription.amount) : 0;

export const getTransactionsByType = (transactions: Transaction[], type: Transaction["type"], month?: string) =>
  transactions.filter((item) => item.type === type && (!month || monthKey(item.date) === month));

export const getTotalByType = (transactions: Transaction[], type: Transaction["type"], month?: string) =>
  sum(getTransactionsByType(transactions, type, month).map((item) => item.amount));

export const getExpensesByCategory = (transactions: Transaction[], month?: string) => {
  const result = new Map<string, number>();
  getTransactionsByType(transactions, "expense", month).forEach((item) => {
    result.set(item.category, (result.get(item.category) ?? 0) + item.amount);
  });
  return [...result.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

export const getBalance = (transactions: Transaction[]) =>
  getTotalByType(transactions, "income") - getTotalByType(transactions, "expense");

export const getMonthlySubscriptionsTotal = (subscriptions: Subscription[]) =>
  sum(subscriptions.map(monthlySubscriptionAmount));

export const getActiveDebtTotal = (debts: Debt[]) =>
  sum(debts.filter((debt) => !debt.isClosed && debt.type === "i_owe").map((debt) => debt.amount));

export const getGoalsProgress = (goals: SavingGoal[]) => {
  const target = sum(goals.map((goal) => goal.targetAmount));
  const current = sum(goals.map((goal) => goal.currentAmount));
  return { target, current, percent: target ? Math.min(100, Math.round((current / target) * 100)) : 0 };
};

export const getPlannedSavingsMonthly = (goals: SavingGoal[]) =>
  sum(
    goals
      .filter((goal) => goal.currentAmount < goal.targetAmount)
      .map((goal) => Math.ceil((goal.targetAmount - goal.currentAmount) / 6)),
  );

export const getDaysLeftInMonth = () => {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.max(1, daysInMonth - now.getDate() + 1);
};

export const getDailySpendLimit = (state: FinanceState) => {
  const month = currentMonth();
  const income = getTotalByType(state.transactions, "income", month);
  const expenses = getTotalByType(state.transactions, "expense", month);
  const requiredPayments = getMonthlySubscriptionsTotal(state.subscriptions);
  const plannedSavings = getPlannedSavingsMonthly(state.goals);
  const daysLeft = getDaysLeftInMonth();
  const freeMoney = income - expenses - requiredPayments - plannedSavings;
  return {
    freeMoney,
    daysLeft,
    dailyLimit: freeMoney / daysLeft,
    isNegative: freeMoney < 0,
  };
};

export const getBudgetProgress = (budgets: CategoryBudget[], transactions: Transaction[], month = currentMonth()) =>
  budgets
    .map((budget) => {
      const spent = sum(
        transactions
          .filter((item) => item.type === "expense" && item.category === budget.category && monthKey(item.date) === month)
          .map((item) => item.amount),
      );
      const percent = budget.monthlyLimit ? Math.round((spent / budget.monthlyLimit) * 100) : 0;
      return {
        ...budget,
        spent,
        left: budget.monthlyLimit - spent,
        percent,
        status: percent >= 100 ? "over" : percent >= 80 ? "warning" : "ok",
      };
    })
    .sort((a, b) => b.percent - a.percent);

export const getMonthlySeries = (transactions: Transaction[]) => {
  const keys = Array.from(new Set(transactions.map((item) => monthKey(item.date)))).sort().slice(-6);
  return keys.map((key) => ({
    month: new Intl.DateTimeFormat("ru-RU", { month: "short" }).format(new Date(`${key}-01`)),
    доходы: getTotalByType(transactions, "income", key),
    расходы: getTotalByType(transactions, "expense", key),
  }));
};

export const getUpcomingSubscriptions = (subscriptions: Subscription[]) =>
  subscriptions
    .filter((item) => item.isActive)
    .map((item) => ({ ...item, daysLeft: daysBetween(todayISO(), item.nextPaymentDate) }))
    .filter((item) => item.daysLeft >= 0 && item.daysLeft <= 7)
    .sort((a, b) => a.daysLeft - b.daysLeft);

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const addYears = (date: Date, years: number) => {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
};

export type PaymentEvent = {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: "subscription" | "debt" | "recurring";
  category: string;
  daysLeft: number;
};

export const getPaymentCalendar = (state: FinanceState, horizonDays = 30): PaymentEvent[] => {
  const today = new Date(todayISO());
  const horizon = new Date(today);
  horizon.setDate(today.getDate() + horizonDays);
  const events: PaymentEvent[] = [];

  state.subscriptions
    .filter((item) => item.isActive)
    .forEach((item) => {
      let date = new Date(item.nextPaymentDate);
      while (date < today) {
        date = item.period === "monthly" ? addMonths(date, 1) : addYears(date, 1);
      }
      if (date <= horizon) {
        const iso = date.toISOString().slice(0, 10);
        events.push({
          id: `subscription-${item.id}`,
          title: item.name,
          amount: item.amount,
          date: iso,
          type: "subscription",
          category: item.category,
          daysLeft: daysBetween(todayISO(), iso),
        });
      }
    });

  state.debts
    .filter((debt) => !debt.isClosed && debt.deadline)
    .forEach((debt) => {
      const date = debt.deadline!;
      const daysLeft = daysBetween(todayISO(), date);
      if (daysLeft >= 0 && daysLeft <= horizonDays) {
        events.push({
          id: `debt-${debt.id}`,
          title: debt.type === "i_owe" ? `Вернуть: ${debt.person}` : `Должны вернуть: ${debt.person}`,
          amount: debt.amount,
          date,
          type: "debt",
          category: debt.type === "i_owe" ? "долг" : "возврат",
          daysLeft,
        });
      }
    });

  state.transactions
    .filter((item) => item.isRecurring)
    .forEach((item) => {
      let date = new Date(item.date);
      while (date < today) date = addMonths(date, 1);
      if (date <= horizon) {
        const iso = date.toISOString().slice(0, 10);
        events.push({
          id: `recurring-${item.id}`,
          title: item.comment || item.category,
          amount: item.amount,
          date: iso,
          type: "recurring",
          category: item.category,
          daysLeft: daysBetween(todayISO(), iso),
        });
      }
    });

  return events.sort((a, b) => a.date.localeCompare(b.date));
};

export const getInsights = (state: FinanceState) => {
  const month = currentMonth();
  const expenses = getTotalByType(state.transactions, "expense", month);
  const subscriptions = getMonthlySubscriptionsTotal(state.subscriptions);
  const topCategory = getExpensesByCategory(state.transactions, month)[0];
  const goals = state.goals.filter((goal) => goal.currentAmount < goal.targetAmount);
  const goal = goals[0];
  const subShare = expenses ? Math.round((subscriptions / expenses) * 100) : 0;
  const goalAdvice = goal ? Math.ceil((goal.targetAmount - goal.currentAmount) / 6) : 0;
  const overBudget = getBudgetProgress(state.budgets, state.transactions, month).find((budget) => budget.status === "over");
  const daily = getDailySpendLimit(state);

  return [
    topCategory ? `Больше всего денег уходит на ${topCategory.name}.` : "Пока мало данных для главного вывода.",
    `Подписки занимают ${subShare}% от расходов текущего месяца.`,
    overBudget
      ? `Ты превысил бюджет по категории ${overBudget.category} на ${Math.abs(overBudget.left).toLocaleString("ru-RU")} ₽.`
      : topCategory?.name === "развлечения"
        ? "Расходы на развлечения заметны в бюджете, их стоит держать на отдельном лимите."
        : "Самые крупные траты уже видны в аналитике, можно поставить лимит на топ-категорию.",
    goal ? `Ты можешь быстрее накопить на "${goal.title}", если будешь откладывать ${goalAdvice.toLocaleString("ru-RU")} ₽ в месяц.` : "Все цели закрыты или пока не добавлены.",
    daily.isNegative ? "Свободный дневной лимит ушёл в минус: стоит сократить необязательные траты." : `До конца месяца можно тратить около ${Math.floor(daily.dailyLimit).toLocaleString("ru-RU")} ₽ в день.`,
  ];
};
