import { Plus, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import type { Account, Debt, SavingGoal, Subscription, Transaction } from "../types";
import { parseQuickExpense } from "../utils/categoryRules";
import { todayISO } from "../utils/format";
import { safeGetItem, safeSetItem } from "../utils/storage";
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
type QuickTemplate = { label: string; amount: number; category: string };
const QUICK_TEMPLATES_KEY = "money-control-quick-templates";

const loadTemplates = (): QuickTemplate[] => {
  try {
    return JSON.parse(safeGetItem(QUICK_TEMPLATES_KEY) ?? "[]") as QuickTemplate[];
  } catch {
    return [];
  }
};

export const QuickAddModal = ({
  open,
  onClose,
  onAddTransaction,
  onAddSubscription,
  onAddDebt,
  onAddGoal,
  accounts,
  transactions,
  onNotify,
}: {
  open: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void;
  onAddSubscription: (subscription: Omit<Subscription, "id">) => void;
  onAddDebt: (debt: Omit<Debt, "id">) => void;
  onAddGoal: (goal: Omit<SavingGoal, "id">) => void;
  accounts: Account[];
  transactions: Transaction[];
  onNotify: (message: string) => void;
}) => {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<Mode>("expense");
  const [quickText, setQuickText] = useState("");
  const [customTemplates, setCustomTemplates] = useState<QuickTemplate[]>(loadTemplates);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "еда",
    date: todayISO(),
    comment: "",
    accountId: accounts[0]?.id ?? "",
  });

  const recentTemplates = useMemo(
    () =>
      transactions
        .filter((item) => item.type === "expense")
        .slice(0, 4)
        .map((item) => ({ label: item.comment || item.category, amount: item.amount, category: item.category })),
    [transactions],
  );

  const frequentTemplates = useMemo(() => {
    const map = new Map<string, QuickTemplate & { count: number }>();
    transactions.filter((item) => item.type === "expense").forEach((item) => {
      const label = item.comment || item.category;
      const key = `${label}-${item.category}`;
      const current = map.get(key);
      map.set(key, { label, amount: current?.amount ?? item.amount, category: item.category, count: (current?.count ?? 0) + 1 });
    });
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 4);
  }, [transactions]);

  const applyTemplate = (item: QuickTemplate) => {
    setMode("expense");
    setForm({ ...form, title: item.label, amount: String(item.amount), category: item.category, comment: item.label });
  };

  const addCurrentTemplate = () => {
    const amount = Number(form.amount);
    if (!form.comment && !form.title) return;
    if (amount <= 0) return;
    const next = [{ label: form.comment || form.title, amount, category: form.category }, ...customTemplates].slice(0, 8);
    setCustomTemplates(next);
    safeSetItem(QUICK_TEMPLATES_KEY, JSON.stringify(next));
    onNotify("Шаблон сохранён");
  };

  const submitQuickText = () => {
    const parsed = parseQuickExpense(quickText);
    if (!parsed) {
      onNotify("Напиши в формате: кофе 250");
      return;
    }
    onAddTransaction({ type: "expense", amount: parsed.amount, category: parsed.category, date: todayISO(), comment: parsed.label, accountId: form.accountId || accounts[0]?.id });
    setQuickText("");
    onNotify("Расход добавлен");
    onClose();
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (amount <= 0) return;
    if (mode === "expense" || mode === "income") {
      onAddTransaction({ type: mode, amount, category: form.category, date: form.date, comment: form.comment || form.title || undefined, accountId: form.accountId || accounts[0]?.id });
      onNotify(mode === "expense" ? "Расход добавлен" : "Доход добавлен");
    }
    if (mode === "subscription") {
      onAddSubscription({ name: form.title || form.category, amount, period: "monthly", nextPaymentDate: form.date, category: form.category, isActive: true });
      onNotify("Подписка добавлена");
    }
    if (mode === "debt") {
      onAddDebt({ type: "i_owe", person: form.title || "Без имени", amount, date: todayISO(), deadline: form.date, isClosed: false });
      onNotify("Долг добавлен");
    }
    if (mode === "goal") {
      onAddGoal({ title: form.title || "Новая цель", targetAmount: amount, currentAmount: 0, deadline: form.date });
      onNotify("Цель добавлена");
    }
    setForm({ title: "", amount: "", category: "еда", date: todayISO(), comment: "", accountId: accounts[0]?.id ?? "" });
    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 backdrop-blur-md sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.12 : 0.2, ease: "easeOut" }}
        >
      <motion.div
        className="glass-panel w-full max-w-lg rounded-t-[30px] p-5 shadow-soft sm:rounded-5xl"
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 16 }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 14 }}
        transition={{ duration: reduced ? 0.12 : 0.24, ease: "easeOut" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink">Добавить</h2>
          <button className={ghostButtonClass} type="button" onClick={onClose} aria-label="Закрыть"><X size={18} /></button>
        </div>
        <div className="mb-4 grid grid-cols-5 gap-1 rounded-3xl bg-slate-50 p-1">
          {[
            ["expense", "Расход"],
            ["income", "Доход"],
            ["subscription", "Подписка"],
            ["debt", "Долг"],
            ["goal", "Цель"],
          ].map(([key, label]) => (
            <motion.button
              key={key}
              className={`rounded-2xl px-2 py-3 text-xs font-semibold ${mode === key ? "bg-blue-500 text-white" : "text-muted"}`}
              type="button"
              onClick={() => setMode(key as Mode)}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.1 : 0.2, delay: reduced ? 0 : Number(["expense", "income", "subscription", "debt", "goal"].indexOf(key)) * 0.04, ease: "easeOut" }}
            >
              {label}
            </motion.button>
          ))}
        </div>
        {mode === "expense" ? (
          <div className="mb-4 rounded-3xl bg-slate-50 p-3">
            <div className="flex gap-2">
              <input className={inputClass} value={quickText} onChange={(e) => setQuickText(e.target.value)} placeholder="Быстрый ввод: кофе 250" />
              <button className={ghostButtonClass} type="button" onClick={submitQuickText}>OK</button>
            </div>
          </div>
        ) : null}
        {mode === "expense" ? (
          <div className="mb-4 space-y-3">
            <TemplateGrid title="Быстрые траты" items={quickExpenses} onPick={applyTemplate} reduced={reduced} />
            {recentTemplates.length ? <TemplateGrid title="Недавние шаблоны" items={recentTemplates} onPick={applyTemplate} reduced={reduced} /> : null}
            {frequentTemplates.length ? <TemplateGrid title="Частые траты" items={frequentTemplates} onPick={applyTemplate} reduced={reduced} /> : null}
            {customTemplates.length ? <TemplateGrid title="Мои шаблоны" items={customTemplates} onPick={applyTemplate} reduced={reduced} /> : null}
          </div>
        ) : null}
        <form className="space-y-4" onSubmit={submit}>
          {mode !== "expense" && mode !== "income" ? <Field label={mode === "debt" ? "Кому" : "Название"}><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field> : null}
          <Field label="Сумма"><input className={inputClass} type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></Field>
          {(mode === "expense" || mode === "income" || mode === "subscription") ? <Field label="Категория"><input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field> : null}
          {(mode === "expense" || mode === "income") ? <Field label="Счёт"><select className={inputClass} value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></Field> : null}
          <Field label={mode === "goal" || mode === "debt" ? "Дедлайн" : "Дата"}><input className={inputClass} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          {(mode === "expense" || mode === "income") ? <Field label="Комментарий"><input className={inputClass} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} /></Field> : null}
          <div className="flex gap-2">
            <button className={`${buttonClass} flex-1`} type="submit"><Plus size={18} />Добавить</button>
            {mode === "expense" ? <button className={ghostButtonClass} type="button" onClick={addCurrentTemplate}>В шаблон</button> : null}
          </div>
        </form>
      </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

const TemplateGrid = ({ title, items, onPick, reduced }: { title: string; items: QuickTemplate[]; onPick: (item: QuickTemplate) => void; reduced: boolean | null }) => (
  <div>
    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">{title}</p>
    <div className="grid grid-cols-3 gap-2">
      {items.map((item, index) => (
        <motion.button
          key={`${title}-${item.label}-${index}`}
          className="rounded-2xl bg-slate-50 px-3 py-3 text-left text-xs font-semibold text-ink transition hover:bg-white/10"
          type="button"
          onClick={() => onPick(item)}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          whileHover={reduced ? undefined : { y: -2, scale: 1.01 }}
          whileTap={reduced ? undefined : { scale: 0.98 }}
          transition={{ duration: reduced ? 0.1 : 0.2, delay: reduced ? 0 : index * 0.035, ease: "easeOut" }}
        >
          <span className="block truncate">{item.label}</span>
          <span className="mt-1 block text-muted">{item.amount.toLocaleString("ru-RU")} ₽</span>
        </motion.button>
      ))}
    </div>
  </div>
);
