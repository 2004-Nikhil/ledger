import type { SQLiteDatabase } from "expo-sqlite";
import type { IGoalRepository } from "../repositories/IGoalRepository";
import type { IAccountRepository } from "@/features/accounts/repositories/IAccountRepository";
import type { Goal, CreateGoalRequest, ContributeToGoalRequest, GoalContribution } from "../types";
import { generateId } from "@/utils/id";

export class GoalService {
  constructor(
    private db: SQLiteDatabase,
    private goalRepository: IGoalRepository,
    private accountRepository: IAccountRepository
  ) {}

  async createGoal(request: CreateGoalRequest): Promise<Goal> {
    if (!request.name.trim()) {
      throw new Error("Goal name is required.");
    }
    if (!request.category.trim()) {
      throw new Error("Category is required.");
    }
    if (!Number.isFinite(request.requiredAmount) || request.requiredAmount <= 0) {
      throw new Error("Required amount must be greater than zero.");
    }

    return this.goalRepository.create({
      id: generateId("goal"),
      name: request.name.trim(),
      category: request.category.trim(),
      requiredAmount: request.requiredAmount,
      targetDate: request.targetDate ?? null,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * A contribution is conceptually like a transfer: money leaves a
   * spendable account and becomes earmarked toward the goal. It never
   * counts as an expense — net worth is unchanged, only which "bucket"
   * the money sits in changes.
   */
  async contribute(request: ContributeToGoalRequest): Promise<GoalContribution> {
    if (!Number.isFinite(request.amount) || request.amount <= 0) {
      throw new Error("Contribution amount must be greater than zero.");
    }

    const [goal, account] = await Promise.all([
      this.goalRepository.findById(request.goalId),
      this.accountRepository.findById(request.accountId),
    ]);
    if (!goal) throw new Error("Goal no longer exists.");
    if (!account) throw new Error("Selected account no longer exists.");

    const row = {
      id: generateId("gc"),
      goalId: request.goalId,
      accountId: request.accountId,
      amount: request.amount,
      date: request.date,
      createdAt: new Date().toISOString(),
    };

    let created: GoalContribution | undefined;
    await this.db.withTransactionAsync(async () => {
      created = await this.goalRepository.createContribution(row);
      await this.goalRepository.updateAccumulated(goal.id, goal.accumulatedAmount + request.amount);
      await this.accountRepository.adjustBalance(request.accountId, -request.amount);
    });

    if (!created) {
      throw new Error("Contribution failed to save.");
    }
    return created;
  }

  async listGoals(): Promise<Goal[]> {
    return this.goalRepository.findAll();
  }
}
