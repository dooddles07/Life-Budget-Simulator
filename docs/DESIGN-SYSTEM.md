# Life Budget Simulator — Design System

Theme name: **Neon Life-Sim**. The product name promises a simulation, so the interface is built like a game HUD over a finance app: levels, XP, streaks, and a what-if engine, rendered on OLED black with an electric violet and lime accent pair.

Source of truth: [`constants/theme.ts`](../constants/theme.ts). Tailwind mirrors the palette in [`tailwind.config.js`](../tailwind.config.js) — change both together.

## Colour

Dark is the primary theme. Light is a full parallel set, not a derivation: lime `#A3E635` is unreadable on white, so light mode substitutes olive `#4D7C0F`, and violet darkens to `#6D28D9` to hold 4.5:1 against white text.

| Token | Dark | Light | Use |
|---|---|---|---|
| `bg` | `#08080F` | `#F6F6FB` | app base |
| `bgElevated` | `#0D0D18` | `#FFFFFF` | raised base |
| `surface` | `#12121F` | `#FFFFFF` | cards |
| `surfaceElevated` | `#1A1A2E` | `#FFFFFF` | sheets, modals |
| `surfacePressed` | `#252540` | `#ECECF5` | tracks, pressed fills |
| `primary` | `#7C3AED` | `#6D28D9` | brand, FAB, active nav |
| `primaryBright` | `#A78BFA` | `#7C3AED` | text-on-dark, glow stop |
| `accent` | `#A3E635` | `#4D7C0F` | XP, gains, hero numbers |
| `success` | `#22C55E` | `#15803D` | income |
| `danger` | `#F43F5E` | `#BE123C` | overspend, destructive |
| `warning` | `#FBBF24` | `#B45309` | 80% budget threshold, streaks |
| `fg` | `#F5F5FA` | `#111122` | body text |
| `fgMuted` | `#9E9EBB` | `#55556E` | secondary text |
| `fgFaint` | `#6C6C88` | `#83839C` | decorative/disabled only |
| `border` | `rgba(255,255,255,.09)` | `rgba(17,17,34,.10)` | dividers |
| `scrim` | `rgba(0,0,0,.62)` | `rgba(10,10,20,.55)` | modal backdrop |

`categories[0..7]` is an index-stable swatch array. A category's colour is its index, so reordering the array recolours the whole app — don't.

### Verified contrast

Every foreground token was checked against all three surfaces in both themes. Body-weight tokens target 4.5:1; `fgFaint` is decorative/disabled only and targets 3:1.

**Zero failures.** Tightest pairs: `danger` on `surfaceElevated` (dark) 4.65:1; `accent`/`success`/`warning` on `bg` (light) 4.64–4.66:1.

## Typography

- **Outfit** — display, headings, hero money figures
- **Plus Jakarta Sans** — body, labels, UI

Scale: Display 40/44 · H1 32/38 · H2 24/30 · H3 20/26 · Body 16/24 · Label 14/20 · Caption 12/16. Nothing below 12.

Every money figure sets `fontVariant: ['tabular-nums']` so digits hold their width — otherwise counters jitter as they roll and list amounts fail to align.

## Spacing and shape

4/8 rhythm: `4, 8, 12, 16, 24, 32, 48`. Radii `sm 12 / md 16 / lg 24 / xl 32 / pill 999`. Icons `sm 16 / md 24 / lg 32`, Lucide only, stroke **1.75** everywhere. No emoji is used as an icon anywhere in the app.

`TAP_MIN = 44` — the `Pressable` primitive applies it automatically unless `noMinSize` is set, in which case the component sets its own ≥44 box.

## Motion

All motion is gated through [`hooks/useMotion.ts`](../hooks/useMotion.ts). When reduced motion is on — from the OS or the Profile toggle — durations collapse to 0 and springs become instant timings. Values still land on their targets, so layout and state never desync.

| Pattern | Spec |
|---|---|
| Press feedback | scale 0.96, 90ms, no layout-bound change |
| Micro-interaction | 180ms, `Easing.out(Easing.cubic)` |
| Standard | 260ms |
| Emphasis / unlock burst | 420ms |
| Counter roll | 620ms, `Easing.out(Easing.exp)` |
| List stagger | 45ms per index, capped at 12 |
| Default spring | `damping 20, stiffness 180, mass 0.9` |
| Bouncy (XP, goals) | `damping 12, stiffness 140` |
| Soft (progress) | `damping 24, stiffness 120` |

## Accessibility notes specific to this codebase

`react-native-web@0.21` **drops `accessibilityState` and `accessibilityValue`** — neither reaches the DOM. Every stateful control therefore passes the `aria-*` form as well (`aria-selected`, `aria-checked`, `aria-pressed`, `aria-disabled`, `aria-busy`, `aria-valuenow`/`min`/`max`/`valuetext`). React Native core maps `aria-*` natively, so this stays a single source of truth rather than a web-only patch.

Status is never colour-only. Over-budget is colour **+** a `TriangleAlert` icon **+** the text "₱x over"; insight tone changes the icon (`TriangleAlert` / `Lightbulb` / `TrendingDown`), not just the hue.
