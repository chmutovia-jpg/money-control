import { Edit3, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Card, EmptyState, SectionHeader } from "../components/Card";
import { Field, buttonClass, ghostButtonClass, inputClass } from "../components/FormControls";
import { ProgressBar } from "../components/ProgressBar";
import type { CategoryBudget, Transaction } from "../types";
import { currentMonth, getBudgetProgress } from "../utils/calculations";
import { formatCurrency } from "../utils/format";

const categories = ["еда", "транспорт", "жильё", "развлечения", "здоровье", "одежда", "подписки", "другое"];
const blank = { category: "еда", monthlyLimit: "" };

export const BudgetsPage = ({
  budgets,
  transactions,
  onAdd,
  onUpdate,
  onDelete,
}: {
  budgets: CategoryBudget[];
  transactions: Transaction[];
  onAdd: (budget: Omit<CategoryBudget, "id">) => void;
  onUpdate: (budget: CategoryBudget) => void;
  onDelete: (id: string) => void;
}) => {
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const progress = getBudgetProgress(budgets, transactions, currentMonth());

  const reset = () => {
    setForm(blank);
    setEditingId(null);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = { category: form.category, monthlyLimit: Number(form.monthlyLimit) };
    if (!payload.monthlyLimit || payload.monthlyLimit <= 0) return;
    if (editingId) onUpdate({ ...payload, id: editingId });
    else onAdd(payload);
    reset();
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">Контроль лимитов</p>
        <h1 className="mt-1 text-3xl font-bold text-ink">Бюджеты</h1>
      </div>
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card>
          <SectionHeader title={editingId ? "Редактировать лимит" : "Добавить лимит"} />
          <form className="space-y-4" onSubmit={submit}>
            <Field label="Категория">
              <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </Field>
            <Field label="Лимит в месяц">
              <input className={inputClass} type="number" min="0" value={form.monthlyLimit} onChange={(e) => setForm({ ...form, monthlyLimit: e.target.value })} placeholder="30 000" required />
            </Field>
            <div className="flex gap-2">
              <button className={buttonClass} type="submit"><Plus size={18} />{editingId ? "Сохранить" : "Добавить"}</button>
              {editingId ? <button className={ghostButtonClass} type="button" onClick={reset}><X size={18} />Отмена</button> : null}
            </div>
          </form>
        </Card>

        <Card>
          <SectionHeader title={`Лимиты: ${budgets.length}`} />
          {progress.length ? <div className="grid gap-4 xl:grid-cols-2">{progress.map((budget) => (
            <div key={budget.id} className={`rounded-3xl border p-4 ${budget.status === "over" ? "border-rose-300/30 bg-rose-400/10" : budget.status === "warning" ? "border-amber-300/30 bg-amber-400/10" : "border-white/10 bg-slate-50"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-ink">{budget.category}</p>
                  <p className="mt-1 text-sm text-muted">{formatCurrency(budget.spent)} из {formatCurrency(budget.monthlyLimit)}</p>
                </div>
                <div className="flex gap-2">
                  <button className={ghostButtonClass} type="button" onClick={() => { setEditingId(budget.id); setForm({ category: budget.category, monthlyLimit: String(budget.monthlyLimit) }); }}><Edit3 size={17} /></button>
                  <button className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600" type="button" onClick={() => onDelete(budget.id)}><Trash2 size={17} /></button>
                </div>
              </div>
              <div className="mt-4">
                <ProgressBar value={Math.min(100, budget.percent)} tone={budget.status === "over" ? "bg-rose-500" : budget.status === "warning" ? "bg-amber-400" : "bg-blue-500"} />
                <p className={`mt-2 text-sm font-semibold ${budget.status === "over" ? "text-rose-300" : budget.status === "warning" ? "text-amber-200" : "text-muted"}`}>
                  {budget.status === "over" ? `Лимит превышен на ${formatCurrency(Math.abs(budget.left))}` : budget.status === "warning" ? `Использовано ${budget.percent}%, пора притормозить` : `Осталось ${formatCurrency(budget.left)}`}
                </p>
              </div>
            </div>
          ))}</div> : <EmptyState title="Бюджетов пока нет" text="Добавь месячный лимит для категории расходов." />}
        </Card>
      </div>
    </div>
  );
};
