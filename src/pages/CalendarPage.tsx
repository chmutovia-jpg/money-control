import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { Card, EmptyState, SectionHeader } from "../components/Card";
import type { FinanceState } from "../types";
import { getCashflowForecast, getDueRecurringTransactions, getPaymentCalendar } from "../utils/calculations";
import { formatCurrency, formatDate } from "../utils/format";

const typeLabel = {
  subscription: "Подписка",
  debt: "Долг",
  recurring: "Повтор",
};

export const CalendarPage = ({ state, onApplyRecurring }: { state: FinanceState; onApplyRecurring: () => void }) => {
  const [horizon, setHorizon] = useState<7 | 30>(7);
  const events = getPaymentCalendar(state, horizon);
  const dueRecurring = getDueRecurringTransactions(state.transactions);
  const cashflow = getCashflowForecast(state, 30);

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">Ближайшие списания</p>
        <h1 className="mt-1 text-3xl font-bold text-ink">Календарь платежей</h1>
      </div>
      {dueRecurring.length ? (
        <Card className="mb-5">
          <SectionHeader title="Регулярные операции готовы" />
          <p className="text-sm text-muted">Сегодня можно добавить {dueRecurring.length} регулярн. операций без дублей.</p>
          <button className="mt-4 rounded-2xl bg-blue-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-400" type="button" onClick={onApplyRecurring}>Добавить операции</button>
        </Card>
      ) : null}
      <Card className="mb-5">
        <SectionHeader title="Cashflow до конца месяца" />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {cashflow.slice(0, 30).map((day) => (
            <div key={day.date} className={`rounded-3xl border p-3 ${day.isLow ? "border-rose-300/30 bg-rose-400/10" : "border-white/10 bg-slate-50"}`}>
              <p className="text-xs text-muted">{formatDate(day.date)}</p>
              <p className={`mt-1 font-bold ${day.isLow ? "text-rose-200" : "text-ink"}`}>{formatCurrency(day.balance)}</p>
              {day.events.length ? <p className="mt-1 text-xs text-muted">{day.events.length} платеж.</p> : null}
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <SectionHeader
          title={horizon === 7 ? "На 7 дней" : "На 30 дней"}
          action={
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-white/5 p-1">
              <button className={`rounded-xl px-3 py-2 text-sm font-semibold ${horizon === 7 ? "bg-white/90 text-slate-950" : "text-muted"}`} type="button" onClick={() => setHorizon(7)}>7 дней</button>
              <button className={`rounded-xl px-3 py-2 text-sm font-semibold ${horizon === 30 ? "bg-white/90 text-slate-950" : "text-muted"}`} type="button" onClick={() => setHorizon(30)}>30 дней</button>
            </div>
          }
        />
        {events.length ? <div className="space-y-3">{events.map((event) => (
          <div key={event.id} className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-400/10 text-blue-300">
                <CalendarDays size={20} />
              </div>
              <div>
                <p className="font-bold text-ink">{event.title}</p>
                <p className="text-sm text-muted">{typeLabel[event.type]} • {event.category} • {formatDate(event.date)}</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-lg font-bold text-ink">{formatCurrency(event.amount)}</p>
              <p className={`text-sm font-semibold ${event.daysLeft <= 3 ? "text-amber-200" : "text-muted"}`}>
                {event.daysLeft === 0 ? "Сегодня" : `Через ${event.daysLeft} дн.`}
              </p>
            </div>
          </div>
        ))}</div> : <EmptyState title="Платежей нет" text="На выбранный период нет подписок, дедлайнов долгов или повторяющихся операций." />}
      </Card>
    </div>
  );
};
