import type { SQLiteDatabase } from "expo-sqlite";
import type { IGoalRepository, CreateGoalRow, CreateContributionRow } from "./IGoalRepository";
import type { Goal, GoalContribution } from "../types";

interface GoalRow {
  id: string;
  name: string;
  category: string;
  required_amount: number;
  accumulated_amount: number;
  target_date: string | null;
  created_at: string;
}

interface ContributionRow {
  id: string;
  goal_id: string;
  account_id: string;
  amount: number;
  date: string;
  created_at: string;
}

function mapGoalRow(row: GoalRow): Goal {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    requiredAmount: row.required_amount,
    accumulatedAmount: row.accumulated_amount,
    targetDate: row.target_date,
    createdAt: row.created_at,
  };
}

function mapContributionRow(row: ContributionRow): GoalContribution {
  return {
    id: row.id,
    goalId: row.goal_id,
    accountId: row.account_id,
    amount: row.amount,
    date: row.date,
    createdAt: row.created_at,
  };
}

export class SqliteGoalRepository implements IGoalRepository {
  constructor(private db: SQLiteDatabase) {}

  async create(input: CreateGoalRow): Promise<Goal> {
    await this.db.runAsync(
      `INSERT INTO goals (id, name, category, required_amount, accumulated_amount, target_date, created_at)
       VALUES (?, ?, ?, ?, 0, ?, ?);`,
      [input.id, input.name, input.category, input.requiredAmount, input.targetDate, input.createdAt]
    );
    return {
      id: input.id,
      name: input.name,
      category: input.category,
      requiredAmount: input.requiredAmount,
      accumulatedAmount: 0,
      targetDate: input.targetDate,
      createdAt: input.createdAt,
    };
  }

  async findAll(): Promise<Goal[]> {
    const rows = await this.db.getAllAsync<GoalRow>("SELECT * FROM goals ORDER BY created_at ASC;");
    return rows.map(mapGoalRow);
  }

  async findById(id: string): Promise<Goal | null> {
    const row = await this.db.getFirstAsync<GoalRow>("SELECT * FROM goals WHERE id = ?;", [id]);
    return row ? mapGoalRow(row) : null;
  }

  async updateAccumulated(id: string, accumulatedAmount: number): Promise<void> {
    await this.db.runAsync("UPDATE goals SET accumulated_amount = ? WHERE id = ?;", [accumulatedAmount, id]);
  }

  async createContribution(input: CreateContributionRow): Promise<GoalContribution> {
    await this.db.runAsync(
      `INSERT INTO goal_contributions (id, goal_id, account_id, amount, date, created_at)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [input.id, input.goalId, input.accountId, input.amount, input.date, input.createdAt]
    );
    return { ...input };
  }
}
