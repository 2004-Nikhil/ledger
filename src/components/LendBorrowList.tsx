import { useState } from "react";
import { View } from "react-native";
import type { LendBorrow } from "@/features/lendBorrow/types";
import { Button, Divider, EmptyState, GlassCard, InlineError, MoneyText, Pill, ProgressBar, SkeletonRows, Text, TextField, CURRENCY_SYMBOL, money, space } from "@/ui";
import { formatDisplayDate } from "@/utils/date";

type Props = {
  entries: LendBorrow[];
  onRepay: (lendBorrowId: string, amount: number) => Promise<void>;
  loading?: boolean;
  onAddEntry?: () => void;
};

const STATUS_LABEL: Record<LendBorrow["status"], string> = {
  unpaid: "Unpaid",
  partial: "Partially paid",
  paid: "Paid",
};

function isOverdue(entry: LendBorrow): boolean {
  if (!entry.dueDate || entry.status === "paid") return false;
  return new Date(entry.dueDate) < new Date(new Date().toDateString());
}

function EntryRow({ entry, onRepay }: { entry: LendBorrow; onRepay: Props["onRepay"] }) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const remaining = entry.amount - entry.paidAmount;
  const overdue = isOverdue(entry);

  const handleRepay = async () => {
    setError(null);
    const parsed = Number(amount);
    if (Number.isNaN(parsed) || parsed <= 0) return setError("Enter an amount greater than 0.");
    setIsSubmitting(true);
    try {
      await onRepay(entry.id, parsed);
      setAmount("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ paddingVertical: 16, gap: space.md }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: space.md }}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text variant="bodyStrong" numberOfLines={2}>
            {entry.person}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            <Pill label={entry.direction === "lent" ? "You lent" : "You borrowed"} tone={entry.direction === "lent" ? "accent" : "violet"} />
            <Pill label={STATUS_LABEL[entry.status]} tone={entry.status === "paid" ? "positive" : "neutral"} icon={entry.status === "paid" ? "checkmark" : undefined} />
            {overdue ? <Pill label="Overdue" tone="negative" icon="time-outline" /> : null}
          </View>
        </View>
        <MoneyText amount={entry.amount} size="figureSm" align="right" style={{ maxWidth: 140 }} />
      </View>

      <Text variant="caption" tone="secondary">
        {formatDisplayDate(entry.date)}
        {entry.dueDate ? `  ·  due ${formatDisplayDate(entry.dueDate)}` : ""}
        {entry.status !== "unpaid" ? `  ·  ${money(entry.paidAmount, 0)} of ${money(entry.amount, 0)} paid` : ""}
      </Text>

      {entry.status === "partial" ? <ProgressBar value={entry.amount > 0 ? entry.paidAmount / entry.amount : 0} tone="accent" label="Repaid so far" /> : null}

      {entry.status !== "paid" ? (
        <View style={{ flexDirection: "row", gap: space.sm, alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <TextField
              prefix={CURRENCY_SYMBOL}
              placeholder={`Repay up to ${money(remaining, 0)}`}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              accessibilityLabel={`Repayment amount for ${entry.person}`}
            />
          </View>
          <Button label={isSubmitting ? "…" : "Record"} onPress={handleRepay} loading={isSubmitting} size="lg" style={{ minHeight: 52 }} accessibilityLabel={`Record repayment for ${entry.person}`} />
        </View>
      ) : null}
      {error ? <InlineError message={error} /> : null}
    </View>
  );
}

export function LendBorrowList({ entries, onRepay, loading = false, onAddEntry }: Props) {
  // What's still outstanding in each direction — derived from the entries as given.
  const owedToYou = entries.filter((e) => e.direction === "lent").reduce((s, e) => s + (e.amount - e.paidAmount), 0);
  const youOwe = entries.filter((e) => e.direction === "borrowed").reduce((s, e) => s + (e.amount - e.paidAmount), 0);

  return (
    <View style={{ gap: space.xl }}>
      <GlassCard variant="solid" glow="cyan" glowCorner="tr" padding={space.xl} style={{ flexDirection: "row", gap: space.xl }}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text variant="caption" tone="secondary">
            Owed to you
          </Text>
          <MoneyText amount={owedToYou} size="hero" animate decimals={0} />
        </View>
        <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />
        <View style={{ flex: 1, gap: 6 }}>
          <Text variant="caption" tone="secondary">
            You owe
          </Text>
          <MoneyText amount={youOwe} size="hero" animate decimals={0} />
        </View>
      </GlassCard>

      {loading && entries.length === 0 ? (
        <SkeletonRows count={3} />
      ) : entries.length === 0 ? (
        <EmptyState icon="people-outline" title="Nothing lent or borrowed yet" message="Record money you've lent or borrowed and track repayments here." actionLabel={onAddEntry ? "New entry" : undefined} onAction={onAddEntry} />
      ) : (
        <GlassCard style={{ paddingHorizontal: space.lg }}>
          {entries.map((item, i) => (
            <View key={item.id}>
              {i > 0 && <Divider />}
              <EntryRow entry={item} onRepay={onRepay} />
            </View>
          ))}
        </GlassCard>
      )}
    </View>
  );
}
