export type CurrencyCode = "PHP" | "USD" | "EUR" | "GBP" | "JPY";

export const CURRENCIES: Record<
  CurrencyCode,
  { symbol: string; label: string; decimals: number }
> = {
  PHP: { symbol: "₱", label: "Philippine Peso", decimals: 2 },
  USD: { symbol: "$", label: "US Dollar", decimals: 2 },
  EUR: { symbol: "€", label: "Euro", decimals: 2 },
  GBP: { symbol: "£", label: "British Pound", decimals: 2 },
  JPY: { symbol: "¥", label: "Japanese Yen", decimals: 0 },
};

export const DEFAULT_CURRENCY: CurrencyCode = "PHP";

/** XP needed to clear each level; index 0 is level 1. */
export const XP_CURVE = [0, 250, 600, 1100, 1800, 2700, 3900, 5400, 7200, 9400];

export const LEVEL_TITLES = [
  "Paycheck Rookie",
  "Budget Apprentice",
  "Receipt Wrangler",
  "Envelope Adept",
  "Cashflow Tactician",
  "Interest Whisperer",
  "Portfolio Pilot",
  "Compound Sage",
  "Net Worth Architect",
  "Financial Freedom",
];

export function levelFromXp(xp: number) {
  let level = 1;
  for (let i = XP_CURVE.length - 1; i >= 0; i--) {
    if (xp >= XP_CURVE[i]) {
      level = i + 1;
      break;
    }
  }
  const floor = XP_CURVE[level - 1] ?? 0;
  const ceil = XP_CURVE[level] ?? floor + 2000;
  return {
    level,
    title: LEVEL_TITLES[level - 1] ?? LEVEL_TITLES[LEVEL_TITLES.length - 1],
    floor,
    ceil,
    progress: Math.min(1, Math.max(0, (xp - floor) / (ceil - floor))),
  };
}
