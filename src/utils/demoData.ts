import type { FinanceState } from "../types";

export const demoData: FinanceState = {
  accounts: [
    { id: "a1", name: "Основная карта", type: "card", balance: 22000, currency: "RUB", color: "#60a5fa" },
    { id: "a2", name: "Наличные", type: "cash", balance: 6500, currency: "RUB", color: "#34d399" },
    { id: "a3", name: "Накопления", type: "savings", balance: 118000, currency: "RUB", color: "#a78bfa" },
  ],
  transactions: [
    { id: "t1", type: "income", amount: 145000, category: "зарплата", date: "2026-06-03", comment: "Основная работа", accountId: "a1" },
    { id: "t2", type: "income", amount: 28000, category: "фриланс", date: "2026-06-05", comment: "Лендинг", accountId: "a1" },
    { id: "t3", type: "expense", amount: 18500, category: "жильё", date: "2026-06-01", comment: "Аренда", accountId: "a1" },
    { id: "t4", type: "expense", amount: 9600, category: "еда", date: "2026-06-04", comment: "Продукты", accountId: "a1" },
    { id: "t5", type: "expense", amount: 4200, category: "транспорт", date: "2026-06-06", comment: "Такси и метро", accountId: "a1" },
    { id: "t6", type: "expense", amount: 7500, category: "развлечения", date: "2026-06-07", comment: "Кино и кафе", accountId: "a1" },
    { id: "t7", type: "expense", amount: 3200, category: "здоровье", date: "2026-05-25", comment: "Аптека", accountId: "a1" },
    { id: "t8", type: "income", amount: 130000, category: "зарплата", date: "2026-05-03", comment: "Май", accountId: "a1" },
    { id: "t9", type: "expense", amount: 54000, category: "еда", date: "2026-05-12", comment: "Майские расходы", accountId: "a1" },
    { id: "t10", type: "expense", amount: 11000, category: "одежда", date: "2026-05-18", comment: "Обновление гардероба", accountId: "a1" },
  ],
  subscriptions: [
    { id: "s1", name: "Музыка", amount: 299, period: "monthly", nextPaymentDate: "2026-06-10", category: "развлечения", isActive: true, usageStatus: "using" },
    { id: "s2", name: "Облако", amount: 799, period: "monthly", nextPaymentDate: "2026-06-13", category: "работа", isActive: true, usageStatus: "using" },
    { id: "s3", name: "Кинотеатр", amount: 3990, period: "yearly", nextPaymentDate: "2026-09-01", category: "развлечения", isActive: true, usageStatus: "rarely" },
  ],
  debts: [
    { id: "d1", type: "i_owe", person: "Илья", amount: 15000, date: "2026-05-29", deadline: "2026-06-20", isClosed: false },
    { id: "d2", type: "owed_to_me", person: "Марина", amount: 7200, date: "2026-06-02", deadline: "2026-06-15", isClosed: false },
  ],
  goals: [
    { id: "g1", title: "Подушка безопасности", targetAmount: 300000, currentAmount: 118000, deadline: "2026-12-31" },
    { id: "g2", title: "Отпуск", targetAmount: 180000, currentAmount: 64000, deadline: "2026-09-10" },
  ],
  budgets: [
    { id: "b1", category: "еда", monthlyLimit: 35000 },
    { id: "b2", category: "транспорт", monthlyLimit: 12000 },
    { id: "b3", category: "развлечения", monthlyLimit: 10000 },
    { id: "b4", category: "здоровье", monthlyLimit: 8000 },
  ],
};
