import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useDataBackup } from "@/features/data/hooks/useDataBackup";
import { formatDisplayDate } from "@/utils/date";

const TABLE_LABELS: Record<string, string> = {
  accounts: "Accounts",
  categories: "Categories",
  transactions: "Transactions",
  transfers: "Transfers",
  lendBorrows: "Lend/Borrow",
  lendBorrowRepayments: "Repayments",
  budgets: "Budgets",
  goals: "Goals",
  goalContributions: "Goal contributions",
  investments: "Investments",
};

export default function DataScreen() {
  const { status, error, lastImportSummary, lastExportedAt, exportBackup, importBackup } = useDataBackup();
  const isBusy = status !== "idle";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Backup &amp; Restore</Text>
      <Text style={styles.intro}>
        Export everything — accounts, transactions, budgets, goals, investments, all of it — into
        one JSON file. Saving it to Google Drive (or anywhere else) is just picking it from the
        share sheet that opens after exporting.
      </Text>

      <Pressable style={[styles.button, styles.exportButton, isBusy && styles.buttonDisabled]} onPress={exportBackup} disabled={isBusy}>
        <Text style={styles.buttonText}>{status === "exporting" ? "Exporting…" : "Export backup"}</Text>
      </Pressable>

      {lastExportedAt && (
        <Text style={styles.hint}>Last export: {formatDisplayDate(lastExportedAt)}</Text>
      )}

      <View style={styles.divider} />

      <Text style={styles.title}>Restore from a backup</Text>
      <Text style={styles.intro}>
        Pick a backup file (from Drive, Files, wherever you saved it). Anything not already in the
        app gets added; anything that already exists is left untouched — nothing gets overwritten
        or duplicated.
      </Text>

      <Pressable style={[styles.button, styles.importButton, isBusy && styles.buttonDisabled]} onPress={importBackup} disabled={isBusy}>
        <Text style={styles.buttonText}>{status === "importing" ? "Importing…" : "Import backup"}</Text>
      </Pressable>

      {error && <Text style={styles.error}>{error}</Text>}

      {lastImportSummary && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Last import</Text>
          {Object.keys(TABLE_LABELS).map((key) => {
            const imported = lastImportSummary.imported[key as keyof typeof lastImportSummary.imported] ?? 0;
            const skipped = lastImportSummary.skipped[key as keyof typeof lastImportSummary.skipped] ?? 0;
            if (imported === 0 && skipped === 0) return null;
            return (
              <Text key={key} style={styles.summaryRow}>
                {TABLE_LABELS[key]}: {imported} added, {skipped} already there
              </Text>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 8 },
  title: { fontSize: 17, fontWeight: "600", marginTop: 8 },
  intro: { fontSize: 13, color: "#6b7280", lineHeight: 18 },
  button: { borderRadius: 8, paddingVertical: 12, alignItems: "center", marginTop: 4 },
  exportButton: { backgroundColor: "#2563eb" },
  importButton: { backgroundColor: "#16a34a" },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#ffffff", fontWeight: "600", fontSize: 14 },
  hint: { fontSize: 12, color: "#9ca3af" },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#e5e7eb", marginVertical: 12 },
  error: { color: "#dc2626", fontSize: 13 },
  summaryCard: { backgroundColor: "#f9fafb", borderRadius: 10, padding: 12, gap: 4, marginTop: 8 },
  summaryTitle: { fontSize: 13, fontWeight: "700", color: "#374151" },
  summaryRow: { fontSize: 12, color: "#6b7280" },
});
