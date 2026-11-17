import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useTransactions } from "@/features/transactions/hooks/useTransactions";
import { useAnalytics } from "@/features/analytics/hooks/useAnalytics";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { CategoryPieChart } from "@/components/CategoryPieChart";
import { BalanceTrendChart } from "@/components/BalanceTrendChart";
import { IncomeExpenseBarChart } from "@/components/IncomeExpenseBarChart";
import { CategoryTrendChart } from "@/components/CategoryTrendChart";
import { ErrorNotice, GlassCard, MoneyText, Pill, Screen, Section, Skeleton, Text, money, space, useMetrics } from "@/ui";

/**
 * Deeper charts, moved off Home so the dashboard stays calm. Every chart the
 * old dashboard had is here, unchanged in what it measures.
 */
export default function AnalyticsScreen() {
  const { columns } = useMetrics();
  const { totalBalance } = useAccounts();
  const { transactions } = useTransactions();
  const { expenseCategories } = useCategories();
  const { balanceTrend, incomeExpenseTrend, categoryBreakdown, categoryTrend, viewCategoryTrend, isLoading, error, refresh } = useAnalytics();
  const [trendCategoryId, setTrendCategoryId] = useState<string | null>(null);

  // Re-read whenever money moves (see Home for why).
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    refresh();
  }, [transactions, totalBalance, refresh]);

  const handleSelectTrendCategory = (categoryId: string) => {
    setTrendCategoryId(categoryId);
    viewCategoryTrend(categoryId);
  };

  const latest = balanceTrend[balanceTrend.length - 1];
  const previous = balanceTrend[balanceTrend.length - 2];
  const change = latest && previous ? latest.totalBalance - previous.totalBalance : null;

  const balanceCard = (
    <Section title="Balance trend">
      <GlassCard variant="solid" glow="blue" glowCorner="tr" padding={space.lg} style={{ gap: space.md }}>
        {isLoading && balanceTrend.length === 0 ? (
          <Skeleton height={190} r={16} />
        ) : (
          <>
            <View style={{ paddingHorizontal: space.xs, gap: 6 }}>
              {latest ? <MoneyText amount={latest.totalBalance} size="hero" animate decimals={0} /> : null}
              {change !== null && change !== 0 ? (
                <Pill tone={change > 0 ? "positive" : "negative"} icon={change > 0 ? "trending-up-outline" : "trending-down-outline"} label={`${change > 0 ? "+" : "\u2212"}${money(Math.abs(change), 0)} vs last month`} />
              ) : (
                <Text variant="caption" tone="secondary">
                  Spendable balance across all accounts
                </Text>
              )}
            </View>
            <BalanceTrendChart points={balanceTrend} height={190} />
          </>
        )}
      </GlassCard>
    </Section>
  );

  const flowCard = (
    <Section title="Income vs expense">
      <GlassCard padding={space.lg}>
        {isLoading && incomeExpenseTrend.length === 0 ? <Skeleton height={190} r={16} /> : <IncomeExpenseBarChart points={incomeExpenseTrend} />}
      </GlassCard>
    </Section>
  );

  const breakdownCard = (
    <Section title="Expense breakdown">
      <GlassCard padding={space.lg}>
        <CategoryPieChart slices={categoryBreakdown} />
      </GlassCard>
    </Section>
  );

  const trendCard = (
    <Section title="Category trend">
      <GlassCard padding={space.lg}>
        <CategoryTrendChart expenseCategories={expenseCategories} selectedCategoryId={trendCategoryId} onSelectCategory={handleSelectTrendCategory} trend={categoryTrend} bleed={space.lg} />
      </GlassCard>
    </Section>
  );

  return (
    <Screen title="Analytics" subtitle="The last six months at a glance" onRefresh={refresh}>
      {error ? <ErrorNotice message={error} onRetry={refresh} /> : null}
      {balanceCard}
      {columns === 2 ? (
        <>
          <View style={{ flexDirection: "row", gap: space.xl, alignItems: "flex-start" }}>
            <View style={{ flex: 1 }}>{flowCard}</View>
            <View style={{ flex: 1 }}>{trendCard}</View>
          </View>
          {breakdownCard}
        </>
      ) : (
        <>
          {flowCard}
          {breakdownCard}
          {trendCard}
        </>
      )}
    </Screen>
  );
}
