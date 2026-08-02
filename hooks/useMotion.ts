import { useMemo } from "react";
import {
  Easing,
  FadeIn,
  FadeInDown,
  withSpring,
  withTiming,
  type EasingFunction,
  type WithSpringConfig,
  type WithTimingConfig,
} from "react-native-reanimated";

import { motion } from "@/constants/theme";
import { useReduceMotion } from "@/hooks/useTheme";

/**
 * Single gate for every animation in the app. When reduced motion is on,
 * durations collapse to 0 and springs become instant timings -- values still
 * land on their targets, so layout and state never desync.
 */
export function useMotion() {
  const reduce = useReduceMotion();

  return useMemo(() => {
    const timing = (
      duration: number,
      easing: EasingFunction = Easing.out(Easing.cubic)
    ): WithTimingConfig => ({ duration: reduce ? 0 : duration, easing });

    return {
      reduce,
      timing,
      /** Spring falls back to a 0ms timing so the value still commits. */
      toSpring: (to: number, config: WithSpringConfig = motion.spring) =>
        reduce ? withTiming(to, { duration: 0 }) : withSpring(to, config),
      toTiming: (to: number, duration = motion.standard, easing?: EasingFunction) =>
        withTiming(to, timing(duration, easing)),
      // Reduced motion returns undefined rather than a 0ms animation: Reanimated's
      // web entering path holds the element at `visibility: hidden` until the
      // animation starts, so skipping the wrapper entirely is both faster and
      // safer -- content can never be left hidden waiting on a frame.
      /** Staggered list entrance; index drives the delay, capped so long lists stay snappy. */
      enterList: (index: number) =>
        reduce
          ? undefined
          : FadeInDown.delay(Math.min(index, 12) * motion.stagger)
              .duration(motion.standard)
              .springify()
              .damping(16),
      enter: (delay = 0) =>
        reduce ? undefined : FadeIn.delay(delay).duration(motion.standard),
      durations: motion,
    };
  }, [reduce]);
}
