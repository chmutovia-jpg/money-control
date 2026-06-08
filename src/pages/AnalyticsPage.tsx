import { useRef } from "react";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, EmptyState, SectionHeader } from "../components/Card";
import { ghostButtonClass } from "../components/FormControls";
import type { FinanceState } from "../types";
import { currentMonth, getExpensesByCategory, getGoalsProgress, getInsights, getMonthlySeries, getMonthlySubscriptionsTotal, getTotalByType } from "../utils/calculations";
import { formatCurrency, monthKey } from "../utils/format";

const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)", "#94a3b8"];

export const AnalyticsPage = ({ state }: { state: FinanceState }) => {
  const wrappedRef = useRef<HTMLDivElement>(null);
  const categories = getExpensesByCategory(state.transactions, currentMonth());
  const monthly = getMonthlySeries(state.transactions);
  const insights = getInsights(state);
  const top = categories.slice(0, 5);
  const month = currentMonth();
  const monthTransactions = state.transactions.filter((item) => monthKey(item.date) === month);
  const income = getTotalByType(state.transactions, "income", month);
  const expenses = getTotalByType(state.transactions, "expense", month);
  const saved = income - expenses;
  const biggestCategory = categories[0];
  const biggestPurchase = monthTransactions.filter((item) => item.type === "expense").sort((a, b) => b.amount - a.amount)[0];
  const daysPassed = new Date().getDate();
  const averageDailyExpense = expenses / Math.max(1, daysPassed);
  const subscriptions = getMonthlySubscriptionsTotal(state.subscriptions);
  const goals = getGoalsProgress(state.goals);
  const previousMonthDate = new Date(`${month}-01`);
  previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
  const previousMonth = previousMonthDate.toISOString().slice(0, 7);
  const previousIncome = getTotalByType(state.transactions, "income", previousMonth);
  const previousExpenses = getTotalByType(state.transactions, "expense", previousMonth);
  const previousCategories = getExpensesByCategory(state.transactions, previousMonth);
  const categoryChanges = categories
    .map((category) => ({ ...category, previous: previousCategories.find((item) => item.name === category.name)?.value ?? 0 }))
    .map((category) => ({ name: category.name, diff: category.value - category.previous }))
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
  const comparisonInsights = [
    expenses > previousExpenses ? `Расходы выше прошлого месяца на ${formatCurrency(expenses - previousExpenses)}.` : `Расходы ниже прошлого месяца на ${formatCurrency(previousExpenses - expenses)}.`,
    income > previousIncome ? `Доходы выросли на ${formatCurrency(income - previousIncome)}.` : `Доходы снизились на ${formatCurrency(previousIncome - income)}.`,
    categoryChanges[0] ? `Самое заметное изменение: ${categoryChanges[0].name}, ${categoryChanges[0].diff > 0 ? "рост" : "снижение"} ${formatCurrency(Math.abs(categoryChanges[0].diff))}.` : "Пока недостаточно категорий для сравнения.",
  ];
  const monthTips = [
    biggestCategory ? `Поставь лимит на категорию “${biggestCategory.name}” на 10-15% ниже текущих расходов.` : "Добавь первые расходы, чтобы советы стали точнее.",
    subscriptions > 0 ? `Проверь подписки: сейчас они занимают ${Math.round((subscriptions / Math.max(1, expenses)) * 100)}% расходов месяца.` : "Добавь подписки, чтобы видеть их влияние на бюджет.",
    saved > 0 ? `Переведи часть экономии в цель сразу после дохода, пока деньги не растворились в расходах.` : "В следующем месяце начни с дневного лимита и отслеживай крупные траты.",
  ];

  const saveWrappedImage = async () => {
    if (!wrappedRef.current) return;
    const dataUrl = await toPng(wrappedRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      width: wrappedRef.current.offsetWidth,
      height: wrappedRef.current.offsetHeight,
      backgroundColor: "#050816",
    });
    const link = document.createElement("a");
    link.download = `money-control-month-wrapped-${month}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div>
      <div className="mb-6"><p className="text-sm font-semibold uppercase tracking-wide text-muted">Финансовая картина</p><h1 className="mt-1 text-3xl font-bold text-ink">Аналитика</h1></div>
      <Card className="mb-5">
        <SectionHeader title="Итоги месяца" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Потрачено" value={formatCurrency(expenses)} tone="text-rose-300" />
          <Metric label="Заработано" value={formatCurrency(income)} tone="text-emerald-300" />
          <Metric label="Сэкономлено" value={formatCurrency(saved)} tone={saved >= 0 ? "text-blue-300" : "text-rose-300"} />
          <Metric label="Подписки" value={formatCurrency(subscriptions)} tone="text-violet-300" />
          <Metric label="Дорогая категория" value={biggestCategory?.name ?? "нет данных"} />
          <Metric label="Большая покупка" value={biggestPurchase ? formatCurrency(biggestPurchase.amount) : "нет данных"} />
          <Metric label="Средний расход в день" value={formatCurrency(Math.round(averageDailyExpense))} />
          <Metric label="Операций" value={String(monthTransactions.length)} />
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {monthTips.map((tip) => <div key={tip} className="rounded-3xl border border-white/10 bg-slate-50 p-4 text-sm font-medium text-ink">{tip}</div>)}
        </div>
      </Card>
      <Card className="mb-5 overflow-hidden">
        <SectionHeader title="Month Wrapped" action={<button className={ghostButtonClass} type="button" onClick={saveWrappedImage}><Download size={18} />Сохранить как изображение</button>} />
        <div ref={wrappedRef} className="mx-auto aspect-[4/5] w-full max-w-[540px] rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(96,165,250,0.28),transparent_34%),radial-gradient(circle_at_90%_10%,rgba(139,92,246,0.22),transparent_32%),linear-gradient(145deg,#050816,#111827)] p-6 text-ink shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">Month Wrapped</p>
          <h2 className="mt-2 text-3xl font-bold text-ink">Итоги месяца</h2>
          <p className="mt-2 text-sm text-muted">Карточка месяца для будущего сохранения как изображение.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Metric label="Доходы" value={formatCurrency(income)} tone="text-emerald-300" />
            <Metric label="Расходы" value={formatCurrency(expenses)} tone="text-rose-300" />
            <Metric label="Сэкономлено" value={formatCurrency(saved)} tone={saved >= 0 ? "text-blue-300" : "text-rose-300"} />
            <Metric label="Подписки" value={formatCurrency(subscriptions)} tone="text-violet-300" />
            <Metric label="Топ-категория" value={biggestCategory?.name ?? "нет данных"} />
            <Metric label="Крупная покупка" value={biggestPurchase ? formatCurrency(biggestPurchase.amount) : "нет данных"} />
            <Metric label="Цели" value={`${goals.percent}%`} tone="text-emerald-300" />
            <Metric label="Совет" value={monthTips[0]} />
          </div>
        </div>
      </Card>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <SectionHeader title="Расходы по категориям" />
          {categories.length ? <div className="h-64 sm:h-80"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categories} dataKey="value" nameKey="name" innerRadius={48} outerRadius={96} paddingAngle={4} isAnimationActive animationBegin={80} animationDuration={650}>{categories.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}</Pie><Tooltip formatter={(value) => formatCurrency(Number(value))} /></PieChart></ResponsiveContainer></div> : <EmptyState title="Нет данных" text="Добавь расходы для круговой диаграммы." />}
        </Card>
        <Card>
          <SectionHeader title="Доходы и расходы по месяцам" />
          {monthly.length ? <div className="h-64 sm:h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthly}><defs><linearGradient id="incomeGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--success)" stopOpacity={0.95} /><stop offset="100%" stopColor="var(--success)" stopOpacity={0.42} /></linearGradient><linearGradient id="expenseGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--danger)" stopOpacity={0.95} /><stop offset="100%" stopColor="var(--danger)" stopOpacity={0.42} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.16)" /><XAxis dataKey="month" /><YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000)}к`} /><Tooltip formatter={(value) => formatCurrency(Number(value))} /><Bar dataKey="доходы" fill="url(#incomeGradient)" radius={[12, 12, 4, 4]} isAnimationActive animationBegin={60} animationDuration={650} /><Bar dataKey="расходы" fill="url(#expenseGradient)" radius={[12, 12, 4, 4]} isAnimationActive animationBegin={120} animationDuration={650} /></BarChart></ResponsiveContainer></div> : <EmptyState title="Нет данных" text="Добавь операции, и здесь появится динамика доходов и расходов." />}
        </Card>
      </div>
      <Card className="mt-5">
        <SectionHeader title="Сравнение с прошлым месяцем" />
        <div className="grid gap-3 md:grid-cols-3">
          <Metric label="Расходы vs прошлый месяц" value={`${expenses >= previousExpenses ? "+" : "-"}${formatCurrency(Math.abs(expenses - previousExpenses))}`} tone={expenses > previousExpenses ? "text-rose-300" : "text-emerald-300"} />
          <Metric label="Доходы vs прошлый месяц" value={`${income >= previousIncome ? "+" : "-"}${formatCurrency(Math.abs(income - previousIncome))}`} tone={income >= previousIncome ? "text-emerald-300" : "text-rose-300"} />
          <Metric label="Средний расход в день" value={formatCurrency(Math.round(averageDailyExpense))} />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="font-bold text-ink">Самый большой рост</p>
            {categoryChanges.filter((item) => item.diff > 0).slice(0, 3).map((item) => <p key={item.name} className="mt-2 text-sm text-muted">{item.name}: +{formatCurrency(item.diff)}</p>)}
          </div>
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="font-bold text-ink">Самое большое снижение</p>
            {categoryChanges.filter((item) => item.diff < 0).slice(0, 3).map((item) => <p key={item.name} className="mt-2 text-sm text-muted">{item.name}: -{formatCurrency(Math.abs(item.diff))}</p>)}
          </div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">{comparisonInsights.map((text) => <div key={text} className="rounded-3xl border border-white/10 bg-white/10 p-4 text-sm font-medium text-ink">{text}</div>)}</div>
      </Card>
      <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <SectionHeader title="Топ-5 категорий" />
          {top.length ? <div className="space-y-3">{top.map((item, index) => (
            <div key={item.name} className="rounded-3xl bg-slate-50 p-4">
              <div className="flex items-center justify-between"><p className="font-semibold text-ink">{index + 1}. {item.name}</p><p className="font-bold text-rose-600">{formatCurrency(item.value)}</p></div>
              <div className="mt-3 h-2 rounded-full bg-slate-200"><div className="h-full rounded-full bg-blue-500" style={{ width: `${(item.value / top[0].value) * 100}%` }} /></div>
            </div>
          ))}</div> : <EmptyState title="Топ пуст" text="Категории появятся после добавления расходов." />}
        </Card>
        <Card>
          <SectionHeader title="Инсайты" />
          <div className="space-y-3">{insights.map((insight) => <div key={insight} className="rounded-3xl border border-white/10 bg-white/10 p-4 text-sm font-medium text-ink shadow-card">{insight}</div>)}</div>
        </Card>
      </div>
    </div>
  );
};

const Metric = ({ label, value, tone = "text-ink" }: { label: string; value: string; tone?: string }) => (
  <div className="rounded-3xl bg-slate-50 p-4">
    <p className="text-xs text-muted">{label}</p>
    <p className={`mt-2 break-words text-xl font-bold ${tone}`}>{value}</p>
  </div>
);
