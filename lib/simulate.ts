import { NET_WORTH_HISTORY, PROFILE } from "@/data/seed";

export type Scenario = {
  /** Share of coffee runs cut, 0-100. */
  coffeeCut: number;
  /** Rent change in percent, -20 to +30. */
  rentDelta: number;
  /** Extra monthly income from a side hustle. */
  sideHustle: number;
  /** How many of the current subscriptions to keep. */
  subscriptions: number;
  /** Share of leftover cash actually saved rather than spent, 0-100. */
  savingsRate: number;
};

export const BASE_SCENARIO: Scenario = {
  coffeeCut: 0,
  rentDelta: 0,
  sideHustle: 0,
  subscriptions: PROFILE.subscriptions.length,
  savingsRate: 55,
};

const RENT = 16000;
const MONTHS = 12;
/** Nominal annual return on savings, applied monthly. */
const MONTHLY_RETURN = 0.05 / 12;

export type Projection = {
  points: { label: string; value: number }[];
  monthlySurplus: number;
  finalValue: number;
  /** Change versus the untouched baseline at month 12. */
  delta: number;
  /** Month index where the balance first goes negative, or null. */
  breakEvenMonth: number | null;
};

function monthLabel(offset: number) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return d.toLocaleDateString("en-US", { month: "short" });
}

export function project(scenario: Scenario): Projection {
  const subsAll = PROFILE.subscriptions;
  const keptSubs = subsAll
    .slice(0, Math.max(0, Math.min(subsAll.length, scenario.subscriptions)))
    .reduce((s, sub) => s + sub.cost, 0);
  const allSubs = subsAll.reduce((s, sub) => s + sub.cost, 0);

  const coffeeSaved = PROFILE.coffeePerMonth * (scenario.coffeeCut / 100);
  const rentChange = RENT * (scenario.rentDelta / 100);
  const subsSaved = allSubs - keptSubs;

  const income = PROFILE.monthlyIncome + scenario.sideHustle;
  const outgoing =
    PROFILE.monthlyFixed + PROFILE.monthlyVariable + rentChange - coffeeSaved - subsSaved;

  const surplus = income - outgoing;
  const invested = surplus * (scenario.savingsRate / 100);

  const start = NET_WORTH_HISTORY[NET_WORTH_HISTORY.length - 1].value;
  const points: { label: string; value: number }[] = [
    { label: monthLabel(0), value: start },
  ];

  let balance = start;
  let breakEvenMonth: number | null = null;

  for (let m = 1; m <= MONTHS; m++) {
    balance = balance * (1 + MONTHLY_RETURN) + invested;
    if (balance < 0 && breakEvenMonth === null) breakEvenMonth = m;
    points.push({ label: monthLabel(m), value: Math.round(balance) });
  }

  return {
    points,
    monthlySurplus: Math.round(surplus),
    finalValue: Math.round(balance),
    delta: 0,
    breakEvenMonth,
  };
}

/** Baseline projection, computed once -- every scenario is measured against it. */
export const BASELINE = project(BASE_SCENARIO);

export function projectAgainstBaseline(scenario: Scenario): Projection {
  const result = project(scenario);
  return { ...result, delta: result.finalValue - BASELINE.finalValue };
}
