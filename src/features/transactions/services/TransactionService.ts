import type { SQLiteDatabase } from "expo-sqlite";
import type { ITransactionRepository } from "../repositories/ITransactionRepository";
import type { IAccountRepository } from "@/features/accounts/repositories/IAccountRepository";
import type { Transaction, CreateTransactionRequest } from "../types";
import { generateId } from "@/utils/id";

/** How long a transaction stays editable after creation, per the feature plan. */
export const EDIT_WINDOW_MINUTES = 20;

export class TransactionService {
  constructor(
    // `db` is used only to draw a transaction boundary around the two
    // repository writes below — it never runs raw SQL itself. Everything
    // that touches table shape still goes through the repositories.
    private db: SQLiteDatabase,
    private transactionRepository: ITransactionRepository,
    private accountRepository: IAccountRepository
  ) {}

  async createTransaction(request: CreateTransactionRequest): Promise<Transaction> {
    if (!request.name.trim()) {
      throw new Error("Transaction name is required.");
    }
    if (!Number.isFinite(request.amount) || request.amount <= 0) {
      throw new Error("Amount must be greater than zero.");
    }

    const account = await this.accountRepository.findById(request.accountId);
    if (!account) {
      throw new Error("Selected account no longer exists.");
    }

    const now = new Date();
    const lockedUntil = new Date(now.getTime() + EDIT_WINDOW_MINUTES * 60_000);

    // The only place this sign decision is made — the account's balance
    // and the transaction row can never disagree about it.
    const balanceDelta = request.type === "income" ? request.amount : -request.amount;

    const row = {
      id: generateId("txn"),
      name: request.name.trim(),
      amount: request.amount,
      date: request.date,
      categoryId: request.categoryId,
      accountId: request.accountId,
      type: request.type,
      notes: request.notes?.trim() || null,
      lockedUntil: lockedUntil.toISOString(),
      createdAt: now.toISOString(),
    };

    let created: Transaction | undefined;

    // Both writes succeed together or neither does — a transaction row
    // can never exist without its matching balance update, or vice versa.
    await this.db.withTransactionAsync(async () => {
      created = await this.transactionRepository.create(row);
      await this.accountRepository.adjustBalance(request.accountId, balanceDelta);
    });

    if (!created) {
      throw new Error("Transaction failed to save.");
    }
    return created;
  }

  async listTransactions(): Promise<Transaction[]> {
    return this.transactionRepository.findAll();
  }

  /** The 15–20 min immutable-ledger rule, enforced here — not in the UI, not in the repository. */
  isEditable(transaction: Transaction): boolean {
    return new Date() < new Date(transaction.lockedUntil);
  }
}
