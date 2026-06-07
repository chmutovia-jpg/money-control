import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import type { PageKey } from "../App";
import { Card, SectionHeader } from "../components/Card";
import type { Transaction } from "../types";
import { formatCurrency, formatDate } from "../utils/format";

export const OperationsPage = ({ transactions, setActivePage }: { transactions: Transaction[]; setActivePage: (page: PageKey) => void }) => {
  const latest = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);

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
        <SectionHeader title="Последние операции" />
        <div className="space-y-3">
          {latest.map((item) => <div key={item.id} className="flex items-center justify-between rounded-3xl bg-slate-50 p-4"><div><p className="font-semibold">{item.category}</p><p className="text-sm text-muted">{formatDate(item.date)}</p></div><p className={item.type === "income" ? "font-bold text-emerald-300" : "font-bold text-rose-300"}>{item.type === "income" ? "+" : "-"}{formatCurrency(item.amount)}</p></div>)}
        </div>
      </Card>
    </div>
  );
};
