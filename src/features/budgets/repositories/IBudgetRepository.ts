import type { Budget } from "../types";

export interface UpsertBudgetRow {
  id: string;
  categoryId: string;
  month: string;
  allottedAmount: number;
  rolloverEnabled: boolean;
  createdAt: string;
}

export interface IBudgetRepository {
  /** All budgets, all categories, all months — BudgetService needs the whole graph for rollover math. */
  findAll(): Promise<Budget[]>;
  findByCategoryAndMonth(categoryId: string, month: string): Promise<Budget | null>;
  create(input: UpsertBudgetRow): Promise<Budget>;
  update(id: string, allottedAmount: number, rolloverEnabled: boolean): Promise<Budget>;
}
