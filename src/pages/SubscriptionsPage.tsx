import { AlertCircle, Edit3, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Card, EmptyState, SectionHeader } from "../components/Card";
import { Field, buttonClass, ghostButtonClass, inputClass } from "../components/FormControls";
import type { Subscription } from "../types";
import { getMonthlySubscriptionsTotal, getUpcomingSubscriptions, monthlySubscriptionAmount } from "../utils/calculations";
import { formatCurrency, formatDate, todayISO } from "../utils/format";

type SubscriptionForm = {
  name: string;
  amount: string;
  period: Subscription["period"];
  nextPaymentDate: string;
  category: string;
  isActive: boolean;
  usageStatus: Subscription["usageStatus"];
};

const blank: SubscriptionForm = { name: "", amount: "", period: "monthly", nextPaymentDate: todayISO(), category: "развлечения", isActive: true, usageStatus: "using" };

export const SubscriptionsPage = ({ subscriptions, onAdd, onUpdate, onDelete }: {
  subscriptions: Subscription[];
  onAdd: (subscription: Omit<Subscription, "id">) => void;
  onUpdate: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
}) => {
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const upcoming = getUpcomingSubscriptions(subscriptions);
  const monthlyTotal = getMonthlySubscriptionsTotal(subscriptions);
  const yearlyTotal = monthlyTotal * 12;
  const cancelSavings = subscriptions
    .filter((item) => item.isActive && item.usageStatus === "can_cancel")
    .reduce((total, item) => total + monthlySubscriptionAmount(item) * 12, 0);

  const reset = () => { setForm(blank); setEditingId(null); };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = { ...form, amount: Number(form.amount) };
    if (!payload.name.trim() || payload.amount <= 0) return;
    if (editingId) onUpdate({ ...payload, id: editingId });
    else onAdd(payload);
    reset();
  };

  return (
    <div>
      <div className="mb-6"><p className="text-sm font-semibold uppercase tracking-wide text-muted">Регулярные платежи</p><h1 className="mt-1 text-3xl font-bold text-ink">Подписки</h1></div>
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card>
          <SectionHeader title={editingId ? "Редактировать" : "Добавить подписку"} />
          <form className="space-y-4" onSubmit={submit}>
            <Field label="Название"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
            <Field label="Стоимость"><input className={inputClass} type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></Field>
            <Field label="Периодичность"><select className={inputClass} value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value as Subscription["period"] })}><option value="monthly">ежемесячно</option><option value="yearly">ежегодно</option></select></Field>
            <Field label="Следующее списание"><input className={inputClass} type="date" value={form.nextPaymentDate} onChange={(e) => setForm({ ...form, nextPaymentDate: e.target.value })} required /></Field>
            <Field label="Категория"><input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
            <Field label="Использование"><select className={inputClass} value={form.usageStatus} onChange={(e) => setForm({ ...form, usageStatus: e.target.value as Subscription["usageStatus"] })}><option value="using">использую</option><option value="rarely">редко использую</option><option value="can_cancel">можно отключить</option></select></Field>
            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-ink"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Активна</label>
            <div className="flex gap-2"><button className={buttonClass} type="submit"><Plus size={18} />{editingId ? "Сохранить" : "Добавить"}</button>{editingId ? <button className={ghostButtonClass} type="button" onClick={reset}><X size={18} />Отмена</button> : null}</div>
          </form>
        </Card>
        <div className="space-y-5">
          <Card className="bg-gradient-to-br from-slate-800/70 via-slate-900/80 to-blue-950/70 text-white">
            <p className="text-sm text-white/80">Подписок в месяц</p>
            <p className="mt-2 text-4xl font-bold">{formatCurrency(monthlyTotal)}</p>
            <p className="mt-2 text-sm text-white/80">В год: {formatCurrency(yearlyTotal)}</p>
            {cancelSavings > 0 ? <p className="mt-3 rounded-2xl bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">Если отключить подписки “можно отключить”, ты сэкономишь {formatCurrency(cancelSavings)} в год.</p> : null}
            {upcoming.length ? <p className="mt-3 flex items-center gap-2 text-sm"><AlertCircle size={17} />Ближайшее списание: {upcoming[0].name}, {upcoming[0].daysLeft} дн.</p> : null}
          </Card>
          <Card>
            <SectionHeader title="Все подписки" />
            {subscriptions.length ? <div className="space-y-3">{subscriptions.map((item) => {
              const near = upcoming.some((sub) => sub.id === item.id);
              return <div key={item.id} className={`rounded-3xl border p-4 ${near ? "border-amber-200 bg-amber-50" : "border-slate-100 bg-slate-50"}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="font-bold text-ink">{item.name}</p><p className="mt-1 text-sm text-muted">{item.category} • {formatDate(item.nextPaymentDate)} • {item.period === "monthly" ? "ежемесячно" : "ежегодно"} • {item.usageStatus === "using" ? "использую" : item.usageStatus === "rarely" ? "редко использую" : "можно отключить"}</p><p className="mt-2 text-lg font-bold text-sky-600">{formatCurrency(monthlySubscriptionAmount(item))} / мес. <span className="text-sm text-muted">• {formatCurrency(monthlySubscriptionAmount(item) * 12)} / год</span></p></div>
                  <div className="flex gap-2"><button className={ghostButtonClass} type="button" onClick={() => { setEditingId(item.id); setForm({ ...item, amount: String(item.amount), usageStatus: item.usageStatus ?? "using" }); }}><Edit3 size={17} />Изм.</button><button className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600" type="button" onClick={() => onDelete(item.id)}><Trash2 size={17} /></button></div>
                </div>
              </div>;
            })}</div> : <EmptyState title="Подписок нет" text="Добавь регулярные платежи, чтобы видеть месячную нагрузку." />}
          </Card>
        </div>
      </div>
    </div>
  );
};
