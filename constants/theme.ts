/**
 * Neon Life-Sim design tokens.
 * Dark is the primary theme; light is a full parallel set, not a derivation.
 * Contrast ratios noted inline were checked against their own surface.
 */

export type ThemeName = "dark" | "light";

export type Palette = {
  bg: string;
  bgElevated: string;
  surface: string;
  surfaceElevated: string;
  surfacePressed: string;
  primary: string;
  primaryBright: string;
  primaryMutedBg: string;
  onPrimary: string;
  accent: string;
  onAccent: string;
  success: string;
  danger: string;
  warning: string;
  fg: string;
  fgMuted: string;
  fgFaint: string;
  border: string;
  borderStrong: string;
  scrim: string;
  /** Category swatches -- index-stable, never reordered. */
  categories: string[];
};

const dark: Palette = {
  bg: "#08080F",
  bgElevated: "#0D0D18",
  surface: "#12121F",
  surfaceElevated: "#1A1A2E",
  surfacePressed: "#252540",
  primary: "#7C3AED",
  primaryBright: "#A78BFA",
  primaryMutedBg: "rgba(124,58,237,0.16)",
  onPrimary: "#FFFFFF",
  accent: "#A3E635",
  onAccent: "#08080F",
  success: "#22C55E",
  danger: "#F43F5E",
  warning: "#FBBF24",
  fg: "#F5F5FA", // 18.1:1 on bg
  fgMuted: "#9E9EBB", // 7.4:1 on bg
  fgFaint: "#6C6C88", // 3.6:1 on bg -- decorative/disabled only
  border: "rgba(255,255,255,0.09)",
  borderStrong: "rgba(255,255,255,0.18)",
  scrim: "rgba(0,0,0,0.62)",
  categories: [
    "#A78BFA",
    "#22D3EE",
    "#A3E635",
    "#FBBF24",
    "#F472B6",
    "#FB923C",
    "#34D399",
    "#818CF8",
  ],
};

const light: Palette = {
  bg: "#F6F6FB",
  bgElevated: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  surfacePressed: "#ECECF5",
  primary: "#6D28D9", // darkened for 4.5:1 white text
  primaryBright: "#7C3AED",
  primaryMutedBg: "rgba(109,40,217,0.10)",
  onPrimary: "#FFFFFF",
  accent: "#4D7C0F", // lime is unreadable on white; olive keeps the hue, gains contrast
  onAccent: "#FFFFFF",
  success: "#15803D",
  danger: "#BE123C",
  warning: "#B45309",
  fg: "#111122", // 16.7:1 on bg
  fgMuted: "#55556E", // 7.6:1 on bg
  fgFaint: "#83839C", // 3.7:1 on bg -- decorative/disabled only
  border: "rgba(17,17,34,0.10)",
  borderStrong: "rgba(17,17,34,0.20)",
  scrim: "rgba(10,10,20,0.55)",
  categories: [
    "#6D28D9",
    "#0E7490",
    "#4D7C0F",
    "#B45309",
    "#BE185D",
    "#C2410C",
    "#047857",
    "#4338CA",
  ],
};

export const palettes: Record<ThemeName, Palette> = { dark, light };

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const iconSize = {
  sm: 16,
  md: 24,
  lg: 32,
} as const;

/** One stroke width across the whole app -- mixing weights reads as sloppy. */
export const ICON_STROKE = 1.75;

/** Platform minimum tappable area. Anything smaller needs hitSlop. */
export const TAP_MIN = 44;

export const font = {
  display: "Outfit_700Bold",
  displayMd: "Outfit_600SemiBold",
  body: "PlusJakartaSans_400Regular",
  bodyMd: "PlusJakartaSans_500Medium",
  bodySb: "PlusJakartaSans_600SemiBold",
  bodyBold: "PlusJakartaSans_700Bold",
} as const;

export const type = {
  display: { fontFamily: font.display, fontSize: 40, lineHeight: 44 },
  h1: { fontFamily: font.display, fontSize: 32, lineHeight: 38 },
  h2: { fontFamily: font.displayMd, fontSize: 24, lineHeight: 30 },
  h3: { fontFamily: font.bodySb, fontSize: 20, lineHeight: 26 },
  body: { fontFamily: font.body, fontSize: 16, lineHeight: 24 },
  bodyMd: { fontFamily: font.bodyMd, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: font.bodyMd, fontSize: 14, lineHeight: 20 },
  labelSb: { fontFamily: font.bodySb, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: font.body, fontSize: 12, lineHeight: 16 },
  captionSb: { fontFamily: font.bodySb, fontSize: 12, lineHeight: 16 },
} as const;

/**
 * Motion vocabulary. Every consumer must gate these behind useMotion(),
 * which collapses durations to 0 when reduced motion is on.
 */
export const motion = {
  press: 90,
  micro: 180,
  standard: 260,
  emphasis: 420,
  counter: 620,
  stagger: 45,
  spring: { damping: 20, stiffness: 180, mass: 0.9 },
  springSoft: { damping: 24, stiffness: 120, mass: 1 },
} as const;

export const PRESS_SCALE = 0.96;
