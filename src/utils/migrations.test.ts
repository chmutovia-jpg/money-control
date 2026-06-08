import { describe, expect, it } from "vitest";
import { CURRENT_SCHEMA_VERSION, migrateFinanceState } from "./migrations";

describe("finance migrations", () => {
  it("creates a default account for legacy data", () => {
    const state = migrateFinanceState({ transactions: [], subscriptions: [] });
    expect(state.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(state.accounts).toHaveLength(1);
    expect(state.accounts[0].name).toBe("Основной");
  });

  it("links legacy transactions to the default account", () => {
    const state = migrateFinanceState({
      transactions: [{ id: "t1", type: "expense", amount: 250, category: "еда", date: "2026-06-08" }],
    });
    expect(state.transactions[0].accountId).toBe(state.accounts[0].id);
  });

  it("sets default subscription usage status", () => {
    const state = migrateFinanceState({
      subscriptions: [{ id: "s1", name: "Music", amount: 299, period: "monthly", nextPaymentDate: "2026-06-10", category: "развлечения", isActive: true }],
    });
    expect(state.subscriptions[0].usageStatus).toBe("using");
  });
});
