import { useState } from "react";
import { View } from "react-native";
import type { Investment, PortfolioSummary } from "@/features/investments/types";
import { Button, Divider, EmptyState, GlassCard, InlineError, MoneyText, SkeletonRows, Text, TextField, CURRENCY_SYMBOL, money, percent, space } from "@/ui";

type Props = {
  investments: Investment[];
  summary: PortfolioSummary;
  onUpdateValue: (investmentId: string, currentValue: number) => Promise<void>;
  loading?: boolean;
  onAddInvestment?: () => void;
};

const TYPE_LABEL: Record<Investment["type"], string> = {
  stock: "Stock",
  mutual_fund: "Mutual fund",
  sip: "SIP",
};

function InvestmentRow({ investment, onUpdateValue }: { investment: Investment; onUpdateValue: Props["onUpdateValue"] }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(investment.currentValue));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cost = investment.units * investment.buyPrice;
  const gain = investment.currentValue - cost;
  const gainPercent = cost > 0 ? (gain / cost) * 100 : 0;

  const handleSave = async () => {
    setError(null);
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0) return setError("Enter a value of 0 or more.");
    setIsSubmitting(true);
    try {
      await onUpdateValue(investment.id, parsed);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  const details =
    TYPE_LABEL[investment.type] +
    (investment.units > 0 ? ` · ${investment.units} units @ ${money(investment.buyPrice)}` : "") +
    (investment.type === "sip" && investment.sipAmount ? ` · ${money(investment.sipAmount, 0)}/${investment.sipFrequency}` : "");

  return (
    <View style={{ paddingVertical: 16, gap: space.md }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: space.md }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong" numberOfLines={2}>
            {investment.name}
          </Text>
          <Text variant="caption" tone="secondary">
            {details}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 2, maxWidth: "48%" }}>
          <MoneyText amount={investment.currentValue} size="figureSm" align="right" />
          {cost > 0 ? (
            <Text variant="caption" tone={gain >= 0 ? "positive" : "negative"}>
              {gain >= 0 ? "+" : "\u2212"}
              {money(Math.abs(gain), 0)} ({gainPercent.toFixed(1)}%)
            </Text>
          ) : null}
        </View>
      </View>

      {!editing ? (
        <Button label="Update value" variant="glass" size="sm" icon="create-outline" onPress={() => setEditing(true)} accessibilityLabel={`Update current value of ${investment.name}`} />
      ) : (
        <View style={{ gap: space.sm }}>
          <View style={{ flexDirection: "row", gap: space.sm, alignItems: "flex-start" }}>
            <View style={{ flex: 1 }}>
              <TextField prefix={CURRENCY_SYMBOL} value={value} onChangeText={setValue} keyboardType="numeric" accessibilityLabel={`Current value of ${investment.name}`} autoFocus />
            </View>
            <Button label={isSubmitting ? "…" : "Save"} onPress={handleSave} loading={isSubmitting} size="lg" style={{ minHeight: 52 }} />
          </View>
          <Button label="Cancel" variant="ghost" size="sm" onPress={() => setEditing(false)} />
        </View>
      )}
      {error ? <InlineError message={error} /> : null}
    </View>
  );
}

export function InvestmentList({ investments, summary, onUpdateValue, loading = false, onAddInvestment }: Props) {
  const up = summary.totalGain >= 0;
  return (
    <View style={{ gap: space.xl }}>
      <GlassCard variant="solid" glow={summary.totalCost > 0 && up ? "green" : "blue"} glowCorner="tr" padding={space.xl} style={{ gap: space.sm }}>
        <Text variant="caption" tone="secondary">
          Portfolio value
        </Text>
        <MoneyText amount={summary.totalCurrentValue} size="display" animate />
        {summary.totalCost > 0 ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text variant="captionStrong" tone={up ? "positive" : "negative"}>
              {up ? "+" : "\u2212"}
              {money(Math.abs(summary.totalGain), 0)} ({percent(Math.abs(summary.totalGainPercent))})
            </Text>
            <Text variant="caption" tone="secondary">
              on {money(summary.totalCost, 0)} invested
            </Text>
          </View>
        ) : (
          <Text variant="caption" tone="secondary">
            Add units and a buy price to see your gain.
          </Text>
        )}
      </GlassCard>

      {loading && investments.length === 0 ? (
        <SkeletonRows count={3} />
      ) : investments.length === 0 ? (
        <EmptyState icon="trending-up-outline" title="No investments tracked yet" message="Track stocks, funds, and SIPs to include them in your net worth." actionLabel={onAddInvestment ? "Add investment" : undefined} onAction={onAddInvestment} />
      ) : (
        <GlassCard style={{ paddingHorizontal: space.lg }}>
          {investments.map((item, i) => (
            <View key={item.id}>
              {i > 0 && <Divider />}
              <InvestmentRow investment={item} onUpdateValue={onUpdateValue} />
            </View>
          ))}
        </GlassCard>
      )}
    </View>
  );
}
