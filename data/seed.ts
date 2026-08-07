/**
 * Static demo data. No persistence -- every launch replays the same month
 * so screenshots and demos stay reproducible.
 */

import type { IconComponent } from "@/lib/lucide-icons";
import {
  Bus,
  Clapperboard,
  CreditCard,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  Home,
  PiggyBank,
  ShoppingBag,
  Utensils,
  Wallet,
  Zap,
} from "@/lib/lucide-icons";

export type CategoryId =
  | "food"
  | "transport"
  | "housing"
  | "fun"
  | "shopping"
  | "health"
  | "bills"
  | "learning";

export type Category = {
  id: CategoryId;
  label: string;
  icon: IconComponent;
  /** Index into Palette.categories -- stable across themes. */
  swatch: number;
};

export const CATEGORIES: Category[] = [
  { id: "food", label: "Food", icon: Utensils, swatch: 0 },
  { id: "transport", label: "Transport", icon: Bus, swatch: 1 },
  { id: "housing", label: "Housing", icon: Home, swatch: 2 },
  { id: "fun", label: "Fun", icon: Clapperboard, swatch: 3 },
  { id: "shopping", label: "Shopping", icon: ShoppingBag, swatch: 4 },
  { id: "health", label: "Health", icon: HeartPulse, swatch: 5 },
  { id: "bills", label: "Bills", icon: Zap, swatch: 6 },
  { id: "learning", label: "Learning", icon: GraduationCap, swatch: 7 },
];

export const CATEGORY_MAP: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
) as Record<CategoryId, Category>;

export type Transaction = {
  id: string;
  title: string;
  merchant: string;
  amount: number; // negative = expense, positive = income
  category: CategoryId;
  date: string; // ISO
  /** Marks a choice the Simulator can replay as a what-if. */
  simulated?: boolean;
};

/** Anchored to "now" so the list always reads as the current month. */
const now = new Date();
const at = (daysAgo: number, hour: number, minute = 0) => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const TRANSACTIONS: Transaction[] = [
  { id: "t01", title: "Cold brew + pandesal", merchant: "Kuya's Coffee", amount: -185, category: "food", date: at(0, 8, 15) },
  { id: "t02", title: "Ride to office", merchant: "Grab", amount: -240, category: "transport", date: at(0, 9, 2) },
  { id: "t03", title: "Team lunch", merchant: "Mesa Filipina", amount: -640, category: "food", date: at(0, 12, 30) },
  { id: "t04", title: "Gym day pass", merchant: "Anytime Fitness", amount: -350, category: "health", date: at(0, 19, 10) },

  { id: "t05", title: "Groceries run", merchant: "S&R", amount: -3480, category: "food", date: at(1, 11, 5) },
  { id: "t06", title: "Streaming bundle", merchant: "Netflix", amount: -549, category: "fun", date: at(1, 14, 0) },
  { id: "t07", title: "Cold brew", merchant: "Kuya's Coffee", amount: -185, category: "food", date: at(1, 8, 20) },

  { id: "t08", title: "Freelance payout", merchant: "Upwork", amount: 18500, category: "bills", date: at(2, 10, 0) },
  { id: "t09", title: "Electricity", merchant: "Meralco", amount: -2870, category: "bills", date: at(2, 15, 40) },
  { id: "t10", title: "Cold brew", merchant: "Kuya's Coffee", amount: -185, category: "food", date: at(2, 8, 12) },

  { id: "t11", title: "New running shoes", merchant: "Nike", amount: -5200, category: "shopping", date: at(3, 16, 25) },
  { id: "t12", title: "Jeepney + MRT", merchant: "Beep Card", amount: -96, category: "transport", date: at(3, 7, 45) },
  { id: "t13", title: "Cold brew", merchant: "Kuya's Coffee", amount: -185, category: "food", date: at(3, 8, 30) },

  { id: "t14", title: "Design course", merchant: "Coursera", amount: -1750, category: "learning", date: at(4, 20, 0) },
  { id: "t15", title: "Dinner with friends", merchant: "Ramen Nagi", amount: -890, category: "food", date: at(4, 19, 15) },
  { id: "t16", title: "Fuel", merchant: "Shell", amount: -1500, category: "transport", date: at(4, 17, 5) },

  { id: "t17", title: "Rent", merchant: "Landlord", amount: -16000, category: "housing", date: at(5, 9, 0) },
  { id: "t18", title: "Internet", merchant: "Converge", amount: -1699, category: "bills", date: at(5, 9, 30) },
  { id: "t19", title: "Cold brew", merchant: "Kuya's Coffee", amount: -185, category: "food", date: at(5, 8, 18) },

  { id: "t20", title: "Salary", merchant: "Acme Corp", amount: 52000, category: "bills", date: at(6, 9, 0) },
  { id: "t21", title: "Movie night", merchant: "SM Cinema", amount: -680, category: "fun", date: at(6, 20, 30) },
  { id: "t22", title: "Pharmacy", merchant: "Mercury Drug", amount: -430, category: "health", date: at(6, 13, 20) },

  { id: "t23", title: "Weekend market", merchant: "Salcedo Market", amount: -1240, category: "food", date: at(7, 10, 15) },
  { id: "t24", title: "Concert tickets", merchant: "SM Tickets", amount: -3500, category: "fun", date: at(7, 21, 0) },
  { id: "t25", title: "Phone plan", merchant: "Globe", amount: -1299, category: "bills", date: at(8, 12, 0) },
  { id: "t26", title: "Cold brew", merchant: "Kuya's Coffee", amount: -185, category: "food", date: at(8, 8, 25) },
  { id: "t27", title: "Book haul", merchant: "Fully Booked", amount: -2100, category: "learning", date: at(9, 15, 45) },
  { id: "t28", title: "Grab ride", merchant: "Grab", amount: -310, category: "transport", date: at(9, 18, 30) },
  { id: "t29", title: "Water bill", merchant: "Maynilad", amount: -640, category: "bills", date: at(10, 11, 0) },
  { id: "t30", title: "Cold brew", merchant: "Kuya's Coffee", amount: -185, category: "food", date: at(10, 8, 10) },
];

export type Budget = {
  id: string;
  category: CategoryId;
  limit: number;
  spent: number;
};

export const BUDGETS: Budget[] = [
  { id: "b1", category: "food", limit: 12000, spent: 7175 },
  { id: "b2", category: "transport", limit: 4000, spent: 2146 },
  { id: "b3", category: "housing", limit: 16000, spent: 16000 },
  { id: "b4", category: "fun", limit: 4000, spent: 4729 },
  { id: "b5", category: "shopping", limit: 5000, spent: 5200 },
  { id: "b6", category: "health", limit: 2500, spent: 780 },
  { id: "b7", category: "bills", limit: 8000, spent: 6508 },
  { id: "b8", category: "learning", limit: 4000, spent: 3850 },
];

export type Goal = {
  id: string;
  title: string;
  target: number;
  saved: number;
  monthly: number;
  icon: IconComponent;
  accentIndex: number;
};

export const GOALS: Goal[] = [
  { id: "g1", title: "Emergency fund", target: 180000, saved: 112400, monthly: 8000, icon: PiggyBank, accentIndex: 2 },
  { id: "g2", title: "Travel fund", target: 120000, saved: 43600, monthly: 6000, icon: Clapperboard, accentIndex: 0 },
  { id: "g3", title: "New gadget", target: 95000, saved: 71250, monthly: 5000, icon: CreditCard, accentIndex: 1 },
  { id: "g4", title: "Down payment", target: 900000, saved: 96000, monthly: 12000, icon: Home, accentIndex: 6 },
];

export type Achievement = {
  id: string;
  title: string;
  detail: string;
  icon: IconComponent;
  unlocked: boolean;
  /** 0-1, only meaningful while locked. */
  progress: number;
  xp: number;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "a1", title: "First Entry", detail: "Log your first expense", icon: Wallet, unlocked: true, progress: 1, xp: 25 },
  { id: "a2", title: "Week Streak", detail: "Log 7 days in a row", icon: Zap, unlocked: true, progress: 1, xp: 60 },
  { id: "a3", title: "Under Budget", detail: "Finish a month under every envelope", icon: PiggyBank, unlocked: true, progress: 1, xp: 120 },
  { id: "a4", title: "Goal Getter", detail: "Hit your first savings goal", icon: HeartPulse, unlocked: false, progress: 0.62, xp: 150 },
  { id: "a5", title: "Coffee Quitter", detail: "Skip 10 coffee runs", icon: Utensils, unlocked: false, progress: 0.4, xp: 90 },
  { id: "a6", title: "Simulator", detail: "Run 5 what-if scenarios", icon: GraduationCap, unlocked: false, progress: 0.8, xp: 80 },
  { id: "a7", title: "Iron Discipline", detail: "30 day logging streak", icon: Dumbbell, unlocked: false, progress: 0.4, xp: 250 },
  { id: "a8", title: "Six Figures", detail: "Reach ₱100k net worth", icon: CreditCard, unlocked: true, progress: 1, xp: 200 },
  { id: "a9", title: "Debt Free", detail: "Clear every liability", icon: Home, unlocked: false, progress: 0.15, xp: 400 },
];

export type Persona = {
  id: string;
  label: string;
  blurb: string;
  income: number;
  icon: IconComponent;
};

export const PERSONAS: Persona[] = [
  { id: "student", label: "Student", blurb: "Allowance, dorm life, tight margins", income: 12000, icon: GraduationCap },
  { id: "grad", label: "Fresh Grad", blurb: "First salary, first rent, first mistakes", income: 32000, icon: Wallet },
  { id: "hustler", label: "Side Hustler", blurb: "Day job plus freelance income", income: 70500, icon: Zap },
  { id: "provider", label: "Provider", blurb: "Family budget, long horizon", income: 110000, icon: Home },
];

/** Baseline the Simulator perturbs. */
export const PROFILE = {
  name: "Alex",
  handle: "@dooddles",
  xp: 3120,
  streakDays: 12,
  netWorth: 268400,
  monthlyIncome: 70500,
  monthlyFixed: 22638, // rent, bills, subscriptions
  monthlyVariable: 19850, // food, transport, fun, shopping
  coffeePerMonth: 1665, // 9 runs x 185
  subscriptions: [
    { id: "s1", name: "Netflix", cost: 549 },
    { id: "s2", name: "Spotify", cost: 194 },
    { id: "s3", name: "iCloud", cost: 149 },
    { id: "s4", name: "Gym", cost: 1800 },
    { id: "s5", name: "Coursera", cost: 1750 },
  ],
};

export const WEEKLY_SPEND = [
  { label: "Mon", value: 1420 },
  { label: "Tue", value: 2860 },
  { label: "Wed", value: 980 },
  { label: "Thu", value: 4210 },
  { label: "Fri", value: 3640 },
  { label: "Sat", value: 5180 },
  { label: "Sun", value: 2240 },
];

/** Trailing 6 months of net worth -- the Simulator extends from the last point. */
export const NET_WORTH_HISTORY = [
  { label: "Mar", value: 198000 },
  { label: "Apr", value: 214500 },
  { label: "May", value: 226800 },
  { label: "Jun", value: 241200 },
  { label: "Jul", value: 252900 },
  { label: "Aug", value: 268400 },
];
