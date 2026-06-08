import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AppSplash } from "./components/AppSplash";
import { Layout } from "./components/Layout";
import { QuickAddModal } from "./components/QuickAddModal";
import { Toasts, type ToastItem } from "./components/Toasts";
import { PageTransition } from "./components/motion";
import { buttonClass, inputClass } from "./components/FormControls";
import { useAuth } from "./hooks/useAuth";
import { useFinanceData } from "./hooks/useFinanceData";
import { useTheme } from "./hooks/useTheme";
import { areAmountsHidden, setAmountsHidden } from "./utils/format";
import { verifySecret } from "./utils/crypto";
import { getSmartAlerts } from "./utils/smartAlerts";
import { safeGetItem, safeSetItem } from "./utils/storage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AccountsPage } from "./pages/AccountsPage";
import { AuthPage } from "./pages/AuthPage";
import { BudgetsPage } from "./pages/BudgetsPage";
import { CalendarPage } from "./pages/CalendarPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DebtsPage } from "./pages/DebtsPage";
import { GoalsPage } from "./pages/GoalsPage";
import { OperationsPage } from "./pages/OperationsPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { PlanPage } from "./pages/PlanPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SubscriptionsPage } from "./pages/SubscriptionsPage";
import { TransactionsPage } from "./pages/TransactionsPage";

export type PageKey = "dashboard" | "operations" | "plan" | "accounts" | "income" | "expenses" | "subscriptions" | "debts" | "goals" | "budgets" | "calendar" | "analytics" | "profile";

const App = () => {
  const [activePage, setActivePage] = useState<PageKey>("dashboard");
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [amountsHidden, setAmountsHiddenState] = useState(areAmountsHidden);
  const [locked, setLocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  const [economyMode, setEconomyMode] = useState(() => safeGetItem("money-control-economy-mode") === "true");
  const reduced = useReducedMotion();
  const auth = useAuth();
  const theme = useTheme();
  const finance = useFinanceData(auth.currentUser?.id ?? null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setSplashVisible(false), reduced ? 220 : 650);
    return () => window.clearTimeout(timeout);
  }, [reduced]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get("page") as PageKey | null;
    if (page && ["dashboard", "operations", "plan", "accounts", "income", "expenses", "subscriptions", "debts", "goals", "budgets", "calendar", "analytics", "profile"].includes(page)) {
      setActivePage(page);
    }
    if (params.get("quick") === "expense") setQuickAddOpen(true);
  }, []);

  useEffect(() => {
    setLocked(Boolean(auth.currentUser?.pinHash || auth.currentUser?.pin));
  }, [auth.currentUser?.id, auth.currentUser?.pinHash, auth.currentUser?.pin]);

  useEffect(() => {
    if (!(auth.currentUser?.pinHash || auth.currentUser?.pin) || locked) return;
    let timer = window.setTimeout(() => setLocked(true), 3 * 60_000);
    const resetTimer = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setLocked(true), 3 * 60_000);
    };
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("touchstart", resetTimer);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
    };
  }, [auth.currentUser?.pinHash, auth.currentUser?.pin, locked]);

  const notify = (message: string, action?: ToastItem["action"]) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((current) => [{ id, message, action }, ...current].slice(0, 4));
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4200);
  };

  const removeToast = (id: string) => setToasts((current) => current.filter((toast) => toast.id !== id));
  const toggleAmountsHidden = () => {
    const next = !amountsHidden;
    setAmountsHidden(next);
    setAmountsHiddenState(next);
  };
  const toggleEconomyMode = () => {
    setEconomyMode((current) => {
      const next = !current;
      safeSetItem("money-control-economy-mode", String(next));
      notify(next ? "Режим экономии включён" : "Режим экономии выключен");
      return next;
    });
  };

  if (!auth.currentUser) {
    return (
      <>
        <AuthPage theme={theme.theme} error={auth.error} onLogin={auth.login} onRegister={auth.register} onLoginWithPin={auth.loginWithPin} onDemoLogin={auth.demoLogin} onClearError={auth.clearError} />
        <AppSplash visible={splashVisible} theme={theme.theme} />
      </>
    );
  }

  if (!auth.currentUser.onboardingCompleted) {
    return (
      <>
        <OnboardingPage
          onFinish={(nextState) => {
            finance.replaceAll(nextState);
            auth.completeOnboarding();
          }}
        />
        <AppSplash visible={splashVisible} theme={theme.theme} />
      </>
    );
  }

  if (locked && (auth.currentUser.pinHash || auth.currentUser.pin)) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center px-4 text-ink" data-theme={theme.theme}>
        <motion.form
          className="glass-panel w-full max-w-sm rounded-[32px] p-6 text-center shadow-soft"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.97 }}
          animate={pinError && !reduced ? { x: [0, -8, 8, -5, 5, 0], opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: 0, scale: 1, x: 0 }}
          transition={{ duration: pinError ? 0.34 : 0.28, ease: "easeOut" }}
          onSubmit={async (event) => {
            event.preventDefault();
            const pinOk = auth.currentUser?.pin
              ? pinInput === auth.currentUser.pin
              : await verifySecret(pinInput, auth.currentUser?.pinHash, auth.currentUser?.pinSalt);
            if (pinOk) {
              setLocked(false);
              setPinInput("");
            } else {
              setPinError(true);
              window.setTimeout(() => setPinError(false), 420);
              notify("Неверный PIN");
            }
          }}
        >
          <img className="mx-auto mb-4 h-20 w-20 rounded-[24px] shadow-[0_0_42px_rgba(96,165,250,0.24)]" src="./icon.svg" alt="Money Control" />
          <h1 className="text-2xl font-bold">Money Control закрыт</h1>
          <p className="mt-2 text-sm text-muted">Введите локальный PIN, чтобы открыть приложение.</p>
          <div className="mt-5 flex justify-center gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <motion.span
                key={index}
                className={`h-3 w-3 rounded-full border border-white/20 ${pinInput.length > index ? "bg-blue-300" : "bg-white/10"}`}
                animate={{ scale: pinInput.length > index ? 1.12 : 1 }}
                transition={{ duration: 0.16 }}
              />
            ))}
          </div>
          <input className={`${inputClass} mt-5 text-center text-xl tracking-[0.3em]`} inputMode="numeric" type="password" value={pinInput} onChange={(e) => setPinInput(e.target.value.slice(0, 8))} autoFocus />
          <button className={`${buttonClass} mt-4 w-full`} type="submit">Разблокировать</button>
          <Toasts items={toasts} onDismiss={removeToast} />
        </motion.form>
        <AppSplash visible={splashVisible} theme={theme.theme} />
      </div>
    );
  }

  const page = {
    dashboard: <DashboardPage state={finance.state} economyMode={economyMode} onToggleEconomyMode={toggleEconomyMode} onReset={() => { finance.resetAll(); notify("Все данные очищены"); }} onRestoreDemo={() => { finance.restoreDemo(); notify("Демо-данные восстановлены"); }} />,
    operations: <OperationsPage transactions={finance.state.transactions} setActivePage={setActivePage} />,
    plan: <PlanPage setActivePage={setActivePage} />,
    accounts: <AccountsPage accounts={finance.state.accounts} transactions={finance.state.transactions} onAdd={(account) => { finance.addAccount(account); notify("Счёт создан"); }} onUpdate={(account) => { finance.updateAccount(account); notify("Счёт обновлён"); }} onDelete={(id) => { const previous = finance.state; finance.deleteAccount(id); notify("Счёт удалён", { label: "Отменить", onClick: () => finance.replaceAll(previous) }); }} />,
    income: <TransactionsPage type="income" transactions={finance.state.transactions} accounts={finance.state.accounts} onAdd={(transaction) => { finance.addTransaction(transaction); notify("Доход добавлен"); }} onUpdate={(transaction) => { finance.updateTransaction(transaction); notify("Доход обновлён"); }} onDelete={(id) => { const previous = finance.state; finance.deleteTransaction(id); notify("Доход удалён", { label: "Отменить", onClick: () => finance.replaceAll(previous) }); }} />,
    expenses: <TransactionsPage type="expense" transactions={finance.state.transactions} accounts={finance.state.accounts} onAdd={(transaction) => { finance.addTransaction(transaction); notify("Расход добавлен"); }} onUpdate={(transaction) => { finance.updateTransaction(transaction); notify("Расход обновлён"); }} onDelete={(id) => { const previous = finance.state; finance.deleteTransaction(id); notify("Расход удалён", { label: "Отменить", onClick: () => finance.replaceAll(previous) }); }} />,
    subscriptions: <SubscriptionsPage subscriptions={finance.state.subscriptions} onAdd={(subscription) => { finance.addSubscription(subscription); notify("Подписка добавлена"); }} onUpdate={(subscription) => { finance.updateSubscription(subscription); notify("Подписка обновлена"); }} onDelete={(id) => { const previous = finance.state; finance.deleteSubscription(id); notify("Подписка удалена", { label: "Отменить", onClick: () => finance.replaceAll(previous) }); }} />,
    debts: <DebtsPage debts={finance.state.debts} onAdd={(debt) => { finance.addDebt(debt); notify("Долг добавлен"); }} onUpdate={(debt) => { finance.updateDebt(debt); notify("Долг обновлён"); }} onDelete={(id) => { const previous = finance.state; finance.deleteDebt(id); notify("Долг удалён", { label: "Отменить", onClick: () => finance.replaceAll(previous) }); }} />,
    goals: <GoalsPage goals={finance.state.goals} onAdd={(goal) => { finance.addGoal(goal); notify("Цель добавлена"); }} onUpdate={(goal) => { finance.updateGoal(goal); notify("Цель обновлена"); }} onDelete={(id) => { const previous = finance.state; finance.deleteGoal(id); notify("Цель удалена", { label: "Отменить", onClick: () => finance.replaceAll(previous) }); }} />,
    budgets: <BudgetsPage budgets={finance.state.budgets} transactions={finance.state.transactions} onAdd={(budget) => { finance.addBudget(budget); notify("Бюджет сохранён"); }} onUpdate={(budget) => { finance.updateBudget(budget); notify("Бюджет обновлён"); }} onDelete={(id) => { const previous = finance.state; finance.deleteBudget(id); notify("Бюджет удалён", { label: "Отменить", onClick: () => finance.replaceAll(previous) }); }} />,
    calendar: <CalendarPage state={finance.state} onApplyRecurring={() => { finance.applyDueRecurring(); notify("Регулярные операции добавлены"); }} />,
    analytics: <AnalyticsPage state={finance.state} />,
    profile: <ProfilePage user={auth.currentUser} financeState={finance.state} theme={theme.theme} authError={auth.error} onThemeChange={theme.setTheme} onImportData={finance.replaceAll} onUpdateProfile={auth.updateProfile} onSetPin={auth.setPin} onLogout={auth.logout} />,
  }[activePage];

  return (
    <>
      <Layout activePage={activePage} setActivePage={setActivePage} user={auth.currentUser} onLogout={auth.logout} onQuickAdd={() => setQuickAddOpen(true)} amountsHidden={amountsHidden} onToggleAmountsHidden={toggleAmountsHidden} theme={theme.theme} alerts={getSmartAlerts(finance.state)}>
        <PageTransition key={activePage}>{page}</PageTransition>
      </Layout>
      <QuickAddModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onAddTransaction={finance.addTransaction}
        onAddSubscription={finance.addSubscription}
        onAddDebt={finance.addDebt}
        onAddGoal={finance.addGoal}
        accounts={finance.state.accounts}
        transactions={finance.state.transactions}
        economyMode={economyMode}
        onNotify={notify}
      />
      <Toasts items={toasts} onDismiss={removeToast} />
      <AppSplash visible={splashVisible} theme={theme.theme} />
    </>
  );
};

export default App;
