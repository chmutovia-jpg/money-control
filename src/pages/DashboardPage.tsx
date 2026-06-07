import { BarChart3, CreditCard, Lightbulb, PiggyBank, Repeat, Target, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, EmptyState, SectionHeader } from "../components/Card";
import { ProgressBar } from "../components/ProgressBar";
import { StatCard } from "../components/StatCard";
import type { FinanceState } from "../types";
import { currentMonth, getActiveDebtTotal, getBalance, getBudgetProgress, getDailySpendLimit, getEndOfMonthForecast, getExpensesByCategory, getGoalsProgress, getInsights, getMonthlySubscriptionsTotal, getTotalByType } from "../utils/calculations";
import { formatCurrency, formatDate } from "../utils/format";

const colors = ["#60a5fa", "#34d399", "#fb7185", "#a5b4fc", "#2dd4bf", "#fbbf24", "#94a3b8"];

export const DashboardPage = ({ state, onReset, onRestoreDemo }: { state: FinanceState; onReset: () => void; onRestoreDemo: () => void }) => {
  const month = currentMonth();
  const income = getTotalByType(state.transactions, "income", month);
  const expenses = getTotalByType(state.transactions, "expense", month);
  const balance = getBalance(state.transactions);
  const subscriptions = getMonthlySubscriptionsTotal(state.subscriptions);
  const debts = getActiveDebtTotal(state.debts);
  const goals = getGoalsProgress(state.goals);
  const daily = getDailySpendLimit(state);
  const forecast = getEndOfMonthForecast(state);
  const budgets = getBudgetProgress(state.budgets, state.transactions, month);
  const problemBudget = budgets.find((budget) => budget.status === "over");
  const warningBudget = budgets.find((budget) => budget.status === "warning");
  const budgetStatus = problemBudget ? `Превышен лимит: ${problemBudget.category}` : warningBudget ? `Внимание: ${warningBudget.category} уже ${warningBudget.percent}%` : "Бюджет в норме";
  const insights = getInsights(state);
  const expensesByCategory = getExpensesByCategory(state.transactions, month);
  const latest = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - new Date().getDate();

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">Добро пожаловать</p>
          <h1 className="mt-1 text-3xl font-bold text-ink">Money Control</h1>
          <p className="mt-2 max-w-2xl text-muted">Контроль доходов, расходов, подписок, долгов и целей в одном спокойном интерфейсе.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-ink shadow-card transition hover:bg-white/15" onClick={onRestoreDemo} type="button">Вернуть демо</button>
          <button className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600" onClick={onReset} type="button">Очистить все данные</button>
        </div>
      </div>

      <section className={`glass-panel mb-5 rounded-[28px] p-6 shadow-soft ${daily.isNegative ? "border-rose-300/30" : ""}`}>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">Сегодня можно потратить</p>
            <p className={`mt-3 text-5xl font-bold leading-none sm:text-6xl ${daily.isNegative ? "text-rose-300" : "text-ink"}`}>
              {formatCurrency(Math.floor(daily.dailyLimit))}
            </p>
            <p className={`mt-4 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${problemBudget ? "bg-rose-400/10 text-rose-200" : warningBudget ? "bg-amber-400/10 text-amber-100" : "bg-emerald-400/10 text-emerald-200"}`}>
              {daily.isNegative ? "Лимит ушёл в минус" : budgetStatus}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-3xl bg-slate-50 p-4"><p className="text-xs text-muted">Баланс</p><p className="mt-1 font-bold text-ink">{formatCurrency(balance)}</p></div>
            <div className="rounded-3xl bg-slate-50 p-4"><p className="text-xs text-muted">До конца</p><p className="mt-1 font-bold text-ink">{daily.daysLeft} дн.</p></div>
            <div className="rounded-3xl bg-slate-50 p-4"><p className="text-xs text-muted">Свободно</p><p className="mt-1 font-bold text-ink">{formatCurrency(daily.freeMoney)}</p></div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Общий баланс" value={formatCurrency(balance)} icon={Wallet} tone="blue" />
        <StatCard label="Доходы за месяц" value={formatCurrency(income)} icon={TrendingUp} tone="green" />
        <StatCard label="Расходы за месяц" value={formatCurrency(expenses)} icon={TrendingDown} tone="red" />
        <StatCard label="Прогноз на конец месяца" value={formatCurrency(Math.floor(forecast.forecast))} icon={BarChart3} tone={forecast.forecast < 0 ? "red" : "blue"} hint={`Платежи: ${formatCurrency(forecast.futurePayments)}`} />
        <StatCard label="Подписки / месяц" value={formatCurrency(subscriptions)} icon={Repeat} tone="violet" />
        <StatCard label="Мои долги" value={formatCurrency(debts)} icon={CreditCard} tone="red" />
        <StatCard label="Цели накоплений" value={`${goals.percent}%`} icon={Target} tone="blue" hint={`${formatCurrency(goals.current)} из ${formatCurrency(goals.target)}`} />
        <StatCard label="Можно тратить в день" value={formatCurrency(Math.floor(daily.dailyLimit))} icon={PiggyBank} tone={daily.isNegative ? "red" : "green"} hint={daily.isNegative ? "Свободные деньги ушли в минус" : `На ${daily.daysLeft} дн. до конца месяца`} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <SectionHeader title="Куда уходят деньги" />
          {expensesByCategory.length ? (
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expensesByCategory} dataKey="value" nameKey="name" innerRadius={64} outerRadius={112} paddingAngle={4}>
                    {expensesByCategory.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyState title="Нет расходов" text="Добавь расходы, чтобы увидеть диаграмму категорий." />}
        </Card>
        <Card>
          <SectionHeader title="Последние операции" />
          {latest.length ? <div className="space-y-3">{latest.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-3xl bg-slate-50 p-4">
              <div><p className="font-semibold text-ink">{item.category}</p><p className="text-sm text-muted">{formatDate(item.date)}{item.comment ? ` • ${item.comment}` : ""}</p></div>
              <p className={`font-bold ${item.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>{item.type === "income" ? "+" : "-"}{formatCurrency(item.amount)}</p>
            </div>
          ))}</div> : <EmptyState title="Операций нет" text="После добавления доходов и расходов они появятся здесь." />}
        </Card>
      </div>

      <Card className="mt-5">
        <SectionHeader title="Бюджеты по категориям" />
        {budgets.length ? <div className="grid gap-4 md:grid-cols-2">{budgets.slice(0, 6).map((budget) => (
          <div key={budget.id} className={`rounded-3xl border p-4 ${budget.status === "over" ? "border-rose-300/30 bg-rose-400/10" : budget.status === "warning" ? "border-amber-300/30 bg-amber-400/10" : "border-white/10 bg-slate-50"}`}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-ink">{budget.category}</p>
                <p className="text-sm text-muted">{formatCurrency(budget.spent)} из {formatCurrency(budget.monthlyLimit)}</p>
              </div>
              <p className={`text-sm font-bold ${budget.status === "over" ? "text-rose-300" : budget.status === "warning" ? "text-amber-200" : "text-blue-300"}`}>{budget.percent}%</p>
            </div>
            <ProgressBar value={Math.min(100, budget.percent)} tone={budget.status === "over" ? "bg-rose-500" : budget.status === "warning" ? "bg-amber-400" : "bg-blue-500"} />
            {budget.status !== "ok" ? <p className={`mt-2 text-sm font-semibold ${budget.status === "over" ? "text-rose-300" : "text-amber-200"}`}>{budget.status === "over" ? "Лимит превышен" : "Потрачено больше 80% лимита"}</p> : null}
          </div>
        ))}</div> : <EmptyState title="Бюджеты не настроены" text="Добавь лимиты на экране Бюджеты, чтобы видеть прогресс здесь." />}
      </Card>

      <Card className="mt-5">
        <SectionHeader title="Умные подсказки" action={<Lightbulb size={20} className="text-blue-300" />} />
        <div className="grid gap-3 md:grid-cols-2">
          {insights.map((insight) => <div key={insight} className="rounded-3xl border border-white/10 bg-slate-50 p-4 text-sm font-medium text-ink">{insight}</div>)}
        </div>
      </Card>

      <Card className="mt-5">
        <SectionHeader title="Прогресс по целям" />
        {state.goals.length ? <div className="grid gap-4 md:grid-cols-2">{state.goals.map((goal) => {
          const percent = goal.targetAmount ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
          return <div key={goal.id} className="rounded-3xl bg-slate-50 p-4"><div className="mb-3 flex items-center justify-between"><p className="font-bold">{goal.title}</p><p className="text-sm font-semibold text-blue-300">{percent}%</p></div><ProgressBar value={percent} /><p className="mt-2 text-sm text-muted">{formatCurrency(goal.currentAmount)} из {formatCurrency(goal.targetAmount)}</p></div>;
        })}</div> : <EmptyState title="Целей нет" text="Создай первую цель накоплений." />}
      </Card>
    </div>
  );
};
