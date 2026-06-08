import { BarChart3, CreditCard, Lightbulb, PiggyBank, Repeat, Target, TrendingDown, TrendingUp, Wallet, Zap } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, EmptyState, SectionHeader } from "../components/Card";
import { ProgressBar } from "../components/ProgressBar";
import { StatCard } from "../components/StatCard";
import { AnimatedNumber } from "../components/motion";
import type { FinanceState } from "../types";
import { currentMonth, getAccountsWithBalance, getActiveDebtTotal, getBudgetProgress, getCashflowForecast, getDailySpendLimit, getEndOfMonthForecast, getExpensesByCategory, getFinancialTemperature, getGoalsProgress, getInsights, getMonthlySubscriptionsTotal, getPaymentCalendar, getPurchaseStressTest, getTotalAccountBalance, getTotalByType } from "../utils/calculations";
import { formatCurrency, formatDate } from "../utils/format";

const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)", "#94a3b8"];

export const DashboardPage = ({
  state,
  economyMode,
  onToggleEconomyMode,
  onReset,
  onRestoreDemo,
}: {
  state: FinanceState;
  economyMode: boolean;
  onToggleEconomyMode: () => void;
  onReset: () => void;
  onRestoreDemo: () => void;
}) => {
  const [stressAmount, setStressAmount] = useState("");
  const reduced = useReducedMotion();
  const month = currentMonth();
  const income = getTotalByType(state.transactions, "income", month);
  const expenses = getTotalByType(state.transactions, "expense", month);
  const balance = getTotalAccountBalance(state);
  const subscriptions = getMonthlySubscriptionsTotal(state.subscriptions);
  const debts = getActiveDebtTotal(state.debts);
  const goals = getGoalsProgress(state.goals);
  const daily = getDailySpendLimit(state);
  const forecast = getEndOfMonthForecast(state);
  const accountBalances = getAccountsWithBalance(state.accounts, state.transactions);
  const nearestPayments = getPaymentCalendar(state, 30).slice(0, 3);
  const budgets = getBudgetProgress(state.budgets, state.transactions, month);
  const riskyBudgets = budgets.filter((budget) => budget.status !== "ok").slice(0, 3);
  const problemBudget = budgets.find((budget) => budget.status === "over");
  const warningBudget = budgets.find((budget) => budget.status === "warning");
  const budgetStatus = problemBudget ? `Превышен лимит: ${problemBudget.category}` : warningBudget ? `Внимание: ${warningBudget.category} уже ${warningBudget.percent}%` : "Бюджет в норме";
  const insights = getInsights(state);
  const expensesByCategory = getExpensesByCategory(state.transactions, month);
  const latest = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - new Date().getDate();
  const temperature = getFinancialTemperature(state);
  const stress = getPurchaseStressTest(state, Number(stressAmount) || 0);
  const weekPayments = getPaymentCalendar(state, 7).filter((event) => event.direction === "expense").slice(0, 3);
  const cashflowRisk = getCashflowForecast(state, 14).find((day) => day.isLow);
  const economyDailyLimit = Math.max(0, Math.floor(daily.dailyLimit * 0.8));
  const weekAdvice = cashflowRisk
    ? `Держи траты ниже ${formatCurrency(economyDailyLimit || Math.floor(daily.dailyLimit))} в день до ${formatDate(cashflowRisk.date)}.`
    : riskyBudgets[0]
      ? `На этой неделе снизь траты в категории "${riskyBudgets[0].category}".`
      : "Неделя выглядит спокойной: держи дневной лимит и не забывай про цели.";
  const temperatureClasses = {
    green: "financial-temp-green",
    yellow: "financial-temp-yellow",
    red: "financial-temp-red",
  };
  const temperatureIndex = temperature.status === "green" ? 0 : temperature.status === "yellow" ? 1 : 2;
  const temperaturePosition = temperature.status === "green" ? "10%" : temperature.status === "yellow" ? "50%" : "90%";

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">Добро пожаловать</p>
          <h1 className="mt-1 text-3xl font-bold text-ink">Money Control</h1>
          <p className="mt-2 max-w-2xl text-muted">Контроль доходов, расходов, подписок, долгов и целей в одном спокойном интерфейсе.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-card transition ${economyMode ? "bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/20" : "border border-white/15 bg-white/10 text-ink hover:bg-white/15"}`} onClick={onToggleEconomyMode} type="button">
            <Zap size={17} />
            {economyMode ? "Экономия включена" : "Режим экономии"}
          </button>
          <button className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-ink shadow-card transition hover:bg-white/15" onClick={onRestoreDemo} type="button">Вернуть демо</button>
          <button className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600" onClick={onReset} type="button">Очистить все данные</button>
        </div>
      </div>

      <motion.section
        className={`premium-hero relative mb-8 overflow-hidden rounded-[34px] p-5 shadow-soft sm:p-7 lg:p-8 ${daily.isNegative ? "border-rose-300/30" : ""}`}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.985 }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: reduced ? 0.12 : 0.42, ease: "easeOut" }}
      >
        <div className="relative z-10 grid gap-7 xl:grid-cols-[1.1fr_0.9fr] xl:items-stretch">
          <div className="flex min-h-[310px] flex-col justify-between">
            <div className={`financial-temp-badge inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${temperatureClasses[temperature.status]}`}>
              <span className="h-2.5 w-2.5 rounded-full bg-current shadow-[0_0_18px_currentColor]" />
              Финансовая температура: {temperature.title}
            </div>
            <div className="mt-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted">Сегодня можно потратить</p>
              <p className={`mt-3 text-[3.8rem] font-semibold leading-[0.92] tracking-normal sm:text-[5.6rem] lg:text-[6.4rem] ${daily.isNegative ? "text-rose-300" : "text-ink"}`}>
                <AnimatedNumber value={Math.floor(daily.dailyLimit)} />
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={temperature.title}
                  className="mt-5 max-w-xl text-base leading-7 text-muted"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
                  animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduced ? 0.1 : 0.22, ease: "easeOut" }}
                >
                  {temperature.advice}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="mt-8">
              <div className="temperature-scale">
                <motion.span
                  className="absolute top-1/2 z-10 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-white shadow-[0_0_24px_rgba(255,255,255,0.5)]"
                  initial={false}
                  animate={{ left: temperaturePosition }}
                  transition={{ duration: reduced ? 0.1 : 0.38, ease: "easeOut" }}
                  style={{ marginLeft: "-10px" }}
                />
              </div>
              <div className="mt-3 grid grid-cols-3 text-xs font-semibold text-muted">
                <span className={temperatureIndex === 0 ? "text-emerald-300" : ""}>Спокойно</span>
                <span className={`text-center ${temperatureIndex === 1 ? "text-amber-200" : ""}`}>Осторожно</span>
                <span className={`text-right ${temperatureIndex === 2 ? "text-rose-200" : ""}`}>Риск</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <HeroMetric label="Баланс" value={balance} delay={0.08} />
            <HeroMetric label="Прогноз месяца" value={Math.floor(forecast.forecast)} delay={0.14} tone={forecast.forecast < 0 ? "text-rose-300" : "text-blue-200"} />
            <HeroMetric label="До конца месяца" text={`${daily.daysLeft} дн.`} delay={0.2} />
            <HeroMetric label="Свободно" value={daily.freeMoney} delay={0.26} tone={daily.freeMoney < 0 ? "text-rose-300" : "text-emerald-200"} />
            <motion.div
              className={`sm:col-span-2 rounded-[28px] border p-4 ${problemBudget ? "border-rose-300/25 bg-rose-400/10" : warningBudget ? "border-amber-300/25 bg-amber-400/10" : "border-white/10 bg-white/10"}`}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.1 : 0.28, delay: reduced ? 0 : 0.3, ease: "easeOut" }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Статус бюджета</p>
              <p className="mt-2 text-lg font-semibold text-ink">{daily.isNegative ? "Лимит ушёл в минус" : budgetStatus}</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <Card className="mb-5">
        <SectionHeader title="План недели" action={<Lightbulb size={20} className="text-blue-300" />} />
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Финансовый ассистент недели</p>
            <p className="mt-2 text-2xl font-bold text-ink">{weekAdvice}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-xs text-muted">Дневной лимит</p>
                <p className="mt-1 font-bold text-ink">{formatCurrency(Math.floor(daily.dailyLimit))}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-xs text-muted">Эконом-лимит</p>
                <p className="mt-1 font-bold text-emerald-300">{formatCurrency(economyDailyLimit)}</p>
              </div>
            </div>
            {cashflowRisk ? <p className="mt-3 rounded-2xl bg-rose-400/10 px-3 py-2 text-sm font-semibold text-rose-200">Риск cashflow: {formatDate(cashflowRisk.date)}</p> : null}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="font-bold text-ink">Ближайшие платежи</p>
              <div className="mt-3 space-y-2">
                {weekPayments.length ? weekPayments.map((payment) => (
                  <div key={payment.id} className="flex justify-between gap-3 rounded-2xl bg-white/10 px-3 py-2 text-sm">
                    <span className="truncate text-muted">{payment.title}</span>
                    <strong className="text-ink">{formatCurrency(payment.amount)}</strong>
                  </div>
                )) : <p className="text-sm text-muted">На 7 дней нет обязательных платежей.</p>}
              </div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="font-bold text-ink">Рискованные бюджеты</p>
              <div className="mt-3 space-y-2">
                {riskyBudgets.length ? riskyBudgets.map((budget) => (
                  <div key={budget.id} className={`rounded-2xl px-3 py-2 text-sm font-semibold ${budget.status === "over" ? "bg-rose-400/10 text-rose-200" : "bg-amber-400/10 text-amber-200"}`}>
                    {budget.category}: {budget.percent}%
                  </div>
                )) : <p className="text-sm text-muted">Бюджеты пока без риска.</p>}
              </div>
            </div>
          </div>
        </div>
        {economyMode ? <p className="mt-4 rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm font-semibold text-emerald-200">Режим экономии активен: фокус на еде, транспорте, жилье, здоровье и обязательных платежах. Необязательные траты подсвечиваются в Quick Add.</p> : null}
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Общий баланс" value={formatCurrency(balance)} numericValue={balance} icon={Wallet} tone="blue" delay={0.04} />
        <StatCard label="Доходы за месяц" value={formatCurrency(income)} numericValue={income} icon={TrendingUp} tone="green" delay={0.1} />
        <StatCard label="Расходы за месяц" value={formatCurrency(expenses)} numericValue={expenses} icon={TrendingDown} tone="red" delay={0.16} />
        <StatCard label="Прогноз на конец месяца" value={formatCurrency(Math.floor(forecast.forecast))} numericValue={Math.floor(forecast.forecast)} icon={BarChart3} tone={forecast.forecast < 0 ? "red" : "blue"} hint={`Платежи: ${formatCurrency(forecast.futurePayments)}`} delay={0.22} />
        <StatCard label="Подписки / месяц" value={formatCurrency(subscriptions)} numericValue={subscriptions} icon={Repeat} tone="violet" delay={0.28} />
        <StatCard label="Мои долги" value={formatCurrency(debts)} numericValue={debts} icon={CreditCard} tone="red" delay={0.34} />
        <StatCard label="Цели накоплений" value={formatCurrency(goals.current)} numericValue={goals.current} icon={Target} tone="blue" hint={`${formatCurrency(goals.current)} из ${formatCurrency(goals.target)} (${goals.percent}%)`} delay={0.4} />
        <StatCard label="Можно тратить в день" value={formatCurrency(Math.floor(daily.dailyLimit))} numericValue={Math.floor(daily.dailyLimit)} icon={PiggyBank} tone={daily.isNegative ? "red" : "green"} hint={daily.isNegative ? "Свободные деньги ушли в минус" : `На ${daily.daysLeft} дн. до конца месяца`} delay={0.46} />
      </div>

      <Card className="mt-8">
        <SectionHeader title="А что если?" action={<span className={`rounded-full px-3 py-1 text-xs font-semibold ${stress.isRisky ? "bg-rose-400/10 text-rose-200" : "bg-emerald-400/10 text-emerald-200"}`}>{stress.isRisky ? "Риск покупки" : "Покупка допустима"}</span>} />
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-stretch">
          <div className="rounded-[28px] border border-white/10 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Сумма покупки</p>
            <input
              className="premium-input mt-3 w-full rounded-[24px] px-5 py-5 text-3xl font-semibold text-ink outline-none placeholder:text-muted focus:border-blue-300/50 sm:text-4xl"
              type="number"
              min="0"
              value={stressAmount}
              onChange={(e) => setStressAmount(e.target.value)}
              placeholder="0 ₽"
            />
            <p className="mt-3 text-sm leading-6 text-muted">Покажем, как покупка изменит дневной лимит, прогноз месяца и цели.</p>
          </div>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={stressAmount || "empty-stress"}
              className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -6 }}
              transition={{ duration: reduced ? 0.1 : 0.22, ease: "easeOut" }}
            >
              <StressMetric label="Новый дневной лимит" value={formatCurrency(stress.newDailyLimit)} />
              <StressMetric label="Прогноз конца месяца" value={formatCurrency(stress.newForecast)} />
              <StressMetric label="Влияние на цели" value={`${stress.goalImpactPercent}%`} />
              <StressMetric label="Риск покупки" value={stress.isRisky ? "Высокий" : "Низкий"} tone={stress.isRisky ? "text-rose-300" : "text-emerald-300"} />
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <SectionHeader title="Прогноз денег" />
          <p className="text-3xl font-bold text-ink"><AnimatedNumber value={Math.floor(forecast.forecast)} /></p>
          <p className="mt-2 text-sm text-muted">Если продолжишь тратить в таком темпе, в конце месяца останется {formatCurrency(Math.floor(forecast.forecast))}.</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-3xl bg-slate-50 p-3"><p className="text-xs text-muted">Сегодня</p><p className="font-semibold"><AnimatedNumber value={balance} /></p></div>
            <div className="rounded-3xl bg-slate-50 p-3"><p className="text-xs text-muted">Через 7 дней</p><p className="font-semibold"><AnimatedNumber value={Math.floor(balance - forecast.averageDailyExpense * 7)} /></p></div>
            <div className="rounded-3xl bg-slate-50 p-3"><p className="text-xs text-muted">Конец месяца</p><p className="font-semibold"><AnimatedNumber value={Math.floor(forecast.forecast)} /></p></div>
          </div>
          <div className="mt-5 space-y-2">
            {nearestPayments.map((payment) => <div key={payment.id} className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"><span>{payment.title}</span><strong><AnimatedNumber value={payment.amount} /></strong></div>)}
          </div>
        </Card>
        <Card>
          <SectionHeader title="Баланс по счетам" />
          <div className="space-y-3">
            {accountBalances.map((account) => <div key={account.id} className="flex items-center justify-between rounded-3xl bg-slate-50 p-4"><div className="flex items-center gap-3"><span className="h-4 w-4 rounded-full" style={{ backgroundColor: account.color }} /><div><p className="font-semibold">{account.name}</p><p className="text-sm text-muted">{account.type}</p></div></div><p className="font-semibold"><AnimatedNumber value={account.currentBalance} /></p></div>)}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <SectionHeader title="Куда уходят деньги" />
          {expensesByCategory.length ? (
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expensesByCategory} dataKey="value" nameKey="name" innerRadius={64} outerRadius={112} paddingAngle={4} isAnimationActive animationBegin={80} animationDuration={650}>
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
                <p className="text-sm text-muted"><AnimatedNumber value={budget.spent} /> из {formatCurrency(budget.monthlyLimit)}</p>
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
          return <div key={goal.id} className="rounded-3xl bg-slate-50 p-4"><div className="mb-3 flex items-center justify-between"><p className="font-bold">{goal.title}</p><p className="text-sm font-semibold text-blue-300">{percent}%</p></div><ProgressBar value={percent} /><p className="mt-2 text-sm text-muted"><AnimatedNumber value={goal.currentAmount} /> из {formatCurrency(goal.targetAmount)}</p></div>;
        })}</div> : <EmptyState title="Целей нет" text="Создай первую цель накоплений." />}
      </Card>
    </div>
  );
};

const HeroMetric = ({ label, value, text, tone = "text-ink", delay = 0 }: { label: string; value?: number; text?: string; tone?: string; delay?: number }) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="rounded-[28px] border border-white/10 bg-white/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.1 : 0.28, delay: reduced ? 0 : delay, ease: "easeOut" }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-3 text-2xl font-semibold leading-tight ${tone}`}>{typeof value === "number" ? <AnimatedNumber value={value} /> : text}</p>
    </motion.div>
  );
};

const StressMetric = ({ label, value, tone = "text-ink" }: { label: string; value: string; tone?: string }) => (
  <div className="rounded-[24px] border border-white/10 bg-slate-50 p-4">
    <p className="text-xs text-muted">{label}</p>
    <p className={`mt-2 text-lg font-semibold ${tone}`}>{value}</p>
  </div>
);
