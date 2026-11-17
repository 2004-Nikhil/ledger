import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDataBackup } from "@/features/data/hooks/useDataBackup";
import { formatDisplayDate } from "@/utils/date";
import { Button, Divider, ErrorNotice, GlassCard, Screen, Text, colors, space } from "@/ui";
import type { IconName } from "@/ui";

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

function ActionCard({ icon, title, body, children }: { icon: IconName; title: string; body: string; children: React.ReactNode }) {
  return (
    <GlassCard padding={space.xl} style={{ gap: space.lg }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accentBorder }}>
          <Ionicons name={icon} size={20} color={colors.accentText} />
        </View>
        <Text variant="heading" style={{ flex: 1 }}>
          {title}
        </Text>
      </View>
      <Text variant="body" tone="secondary">
        {body}
      </Text>
      {children}
    </GlassCard>
  );
}

export default function DataScreen() {
  const { status, error, lastImportSummary, lastExportedAt, exportBackup, importBackup } = useDataBackup();
  const isBusy = status !== "idle";

  const importedRows = lastImportSummary
    ? Object.keys(TABLE_LABELS)
        .map((key) => ({
          key,
          imported: lastImportSummary.imported[key as keyof typeof lastImportSummary.imported] ?? 0,
          skipped: lastImportSummary.skipped[key as keyof typeof lastImportSummary.skipped] ?? 0,
        }))
    : [];

  return (
    <Screen title="Backup and restore" subtitle="Your data lives on this device. Keep a copy somewhere safe.">
      {error ? <ErrorNotice title={status === "importing" ? "Import failed" : "Backup problem"} message={error} /> : null}

      <ActionCard
        icon="cloud-upload-outline"
        title="Export a backup"
        body="Export everything (accounts, transactions, budgets, goals, investments, all of it) into one JSON file. To save it to Google Drive or anywhere else, pick it from the share sheet that opens."
      >
        <Button label={status === "exporting" ? "Exporting…" : "Export backup"} icon="share-outline" loading={status === "exporting"} disabled={isBusy} onPress={exportBackup} fullWidth size="lg" />
        {lastExportedAt ? (
          <Text variant="caption" tone="secondary">
            Last export: {formatDisplayDate(lastExportedAt)}
          </Text>
        ) : null}
      </ActionCard>

      <ActionCard
        icon="cloud-download-outline"
        title="Restore from a backup"
        body="Pick a backup file from Drive, Files, or wherever you saved it. Anything not already in the app gets added; anything that already exists is left untouched. Nothing is overwritten or duplicated."
      >
        <Button label={status === "importing" ? "Importing…" : "Import backup"} icon="folder-open-outline" variant="glass" loading={status === "importing"} disabled={isBusy} onPress={importBackup} fullWidth size="lg" />
      </ActionCard>

      {lastImportSummary ? (
        <View style={{ gap: space.md }}>
          <Text variant="heading" accessibilityRole="header">
            Last import
          </Text>
          <GlassCard style={{ paddingHorizontal: space.lg }}>
            {importedRows.map((r, i) => (
                <View key={r.key}>
                  {i > 0 && <Divider />}
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: space.md, paddingVertical: 14 }}>
                    <Text variant="bodyStrong" tone={r.imported === 0 && r.skipped === 0 ? "secondary" : "primary"} style={{ flex: 1 }}>
                      {TABLE_LABELS[r.key]}
                    </Text>
                    <Text variant="caption" tone="secondary" style={{ textAlign: "right", flexShrink: 1 }}>
                      <Text variant="captionStrong" tone={r.imported > 0 ? "positive" : "secondary"}>
                        {r.imported} added
                      </Text>
                      {`  ·  ${r.skipped} already there`}
                    </Text>
                  </View>
                </View>
              ))}
          </GlassCard>
        </View>
      ) : null}
    </Screen>
  );
}
