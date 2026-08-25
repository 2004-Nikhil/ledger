import { Dimensions } from "react-native";
import { StackedBarChart } from "react-native-chart-kit";
import type { MonthlyIncomeExpense } from "../features/analytics/types";
import { chartTheme } from "../features/analytics/chartTheme";
import { formatMonthLabel } from "@/utils/date";

type Props = {
  points: MonthlyIncomeExpense[];
};

const CHART_WIDTH = Dimensions.get("window").width - 64;

export function IncomeExpenseBarChart({ points }: Props) {
  const data = {
    labels: points.map((p) => formatMonthLabel(p.month).split(" ")[0].slice(0, 3)),
    legend: ["Income", "Expense"],
    data: points.map((p) => [p.income, p.expense]),
    barColors: ["#16a34a", "#dc2626"],
  };

  return (
    <StackedBarChart
      data={data}
      width={CHART_WIDTH}
      height={180}
      chartConfig={chartTheme}
      hideLegend={false}
    />
  );
}
