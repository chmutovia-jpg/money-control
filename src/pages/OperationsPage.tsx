import { ArrowDownCircle, ArrowUpCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { PageKey } from "../App";
import { Card, EmptyState, SectionHeader } from "../components/Card";
import { inputClass } from "../components/FormControls";
import type { Transaction } from "../types";
import { formatCurrency, formatDate, monthKey, todayISO } from "../utils/format";

const startOfWeek = () => {
  const date = new Date(todayISO());
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
};

const groupLabel = (date: string) => {
  const today = todayISO();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = yesterday.toISOString().slice(0, 10);
  if (date === today) return "Сегодня";
  if (date === yesterdayISO) return "Вчера";
  if (date >= startOfWeek()) return "Эта неделя";
  return new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(new Date(date));
};

export const OperationsPage = ({ transactions, setActivePage }: { transactions: Transaction[]; setActivePage: (page: PageKey) => void }) => {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense" | "recurring">("all");
  const [dateFilter, setDateFilter] = useState<"month" | "week" | "custom">("month");
  const [from, setFrom] = useState(todayISO().slice(0, 8) + "01");
  const [to, setTo] = useState(todayISO());
  const [sort, setSort] = useState<"new" | "old" | "amount">("new");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...transactions]
      .filter((item) => {
        if (typeFilter === "income" && item.type !== "income") return false;
        if (typeFilter === "expense" && item.type !== "expense") return false;
        if (typeFilter === "recurring" && !item.isRecurring) return false;
        if (dateFilter === "month" && monthKey(item.date) !== todayISO().slice(0, 7)) return false;
        if (dateFilter === "week" && item.date < startOfWeek()) return false;
        if (dateFilter === "custom" && (item.date < from || item.date > to)) return false;
        if (q && !`${item.category} ${item.comment ?? ""}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === "old") return a.date.localeCompare(b.date);
        if (sort === "amount") return b.amount - a.amount;
        return b.date.localeCompare(a.date);
      });
  }, [dateFilter, from, query, sort, to, transactions, typeFilter]);

  const groups = filtered.reduce<Record<string, Transaction[]>>((acc, item) => {
    const label = groupLabel(item.date);
    acc[label] = [...(acc[label] ?? []), item];
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">Быстрый доступ</p>
        <h1 className="mt-1 text-3xl font-bold text-ink">Операции</h1>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3">
        <button className="glass-panel rounded-5xl p-5 text-left" type="button" onClick={() => setActivePage("expenses")}><ArrowDownCircle className="mb-3 text-rose-300" /><p className="font-bold">Расходы</p><p className="text-sm text-muted">Добавить и редактировать</p></button>
        <button className="glass-panel rounded-5xl p-5 text-left" type="button" onClick={() => setActivePage("income")}><ArrowUpCircle className="mb-3 text-emerald-300" /><p className="font-bold">Доходы</p><p className="text-sm text-muted">Источники денег</p></button>
      </div>
      <Card>
        <SectionHeader title="Фильтры" action={<Search size={20} className="text-muted" />} />
        <div className="grid gap-3 md:grid-cols-4">
          <input className={inputClass} placeholder="Поиск" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className={inputClass} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}><option value="all">все</option><option value="income">доходы</option><option value="expense">расходы</option><option value="recurring">повторы</option></select>
          <select className={inputClass} value={dateFilter} onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}><option value="month">месяц</option><option value="week">неделя</option><option value="custom">свой период</option></select>
          <select className={inputClass} value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}><option value="new">новые</option><option value="old">старые</option><option value="amount">самые дорогие</option></select>
        </div>
        {dateFilter === "custom" ? <div className="mt-3 grid gap-3 sm:grid-cols-2"><input className={inputClass} type="date" value={from} onChange={(e) => setFrom(e.target.value)} /><input className={inputClass} type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div> : null}
      </Card>
      <Card className="mt-5">
        <SectionHeader title={`Найдено: ${filtered.length}`} />
        {filtered.length ? <div className="space-y-5">{Object.entries(groups).map(([label, items]) => (
          <div key={label}>
            <p className="mb-2 text-sm font-bold text-muted">{label}</p>
            <div className="space-y-2">{items.map((item) => <div key={item.id} className="flex items-center justify-between rounded-3xl bg-slate-50 p-4"><div><p className="font-semibold">{item.category}</p><p className="text-sm text-muted">{formatDate(item.date)}{item.comment ? ` • ${item.comment}` : ""}</p></div><p className={item.type === "income" ? "font-bold text-emerald-300" : "font-bold text-rose-300"}>{item.type === "income" ? "+" : "-"}{formatCurrency(item.amount)}</p></div>)}</div>
          </div>
        ))}</div> : <EmptyState title="Ничего не найдено" text="Попробуй изменить фильтры или поиск." />}
      </Card>
    </div>
  );
};
