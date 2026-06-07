import { CalendarDays, CreditCard, Gauge, Repeat, Target } from "lucide-react";
import type { PageKey } from "../App";

const items: Array<{ page: PageKey; title: string; text: string; icon: typeof Repeat }> = [
  { page: "subscriptions", title: "Подписки", text: "Регулярные списания", icon: Repeat },
  { page: "debts", title: "Долги", text: "Кому и когда вернуть", icon: CreditCard },
  { page: "goals", title: "Цели", text: "Накопления и прогресс", icon: Target },
  { page: "budgets", title: "Бюджеты", text: "Лимиты по категориям", icon: Gauge },
  { page: "calendar", title: "Платежи", text: "Календарь на 7/30 дней", icon: CalendarDays },
];

export const PlanPage = ({ setActivePage }: { setActivePage: (page: PageKey) => void }) => (
  <div>
    <div className="mb-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted">Планирование</p>
      <h1 className="mt-1 text-3xl font-bold text-ink">План</h1>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <button key={item.page} type="button" onClick={() => setActivePage(item.page)} className="glass-panel rounded-5xl p-5 text-left transition hover:-translate-y-0.5">
          <item.icon className="mb-4 text-blue-300" size={26} />
          <p className="text-lg font-bold text-ink">{item.title}</p>
          <p className="mt-1 text-sm text-muted">{item.text}</p>
        </button>
      ))}
    </div>
  </div>
);
