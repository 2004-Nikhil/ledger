import { ScrollView, StyleSheet } from "react-native";
import { useGoals } from "@/features/goals/hooks/useGoals";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { todayIso } from "@/utils/date";
import { GoalList } from "@/components/GoalList";
import { GoalForm } from "@/components/GoalForm";

export default function GoalsScreen() {
  const { goals, progressByGoalId, addGoal, contributeToGoal } = useGoals();
  const { accounts } = useAccounts();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <GoalList
        goals={goals}
        progressByGoalId={progressByGoalId}
        accounts={accounts}
        onContribute={(goalId, accountId, amount) =>
          contributeToGoal({ goalId, accountId, amount, date: todayIso() })
        }
      />
      <GoalForm onSubmit={addGoal} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 8 },
});
