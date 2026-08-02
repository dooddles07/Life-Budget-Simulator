# Activity Log

## 2026-08-01 / 2026-08-02 — Initial build

Built the full app UI from an empty directory: Expo SDK 57 scaffold, design system, 10 screens, verification.

### Stack decision

The request named two tools: the 21st.dev MCP and `motion` (motiondivision/motion). Both were verified before planning:

- `motion@12.43.0` peer-depends on `react-dom`; every export path is DOM-based. **No React Native renderer exists.**
- 21st.dev ships web JSX + Tailwind + Framer Motion. Does not run in RN.

This tradeoff was put to the user, who chose Expo/React Native anyway. Resolution:

- **21st.dev** is used as the component source of record — real component code retrieved and ported to RN, logged in [21ST-COMPONENT-SOURCES.md](21ST-COMPONENT-SOURCES.md). Account is paid tier, so retrieval was unmetered.
- **`motion`** is installed as requested and used where it genuinely runs: the Expo **web** target, via Metro's `.web.tsx` platform resolution, in `components/device-frame/DeviceFrame.web.tsx`.
- All 10 screens animate with **Reanimated 4**, which runs on native and web — one animation codebase, not two.

### Build order

1. Scaffolded `create-expo-app` (blank-typescript) into a temp dir and copied in — the tool rejects the project folder name "Life Budget Simulator" as not URL-friendly.
2. Installed and pinned native modules via `npx expo install`.
3. Tokens, fonts, hooks (`useTheme`, `useMotion`, `useHaptics`).
4. Seed data — one month of realistic transactions, budgets, goals, achievements, personas.
5. Primitives, including six ported 21st.dev components.
6. Navigation shell: expo-router, 4 tabs + centre FAB.
7. Ten screens. Simulator built on `lib/simulate.ts`.
8. Browser verification and fixes.

### Bugs found and fixed during verification

Found by driving the running app in a browser at 390×844, not by reading code.

| Symptom | Root cause | Fix |
|---|---|---|
| Metro failed: `Cannot find module 'babel-preset-expo'` | SDK 57 nests it under `expo/node_modules`; a hand-written `babel.config.js` resolves from the project root | Installed `babel-preset-expo` + `@babel/core` as devDependencies |
| Runtime error: "Cannot manually set color scheme, as dark mode is type 'media'" | NativeWind's web runtime owns the scheme when `darkMode` is `media` | Set `darkMode: "class"` so `PrefsProvider` owns it |
| Console error: `Invalid DOM property transform-origin` | `<G rotation origin>` in `DonutChart` emits an invalid DOM attribute through react-native-web | Replaced with an SVG `transform="rotate(a x y)"` string |
| Fourth tab pushed out of the tab bar | Ported label width (78pt) assumed the original's 6-item scrolling bar; 4 tabs + FAB at 390pt overflows | Label 78 → 56, tab padding 12 → 8, `flexShrink` on tabs |
| Slider thumb never moved; drag scrolled the page | `Gesture.Pan` lost every gesture to the enclosing ScrollView | Added `.activeOffsetX([-6,6])` and `.failOffsetY([-14,14])` |
| Disabled buttons rendered at full opacity | `useAnimatedStyle` is applied last in the style array and overwrote the earlier `opacity: 0.45` | Moved the disabled dim into the animated style |
| Sliders and progress bars exposed no value to assistive tech | react-native-web 0.21 drops `accessibilityValue` **and** `accessibilityState` | Pass the `aria-*` form alongside; RN core maps `aria-*` natively |
| Envelope at exactly 100% read "Close to limit" | Only `> 1` and `>= 0.8` cases existed | Added an `=== 1` case: "Limit reached" |
| Route types listed non-route files, omitted 4 screens | Stale `.expo/types` from a run interrupted mid-write | Cleared `.expo/types` and restarted; all 12 routes now registered |

### Verified

- `npx tsc --noEmit` — clean.
- Fresh page load — zero console errors.
- All 10 screens render at 390×844 in both themes.
- Simulator end-to-end: coffee slider to 50% moved monthly surplus ₱28,012 → ₱28,845 and the 12-month projection +₱5.6k over baseline, with the dashed baseline drawn for comparison.
- Transactions filter: 30 → 11 entries on Food, `aria-pressed` correct, no non-matching merchants left.
- Theme toggle repaints the whole app.
- Contrast: every foreground token against all three surfaces in both themes — **0 failures**.

### Not done

- Native device pass. This machine has no Android SDK, so no emulator. Haptics and true gesture feel need `npx expo start` + Expo Go on a physical phone.
- No persistence — mock data only, per the agreed scope. Theme and currency choices reset on reload.
