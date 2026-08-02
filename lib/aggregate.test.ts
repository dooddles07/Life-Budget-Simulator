import {
  budgetsWithSpend,
  computeBudgetInsights,
  computeCurrentNetWorth,
  computeMonthDelta,
  computeNetWorthHistory,
  computeSpendByCategory,
  computeWeeklySpend,
  mergeAchievements,
  monthsAgoISO,
  startOfMonthISO,
} from "./aggregate";
import type { Achievement, UserAchievement } from "./data/achievements";
import type { Budget } from "./data/budgets";
import type { Transaction } from "./data/transactions";

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: "tx-1",
    user_id: "user-1",
    title: "Test",
    merchant: "Test merchant",
    amount: -100,
    category: "food",
    occurred_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function budget(overrides: Partial<Budget>): Budget {
  return {
    id: "budget-1",
    user_id: "user-1",
    category: "food",
    monthly_limit: 1000,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("computeSpendByCategory", () => {
  it("sums only outgoing (negative) transactions per category", () => {
    const totals = computeSpendByCategory([
      tx({ category: "food", amount: -100 }),
      tx({ category: "food", amount: -50 }),
      tx({ category: "transport", amount: -30 }),
      tx({ category: "food", amount: 500 }), // income, excluded
    ]);
    expect(totals.food).toBe(150);
    expect(totals.transport).toBe(30);
  });

  it("returns an empty record for no spend", () => {
    expect(computeSpendByCategory([])).toEqual({});
  });
});

describe("budgetsWithSpend", () => {
  it("attaches computed spend to each budget's category", () => {
    const result = budgetsWithSpend(
      [budget({ category: "food", monthly_limit: 1000 })],
      [tx({ category: "food", amount: -300 })],
    );
    expect(result[0].spent).toBe(300);
  });

  it("defaults spend to 0 when there are no matching transactions", () => {
    const result = budgetsWithSpend([budget({ category: "housing" })], []);
    expect(result[0].spent).toBe(0);
  });
});

describe("computeWeeklySpend", () => {
  it("buckets spend by weekday, Monday first", () => {
    // 2026-08-10 is a Monday
    const result = computeWeeklySpend([
      tx({ amount: -100, occurred_at: new Date(2026, 7, 10).toISOString() }),
    ]);
    expect(result[0].label).toBe("Mon");
    expect(result[0].value).toBe(100);
    expect(result).toHaveLength(7);
  });

  it("ignores income", () => {
    const result = computeWeeklySpend([
      tx({ amount: 500, occurred_at: new Date(2026, 7, 10).toISOString() }),
    ]);
    expect(result.every((d) => d.value === 0)).toBe(true);
  });
});

describe("computeCurrentNetWorth", () => {
  it("adds the sum of all transactions to the starting balance", () => {
    const net = computeCurrentNetWorth(
      [tx({ amount: 1000 }), tx({ amount: -200 }), tx({ amount: -50 })],
      5000,
    );
    expect(net).toBe(5750);
  });

  it("returns the starting balance unchanged with no transactions", () => {
    expect(computeCurrentNetWorth([], 5000)).toBe(5000);
  });
});

describe("computeMonthDelta", () => {
  it("sums only transactions from the current month", () => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 5).toISOString();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 5).toISOString();
    const delta = computeMonthDelta([
      tx({ amount: 200, occurred_at: thisMonth }),
      tx({ amount: -1000, occurred_at: lastMonth }),
    ]);
    expect(delta).toBe(200);
  });
});

describe("computeNetWorthHistory", () => {
  it("returns one point per requested month", () => {
    const result = computeNetWorthHistory([], 1000, 6);
    expect(result).toHaveLength(6);
    expect(result.every((p) => p.value === 1000)).toBe(true);
  });

  it("accumulates transactions into the running total across months", () => {
    const now = new Date();
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 1, 10).toISOString();
    const result = computeNetWorthHistory([tx({ amount: 500, occurred_at: twoMonthsAgo })], 1000, 3);
    expect(result[result.length - 1].value).toBe(1500);
  });
});

describe("computeBudgetInsights", () => {
  it("flags categories over their limit as bad", () => {
    const insights = computeBudgetInsights([
      { ...budget({ category: "food", monthly_limit: 1000 }), spent: 1200 },
    ]);
    expect(insights).toEqual([
      { id: "over-food", tone: "bad", category: "food", amount: 200 },
    ]);
  });

  it("flags categories at 80%+ of their limit as a warning", () => {
    const insights = computeBudgetInsights([
      { ...budget({ category: "transport", monthly_limit: 1000 }), spent: 850 },
    ]);
    expect(insights).toEqual([
      { id: "near-transport", tone: "warn", category: "transport", amount: 150 },
    ]);
  });

  it("ignores budgets under 80% and budgets with no limit set", () => {
    const insights = computeBudgetInsights([
      { ...budget({ category: "food", monthly_limit: 1000 }), spent: 100 },
      { ...budget({ category: "fun", monthly_limit: 0 }), spent: 500 },
    ]);
    expect(insights).toHaveLength(0);
  });

  it("sorts bad ahead of warn and caps at 3 results", () => {
    const insights = computeBudgetInsights([
      { ...budget({ category: "food", monthly_limit: 100 }), spent: 90 }, // warn
      { ...budget({ category: "transport", monthly_limit: 100 }), spent: 150 }, // bad
      { ...budget({ category: "housing", monthly_limit: 100 }), spent: 150 }, // bad
      { ...budget({ category: "bills", monthly_limit: 100 }), spent: 150 }, // bad
      { ...budget({ category: "shopping", monthly_limit: 100 }), spent: 90 }, // warn
    ]);
    expect(insights).toHaveLength(3);
    expect(insights.every((i, idx) => idx === 0 || insights[idx - 1].tone !== "warn" || i.tone === "warn")).toBe(true);
    expect(insights[0].tone).toBe("bad");
  });
});

describe("mergeAchievements", () => {
  const catalog: Achievement[] = [
    { id: "first-entry", title: "First entry", detail: "Log your first transaction", icon: "wallet", xp: 20 },
    { id: "streak-7", title: "7-day streak", detail: "Open 7 days in a row", icon: "zap", xp: 30 },
  ];

  it("marks achievements unlocked/progress from the user's rows", () => {
    const userAchievements: UserAchievement[] = [
      { user_id: "u1", achievement_id: "first-entry", unlocked: true, progress: 1, unlocked_at: new Date().toISOString() },
    ];
    const result = mergeAchievements(catalog, userAchievements);
    expect(result.find((a) => a.id === "first-entry")).toMatchObject({ unlocked: true, progress: 1 });
    expect(result.find((a) => a.id === "streak-7")).toMatchObject({ unlocked: false, progress: 0 });
  });

  it("defaults every achievement to locked/0 when the user has no rows", () => {
    const result = mergeAchievements(catalog, []);
    expect(result.every((a) => a.unlocked === false && a.progress === 0)).toBe(true);
    expect(result).toHaveLength(catalog.length);
  });
});

describe("startOfMonthISO / monthsAgoISO", () => {
  it("startOfMonthISO returns midnight on the 1st of the current month", () => {
    const d = new Date(startOfMonthISO());
    expect(d.getDate()).toBe(1);
    expect(d.getHours()).toBe(0);
  });

  it("monthsAgoISO returns midnight on the 1st, N months back", () => {
    const now = new Date();
    const d = new Date(monthsAgoISO(2));
    expect(d.getDate()).toBe(1);
    expect(d.getMonth()).toBe((now.getMonth() - 2 + 12) % 12);
  });
});
