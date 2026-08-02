import { CURRENCIES, type CurrencyCode } from "@/constants/config";

export function formatMoney(
  value: number,
  currency: CurrencyCode,
  opts: { compact?: boolean; signed?: boolean; decimals?: boolean } = {}
) {
  const { symbol, decimals } = CURRENCIES[currency];
  const abs = Math.abs(value);
  const sign = opts.signed ? (value < 0 ? "−" : "+") : value < 0 ? "−" : "";

  if (opts.compact && abs >= 1000) {
    const units: [number, string][] = [
      [1_000_000_000, "B"],
      [1_000_000, "M"],
      [1_000, "k"],
    ];
    for (const [div, suffix] of units) {
      if (abs >= div) {
        const n = abs / div;
        const str = n >= 100 ? n.toFixed(0) : n.toFixed(1).replace(/\.0$/, "");
        return `${sign}${symbol}${str}${suffix}`;
      }
    }
  }

  const places = opts.decimals === false ? 0 : decimals;
  const body = abs.toLocaleString("en-US", {
    minimumFractionDigits: places,
    maximumFractionDigits: places,
  });
  return `${sign}${symbol}${body}`;
}

export function formatPercent(value: number, places = 0) {
  return `${(value * 100).toFixed(places)}%`;
}

const DAY_MS = 86_400_000;

export function relativeDay(iso: string, now = new Date()) {
  const date = new Date(iso);
  const startOf = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((startOf(now) - startOf(date)) / DAY_MS);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return date.toLocaleDateString("en-US", { weekday: "long" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function timeOfDay(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function clamp(v: number, lo: number, hi: number) {
  "worklet";
  return Math.min(hi, Math.max(lo, v));
}
