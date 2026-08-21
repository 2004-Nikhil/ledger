import type { Goal, GoalProgress } from "@/features/goals/types";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Projected completion uses a simple heuristic: average daily pace
 * since the goal was created (accumulatedAmount / daysSinceCreated),
 * projected forward at that same rate. It deliberately doesn't need
 * the full contribution history — just the goal's current totals —
 * which keeps this pure and cheap to recompute on every render.
 */
export function computeGoalProgress(goal: Goal, referenceDate: Date = new Date()): GoalProgress {
  const percentComplete =
    goal.requiredAmount > 0 ? Math.min(100, (goal.accumulatedAmount / goal.requiredAmount) * 100) : 100;

  const amountRemaining = Math.max(0, goal.requiredAmount - goal.accumulatedAmount);

  if (amountRemaining <= 0) {
    return { goalId: goal.id, percentComplete: 100, amountRemaining: 0, projectedCompletionDate: null };
  }

  const daysSinceCreated = (referenceDate.getTime() - new Date(goal.createdAt).getTime()) / MS_PER_DAY;

  // Not enough history yet (just created, or nothing contributed) —
  // no honest projection is possible, so say so rather than guess.
  if (daysSinceCreated < 1 || goal.accumulatedAmount <= 0) {
    return { goalId: goal.id, percentComplete, amountRemaining, projectedCompletionDate: null };
  }

  const dailyPace = goal.accumulatedAmount / daysSinceCreated;
  const daysRemaining = amountRemaining / dailyPace;
  const projected = new Date(referenceDate.getTime() + daysRemaining * MS_PER_DAY);

  return {
    goalId: goal.id,
    percentComplete,
    amountRemaining,
    projectedCompletionDate: projected.toISOString().slice(0, 10),
  };
}
