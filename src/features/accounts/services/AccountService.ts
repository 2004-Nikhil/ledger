import type { IAccountRepository } from "../repositories/IAccountRepository";
import type { Account, CreateAccountRequest } from "../types";
import { generateId } from "@/utils/id";

export class AccountService {
  // Depends on the interface, never the concrete SqliteAccountRepository.
  // See composition/container.ts for where the concrete class gets bound.
  constructor(private repository: IAccountRepository) {}

  async createAccount(request: CreateAccountRequest): Promise<Account> {
    const name = request.name.trim();
    if (!name) {
      throw new Error("Account name is required.");
    }
    if (!Number.isFinite(request.openingBalance)) {
      throw new Error("Opening balance must be a number.");
    }

    return this.repository.create({
      id: generateId("acc"),
      name,
      type: request.type,
      openingBalance: request.openingBalance,
      createdAt: new Date().toISOString(),
    });
  }

  async listAccounts(): Promise<Account[]> {
    return this.repository.findAll();
  }

  async getNetWorth(): Promise<number> {
    const accounts = await this.repository.findAll();
    return accounts.reduce((sum, account) => sum + account.currentBalance, 0);
  }
}
