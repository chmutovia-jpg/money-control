import { Rocket, Sparkles, Wallet } from "lucide-react";
import { useState } from "react";
import { Card, SectionHeader } from "../components/Card";
import { Field, buttonClass, ghostButtonClass, inputClass } from "../components/FormControls";
import type { FinanceState } from "../types";
import { demoData } from "../utils/demoData";
import { todayISO } from "../utils/format";

const emptyState: FinanceState = {
  accounts: [{ id: "main", name: "Основной счёт", type: "card", balance: 0, currency: "RUB" }],
  transactions: [],
  subscriptions: [],
  debts: [],
  goals: [],
  budgets: [],
};

export const OnboardingPage = ({
  onFinish,
}: {
  onFinish: (state: FinanceState) => void;
}) => {
  const [quick, setQuick] = useState(false);
  const [form, setForm] = useState({
    balance: "",
    income: "",
    payments: "",
    budget1Category: "еда",
    budget1: "",
    budget2Category: "транспорт",
    budget2: "",
    budget3Category: "развлечения",
    budget3: "",
    goalTitle: "Подушка безопасности",
    goalTarget: "",
  });

  const submitQuick = (event: React.FormEvent) => {
    event.preventDefault();
    const state: FinanceState = {
      accounts: [{ id: "main", name: "Основной счёт", type: "card", balance: Number(form.balance) || 0, currency: "RUB" }],
      transactions: Number(form.income) > 0 ? [{ id: "income-start", type: "income", amount: Number(form.income), category: "зарплата", date: todayISO(), comment: "Месячный доход", isRecurring: true, accountId: "main" }] : [],
      subscriptions: Number(form.payments) > 0 ? [{ id: "required-start", name: "Обязательные платежи", amount: Number(form.payments), period: "monthly", nextPaymentDate: todayISO(), category: "обязательные", isActive: true, usageStatus: "using" }] : [],
      debts: [],
      goals: Number(form.goalTarget) > 0 ? [{ id: "goal-start", title: form.goalTitle || "Первая цель", targetAmount: Number(form.goalTarget), currentAmount: 0 }] : [],
      budgets: [
        { id: "budget-1", category: form.budget1Category, monthlyLimit: Number(form.budget1) || 0 },
        { id: "budget-2", category: form.budget2Category, monthlyLimit: Number(form.budget2) || 0 },
        { id: "budget-3", category: form.budget3Category, monthlyLimit: Number(form.budget3) || 0 },
      ].filter((budget) => budget.monthlyLimit > 0),
    };
    onFinish(state);
  };

  return (
    <div className="app-shell min-h-screen px-4 py-10 text-ink" data-theme="dark">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">С чего начнём?</h1>
          <p className="mt-2 text-muted">Выбери старт: чистый трекер, быстрые настройки или демо.</p>
        </div>
        {!quick ? (
          <div className="grid gap-4 md:grid-cols-3">
            <button className="glass-panel rounded-5xl p-6 text-left" type="button" onClick={() => onFinish(emptyState)}>
              <Wallet className="mb-4 text-blue-300" />
              <p className="text-xl font-bold">Начать с нуля</p>
              <p className="mt-2 text-sm text-muted">Пустые счета, операции и бюджеты.</p>
            </button>
            <button className="glass-panel rounded-5xl p-6 text-left" type="button" onClick={() => setQuick(true)}>
              <Rocket className="mb-4 text-emerald-300" />
              <p className="text-xl font-bold">Быстрый старт</p>
              <p className="mt-2 text-sm text-muted">Заполним основу за минуту.</p>
            </button>
            <button className="glass-panel rounded-5xl p-6 text-left" type="button" onClick={() => onFinish(demoData)}>
              <Sparkles className="mb-4 text-amber-200" />
              <p className="text-xl font-bold">Посмотреть демо</p>
              <p className="mt-2 text-sm text-muted">Откроем приложение с примерами.</p>
            </button>
          </div>
        ) : (
          <Card>
            <SectionHeader title="Быстрый старт" />
            <form className="grid gap-4 md:grid-cols-2" onSubmit={submitQuick}>
              <Field label="Стартовый баланс"><input className={inputClass} type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} /></Field>
              <Field label="Месячный доход"><input className={inputClass} type="number" value={form.income} onChange={(e) => setForm({ ...form, income: e.target.value })} /></Field>
              <Field label="Основные обязательные платежи"><input className={inputClass} type="number" value={form.payments} onChange={(e) => setForm({ ...form, payments: e.target.value })} /></Field>
              <Field label="Первая цель"><input className={inputClass} value={form.goalTitle} onChange={(e) => setForm({ ...form, goalTitle: e.target.value })} /></Field>
              <Field label="Сумма цели"><input className={inputClass} type="number" value={form.goalTarget} onChange={(e) => setForm({ ...form, goalTarget: e.target.value })} /></Field>
              {[1, 2, 3].map((index) => (
                <div className="grid grid-cols-2 gap-2" key={index}>
                  <Field label={`Бюджет ${index}`}><input className={inputClass} value={form[`budget${index}Category` as keyof typeof form]} onChange={(e) => setForm({ ...form, [`budget${index}Category`]: e.target.value })} /></Field>
                  <Field label="Лимит"><input className={inputClass} type="number" value={form[`budget${index}` as keyof typeof form]} onChange={(e) => setForm({ ...form, [`budget${index}`]: e.target.value })} /></Field>
                </div>
              ))}
              <div className="flex gap-2 md:col-span-2">
                <button className={buttonClass} type="submit">Открыть приложение</button>
                <button className={ghostButtonClass} type="button" onClick={() => setQuick(false)}>Назад</button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};
