import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Card, SectionHeader } from "../components/Card";
import { Field, buttonClass, inputClass } from "../components/FormControls";
import type { Account, Transaction } from "../types";
import { getAccountsWithBalance } from "../utils/calculations";
import { formatCurrency } from "../utils/format";

const blank = { name: "", type: "card" as Account["type"], balance: "" };

export const AccountsPage = ({ accounts, transactions, onAdd, onDelete }: {
  accounts: Account[];
  transactions: Transaction[];
  onAdd: (account: Omit<Account, "id" | "currency">) => void;
  onDelete: (id: string) => void;
}) => {
  const [form, setForm] = useState(blank);
  const balances = getAccountsWithBalance(accounts, transactions);
  return (
    <div>
      <div className="mb-6"><p className="text-sm font-semibold uppercase tracking-wide text-muted">Кошельки</p><h1 className="mt-1 text-3xl font-bold text-ink">Счета</h1></div>
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Card>
          <SectionHeader title="Добавить счёт" />
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onAdd({ name: form.name || "Новый счёт", type: form.type, balance: Number(form.balance) || 0 }); setForm(blank); }}>
            <Field label="Название"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Тип"><select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Account["type"] })}><option value="card">карта</option><option value="cash">наличные</option><option value="savings">накопления</option><option value="credit">кредит</option><option value="other">другое</option></select></Field>
            <Field label="Стартовый баланс"><input className={inputClass} type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} /></Field>
            <button className={buttonClass} type="submit"><Plus size={18} />Добавить</button>
          </form>
        </Card>
        <Card>
          <SectionHeader title="Баланс по счетам" />
          <div className="grid gap-3 md:grid-cols-2">
            {balances.map((account) => (
              <div key={account.id} className="rounded-3xl bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3"><div><p className="font-bold">{account.name}</p><p className="text-sm text-muted">{account.type}</p></div><button className="rounded-2xl bg-rose-50 p-3 text-rose-500" type="button" onClick={() => onDelete(account.id)}><Trash2 size={16} /></button></div>
                <p className="mt-4 text-2xl font-bold">{formatCurrency(account.currentBalance)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
