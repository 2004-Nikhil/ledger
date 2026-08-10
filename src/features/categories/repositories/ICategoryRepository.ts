import type { Category } from "../types";

export interface CreateCategoryRow {
  id: string;
  name: string;
  type: Category["type"];
  createdAt: string;
}

export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  create(input: CreateCategoryRow): Promise<Category>;
}
