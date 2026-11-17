import type { MonthlyIncomeExpense } from "../features/analytics/types";
import { FlowBars, Text, money, shortMonth } from "@/ui";

type Props = {
  points: MonthlyIncomeExpense[];
};

export function IncomeExpenseBarChart({ points }: Props) {
  if (points.length === 0) {
    return (
      <Text variant="caption" tone="secondary">
        Income and expense appear once you log transactions.
      </Text>
    );
  }
  return <FlowBars data={points.map((p) => ({ label: shortMonth(p.month), income: p.income, expense: p.expense }))} formatValue={(v) => money(v, 0)} />;
}
