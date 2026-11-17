import type { BalanceTrendPoint } from "../features/analytics/types";
import { LineTrend, Text, money, shortMonth } from "@/ui";

type Props = {
  points: BalanceTrendPoint[];
  height?: number;
};

export function BalanceTrendChart({ points, height = 168 }: Props) {
  if (points.length === 0) {
    return (
      <Text variant="caption" tone="secondary">
        Balance history appears once you have some activity.
      </Text>
    );
  }
  return (
    <LineTrend
      data={points.map((p) => ({ label: shortMonth(p.month), value: p.totalBalance }))}
      height={height}
      tone="accent"
      formatValue={(v) => money(v, 0)}
    />
  );
}
