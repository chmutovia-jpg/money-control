import { expect, test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const clearApp = async (page: import("@playwright/test").Page) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
};

const demoLogin = async (page: import("@playwright/test").Page) => {
  await clearApp(page);
  await page.getByRole("button", { name: "Попробовать демо" }).click();
  await expect(page.getByText("Сегодня можно потратить")).toBeVisible();
};

test("demo login opens Dashboard", async ({ page }) => {
  await demoLogin(page);
  await expect(page.getByText("План недели")).toBeVisible();
});

test("registration and onboarding open the app", async ({ page }) => {
  await clearApp(page);
  await page.locator("button").filter({ hasText: "Создать локальный профиль" }).click();
  await page.getByLabel("Имя").fill("Тест");
  await page.getByLabel("Email").fill(`test-${Date.now()}@money.local`);
  await page.getByLabel("Пароль").fill("secret123");
  await page.locator("form").getByRole("button", { name: "Создать локальный профиль" }).click();
  await expect(page.getByText("С чего начнём?")).toBeVisible();
  await page.getByRole("button", { name: "Начать с нуля" }).click();
  await expect(page.getByText("Сегодня можно потратить")).toBeVisible();
});

test("Quick Add creates coffee expense", async ({ page }) => {
  await demoLogin(page);
  await page.getByRole("button", { name: "Добавить" }).click();
  await page.getByPlaceholder("Быстрый ввод: кофе 250").fill("кофе 250");
  await page.evaluate(() => {
    [...document.querySelectorAll("button")].find((button) => button.textContent?.trim() === "OK")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  await expect(page.getByText("Расход добавлен")).toBeVisible();
});

test("PIN lock opens and unlocks", async ({ page }) => {
  await demoLogin(page);
  await page.evaluate(async () => {
    const users = JSON.parse(localStorage.getItem("money-control-users") || "[]");
    users[0] = { ...users[0], pin: "1234" };
    localStorage.setItem("money-control-users", JSON.stringify(users));
  });
  await page.reload();
  await expect(page.getByText("Money Control закрыт")).toBeVisible();
  await page.locator("input[type='password']").fill("1234");
  await page.getByRole("button", { name: "Разблокировать" }).click();
  await expect(page.getByText("Сегодня можно потратить")).toBeVisible();
});

test("theme choice persists after reload", async ({ page }) => {
  await demoLogin(page);
  await page.goto("/?page=profile");
  await page.getByRole("button", { name: "Graphite Pro Строгий графитовый стиль" }).click();
  await page.reload();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("money-control-theme"))).toBe("graphite-pro");
});

test("JSON export and import work", async ({ page }, testInfo) => {
  await demoLogin(page);
  await page.goto("/?page=profile");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Экспорт JSON" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain("money-control-data");

  const importPath = join(testInfo.outputDir, "import.json");
  mkdirSync(testInfo.outputDir, { recursive: true });
  writeFileSync(importPath, JSON.stringify({ schemaVersion: 2, transactions: [], subscriptions: [], debts: [], goals: [], budgets: [], accounts: [] }));
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Импорт JSON/CSV" }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(importPath);
  await expect(page.getByText("Данные импортированы.")).toBeVisible({ timeout: 10_000 });
});

test("mobile bottom navigation stays fixed while scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await demoLogin(page);
  const before = await page.locator("nav.glass-bottom-nav").boundingBox();
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(150);
  const after = await page.locator("nav.glass-bottom-nav").boundingBox();
  expect(before).not.toBeNull();
  expect(after).not.toBeNull();
  expect(Math.round(after!.y)).toBe(Math.round(before!.y));
});

test("core product sections work", async ({ page }) => {
  await demoLogin(page);

  await page.goto("/?page=accounts");
  await expect(page.getByRole("heading", { name: "Счета", exact: true })).toBeVisible();
  await page.getByLabel("Название").fill("Тестовый счёт");
  await page.getByLabel("Стартовый баланс").fill("12345");
  await page.locator("form").getByRole("button", { name: "Добавить" }).click();
  await expect(page.getByText("Счёт создан")).toBeVisible();
  await expect(page.getByText("Тестовый счёт")).toBeVisible();

  await page.goto("/?page=income");
  await expect(page.getByRole("heading", { name: "Доходы", exact: true })).toBeVisible();
  await page.getByLabel("Сумма").fill("7777");
  await page.getByLabel("Комментарий").fill("E2E доход");
  await page.getByText("Регулярная операция").click();
  await page.locator("form").getByRole("button", { name: "Добавить" }).click();
  await expect(page.getByText("Доход добавлен")).toBeVisible();

  await page.goto("/?page=expenses");
  await expect(page.getByRole("heading", { name: "Расходы", exact: true })).toBeVisible();
  await page.getByLabel("Сумма").fill("333");
  await page.getByLabel("Комментарий").fill("E2E расход");
  await page.locator("form").getByRole("button", { name: "Добавить" }).click();
  await expect(page.getByText("Расход добавлен")).toBeVisible();

  await page.goto("/?page=subscriptions");
  await expect(page.getByRole("heading", { name: "Подписки", exact: true })).toBeVisible();
  await page.getByLabel("Название").fill("E2E подписка");
  await page.getByLabel("Стоимость").fill("499");
  await page.locator("form").getByRole("button", { name: "Добавить" }).click();
  await expect(page.getByText("Подписка добавлена")).toBeVisible();

  await page.goto("/?page=debts");
  await expect(page.getByRole("heading", { name: "Долги", exact: true })).toBeVisible();
  await page.getByLabel("Кому или от кого").fill("E2E человек");
  await page.getByLabel("Сумма").fill("1500");
  await page.locator("form").getByRole("button", { name: "Добавить" }).click();
  await expect(page.getByText("Долг добавлен")).toBeVisible();

  await page.goto("/?page=goals");
  await expect(page.getByRole("heading", { name: "Цели", exact: true })).toBeVisible();
  await page.getByLabel("Название").fill("E2E цель");
  await page.getByLabel("Нужная сумма").fill("10000");
  await page.getByLabel("Уже накоплено").fill("1000");
  await page.locator("form").getByRole("button", { name: "Добавить" }).click();
  await expect(page.getByText("Цель добавлена")).toBeVisible();

  await page.goto("/?page=budgets");
  await expect(page.getByRole("heading", { name: "Бюджеты", exact: true })).toBeVisible();
  await page.getByLabel("Лимит в месяц").fill("9999");
  await page.locator("form").getByRole("button", { name: "Добавить" }).click();
  await expect(page.getByText("Бюджет сохранён")).toBeVisible();

  await page.goto("/?page=calendar");
  await expect(page.getByRole("heading", { name: "Календарь платежей", exact: true })).toBeVisible();
  await expect(page.getByText("Cashflow до конца месяца")).toBeVisible();

  await page.goto("/?page=analytics");
  await expect(page.getByRole("heading", { name: "Аналитика", exact: true })).toBeVisible();
  const imageDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Сохранить как изображение" }).click();
  expect((await imageDownload).suggestedFilename()).toContain("month-wrapped");

  await page.goto("/?page=profile");
  await expect(page.getByRole("heading", { name: "Настройки", exact: true })).toBeVisible();
  await page.getByLabel("Пароль для защищённого backup").fill("secret123");
  const protectedDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Защищённый backup" }).click();
  expect((await protectedDownload).suggestedFilename()).toContain("protected-backup");
});
