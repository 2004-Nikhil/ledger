import { useState } from "react";
import { View } from "react-native";
import type { CategoryBreakdownSlice } from "../features/analytics/types";
import { Donut, EmptyState, MoneyText, PressableScale, Text, money, seriesColor, space, useMetrics } from "@/ui";

type Props = {
  slices: CategoryBreakdownSlice[];
};

export function CategoryPieChart({ slices }: Props) {
  const { width } = useMetrics();
  const [activeKey, setActiveKey] = useState<string | null>(null);

  if (slices.length === 0) {
    return <EmptyState icon="pie-chart-outline" title="No expenses this month yet" message="Once you log spending it will be broken down here." />;
  }

  const total = slices.reduce((s, x) => s + x.amount, 0);
  const active = slices.find((s) => s.categoryId === activeKey) ?? null;
  const wide = width >= 600;
  const size = Math.min(wide ? 220 : width - 96, 232);

  const legend = (
    <View style={{ flex: wide ? 1 : undefined, gap: 2 }}>
      {slices.map((slice, index) => {
        const isActive = activeKey === slice.categoryId;
        return (
          <PressableScale
            key={slice.categoryId}
            onPress={() => setActiveKey(isActive ? null : slice.categoryId)}
            scale={0.985}
            accessibilityRole="button"
            accessibilityLabel={`${slice.categoryName}, ${slice.percent.toFixed(0)} percent, ${money(slice.amount)}`}
            accessibilityState={{ selected: isActive }}
            style={{ minHeight: 44, borderRadius: 12, paddingHorizontal: 8, backgroundColor: isActive ? "rgba(255,255,255,0.06)" : "transparent", justifyContent: "center" }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: seriesColor(index) }} />
              <Text variant="body" numberOfLines={1} style={{ flex: 1 }}>
                {slice.categoryName}
              </Text>
              <Text variant="caption" tone="secondary">
                {slice.percent.toFixed(0)}%
              </Text>
              <MoneyText amount={slice.amount} size="amount" decimals={0} align="right" style={{ minWidth: 72 }} />
            </View>
          </PressableScale>
        );
      })}
    </View>
  );

  return (
    <View style={{ flexDirection: wide ? "row" : "column", alignItems: "center", gap: space.xl }}>
      <Donut
        size={size}
        activeKey={activeKey}
        slices={slices.map((s, i) => ({ key: s.categoryId, value: s.amount, color: seriesColor(i) }))}
        center={
          <View style={{ alignItems: "center", gap: 2 }}>
            <MoneyText amount={active ? active.amount : total} size="figureSm" decimals={0} />
            <Text variant="caption" tone="secondary" numberOfLines={1} style={{ maxWidth: size * 0.55 }}>
              {active ? active.categoryName : "spent"}
            </Text>
          </View>
        }
      />
      <View style={{ alignSelf: "stretch", flex: wide ? 1 : undefined }}>{legend}</View>
    </View>
  );
}
