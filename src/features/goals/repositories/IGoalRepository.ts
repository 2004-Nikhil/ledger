import type { Goal, GoalContribution } from "../types";

export interface CreateGoalRow {
  id: string;
  name: string;
  category: string;
  requiredAmount: number;
  targetDate: string | null;
  createdAt: string;
}

export interface CreateContributionRow {
  id: string;
  goalId: string;
  accountId: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface IGoalRepository {
  create(input: CreateGoalRow): Promise<Goal>;
  findAll(): Promise<Goal[]>;
  findById(id: string): Promise<Goal | null>;
  /** Sets the new accumulated_amount directly — the service computes the new total. */
  updateAccumulated(id: string, accumulatedAmount: number): Promise<void>;
  createContribution(input: CreateContributionRow): Promise<GoalContribution>;
  findAllContributions(): Promise<GoalContribution[]>;
  findContributionById(id: string): Promise<GoalContribution | null>;
}
