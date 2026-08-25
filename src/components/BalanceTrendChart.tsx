import { Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import type { BalanceTrendPoint } from "../features/analytics/types";
import { chartTheme } from "../features/analytics/chartTheme";
import { formatMonthLabel } from "@/utils/date";

type Props = {
  points: BalanceTrendPoint[];
};

const CHART_WIDTH = Dimensions.get("window").width - 64;

export function BalanceTrendChart({ points }: Props) {
  const data = {
    labels: points.map((p) => formatMonthLabel(p.month).split(" ")[0].slice(0, 3)),
    datasets: [{ data: points.map((p) => p.totalBalance) }],
  };

  return (
    <LineChart
      data={data}
      width={CHART_WIDTH}
      height={180}
      chartConfig={chartTheme}
      bezier
      withInnerLines={false}
      withOuterLines={false}
      yAxisLabel=""
      yAxisSuffix=""
    />
  );
}
