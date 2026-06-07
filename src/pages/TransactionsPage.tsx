import { Edit3, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Card, EmptyState, SectionHeader } from "../components/Card";
import { Field, buttonClass, ghostButtonClass, inputClass } from "../components/FormControls";
import type { Account, Transaction } from "../types";
import { formatCurrency, formatDate, todayISO } from "../utils/format";

const incomeCategories = ["зарплата", "фриланс", "подарок", "другое"];
const expenseCategories = ["еда", "транспорт", "жильё", "развлечения", "здоровье", "одежда", "подписки", "другое"];

const emptyForm = (type: Transaction["type"]) => ({
  type,
  amount: "",
  category: type === "income" ? "зарплата" : "еда",
  date: todayISO(),
  comment: "",
  isRecurring: false,
  accountId: "",
});

interface Props {
  type: Transaction["type"];
  transactions: Transaction[];
  onAdd: (transaction: Omit<Transaction, "id">) => void;
  onUpdate: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  accounts: Account[];
}

export const TransactionsPage = ({ type, transactions, onAdd, onUpdate, onDelete, accounts }: Props) => {
  const [form, setForm] = useState(emptyForm(type));
  const [editingId, setEditingId] = useState<string | null>(null);
  const isIncome = type === "income";
  const categories = isIncome ? incomeCategories : expenseCategories;
  const title = isIncome ? "Доходы" : "Расходы";
  const items = transactions.filter((item) => item.type === type);

  const reset = () => {
    setForm(emptyForm(type));
    setEditingId(null);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      type,
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
      comment: form.comment.trim() || undefined,
      isRecurring: form.isRecurring,
      accountId: form.accountId || accounts[0]?.id,
    };
    if (!payload.amount || payload.amount < 0) return;
    if (editingId) onUpdate({ ...payload, id: editingId });
    else onAdd(payload);
    reset();
  };

  const edit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setForm({
      type,
      amount: String(transaction.amount),
      category: transaction.category,
      date: transaction.date,
      comment: transaction.comment ?? "",
      isRecurring: Boolean(transaction.isRecurring),
      accountId: transaction.accountId ?? accounts[0]?.id ?? "",
    });
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">Money Control</p>
        <h1 className="mt-1 text-3xl font-bold text-ink">{title}</h1>
      </div>
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card>
          <SectionHeader title={editingId ? "Редактировать" : isIncome ? "Добавить доход" : "Добавить расход"} />
          <form className="space-y-4" onSubmit={submit}>
            <Field label="Сумма">
              <input className={inputClass} type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="12 500" required />
            </Field>
            <Field label={isIncome ? "Источник" : "Категория"}>
              <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </Field>
            <Field label="Дата">
              <input className={inputClass} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </Field>
            <Field label="Счёт">
              <select className={inputClass} value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}>
                <option value="">Основной</option>
                {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
              </select>
            </Field>
            <Field label="Комментарий">
              <textarea className={`${inputClass} min-h-24 resize-none`} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} placeholder="Необязательно" />
            </Field>
            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-ink">
              <input type="checkbox" checked={form.isRecurring} onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })} />
              Повторяется ежемесячно
            </label>
            <div className="flex gap-2">
              <button className={buttonClass} type="submit"><Plus size={18} />{editingId ? "Сохранить" : "Добавить"}</button>
              {editingId ? <button className={ghostButtonClass} type="button" onClick={reset}><X size={18} />Отмена</button> : null}
            </div>
          </form>
        </Card>

        <Card>
          <SectionHeader title={`Список: ${items.length}`} />
          {items.length ? (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isIncome ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{item.category}</span>
                      <span className="text-sm text-muted">{formatDate(item.date)}</span>
                      {item.isRecurring ? <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-200">повтор</span> : null}
                    </div>
                    <p className="mt-2 text-xl font-bold text-ink">{formatCurrency(item.amount)}</p>
                    {item.comment ? <p className="mt-1 text-sm text-muted">{item.comment}</p> : null}
                  </div>
                  <div className="flex gap-2">
                    <button className={ghostButtonClass} type="button" onClick={() => edit(item)}><Edit3 size={17} />Изм.</button>
                    <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100" type="button" onClick={() => onDelete(item.id)}><Trash2 size={17} />Удалить</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title={isIncome ? "Доходов пока нет" : "Расходов пока нет"} text="Добавь первую запись, и она появится здесь." />
          )}
        </Card>
      </div>
    </div>
  );
};
