import { useState } from "react";
import { View } from "react-native";
import { useGoals } from "@/features/goals/hooks/useGoals";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { todayIso } from "@/utils/date";
import { GoalList } from "@/components/GoalList";
import { GoalForm } from "@/components/GoalForm";
import { Button, ErrorNotice, GlassCard, MoneyText, ProgressBar, Screen, Sheet, Text, money, space } from "@/ui";

export default function GoalsScreen() {
  const { goals, progressByGoalId, addGoal, contributeToGoal, isLoading, error, refresh } = useGoals();
  const { accounts } = useAccounts();
  const [adding, setAdding] = useState(false);

  const saved = goals.reduce((s, g) => s + g.accumulatedAmount, 0);
  const target = goals.reduce((s, g) => s + g.requiredAmount, 0);
  const reached = goals.filter((g) => g.requiredAmount > 0 && g.accumulatedAmount >= g.requiredAmount).length;

  return (
    <>
      <Screen title="Goals" onRefresh={refresh} right={<Button label="New goal" icon="add" size="sm" variant="glass" onPress={() => setAdding(true)} />}>
        {error ? <ErrorNotice message={error} onRetry={refresh} /> : null}

        {goals.length > 0 ? (
          <GlassCard variant="solid" glow="green" glowCorner="tr" glowOpacity={0.14} padding={space.xl} style={{ gap: space.md }}>
            <Text variant="caption" tone="secondary">
              Saved toward goals
            </Text>
            <MoneyText amount={saved} size="hero" animate decimals={0} />
            <View style={{ gap: space.sm }}>
              <ProgressBar value={target > 0 ? saved / target : 0} tone="accent" label="Overall progress" />
              <Text variant="caption" tone="secondary">
                of {money(target, 0)} across {goals.length} {goals.length === 1 ? "goal" : "goals"}
                {reached > 0 ? ` · ${reached} reached` : ""}
              </Text>
            </View>
          </GlassCard>
        ) : null}

        <GoalList
          goals={goals}
          progressByGoalId={progressByGoalId}
          accounts={accounts}
          loading={isLoading}
          onAddGoal={() => setAdding(true)}
          onContribute={(goalId, accountId, amount) => contributeToGoal({ goalId, accountId, amount, date: todayIso() })}
        />
      </Screen>

      <Sheet visible={adding} onClose={() => setAdding(false)} title="New savings goal" subtitle="Set a target and contribute from any account">
        <GoalForm
          onSubmit={async (request) => {
            await addGoal(request);
            setAdding(false);
          }}
        />
      </Sheet>
    </>
  );
}
