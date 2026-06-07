import { Plus, X } from "lucide-react";
import { useState } from "react";
import type { Account, Debt, SavingGoal, Subscription, Transaction } from "../types";
import { todayISO } from "../utils/format";
import { Field, buttonClass, ghostButtonClass, inputClass } from "./FormControls";

const quickExpenses = [
  { label: "Кофе", amount: 250, category: "еда" },
  { label: "Такси", amount: 700, category: "транспорт" },
  { label: "Продукты", amount: 2500, category: "еда" },
  { label: "Кафе", amount: 1200, category: "развлечения" },
  { label: "Аптека", amount: 900, category: "здоровье" },
  { label: "Транспорт", amount: 150, category: "транспорт" },
];

type Mode = "expense" | "income" | "subscription" | "debt" | "goal";

export const QuickAddModal = ({
  open,
  onClose,
  onAddTransaction,
  onAddSubscription,
  onAddDebt,
  onAddGoal,
  accounts,
}: {
  open: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void;
  onAddSubscription: (subscription: Omit<Subscription, "id">) => void;
  onAddDebt: (debt: Omit<Debt, "id">) => void;
  onAddGoal: (goal: Omit<SavingGoal, "id">) => void;
  accounts: Account[];
}) => {
  const [mode, setMode] = useState<Mode>("expense");
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "еда",
    date: todayISO(),
    comment: "",
    accountId: accounts[0]?.id ?? "",
  });

  if (!open) return null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (amount <= 0) return;
    if (mode === "expense" || mode === "income") {
      onAddTransaction({ type: mode, amount, category: form.category, date: form.date, comment: form.comment || form.title || undefined, accountId: form.accountId || accounts[0]?.id });
    }
    if (mode === "subscription") {
      onAddSubscription({ name: form.title || form.category, amount, period: "monthly", nextPaymentDate: form.date, category: form.category, isActive: true });
    }
    if (mode === "debt") {
      onAddDebt({ type: "i_owe", person: form.title || "Без имени", amount, date: todayISO(), deadline: form.date, isClosed: false });
    }
    if (mode === "goal") {
      onAddGoal({ title: form.title || "Новая цель", targetAmount: amount, currentAmount: 0, deadline: form.date });
    }
    setForm({ title: "", amount: "", category: "еда", date: todayISO(), comment: "", accountId: accounts[0]?.id ?? "" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 backdrop-blur-sm sm:items-center">
      <div className="glass-panel w-full max-w-lg rounded-5xl p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink">Добавить</h2>
          <button className={ghostButtonClass} type="button" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="mb-4 grid grid-cols-5 gap-1 rounded-3xl bg-slate-50 p-1">
          {[
            ["expense", "Расход"],
            ["income", "Доход"],
            ["subscription", "Подписка"],
            ["debt", "Долг"],
            ["goal", "Цель"],
          ].map(([key, label]) => (
            <button key={key} className={`rounded-2xl px-2 py-3 text-xs font-semibold ${mode === key ? "bg-blue-500 text-white" : "text-muted"}`} type="button" onClick={() => setMode(key as Mode)}>
              {label}
            </button>
          ))}
        </div>
        {mode === "expense" ? (
          <div className="mb-4 grid grid-cols-3 gap-2">
            {quickExpenses.map((item) => (
              <button key={item.label} className="rounded-2xl bg-slate-50 px-3 py-3 text-sm font-semibold text-ink" type="button" onClick={() => setForm({ ...form, title: item.label, amount: String(item.amount), category: item.category, comment: item.label })}>
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
        <form className="space-y-4" onSubmit={submit}>
          {mode !== "expense" && mode !== "income" ? <Field label={mode === "debt" ? "Кому" : "Название"}><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field> : null}
          <Field label="Сумма"><input className={inputClass} type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></Field>
          {(mode === "expense" || mode === "income" || mode === "subscription") ? <Field label="Категория"><input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field> : null}
          {(mode === "expense" || mode === "income") ? <Field label="Счёт"><select className={inputClass} value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></Field> : null}
          <Field label={mode === "goal" || mode === "debt" ? "Дедлайн" : "Дата"}><input className={inputClass} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          {(mode === "expense" || mode === "income") ? <Field label="Комментарий"><input className={inputClass} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} /></Field> : null}
          <button className={`${buttonClass} w-full`} type="submit"><Plus size={18} />Добавить</button>
        </form>
      </div>
    </div>
  );
};
