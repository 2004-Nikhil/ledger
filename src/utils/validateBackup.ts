import type { BackupData, BackupPayload } from "@/features/data/types";
import { BACKUP_VERSION } from "@/features/data/types";

const REQUIRED_ARRAYS: (keyof BackupData)[] = [
  "accounts",
  "categories",
  "transactions",
  "transfers",
  "lendBorrows",
  "lendBorrowRepayments",
  "budgets",
  "goals",
  "goalContributions",
  "investments",
];

/**
 * Deliberately not a full schema-validation library (zod, etc.) — this
 * is a JSON file the app itself produced, so we only need to catch
 * "wrong file entirely" or "corrupted/truncated" cases with a clear
 * error, not validate every field of every row.
 */
export function validateBackupPayload(raw: unknown): BackupPayload {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("This doesn't look like a Ledger backup file.");
  }

  const obj = raw as Record<string, unknown>;

  if (obj.version !== BACKUP_VERSION) {
    const found = "version" in obj ? String(obj.version) : "none";
    throw new Error(`Unsupported backup version (found: ${found}, expected: ${BACKUP_VERSION}).`);
  }

  if (typeof obj.data !== "object" || obj.data === null) {
    throw new Error("Backup file is missing its data section.");
  }

  const data = obj.data as Record<string, unknown>;
  for (const key of REQUIRED_ARRAYS) {
    if (!Array.isArray(data[key])) {
      throw new Error(`Backup file is missing or has an invalid "${key}" section.`);
    }
  }

  return obj as unknown as BackupPayload;
}
