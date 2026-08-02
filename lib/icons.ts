// Maps the icon key strings stored in the DB (achievements.icon, goals.icon)
// back to their lucide-react-native component. DB rows can't store a
// component reference, so this is the single place that bridges the two.
import {
  Clapperboard,
  CreditCard,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  Home,
  type LucideIcon,
  PiggyBank,
  Target,
  Utensils,
  Wallet,
  Zap,
} from "lucide-react-native";

export const ICON_BY_KEY: Record<string, LucideIcon> = {
  wallet: Wallet,
  zap: Zap,
  "piggy-bank": PiggyBank,
  "heart-pulse": HeartPulse,
  utensils: Utensils,
  "graduation-cap": GraduationCap,
  dumbbell: Dumbbell,
  "credit-card": CreditCard,
  home: Home,
  clapperboard: Clapperboard,
  target: Target,
};

export function iconForKey(key: string): LucideIcon {
  return ICON_BY_KEY[key] ?? Target;
}
