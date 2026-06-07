import { Edit3, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Card, EmptyState, SectionHeader } from "../components/Card";
import { Field, buttonClass, ghostButtonClass, inputClass } from "../components/FormControls";
import { ProgressBar } from "../components/ProgressBar";
import type { SavingGoal } from "../types";
import { formatCurrency, formatDate } from "../utils/format";

const blank = { title: "", targetAmount: "", currentAmount: "", deadline: "" };

export const GoalsPage = ({ goals, onAdd, onUpdate, onDelete }: {
  goals: SavingGoal[];
  onAdd: (goal: Omit<SavingGoal, "id">) => void;
  onUpdate: (goal: SavingGoal) => void;
  onDelete: (id: string) => void;
}) => {
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [topUp, setTopUp] = useState<Record<string, string>>({});
  const reset = () => { setForm(blank); setEditingId(null); };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = { title: form.title, targetAmount: Number(form.targetAmount), currentAmount: Number(form.currentAmount), deadline: form.deadline || undefined };
    if (!payload.title.trim() || payload.targetAmount <= 0) return;
    if (editingId) onUpdate({ ...payload, id: editingId });
    else onAdd(payload);
    reset();
  };

  return (
    <div>
      <div className="mb-6"><p className="text-sm font-semibold uppercase tracking-wide text-muted">Накопления</p><h1 className="mt-1 text-3xl font-bold text-ink">Цели</h1></div>
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card>
          <SectionHeader title={editingId ? "Редактировать" : "Добавить цель"} />
          <form className="space-y-4" onSubmit={submit}>
            <Field label="Название"><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ноутбук" required /></Field>
            <Field label="Нужная сумма"><input className={inputClass} type="number" min="0" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} required /></Field>
            <Field label="Уже накоплено"><input className={inputClass} type="number" min="0" value={form.currentAmount} onChange={(e) => setForm({ ...form, currentAmount: e.target.value })} /></Field>
            <Field label="Дедлайн"><input className={inputClass} type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></Field>
            <div className="flex gap-2"><button className={buttonClass} type="submit"><Plus size={18} />{editingId ? "Сохранить" : "Добавить"}</button>{editingId ? <button className={ghostButtonClass} type="button" onClick={reset}><X size={18} />Отмена</button> : null}</div>
          </form>
        </Card>
        <Card>
          <SectionHeader title={`Цели: ${goals.length}`} />
          {goals.length ? <div className="grid gap-4 xl:grid-cols-2">{goals.map((goal) => {
            const percent = goal.targetAmount ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
            return <div key={goal.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3"><div><p className="font-bold text-ink">{goal.title}</p>{goal.deadline ? <p className="mt-1 text-sm text-muted">до {formatDate(goal.deadline)}</p> : null}</div><button className="rounded-2xl bg-rose-50 p-3 text-rose-600" type="button" onClick={() => onDelete(goal.id)}><Trash2 size={17} /></button></div>
              <p className="mt-4 text-2xl font-bold text-blue-300">{formatCurrency(goal.currentAmount)} <span className="text-sm font-semibold text-muted">из {formatCurrency(goal.targetAmount)}</span></p>
              <div className="mt-3"><ProgressBar value={percent} /><p className="mt-2 text-sm font-semibold text-muted">{percent}% выполнено</p></div>
              <div className="mt-4 flex gap-2"><input className={inputClass} type="number" min="0" placeholder="Пополнить" value={topUp[goal.id] ?? ""} onChange={(e) => setTopUp({ ...topUp, [goal.id]: e.target.value })} /><button className={buttonClass} type="button" onClick={() => { const amount = Number(topUp[goal.id]); if (amount > 0) { onUpdate({ ...goal, currentAmount: goal.currentAmount + amount }); setTopUp({ ...topUp, [goal.id]: "" }); } }}>+</button></div>
              <button className={`${ghostButtonClass} mt-3 w-full`} type="button" onClick={() => { setEditingId(goal.id); setForm({ title: goal.title, targetAmount: String(goal.targetAmount), currentAmount: String(goal.currentAmount), deadline: goal.deadline ?? "" }); }}><Edit3 size={17} />Редактировать</button>
            </div>;
          })}</div> : <EmptyState title="Целей пока нет" text="Создай цель, чтобы отслеживать накопления и прогресс." />}
        </Card>
      </div>
    </div>
  );
};
