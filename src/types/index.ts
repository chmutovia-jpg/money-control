export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  comment?: string;
  isRecurring?: boolean;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  period: "monthly" | "yearly";
  nextPaymentDate: string;
  category: string;
  isActive: boolean;
}

export interface Debt {
  id: string;
  type: "i_owe" | "owed_to_me";
  person: string;
  amount: number;
  date: string;
  deadline?: string;
  isClosed: boolean;
}

export interface SavingGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export interface CategoryBudget {
  id: string;
  category: string;
  monthlyLimit: number;
}

export interface FinanceState {
  transactions: Transaction[];
  subscriptions: Subscription[];
  debts: Debt[];
  goals: SavingGoal[];
  budgets: CategoryBudget[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  createdAt: string;
}
