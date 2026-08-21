export interface Goal {
  id: string;
  name: string;
  category: string;
  requiredAmount: number;
  accumulatedAmount: number;
  targetDate: string | null;
  createdAt: string;
}

export interface CreateGoalRequest {
  name: string;
  category: string;
  requiredAmount: number;
  targetDate?: string;
}

export interface ContributeToGoalRequest {
  goalId: string;
  accountId: string;
  amount: number;
  date: string;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  accountId: string;
  amount: number;
  date: string;
  createdAt: string;
}

/** Derived, not stored — see utils/goalMath.ts. */
export interface GoalProgress {
  goalId: string;
  percentComplete: number;
  amountRemaining: number;
  /** "YYYY-MM-DD", or null if there's not yet enough contribution history to project a pace. */
  projectedCompletionDate: string | null;
}
