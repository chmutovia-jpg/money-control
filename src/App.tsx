import { useState } from "react";
import { Layout } from "./components/Layout";
import { QuickAddModal } from "./components/QuickAddModal";
import { Toasts, type ToastItem } from "./components/Toasts";
import { PageTransition } from "./components/motion";
import { useAuth } from "./hooks/useAuth";
import { useFinanceData } from "./hooks/useFinanceData";
import { useTheme } from "./hooks/useTheme";
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
  const auth = useAuth();
  const theme = useTheme();
  const finance = useFinanceData(auth.currentUser?.id ?? null);

  const notify = (message: string, action?: ToastItem["action"]) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((current) => [{ id, message, action }, ...current].slice(0, 4));
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4200);
  };

  const removeToast = (id: string) => setToasts((current) => current.filter((toast) => toast.id !== id));

  if (!auth.currentUser) {
    return <AuthPage theme={theme.theme} error={auth.error} onLogin={auth.login} onRegister={auth.register} onLoginWithPin={auth.loginWithPin} onDemoLogin={auth.demoLogin} onClearError={auth.clearError} />;
  }

  if (!auth.currentUser.onboardingCompleted) {
    return (
      <OnboardingPage
        onFinish={(nextState) => {
          finance.replaceAll(nextState);
          auth.completeOnboarding();
        }}
      />
    );
  }

  const page = {
    dashboard: <DashboardPage state={finance.state} onReset={() => { finance.resetAll(); notify("Все данные очищены"); }} onRestoreDemo={() => { finance.restoreDemo(); notify("Демо-данные восстановлены"); }} />,
    operations: <OperationsPage transactions={finance.state.transactions} setActivePage={setActivePage} />,
    plan: <PlanPage setActivePage={setActivePage} />,
    accounts: <AccountsPage accounts={finance.state.accounts} transactions={finance.state.transactions} onAdd={(account) => { finance.addAccount(account); notify("Счёт создан"); }} onUpdate={(account) => { finance.updateAccount(account); notify("Счёт обновлён"); }} onDelete={(id) => { const previous = finance.state; finance.deleteAccount(id); notify("Счёт удалён", { label: "Отменить", onClick: () => finance.replaceAll(previous) }); }} />,
    income: <TransactionsPage type="income" transactions={finance.state.transactions} accounts={finance.state.accounts} onAdd={(transaction) => { finance.addTransaction(transaction); notify("Доход добавлен"); }} onUpdate={(transaction) => { finance.updateTransaction(transaction); notify("Доход обновлён"); }} onDelete={(id) => { const previous = finance.state; finance.deleteTransaction(id); notify("Доход удалён", { label: "Отменить", onClick: () => finance.replaceAll(previous) }); }} />,
    expenses: <TransactionsPage type="expense" transactions={finance.state.transactions} accounts={finance.state.accounts} onAdd={(transaction) => { finance.addTransaction(transaction); notify("Расход добавлен"); }} onUpdate={(transaction) => { finance.updateTransaction(transaction); notify("Расход обновлён"); }} onDelete={(id) => { const previous = finance.state; finance.deleteTransaction(id); notify("Расход удалён", { label: "Отменить", onClick: () => finance.replaceAll(previous) }); }} />,
    subscriptions: <SubscriptionsPage subscriptions={finance.state.subscriptions} onAdd={(subscription) => { finance.addSubscription(subscription); notify("Подписка добавлена"); }} onUpdate={(subscription) => { finance.updateSubscription(subscription); notify("Подписка обновлена"); }} onDelete={(id) => { const previous = finance.state; finance.deleteSubscription(id); notify("Подписка удалена", { label: "Отменить", onClick: () => finance.replaceAll(previous) }); }} />,
    debts: <DebtsPage debts={finance.state.debts} onAdd={(debt) => { finance.addDebt(debt); notify("Долг добавлен"); }} onUpdate={(debt) => { finance.updateDebt(debt); notify("Долг обновлён"); }} onDelete={(id) => { const previous = finance.state; finance.deleteDebt(id); notify("Долг удалён", { label: "Отменить", onClick: () => finance.replaceAll(previous) }); }} />,
    goals: <GoalsPage goals={finance.state.goals} onAdd={(goal) => { finance.addGoal(goal); notify("Цель добавлена"); }} onUpdate={(goal) => { finance.updateGoal(goal); notify("Цель обновлена"); }} onDelete={(id) => { const previous = finance.state; finance.deleteGoal(id); notify("Цель удалена", { label: "Отменить", onClick: () => finance.replaceAll(previous) }); }} />,
    budgets: <BudgetsPage budgets={finance.state.budgets} transactions={finance.state.transactions} onAdd={(budget) => { finance.addBudget(budget); notify("Бюджет сохранён"); }} onUpdate={(budget) => { finance.updateBudget(budget); notify("Бюджет обновлён"); }} onDelete={(id) => { const previous = finance.state; finance.deleteBudget(id); notify("Бюджет удалён", { label: "Отменить", onClick: () => finance.replaceAll(previous) }); }} />,
    calendar: <CalendarPage state={finance.state} />,
    analytics: <AnalyticsPage state={finance.state} />,
    profile: <ProfilePage user={auth.currentUser} financeState={finance.state} theme={theme.theme} authError={auth.error} onThemeChange={theme.setTheme} onImportData={finance.replaceAll} onUpdateProfile={auth.updateProfile} onSetPin={auth.setPin} onLogout={auth.logout} />,
  }[activePage];

  return (
    <>
      <Layout activePage={activePage} setActivePage={setActivePage} user={auth.currentUser} onLogout={auth.logout} onQuickAdd={() => setQuickAddOpen(true)} theme={theme.theme}>
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
        onNotify={notify}
      />
      <Toasts items={toasts} onDismiss={removeToast} />
    </>
  );
};

export default App;
