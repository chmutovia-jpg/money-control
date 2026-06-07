import { useState } from "react";
import { Layout } from "./components/Layout";
import { useAuth } from "./hooks/useAuth";
import { useFinanceData } from "./hooks/useFinanceData";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AuthPage } from "./pages/AuthPage";
import { BudgetsPage } from "./pages/BudgetsPage";
import { CalendarPage } from "./pages/CalendarPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DebtsPage } from "./pages/DebtsPage";
import { GoalsPage } from "./pages/GoalsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SubscriptionsPage } from "./pages/SubscriptionsPage";
import { TransactionsPage } from "./pages/TransactionsPage";

export type PageKey = "dashboard" | "income" | "expenses" | "subscriptions" | "debts" | "goals" | "budgets" | "calendar" | "analytics" | "profile";

const App = () => {
  const [activePage, setActivePage] = useState<PageKey>("dashboard");
  const auth = useAuth();
  const finance = useFinanceData(auth.currentUser?.id ?? null);

  if (!auth.currentUser) {
    return <AuthPage error={auth.error} onLogin={auth.login} onRegister={auth.register} onClearError={auth.clearError} />;
  }

  const page = {
    dashboard: <DashboardPage state={finance.state} onReset={finance.resetAll} onRestoreDemo={finance.restoreDemo} />,
    income: <TransactionsPage type="income" transactions={finance.state.transactions} onAdd={finance.addTransaction} onUpdate={finance.updateTransaction} onDelete={finance.deleteTransaction} />,
    expenses: <TransactionsPage type="expense" transactions={finance.state.transactions} onAdd={finance.addTransaction} onUpdate={finance.updateTransaction} onDelete={finance.deleteTransaction} />,
    subscriptions: <SubscriptionsPage subscriptions={finance.state.subscriptions} onAdd={finance.addSubscription} onUpdate={finance.updateSubscription} onDelete={finance.deleteSubscription} />,
    debts: <DebtsPage debts={finance.state.debts} onAdd={finance.addDebt} onUpdate={finance.updateDebt} onDelete={finance.deleteDebt} />,
    goals: <GoalsPage goals={finance.state.goals} onAdd={finance.addGoal} onUpdate={finance.updateGoal} onDelete={finance.deleteGoal} />,
    budgets: <BudgetsPage budgets={finance.state.budgets} transactions={finance.state.transactions} onAdd={finance.addBudget} onUpdate={finance.updateBudget} onDelete={finance.deleteBudget} />,
    calendar: <CalendarPage state={finance.state} />,
    analytics: <AnalyticsPage state={finance.state} />,
    profile: <ProfilePage user={auth.currentUser} financeState={finance.state} onImportData={finance.replaceAll} onUpdateProfile={auth.updateProfile} onLogout={auth.logout} />,
  }[activePage];

  return <Layout activePage={activePage} setActivePage={setActivePage} user={auth.currentUser} onLogout={auth.logout}>{page}</Layout>;
};

export default App;
