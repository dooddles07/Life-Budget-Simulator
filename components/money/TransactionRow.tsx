import { View } from "react-native";
import Animated from "react-native-reanimated";

import { Pressable } from "@/components/ui/Pressable";
import { Text } from "@/components/ui/Text";
import { ICON_STROKE, iconSize, radius, space } from "@/constants/theme";
import { CATEGORY_MAP } from "@/data/seed";
import type { Transaction } from "@/lib/data/transactions";
import { formatMoney, timeOfDay } from "@/lib/format";
import { useMotion } from "@/hooks/useMotion";
import { useCurrency, useTheme } from "@/hooks/useTheme";

export function TransactionRow({
  transaction,
  index = 0,
  onPress,
  animate = true,
}: {
  transaction: Transaction;
  index?: number;
  onPress?: () => void;
  animate?: boolean;
}) {
  const theme = useTheme();
  const currency = useCurrency();
  const { enterList } = useMotion();

  const category = CATEGORY_MAP[transaction.category];
  const Icon = category.icon;
  const swatch = theme.categories[category.swatch];
  const income = transaction.amount > 0;

  return (
    <Animated.View entering={animate ? enterList(index) : undefined}>
      <Pressable
        dimOnly
        noMinSize
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? "button" : "text"}
        accessibilityLabel={`${transaction.title}, ${category.label}, ${formatMoney(
          transaction.amount,
          currency,
          { signed: true, decimals: true }
        )}, ${timeOfDay(transaction.occurred_at)}`}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: space.md,
          paddingVertical: space.md,
          minHeight: 64,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.md,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `${swatch}1F`,
          }}
        >
          <Icon size={iconSize.md} strokeWidth={ICON_STROKE} color={swatch} />
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyMd" numberOfLines={1}>
            {transaction.title}
          </Text>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {transaction.merchant} · {timeOfDay(transaction.occurred_at)}
          </Text>
        </View>

        <Text
          variant="labelSb"
          tabular
          tone={income ? "success" : "default"}
          style={{ textAlign: "right" }}
        >
          {formatMoney(transaction.amount, currency, { signed: true, decimals: true })}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
