import { CheckCircle2, Edit3, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Card, EmptyState, SectionHeader } from "../components/Card";
import { Field, buttonClass, ghostButtonClass, inputClass } from "../components/FormControls";
import type { Debt } from "../types";
import { formatCurrency, formatDate, todayISO } from "../utils/format";

type DebtForm = {
  type: Debt["type"];
  person: string;
  amount: string;
  date: string;
  deadline: string;
  isClosed: boolean;
};

const blank: DebtForm = { type: "i_owe", person: "", amount: "", date: todayISO(), deadline: "", isClosed: false };

export const DebtsPage = ({ debts, onAdd, onUpdate, onDelete }: {
  debts: Debt[];
  onAdd: (debt: Omit<Debt, "id">) => void;
  onUpdate: (debt: Debt) => void;
  onDelete: (id: string) => void;
}) => {
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const reset = () => { setForm(blank); setEditingId(null); };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = { ...form, amount: Number(form.amount), deadline: form.deadline || undefined };
    if (!payload.person.trim() || payload.amount <= 0) return;
    if (editingId) onUpdate({ ...payload, id: editingId });
    else onAdd(payload);
    reset();
  };

  return (
    <div>
      <div className="mb-6"><p className="text-sm font-semibold uppercase tracking-wide text-muted">Обязательства</p><h1 className="mt-1 text-3xl font-bold text-ink">Долги</h1></div>
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card>
          <SectionHeader title={editingId ? "Редактировать" : "Добавить долг"} />
          <form className="space-y-4" onSubmit={submit}>
            <Field label="Тип"><select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Debt["type"] })}><option value="i_owe">я должен</option><option value="owed_to_me">мне должны</option></select></Field>
            <Field label="Кому или от кого"><input className={inputClass} value={form.person} onChange={(e) => setForm({ ...form, person: e.target.value })} required /></Field>
            <Field label="Сумма"><input className={inputClass} type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></Field>
            <Field label="Дата"><input className={inputClass} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></Field>
            <Field label="Дедлайн"><input className={inputClass} type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></Field>
            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-ink"><input type="checkbox" checked={form.isClosed} onChange={(e) => setForm({ ...form, isClosed: e.target.checked })} /> Закрыт</label>
            <div className="flex gap-2"><button className={buttonClass} type="submit"><Plus size={18} />{editingId ? "Сохранить" : "Добавить"}</button>{editingId ? <button className={ghostButtonClass} type="button" onClick={reset}><X size={18} />Отмена</button> : null}</div>
          </form>
        </Card>
        <Card>
          <SectionHeader title={`Долги: ${debts.length}`} />
          {debts.length ? <div className="space-y-3">{debts.map((debt) => (
            <div key={debt.id} className={`rounded-3xl border p-4 ${debt.isClosed ? "border-emerald-100 bg-emerald-50" : "border-slate-100 bg-slate-50"}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${debt.type === "i_owe" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>{debt.type === "i_owe" ? "я должен" : "мне должны"}</span><p className="mt-2 font-bold text-ink">{debt.person}</p><p className="mt-1 text-xl font-bold">{formatCurrency(debt.amount)}</p><p className="mt-1 text-sm text-muted">{formatDate(debt.date)}{debt.deadline ? ` • до ${formatDate(debt.deadline)}` : ""}</p></div>
                <div className="flex flex-wrap gap-2"><button className={ghostButtonClass} type="button" onClick={() => onUpdate({ ...debt, isClosed: true })}><CheckCircle2 size={17} />Погашен</button><button className={ghostButtonClass} type="button" onClick={() => { setEditingId(debt.id); setForm({ ...debt, amount: String(debt.amount), deadline: debt.deadline ?? "" }); }}><Edit3 size={17} />Изм.</button><button className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600" type="button" onClick={() => onDelete(debt.id)}><Trash2 size={17} /></button></div>
              </div>
            </div>
          ))}</div> : <EmptyState title="Долгов нет" text="Добавь долг или сумму, которую должны вернуть тебе." />}
        </Card>
      </div>
    </div>
  );
};
