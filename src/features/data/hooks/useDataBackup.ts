import { useCallback, useState } from "react";
import { useAppContainer } from "@/composition/AppProvider";
import { writeBackupFile, shareBackupFile, pickBackupFile, readBackupFile } from "@/utils/backupFile";
import type { ImportSummary } from "../types";
import { useAccountStore } from "@/features/accounts/store/useAccountStore";
import { useCategoryStore } from "@/features/categories/store/useCategoryStore";
import { useTransactionStore } from "@/features/transactions/store/useTransactionStore";
import { useTransferStore } from "@/features/transfers/store/useTransferStore";
import { useLendBorrowStore } from "@/features/lendBorrow/store/useLendBorrowStore";
import { useBudgetStore } from "@/features/budgets/store/useBudgetStore";
import { useGoalStore } from "@/features/goals/store/useGoalStore";
import { useInvestmentStore } from "@/features/investments/store/useInvestmentStore";
import { currentMonth } from "@/utils/date";

type Status = "idle" | "exporting" | "importing";

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function useDataBackup() {
  const container = useAppContainer();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastImportSummary, setLastImportSummary] = useState<ImportSummary | null>(null);
  const [lastExportedAt, setLastExportedAt] = useState<string | null>(null);

  // After a merge-import, anything on screen could be stale — every
  // feature's store gets reloaded from the (now-updated) database.
  // Called imperatively via getState() since this runs inside an event
  // handler, not during render.
  const refreshAllStores = useCallback(async () => {
    await Promise.all([
      useAccountStore.getState().load(container.accountService),
      useCategoryStore.getState().load(container.categoryService),
      useTransactionStore.getState().load(container.transactionService),
      useTransferStore.getState().load(container.transferService),
      useLendBorrowStore.getState().load(container.lendBorrowService),
      useGoalStore.getState().load(container.goalService),
      useInvestmentStore.getState().load(container.investmentService),
      useBudgetStore.getState().load(container.budgetService, currentMonth()),
    ]);
  }, [container]);

  const exportBackup = useCallback(async () => {
    setStatus("exporting");
    setError(null);
    try {
      const payload = await container.dataService.exportBackup();
      const json = JSON.stringify(payload, null, 2);
      const uri = await writeBackupFile(json);
      await shareBackupFile(uri);
      setLastExportedAt(payload.exportedAt);
    } catch (e) {
      setError(toMessage(e));
    } finally {
      setStatus("idle");
    }
  }, [container]);

  const importBackup = useCallback(async () => {
    setStatus("importing");
    setError(null);
    try {
      const uri = await pickBackupFile();
      if (!uri) return; // person cancelled the picker — not an error

      const json = await readBackupFile(uri);
      const parsed: unknown = JSON.parse(json);
      const summary = await container.dataService.importBackup(parsed);
      setLastImportSummary(summary);
      await refreshAllStores();
    } catch (e) {
      setError(toMessage(e));
    } finally {
      setStatus("idle");
    }
  }, [container, refreshAllStores]);

  return {
    status,
    error,
    lastImportSummary,
    lastExportedAt,
    exportBackup,
    importBackup,
  };
}
