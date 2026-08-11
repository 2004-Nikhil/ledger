export type AccountType = "cash" | "card" | "bank";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  openingBalance: number;
  currentBalance: number;
  createdAt: string;
}

export interface CreateAccountRequest {
  name: string;
  type: AccountType;
  openingBalance: number;
}
