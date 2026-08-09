export type CategoryType = "income" | "expense";

export interface DefaultCategory {
  id: string;
  name: string;
  type: CategoryType;
}

/**
 * Seeded into the categories table by migration 002. Ids are stable,
 * human-readable slugs (not random) precisely so the migration can
 * `INSERT OR IGNORE` them safely on every app version without ever
 * duplicating a row.
 */
export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { id: "income_salary", name: "Salary", type: "income" },
  { id: "income_gift", name: "Gift", type: "income" },
  { id: "income_bonus", name: "Bonus", type: "income" },
  { id: "income_investment", name: "Investment", type: "income" },
  { id: "income_reward", name: "Reward", type: "income" },
  { id: "income_other", name: "Other", type: "income" },

  { id: "expense_food", name: "Food", type: "expense" },
  { id: "expense_clothes", name: "Clothes", type: "expense" },
  { id: "expense_electronics", name: "Electronics", type: "expense" },
  { id: "expense_entertainment", name: "Entertainment", type: "expense" },
  { id: "expense_travel", name: "Travel", type: "expense" },
  { id: "expense_gift", name: "Gift", type: "expense" },
  { id: "expense_transport", name: "Transport", type: "expense" },
  { id: "expense_education", name: "Education", type: "expense" },
  { id: "expense_sports", name: "Sports", type: "expense" },
  { id: "expense_housing", name: "Housing / Rent", type: "expense" },
];
