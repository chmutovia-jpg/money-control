import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, EmptyState, SectionHeader } from "../components/Card";
import type { FinanceState } from "../types";
import { currentMonth, getExpensesByCategory, getInsights, getMonthlySeries } from "../utils/calculations";
import { formatCurrency } from "../utils/format";

const colors = ["#60a5fa", "#34d399", "#fb7185", "#a5b4fc", "#2dd4bf", "#fbbf24", "#94a3b8"];

export const AnalyticsPage = ({ state }: { state: FinanceState }) => {
  const categories = getExpensesByCategory(state.transactions, currentMonth());
  const monthly = getMonthlySeries(state.transactions);
  const insights = getInsights(state);
  const top = categories.slice(0, 5);

  return (
    <div>
      <div className="mb-6"><p className="text-sm font-semibold uppercase tracking-wide text-muted">Финансовая картина</p><h1 className="mt-1 text-3xl font-bold text-ink">Аналитика</h1></div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <SectionHeader title="Расходы по категориям" />
          {categories.length ? <div className="h-64 sm:h-80"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categories} dataKey="value" nameKey="name" innerRadius={48} outerRadius={96} paddingAngle={4}>{categories.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}</Pie><Tooltip formatter={(value) => formatCurrency(Number(value))} /></PieChart></ResponsiveContainer></div> : <EmptyState title="Нет данных" text="Добавь расходы для круговой диаграммы." />}
        </Card>
        <Card>
          <SectionHeader title="Доходы и расходы по месяцам" />
          {monthly.length ? <div className="h-64 sm:h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthly}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.16)" /><XAxis dataKey="month" /><YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000)}к`} /><Tooltip formatter={(value) => formatCurrency(Number(value))} /><Bar dataKey="доходы" fill="#34d399" radius={[10, 10, 0, 0]} /><Bar dataKey="расходы" fill="#fb7185" radius={[10, 10, 0, 0]} /></BarChart></ResponsiveContainer></div> : <EmptyState title="Нет данных" text="История появится после первых операций." />}
        </Card>
      </div>
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
