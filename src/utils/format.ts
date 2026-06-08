export const MONEY_HIDDEN_KEY = "money-control-hide-amounts";

export const areAmountsHidden = () =>
  typeof window !== "undefined" && window.localStorage.getItem(MONEY_HIDDEN_KEY) === "true";

export const setAmountsHidden = (hidden: boolean) => {
  if (typeof window !== "undefined") window.localStorage.setItem(MONEY_HIDDEN_KEY, String(hidden));
};

export const formatCurrency = (value: number) =>
  areAmountsHidden()
    ? "••• ₽"
    : new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  })
    .format(Number.isFinite(value) ? value : 0)
    .replace(/\u00A0/g, " ");

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const daysBetween = (from: string, to: string) => {
  const start = new Date(from);
  const end = new Date(to);
  return Math.ceil((end.getTime() - start.getTime()) / 86_400_000);
};

export const monthKey = (date: string) => date.slice(0, 7);
