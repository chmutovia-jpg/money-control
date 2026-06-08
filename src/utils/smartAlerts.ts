import type { FinanceState } from "../types";
import { currentMonth, getBudgetProgress, getCashflowForecast, getGoalsProgress, getMonthlySubscriptionsTotal, getPaymentCalendar } from "./calculations";
import { formatCurrency, formatDate } from "./format";

export type SmartAlertType = "budget_warning" | "upcoming_payment" | "low_cashflow" | "subscription_review" | "goal_progress";

export type SmartAlert = {
  id: string;
  type: SmartAlertType;
  title: string;
  text: string;
  tone: "blue" | "green" | "amber" | "rose" | "violet";
};

export const getSmartAlerts = (state: FinanceState): SmartAlert[] => {
  const budgets = getBudgetProgress(state.budgets, state.transactions, currentMonth());
  const alerts: SmartAlert[] = [];
  const riskyBudget = budgets.find((budget) => budget.status === "over") ?? budgets.find((budget) => budget.status === "warning");
  const upcomingPayment = getPaymentCalendar(state, 7).find((event) => event.direction === "expense");
  const lowCashflow = getCashflowForecast(state, 14).find((day) => day.isLow);
  const subscriptions = getMonthlySubscriptionsTotal(state.subscriptions);
  const canCancel = state.subscriptions.filter((item) => item.isActive && item.usageStatus === "can_cancel");
  const goals = getGoalsProgress(state.goals);

  if (riskyBudget) {
    alerts.push({
      id: `budget-${riskyBudget.id}`,
      type: "budget_warning",
      title: riskyBudget.status === "over" ? "Бюджет превышен" : "Бюджет близко к лимиту",
      text: `${riskyBudget.category}: ${riskyBudget.percent}% от лимита.`,
      tone: riskyBudget.status === "over" ? "rose" : "amber",
    });
  }

  if (upcomingPayment) {
    alerts.push({
      id: `payment-${upcomingPayment.id}`,
      type: "upcoming_payment",
      title: "Ближайший платёж",
      text: `${upcomingPayment.title}, ${formatCurrency(upcomingPayment.amount)} — ${formatDate(upcomingPayment.date)}.`,
      tone: "blue",
    });
  }

  if (lowCashflow) {
    alerts.push({
      id: `cashflow-${lowCashflow.date}`,
      type: "low_cashflow",
      title: "Риск низкого баланса",
      text: `Проверь траты до ${formatDate(lowCashflow.date)}: прогноз может стать напряжённым.`,
      tone: "rose",
    });
  }

  if (subscriptions > 0) {
    alerts.push({
      id: "subscription-review",
      type: "subscription_review",
      title: "Проверь подписки",
      text: canCancel.length
        ? `Можно пересмотреть подписки: ${canCancel.length}. Потенциал экономии: ${formatCurrency(canCancel.reduce((total, item) => total + (item.period === "yearly" ? item.amount : item.amount * 12), 0))} в год.`
        : `Подписки стоят ${formatCurrency(subscriptions)} в месяц.`,
      tone: "violet",
    });
  }

  if (goals.target > 0) {
    alerts.push({
      id: "goal-progress",
      type: "goal_progress",
      title: "Цели накоплений",
      text: `Накоплено ${goals.percent}% от всех целей.`,
      tone: goals.percent >= 50 ? "green" : "blue",
    });
  }

  return alerts.slice(0, 6);
};
