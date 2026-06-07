import { BarChart3, CalendarDays, CreditCard, Gauge, Home, LogOut, PiggyBank, Plus, Receipt, Repeat, Target, TrendingUp, UserCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PageKey } from "../App";
import type { AppTheme } from "../hooks/useTheme";
import type { User } from "../types";

const navItems: Array<{ key: PageKey; label: string; icon: LucideIcon }> = [
  { key: "dashboard", label: "Главная", icon: Home },
  { key: "income", label: "Доходы", icon: TrendingUp },
  { key: "expenses", label: "Расходы", icon: Receipt },
  { key: "subscriptions", label: "Подписки", icon: Repeat },
  { key: "debts", label: "Долги", icon: CreditCard },
  { key: "goals", label: "Цели", icon: Target },
  { key: "budgets", label: "Бюджеты", icon: Gauge },
  { key: "calendar", label: "Платежи", icon: CalendarDays },
  { key: "analytics", label: "Аналитика", icon: BarChart3 },
];

const mobileNavItems: Array<{ key: PageKey; label: string; icon: LucideIcon }> = [
  { key: "dashboard", label: "Главная", icon: Home },
  { key: "operations", label: "Операции", icon: Receipt },
  { key: "plan", label: "План", icon: Target },
  { key: "analytics", label: "Аналитика", icon: BarChart3 },
  { key: "profile", label: "Профиль", icon: UserCircle },
];

export const Layout = ({
  activePage,
  setActivePage,
  user,
  onLogout,
  onQuickAdd,
  theme,
  children,
}: {
  activePage: PageKey;
  setActivePage: (page: PageKey) => void;
  user: User;
  onLogout: () => void;
  onQuickAdd: () => void;
  theme: AppTheme;
  children: React.ReactNode;
}) => (
  <div className="app-shell min-h-screen bg-surface text-ink" data-theme={theme}>
    <aside className="glass-sidebar fixed left-0 top-0 hidden h-screen w-64 flex-col p-4 shadow-soft backdrop-blur-2xl lg:flex">
      <div className="flex shrink-0 items-center gap-3">
        <div className="brand-orb flex h-12 w-12 items-center justify-center rounded-3xl text-white">
          <PiggyBank size={25} />
        </div>
        <div>
          <p className="text-lg font-bold">Money Control</p>
          <p className="text-xs text-muted">Личные финансы</p>
        </div>
      </div>
      <nav className="mt-6 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setActivePage(item.key)}
            className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition ${
              activePage === item.key ? "bg-white/90 text-slate-950 shadow-card" : "text-slate-300 hover:bg-white/10"
            }`}
          >
            <item.icon size={19} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="mt-4 shrink-0">
        <button
          type="button"
          onClick={() => setActivePage("profile")}
          className="mb-3 flex w-full items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-3 text-left transition hover:bg-white/10"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
            {user.avatar ? <img src={user.avatar} alt="Аватар" className="h-full w-full object-cover" /> : <UserCircle size={25} className="text-muted" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
        </button>
        <button type="button" onClick={onLogout} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-muted transition hover:bg-white/15">
          <LogOut size={17} />
          Выйти
        </button>
      </div>
    </aside>

    <main className="mx-auto max-w-7xl px-4 pb-32 pt-5 sm:px-6 lg:ml-64 lg:px-8 lg:pb-10">
      <div className="glass-panel mb-6 flex items-center justify-between rounded-5xl p-4 shadow-card lg:hidden">
        <div className="flex items-center gap-3">
          <div className="brand-orb flex h-11 w-11 items-center justify-center rounded-3xl text-white">
            <PiggyBank size={23} />
          </div>
          <div>
            <p className="font-bold">Money Control</p>
            <p className="text-xs text-muted">MVP бюджет</p>
          </div>
        </div>
        <button type="button" onClick={() => setActivePage("profile")} className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white/10">
          {user.avatar ? <img src={user.avatar} alt="Аватар" className="h-full w-full object-cover" /> : <UserCircle size={23} className="text-muted" />}
        </button>
      </div>
      {children}
    </main>

    <button
      type="button"
      onClick={onQuickAdd}
      className="fixed bottom-24 right-4 z-30 inline-flex items-center justify-center gap-2 rounded-full bg-blue-500 px-5 py-4 text-sm font-bold text-white shadow-soft transition hover:bg-blue-400 lg:bottom-6 lg:right-8"
    >
      <Plus size={20} />
      Добавить
    </button>

    <nav className="glass-bottom-nav fixed bottom-0 left-0 right-0 z-20 px-2 py-2 shadow-soft backdrop-blur-2xl lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {mobileNavItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setActivePage(item.key)}
            className={`flex min-h-14 flex-col items-center justify-center rounded-2xl px-1 text-[10px] font-semibold transition ${
              activePage === item.key ? "bg-white/90 text-slate-950" : "text-slate-300 hover:bg-white/10"
            }`}
          >
            <item.icon size={18} />
            <span className="mt-1 truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  </div>
);
