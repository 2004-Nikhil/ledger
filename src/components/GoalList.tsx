import { useState } from "react";
import { View } from "react-native";
import type { Goal, GoalProgress } from "../features/goals/types";
import type { Account } from "@/features/accounts/types";
import { Button, Chip, ChipRow, EmptyState, GlassCard, InlineError, MoneyText, Pill, Ring, SkeletonRows, Text, TextField, money, space, CURRENCY_SYMBOL } from "@/ui";
import { formatDisplayDate } from "@/utils/date";

type Props = {
  goals: Goal[];
  progressByGoalId: Map<string, GoalProgress>;
  accounts: Account[];
  onContribute: (goalId: string, accountId: string, amount: number) => Promise<void>;
  loading?: boolean;
  onAddGoal?: () => void;
};

function GoalRow({
  goal,
  progress,
  accounts,
  onContribute,
}: {
  goal: Goal;
  progress: GoalProgress | undefined;
  accounts: Account[];
  onContribute: Props["onContribute"];
}) {
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState<string | null>(accounts[0]?.id ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If accounts finished loading after this row mounted, fall back to the first one.
  const effectiveAccountId = accountId ?? accounts[0]?.id ?? null;
  const percent = progress?.percentComplete ?? 0;
  const isComplete = percent >= 100;

  const handleContribute = async () => {
    setError(null);
    const parsed = Number(amount);
    if (!effectiveAccountId) return setError("Pick an account.");
    if (Number.isNaN(parsed) || parsed <= 0) return setError("Enter an amount greater than 0.");

    setIsSubmitting(true);
    try {
      await onContribute(goal.id, effectiveAccountId, parsed);
      setAmount("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlassCard padding={space.lg} glow={isComplete ? "green" : undefined} glowCorner="tl" glowOpacity={0.12} style={{ gap: space.lg }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.lg }}>
        <Ring value={percent / 100} size={64} tone={isComplete ? "positive" : "accent"}>
          <Text variant="captionStrong">{percent.toFixed(0)}%</Text>
        </Ring>
        <View style={{ flex: 1, gap: 6 }}>
          <Text variant="subheading" numberOfLines={2}>
            {goal.name}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            <Pill label={goal.category} tone="violet" />
            {isComplete ? <Pill label="Goal reached" tone="positive" icon="checkmark-circle-outline" /> : null}
          </View>
        </View>
      </View>

      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", gap: 6 }}>
          <MoneyText amount={goal.accumulatedAmount} size="figureSm" decimals={0} />
          <Text variant="caption" tone="secondary">
            of {money(goal.requiredAmount, 0)}
            {goal.targetDate ? `  ·  target ${formatDisplayDate(goal.targetDate)}` : ""}
          </Text>
        </View>
        {!isComplete ? (
          <Text variant="caption" tone="secondary">
            {progress?.projectedCompletionDate
              ? `At this pace, done around ${formatDisplayDate(progress.projectedCompletionDate)}`
              : "Not enough contribution history yet to project a completion date"}
          </Text>
        ) : null}
      </View>

      {!isComplete ? (
        <View style={{ gap: space.md }}>
          <ChipRow bleed={space.lg}>
            {accounts.map((a) => (
              <Chip key={a.id} label={a.name} selected={effectiveAccountId === a.id} onPress={() => setAccountId(a.id)} />
            ))}
          </ChipRow>
          <View style={{ flexDirection: "row", gap: space.sm, alignItems: "flex-start" }}>
            <View style={{ flex: 1 }}>
              <TextField prefix={CURRENCY_SYMBOL} placeholder="Contribute amount" value={amount} onChangeText={setAmount} keyboardType="numeric" accessibilityLabel={`Contribution amount for ${goal.name}`} />
            </View>
            <Button label={isSubmitting ? "…" : "Add"} onPress={handleContribute} loading={isSubmitting} size="lg" style={{ minWidth: 84, minHeight: 52 }} accessibilityLabel={`Add contribution to ${goal.name}`} />
          </View>
        </View>
      ) : null}
      {error ? <InlineError message={error} /> : null}
    </GlassCard>
  );
}

export function GoalList({ goals, progressByGoalId, accounts, onContribute, loading = false, onAddGoal }: Props) {
  if (loading && goals.length === 0) return <SkeletonRows count={3} />;
  if (goals.length === 0) {
    return <EmptyState icon="flag-outline" title="No savings goals yet" message="Set a target and watch it fill in as you contribute." actionLabel={onAddGoal ? "New goal" : undefined} onAction={onAddGoal} />;
  }
  return (
    <View style={{ gap: space.lg }}>
      {goals.map((item) => (
        <GoalRow key={item.id} goal={item} progress={progressByGoalId.get(item.id)} accounts={accounts} onContribute={onContribute} />
      ))}
    </View>
  );
}
