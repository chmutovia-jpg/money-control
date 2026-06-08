import { Edit3, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Card, SectionHeader } from "../components/Card";
import { Field, buttonClass, ghostButtonClass, inputClass } from "../components/FormControls";
import type { Account, Transaction } from "../types";
import { getAccountsWithBalance } from "../utils/calculations";
import { formatCurrency } from "../utils/format";

const blank = { name: "", type: "card" as Account["type"], balance: "", color: "#60a5fa" };
const accountTypes: Array<{ value: Account["type"]; label: string }> = [
  { value: "card", label: "карта" },
  { value: "cash", label: "наличные" },
  { value: "savings", label: "накопления" },
  { value: "credit", label: "кредит" },
  { value: "crypto", label: "крипто" },
  { value: "other", label: "другое" },
];
const colors = ["#60a5fa", "#34d399", "#a78bfa", "#fb7185", "#fbbf24", "#2dd4bf"];

export const AccountsPage = ({ accounts, transactions, onAdd, onUpdate, onDelete }: {
  accounts: Account[];
  transactions: Transaction[];
  onAdd: (account: Omit<Account, "id" | "currency">) => void;
  onUpdate: (account: Account) => void;
  onDelete: (id: string) => void;
}) => {
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const balances = getAccountsWithBalance(accounts, transactions);
  const reset = () => {
    setForm(blank);
    setEditingId(null);
  };

  return (
    <div>
      <div className="mb-6"><p className="text-sm font-semibold uppercase tracking-wide text-muted">Кошельки</p><h1 className="mt-1 text-3xl font-bold text-ink">Счета</h1></div>
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Card>
          <SectionHeader title={editingId ? "Редактировать счёт" : "Добавить счёт"} />
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const payload = { name: form.name || "Новый счёт", type: form.type, balance: Number(form.balance) || 0, color: form.color };
            if (editingId) onUpdate({ ...payload, id: editingId, currency: "RUB" });
            else onAdd(payload);
            reset();
          }}>
            <Field label="Название"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Тип"><select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Account["type"] })}>{accountTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></Field>
            <Field label="Стартовый баланс"><input className={inputClass} type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} /></Field>
            <Field label="Цвет">
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button key={color} type="button" aria-label={`Цвет ${color}`} onClick={() => setForm({ ...form, color })} className={`h-10 w-10 rounded-2xl border transition ${form.color === color ? "border-white shadow-[0_0_22px_rgba(96,165,250,0.35)]" : "border-white/10"}`} style={{ backgroundColor: color }} />
                ))}
              </div>
            </Field>
            <div className="flex gap-2">
              <button className={buttonClass} type="submit"><Plus size={18} />{editingId ? "Сохранить" : "Добавить"}</button>
              {editingId ? <button className={ghostButtonClass} type="button" onClick={reset}><X size={18} />Отмена</button> : null}
            </div>
          </form>
        </Card>
        <Card>
          <SectionHeader title="Баланс по счетам" />
          <div className="grid gap-3 md:grid-cols-2">
            {balances.map((account) => (
              <div key={account.id} className="rounded-3xl bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-4 w-4 rounded-full" style={{ backgroundColor: account.color }} />
                    <div><p className="font-bold">{account.name}</p><p className="text-sm text-muted">{account.type}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <button className={ghostButtonClass} type="button" onClick={() => { setEditingId(account.id); setForm({ name: account.name, type: account.type, balance: String(account.balance), color: account.color }); }}><Edit3 size={16} /></button>
                    <button className="rounded-2xl bg-rose-50 p-3 text-rose-500" type="button" onClick={() => onDelete(account.id)}><Trash2 size={16} /></button>
                  </div>
                </div>
                <p className="mt-4 text-2xl font-bold">{formatCurrency(account.currentBalance)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
