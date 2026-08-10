export type CategoryType = "income" | "expense";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  isCustom: boolean;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  type: CategoryType;
}
