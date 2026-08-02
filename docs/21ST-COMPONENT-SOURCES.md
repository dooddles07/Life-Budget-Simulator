# 21st.dev Component Sources

Every component below was retrieved from the 21st.dev MCP catalogue and ported to React Native. The originals are web components (React DOM + Tailwind + Framer Motion) and cannot run in React Native, so each port keeps the source's layout, proportions, and motion parameters while swapping the runtime.

| Ported to | Source | 21st.dev URL |
|---|---|---|
| `components/nav/TabBar.tsx` | Bottom Nav Bar — @arunachalam | https://21st.dev/@arunachalam/components/bottom-nav-bar |
| `components/money/NumberTicker.tsx` | Number Ticker Currency Counter — @shadcnspace | https://21st.dev/@shadcnspace/components/number-ticker-02 |
| `components/ui/SegmentedBar.tsx` | Spending Limit Card — @lavikatiyar | https://21st.dev/@lavikatiyar/components/card-8 |
| `app/(tabs)/budgets.tsx` (`EnvelopeCard`) | Spending Limit Card — @lavikatiyar | https://21st.dev/@lavikatiyar/components/card-8 |
| `components/ui/ProgressRing.tsx` | Financial Score Cards — @designali-in | https://21st.dev/@designali-in/components/financial-score-cards |
| `components/charts/BarChart.tsx` | Weekly Expense Card — @ravikatiyar162 | https://21st.dev/@ravikatiyar162/components/card-20 |

## What changed in each port

### Bottom Nav Bar → `TabBar.tsx`
**Kept:** pill container, tinted active pill behind the icon, label that expands horizontally out of the icon on activation, `whileTap` press feedback.
**Motion parameters carried over verbatim:** label width spring `stiffness: 350, damping: 32`; opacity crossfade ~190ms.
**Changed:**
- `framer-motion` → Reanimated `useDerivedValue` + `withSpring`; `whileTap` → the shared `Pressable` press scale.
- `lucide-react` → `lucide-react-native`.
- Tailwind classes → theme tokens from `constants/theme.ts`.
- Label width reduced 78 → 56pt. The original assumes a 6-item scrolling bar; at 390pt with 4 tabs plus a centre FAB, 78 pushed the fourth tab outside the pill.
- Added the centre FAB, `expo-blur` backdrop on native, and safe-area bottom inset. Neither exists in the original.

### Number Ticker → `NumberTicker.tsx`
**Kept:** the rolling-value behaviour, currency formatting, fixed decimal places.
**Changed:** the original delegates entirely to `@number-flow/react`, a DOM-only library. Replaced with a Reanimated shared value driving an uneditable `TextInput` via `useAnimatedProps` — the standard RN technique for animating text off the JS thread. `toLocaleString` is unavailable inside a worklet, so thousands grouping is done with a regex. Added an accessible wrapper carrying the settled value, so a screen reader announces a stable number rather than a mid-tween one.

### Spending Limit Card → `SegmentedBar.tsx` + `EnvelopeCard`
**Kept:** N discrete segments filled proportionally, staggered entrance, headline amount with a muted "of {limit}" suffix, `role="progressbar"` with min/max/now.
**Motion parameters carried over:** per-segment stagger (original `staggerChildren: 0.08`, here a 28ms Reanimated delay per index).
**Changed:** Framer variants → per-segment Reanimated springs on `scaleY` and opacity, so the layout box stays fixed. Added an overflow colour for segments past 100%, and a status line that pairs colour with an icon and text so over-budget survives greyscale and colour-blindness.

### Financial Score Cards → `ProgressRing.tsx`
**Kept:** the half-circle gauge and its animate-on-mount stroke fill.
**Changed:** CSS/SVG → `react-native-svg` with an animated `strokeDashoffset`. Generalised `sweep` so the same component serves both a full ring and a 260° gauge, and added a gradient stroke.

### Weekly Expense Card → `BarChart.tsx`
**Kept:** staggered bar growth and the themeable palette.
**Changed:** the original renders a bubble chart with Framer Motion; this is a bar chart with the same staggered-entrance feel (55ms per index) driven by Reanimated springs on height. Added tap-to-isolate with a dimmed non-active state and per-bar accessibility labels.

## Tier

The 21st.dev account is on the paid tier (`get_usage` → `"tier": "paid"`, no retrieval cap), so component retrieval was unmetered. Search first for anything else you need rather than hand-rolling it:

```bash
# via MCP: mcp__21st__search { query: "...", type: "component" }
```
