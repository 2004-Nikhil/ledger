import type { Category } from "../types";

export interface CreateCategoryRow {
  id: string;
  name: string;
  type: Category["type"];
  createdAt: string;
}

export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  create(input: CreateCategoryRow): Promise<Category>;
}
