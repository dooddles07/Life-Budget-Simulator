// Maps the icon key strings stored in the DB (achievements.icon, goals.icon)
// back to their icon component. DB rows can't store a component reference,
// so this is the single place that bridges the two.
import {
  Clapperboard,
  CreditCard,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  House,
  type IconComponent,
  PiggyBank,
  Target,
  Utensils,
  Wallet,
  Zap,
} from "@/lib/lucide-icons";

export type { IconComponent };

export const ICON_BY_KEY: Record<string, IconComponent> = {
  wallet: Wallet,
  zap: Zap,
  "piggy-bank": PiggyBank,
  "heart-pulse": HeartPulse,
  utensils: Utensils,
  "graduation-cap": GraduationCap,
  dumbbell: Dumbbell,
  "credit-card": CreditCard,
  home: House,
  clapperboard: Clapperboard,
  target: Target,
};

export function iconForKey(key: string): IconComponent {
  return ICON_BY_KEY[key] ?? Target;
}
