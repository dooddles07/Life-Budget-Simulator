import { useEffect } from "react";
import {
  Platform,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
} from "react-native";
import Animated, { Easing, useAnimatedProps, useSharedValue } from "react-native-reanimated";

import { type TextTone, type TextVariant } from "@/components/ui/Text";
import { CURRENCIES, type CurrencyCode } from "@/constants/config";
import { motion, type as typeScale } from "@/constants/theme";
import { formatMoney } from "@/lib/format";
import { useMotion } from "@/hooks/useMotion";
import { useCurrency, useTheme } from "@/hooks/useTheme";

/**
 * Ported from 21st.dev "Number Ticker Currency Counter" (@shadcnspace/number-ticker-02),
 * which uses @number-flow/react -- a DOM-only library. The roll is reproduced with a
 * Reanimated shared value driving an uneditable TextInput, the standard RN technique for
 * animating text off the JS thread. Behaviour matches: value tweens, currency formatting,
 * fixed decimals.
 */

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export type NumberTickerProps = {
  value: number;
  variant?: TextVariant;
  tone?: TextTone;
  currency?: CurrencyCode;
  /** Renders 1.2k / 3.4M instead of full digits. */
  compact?: boolean;
  decimals?: boolean;
  /** Prefix a +/- sign even when positive. */
  signed?: boolean;
  duration?: number;
  style?: TextStyle;
  /** Overrides the announced string; defaults to the formatted amount. */
  accessibilityLabel?: string;
};

export function NumberTicker({
  value,
  variant = "display",
  tone = "default",
  currency,
  compact,
  decimals = false,
  signed,
  duration = motion.counter,
  style,
  accessibilityLabel,
}: NumberTickerProps) {
  const theme = useTheme();
  const appCurrency = useCurrency();
  const code = currency ?? appCurrency;
  const { toTiming } = useMotion();

  const progress = useSharedValue(value);

  useEffect(() => {
    progress.value = toTiming(value, duration, Easing.out(Easing.exp));
  }, [value, duration, toTiming, progress]);

  const symbol = CURRENCIES[code].symbol;
  const places = decimals ? CURRENCIES[code].decimals : 0;

  const animatedProps = useAnimatedProps(() => {
    const v = progress.value;
    const abs = Math.abs(v);
    const sign = signed ? (v < 0 ? "−" : "+") : v < 0 ? "−" : "";

    let body: string;
    if (compact && abs >= 1000) {
      const div =
        abs >= 1_000_000_000 ? 1_000_000_000 : abs >= 1_000_000 ? 1_000_000 : 1_000;
      const suffix = div === 1_000_000_000 ? "B" : div === 1_000_000 ? "M" : "k";
      const n = abs / div;
      body = `${n >= 100 ? n.toFixed(0) : n.toFixed(1)}${suffix}`;
    } else {
      // toLocaleString is unavailable inside a worklet -- group manually.
      const fixed = abs.toFixed(places);
      const [whole, frac] = fixed.split(".");
      const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      body = frac ? `${grouped}.${frac}` : grouped;
    }

    // `text` is a real native prop on TextInput but is absent from TextInputProps,
    // so the returned object needs a cast to satisfy the animated-props type.
    return { text: `${sign}${symbol}${body}` } as unknown as Partial<TextInputProps>;
  });

  const color =
    tone === "muted" ? theme.fgMuted
    : tone === "faint" ? theme.fgFaint
    : tone === "primary" ? theme.primaryBright
    : tone === "accent" ? theme.accent
    : tone === "success" ? theme.success
    : tone === "danger" ? theme.danger
    : tone === "warning" ? theme.warning
    : tone === "onPrimary" ? theme.onPrimary
    : tone === "onAccent" ? theme.onAccent
    : theme.fg;

  const spoken =
    accessibilityLabel ?? formatMoney(value, code, { compact, signed, decimals });

  return (
    // The rolling digits are decorative for a screen reader; the wrapper carries
    // the settled value so the announcement is stable instead of mid-tween.
    <View accessible accessibilityRole="text" accessibilityLabel={spoken}>
      <AnimatedTextInput
        editable={false}
        defaultValue={spoken}
        animatedProps={animatedProps}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          typeScale[variant],
          styles.reset,
          { color, fontVariant: ["tabular-nums"] },
          style,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  reset: {
    padding: 0,
    margin: 0,
    // TextInput reserves extra vertical space on Android; strip it so the
    // baseline matches sibling Text.
    ...(Platform.OS === "android" ? { includeFontPadding: false } : null),
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : null),
  },
});
