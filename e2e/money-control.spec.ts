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
