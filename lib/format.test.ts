import { clamp, formatMoney, formatPercent, greeting, relativeDay, timeOfDay } from "./format";

describe("formatMoney", () => {
  it("formats a positive amount with symbol and decimals", () => {
    expect(formatMoney(1234.5, "PHP")).toBe("₱1,234.50");
  });

  it("respects a currency's decimal places", () => {
    expect(formatMoney(1234, "JPY")).toBe("¥1,234");
  });

  it("signs negative values with a minus, unsigned by default", () => {
    expect(formatMoney(-50, "USD")).toBe("−$50.00");
  });

  it("signs positive values with a plus when signed is requested", () => {
    expect(formatMoney(50, "USD", { signed: true })).toBe("+$50.00");
  });

  it("compacts large values with k/M/B suffixes", () => {
    expect(formatMoney(70500, "PHP", { compact: true })).toBe("₱70.5k");
    expect(formatMoney(1500000, "PHP", { compact: true })).toBe("₱1.5M");
  });

  it("does not compact values under 1000", () => {
    expect(formatMoney(999, "USD", { compact: true })).toBe("$999.00");
  });

  it("drops decimals when decimals: false", () => {
    expect(formatMoney(1234.5, "PHP", { decimals: false })).toBe("₱1,235");
  });
});

describe("formatPercent", () => {
  it("formats a 0-1 fraction as a whole-number percent by default", () => {
    expect(formatPercent(0.42)).toBe("42%");
  });

  it("respects a custom decimal place count", () => {
    expect(formatPercent(0.4256, 1)).toBe("42.6%");
  });
});

describe("relativeDay", () => {
  const now = new Date(2026, 7, 15); // Aug 15, 2026 (Saturday)

  it("labels the same day as Today", () => {
    expect(relativeDay(new Date(2026, 7, 15, 9).toISOString(), now)).toBe("Today");
  });

  it("labels the previous day as Yesterday", () => {
    expect(relativeDay(new Date(2026, 7, 14, 9).toISOString(), now)).toBe("Yesterday");
  });

  it("labels 2-6 days back with a weekday name", () => {
    expect(relativeDay(new Date(2026, 7, 10, 9).toISOString(), now)).toBe("Monday");
  });

  it("labels 7+ days back with month/day", () => {
    expect(relativeDay(new Date(2026, 6, 20, 9).toISOString(), now)).toBe("Jul 20");
  });
});

describe("timeOfDay", () => {
  it("formats an ISO timestamp as a 12-hour time", () => {
    expect(timeOfDay(new Date(2026, 7, 15, 14, 5).toISOString())).toBe("2:05 PM");
  });
});

describe("greeting", () => {
  it("greets morning hours", () => {
    expect(greeting(new Date(2026, 7, 15, 8))).toBe("Good morning");
  });

  it("greets afternoon hours", () => {
    expect(greeting(new Date(2026, 7, 15, 14))).toBe("Good afternoon");
  });

  it("greets evening hours", () => {
    expect(greeting(new Date(2026, 7, 15, 20))).toBe("Good evening");
  });
});

describe("clamp", () => {
  it("passes values already in range through unchanged", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("clamps values below the range to the minimum", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("clamps values above the range to the maximum", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});
