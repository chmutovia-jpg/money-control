const categoryRules: Record<string, string[]> = {
  еда: ["кофе", "кафе", "ресторан", "продукты", "еда", "обед", "ужин", "завтрак", "доставка"],
  транспорт: ["такси", "метро", "транспорт", "автобус", "бензин", "каршеринг", "поезд"],
  здоровье: ["аптека", "лекар", "врач", "клиника", "здоровье", "анализ"],
  жильё: ["аренда", "квартира", "коммунал", "жильё", "ипотека"],
  развлечения: ["кино", "бар", "игра", "концерт", "развлеч", "театр"],
  одежда: ["одежда", "обувь", "футболка", "куртка"],
  подписки: ["подписка", "netflix", "spotify", "яндекс", "icloud", "облако"],
};

export const detectCategory = (text: string, fallback = "другое") => {
  const value = text.toLowerCase();
  const match = Object.entries(categoryRules).find(([, words]) => words.some((word) => value.includes(word)));
  return match?.[0] ?? fallback;
};

export const parseQuickExpense = (text: string) => {
  const match = text.trim().match(/^(.+?)\s+(\d+(?:[.,]\d+)?)$/);
  if (!match) return null;
  const label = match[1].trim();
  const amount = Number(match[2].replace(",", "."));
  if (!label || amount <= 0) return null;
  return { label, amount, category: detectCategory(label) };
};
