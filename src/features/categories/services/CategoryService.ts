import type { ICategoryRepository } from "../repositories/ICategoryRepository";
import type { Category, CreateCategoryRequest } from "../types";
import { generateId } from "@/utils/id";

export class CategoryService {
  constructor(private repository: ICategoryRepository) {}

  async listCategories(): Promise<Category[]> {
    return this.repository.findAll();
  }

  async createCustomCategory(request: CreateCategoryRequest): Promise<Category> {
    const name = request.name.trim();
    if (!name) {
      throw new Error("Category name is required.");
    }
    return this.repository.create({
      id: generateId("cat"),
      name,
      type: request.type,
      createdAt: new Date().toISOString(),
    });
  }
}
