import { useRouter } from "expo-router";
import { ChevronLeft, SearchX } from "@/lib/lucide-icons";
import { useMemo, useState } from "react";
import { SectionList, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TransactionRow } from "@/components/money/TransactionRow";
import { IconButton } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Text } from "@/components/ui/Text";
import { ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { ICON_STROKE, iconSize, space } from "@/constants/theme";
import { CATEGORIES, type CategoryId } from "@/data/seed";
import { useTransactions } from "@/hooks/useTransactions";
import type { Transaction } from "@/lib/data/transactions";
import { formatMoney, relativeDay } from "@/lib/format";
import { useMotion } from "@/hooks/useMotion";
import { useCurrency, useTheme } from "@/hooks/useTheme";

export default function TransactionsScreen() {
  const theme = useTheme();
  const currency = useCurrency();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { enter } = useMotion();
  const { data: transactions, loading, error, refetch } = useTransactions();

  const [filter, setFilter] = useState<CategoryId | null>(null);

  const counts = useMemo(() => {
    const map = {} as Record<CategoryId, number>;
    for (const t of transactions ?? []) map[t.category] = (map[t.category] ?? 0) + 1;
    return map;
  }, [transactions]);

  const sections = useMemo(() => {
    const all = transactions ?? [];
    const filtered = filter ? all.filter((t) => t.category === filter) : all;

    const groups = new Map<string, Transaction[]>();
    for (const t of filtered) {
      const key = relativeDay(t.occurred_at);
      const list = groups.get(key);
      if (list) list.push(t);
      else groups.set(key, [t]);
    }

    return Array.from(groups, ([title, data]) => ({
      title,
      data,
      total: data.reduce((s, t) => s + t.amount, 0),
    }));
  }, [filter, transactions]);

  if (loading) return <LoadingState />;
  if (error || !transactions) {
    return <ErrorState message={error ?? "Couldn't load your transactions."} onRetry={refetch} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Animated.View
        entering={enter()}
        style={{
          paddingTop: insets.top + space.sm,
          paddingHorizontal: space.lg,
          paddingBottom: space.lg,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
          <IconButton
            icon={ChevronLeft}
            label="Go back"
            filled
            onPress={() => router.back()}
          />
          <View style={{ flex: 1 }}>
            <Text variant="h2">Transactions</Text>
            <Text variant="caption" tone="muted" tabular>
              {sections.reduce((s, sec) => s + sec.data.length, 0)} entries
            </Text>
          </View>
        </View>
      </Animated.View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: space.lg,
          paddingBottom: insets.bottom + space.xxxl,
        }}
        ListHeaderComponent={
          <View style={{ marginBottom: space.md }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
              <Chip
                label="All"
                active={filter === null}
                count={transactions.length}
                onPress={() => setFilter(null)}
              />
              {CATEGORIES.filter((c) => counts[c.id]).map((cat) => (
                <Chip
                  key={cat.id}
                  label={cat.label}
                  icon={cat.icon}
                  count={counts[cat.id]}
                  active={filter === cat.id}
                  activeColor={theme.categories[cat.swatch]}
                  onPress={() => setFilter((prev) => (prev === cat.id ? null : cat.id))}
                />
              ))}
            </View>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: space.sm,
              backgroundColor: theme.bg,
            }}
          >
            <Text variant="captionSb" tone="muted">
              {section.title.toUpperCase()}
            </Text>
            <Text variant="captionSb" tabular tone={section.total >= 0 ? "success" : "muted"}>
              {formatMoney(section.total, currency, { signed: true })}
            </Text>
          </View>
        )}
        renderItem={({ item, index }) => (
          <TransactionRow transaction={item} index={index} animate={false} />
        )}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: theme.border, marginLeft: 56 }} />
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: space.xxxl, gap: space.md }}>
            <SearchX size={iconSize.lg} strokeWidth={ICON_STROKE} color={theme.fgFaint} />
            <Text variant="h3" tone="muted">
              Nothing here
            </Text>
            <Text variant="caption" tone="faint" center>
              No transactions in this category yet.
            </Text>
          </View>
        }
      />
    </View>
  );
}
