import type { SQLiteDatabase } from "expo-sqlite";
import type { ICategoryRepository, CreateCategoryRow } from "./ICategoryRepository";
import type { Category } from "../types";

interface CategoryRow {
  id: string;
  name: string;
  type: Category["type"];
  is_custom: number;
  created_at: string;
}

function mapRow(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    isCustom: row.is_custom === 1,
    createdAt: row.created_at,
  };
}

export class SqliteCategoryRepository implements ICategoryRepository {
  constructor(private db: SQLiteDatabase) {}

  async findAll(): Promise<Category[]> {
    const rows = await this.db.getAllAsync<CategoryRow>(
      "SELECT * FROM categories ORDER BY is_custom ASC, name ASC;"
    );
    return rows.map(mapRow);
  }

  async create(input: CreateCategoryRow): Promise<Category> {
    await this.db.runAsync(
      "INSERT INTO categories (id, name, type, is_custom, created_at) VALUES (?, ?, ?, 1, ?);",
      [input.id, input.name, input.type, input.createdAt]
    );
    return {
      id: input.id,
      name: input.name,
      type: input.type,
      isCustom: true,
      createdAt: input.createdAt,
    };
  }
}
