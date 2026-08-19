import type { SQLiteDatabase } from "expo-sqlite";
import type { IBudgetRepository, UpsertBudgetRow } from "./IBudgetRepository";
import type { Budget } from "../types";

interface BudgetRow {
  id: string;
  category_id: string;
  month: string;
  allotted_amount: number;
  rollover_enabled: number;
  created_at: string;
}

function mapRow(row: BudgetRow): Budget {
  return {
    id: row.id,
    categoryId: row.category_id,
    month: row.month,
    allottedAmount: row.allotted_amount,
    rolloverEnabled: row.rollover_enabled === 1,
    createdAt: row.created_at,
  };
}

export class SqliteBudgetRepository implements IBudgetRepository {
  constructor(private db: SQLiteDatabase) {}

  async findAll(): Promise<Budget[]> {
    const rows = await this.db.getAllAsync<BudgetRow>("SELECT * FROM budgets;");
    return rows.map(mapRow);
  }

  async findByCategoryAndMonth(categoryId: string, month: string): Promise<Budget | null> {
    const row = await this.db.getFirstAsync<BudgetRow>(
      "SELECT * FROM budgets WHERE category_id = ? AND month = ?;",
      [categoryId, month]
    );
    return row ? mapRow(row) : null;
  }

  async create(input: UpsertBudgetRow): Promise<Budget> {
    await this.db.runAsync(
      `INSERT INTO budgets (id, category_id, month, allotted_amount, rollover_enabled, created_at)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        input.id,
        input.categoryId,
        input.month,
        input.allottedAmount,
        input.rolloverEnabled ? 1 : 0,
        input.createdAt,
      ]
    );
    return { ...input };
  }

  async update(id: string, allottedAmount: number, rolloverEnabled: boolean): Promise<Budget> {
    await this.db.runAsync(
      "UPDATE budgets SET allotted_amount = ?, rollover_enabled = ? WHERE id = ?;",
      [allottedAmount, rolloverEnabled ? 1 : 0, id]
    );
    const updated = await this.db.getFirstAsync<BudgetRow>("SELECT * FROM budgets WHERE id = ?;", [id]);
    if (!updated) throw new Error("Budget disappeared during update.");
    return mapRow(updated);
  }
}
