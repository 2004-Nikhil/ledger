import { useEffect, useMemo, useRef } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useTransactions } from "@/features/transactions/hooks/useTransactions";
import { useInvestments } from "@/features/investments/hooks/useInvestments";
import { useAnalytics } from "@/features/analytics/hooks/useAnalytics";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { summarizeCurrentMonth } from "@/utils/monthlySummary";
import { DEFAULT_SORT, DEFAULT_FILTERS, filterAndSortTransactions } from "@/utils/filterSort";
import { CategoryPieChart } from "@/components/CategoryPieChart";
import { BalanceTrendChart } from "@/components/BalanceTrendChart";
import { TransactionRow } from "@/components/TransactionList";
import {
  Button, Divider, EmptyState, ErrorNotice, GlassCard, GlassPressable, MoneyText, Pill, Screen, Section, SkeletonRows, Text,
  colors, money, space, useMetrics,
} from "@/ui";

function greeting(): string {
  const h = new Date().getHours();
  return h < 5 ? "Good night" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function DashboardScreen() {
  const router = useRouter();
  const { columns } = useMetrics();
  const { accounts, totalBalance, isLoading: accountsLoading, error: accountsError, refresh: refreshAccounts } = useAccounts();
  const { transactions, isLoading: txLoading, error: txError, refresh: refreshTransactions, isEditable } = useTransactions();
  const { portfolioSummary, refresh: refreshInvestments } = useInvestments();
  const { categories } = useCategories();
  const analytics = useAnalytics();
  const { balanceTrend, categoryBreakdown, error: analyticsError, refresh: refreshAnalytics } = analytics;

  const summary = useMemo(() => summarizeCurrentMonth(transactions), [transactions]);
  const surplus = summary.income - summary.expense;

  // True net worth = spendable cash/bank/card balances + investment value.
  // Deliberately NOT netting out goal contributions or lend/borrow here —
  // those already reduced/increased the relevant account balance when
  // they happened, so totalBalance already reflects them correctly.
  const netWorth = totalBalance + portfolioSummary.totalCurrentValue;

  // Analytics loads once on mount; re-read it whenever money actually moves so
  // the charts never lag behind a transaction logged from another screen.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    refreshAnalytics();
  }, [transactions, totalBalance, refreshAnalytics]);

  const accountsById = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);
  const categoriesById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const recent = useMemo(() => filterAndSortTransactions(transactions, DEFAULT_FILTERS, DEFAULT_SORT).slice(0, 5), [transactions]);

  const error = txError ?? accountsError ?? analyticsError;
  const reload = () => Promise.all([refreshAccounts(), refreshTransactions(), refreshInvestments(), refreshAnalytics()]);

  const deltaTone = surplus > 0 ? "positive" : surplus < 0 ? "negative" : "neutral";
  const breakdownCard = (
    <Section title="Where it went" action={<Button label="Analytics" variant="ghost" size="sm" onPress={() => router.navigate("/analytics" as never)} />}>
      <GlassCard padding={space.lg}>
        <CategoryPieChart slices={categoryBreakdown} />
      </GlassCard>
    </Section>
  );
  const recentCard = (
    <Section title="Recent activity" action={<Button label="See all" variant="ghost" size="sm" onPress={() => router.navigate("/transactions" as never)} />}>
      <GlassCard style={{ paddingHorizontal: space.lg }}>
        {txLoading && recent.length === 0 ? (
          <View style={{ paddingVertical: space.lg }}>
            <SkeletonRows count={3} />
          </View>
        ) : recent.length === 0 ? (
          <EmptyState icon="receipt-outline" title="No transactions yet" message="Tap + to log your first one." />
        ) : (
          recent.map((t, i) => (
            <View key={t.id}>
              {i > 0 && <Divider inset={56} />}
              <TransactionRow transaction={t} accountsById={accountsById} categoriesById={categoriesById} locked={!isEditable(t)} />
            </View>
          ))
        )}
      </GlassCard>
    </Section>
  );

  return (
    <Screen title={greeting()} subtitle={new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })} onRefresh={reload}>
      {error ? <ErrorNotice message={error} onRetry={reload} /> : null}

      {/* Hero: the one thing to remember. Everything else is quieter. */}
      <GlassCard variant="solid" glow="blue" glowCorner="tr" glowOpacity={0.22} radius={28}>
        <View style={{ padding: space.xl, gap: space.sm }}>
          <Text variant="caption" tone="secondary">
            Net worth
          </Text>
          <MoneyText amount={netWorth} size="display" animate tone={netWorth < 0 ? "negative" : "primary"} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 4 }}>
            <Pill
              tone={deltaTone}
              icon={surplus > 0 ? "trending-up-outline" : surplus < 0 ? "trending-down-outline" : "remove-outline"}
              label={`${surplus >= 0 ? "+" : "\u2212"}${money(Math.abs(surplus), 0)} this month`}
            />
          </View>
          <Text variant="caption" tone="secondary">
            {money(totalBalance, 0)} spendable · {money(portfolioSummary.totalCurrentValue, 0)} invested
          </Text>
        </View>
        <View style={{ paddingHorizontal: space.md, paddingBottom: space.md }}>
          <BalanceTrendChart points={balanceTrend} height={150} />
        </View>
      </GlassCard>

      {/* This month */}
      <Section title="This month">
        <View style={{ flexDirection: "row", gap: space.md }}>
          <FlowTile label="Income" icon="arrow-down-outline" amount={summary.income} />
          <FlowTile label="Expense" icon="arrow-up-outline" amount={summary.expense} />
        </View>
        <GlassCard quiet padding={space.lg} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: space.md }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name={surplus >= 0 ? "checkmark-circle-outline" : "alert-circle-outline"} size={20} color={surplus >= 0 ? colors.positive : colors.negative} />
            <Text variant="bodyStrong">{surplus >= 0 ? "Surplus" : "Deficit"}</Text>
          </View>
          <MoneyText amount={Math.abs(surplus)} size="figureSm" tone={surplus > 0 ? "positive" : surplus < 0 ? "negative" : "primary"} align="right" style={{ maxWidth: 190 }} />
        </GlassCard>
      </Section>

      {columns === 2 ? (
        <View style={{ flexDirection: "row", gap: space.xl, alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>{breakdownCard}</View>
          <View style={{ flex: 1 }}>{recentCard}</View>
        </View>
      ) : (
        <>
          {breakdownCard}
          {recentCard}
        </>
      )}

      <GlassPressable onPress={() => router.navigate("/analytics" as never)} accessibilityLabel="Open analytics: income versus expense and category trends" style={{ flexDirection: "row", alignItems: "center", gap: space.md, padding: space.lg }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: colors.accentSoft }}>
          <Ionicons name="stats-chart-outline" size={19} color={colors.accentText} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="bodyStrong">Trends and insights</Text>
          <Text variant="caption" tone="secondary">
            Income vs expense, category trends
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </GlassPressable>
    </Screen>
  );
}

function FlowTile({ label, icon, amount }: { label: string; icon: "arrow-down-outline" | "arrow-up-outline"; amount: number }) {
  return (
    <GlassCard padding={space.lg} style={{ flex: 1, gap: space.sm }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Ionicons name={icon} size={15} color={colors.textSecondary} />
        <Text variant="caption" tone="secondary">
          {label}
        </Text>
      </View>
      <MoneyText amount={amount} size="figure" decimals={0} />
    </GlassCard>
  );
}
