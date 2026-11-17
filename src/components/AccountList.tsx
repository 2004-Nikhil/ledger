import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Account } from "@/features/accounts/types";
import { Divider, EmptyState, GlassCard, MoneyText, SkeletonRows, Text, colors, space, useMetrics } from "@/ui";

const TYPE_LABEL: Record<Account["type"], string> = {
  cash: "Cash",
  card: "Card",
  bank: "Bank",
};

const TYPE_ICON = {
  cash: "cash-outline",
  card: "card-outline",
  bank: "business-outline",
} as const;

type Props = {
  accounts: Account[];
  netWorth: number;
  loading?: boolean;
  onAddAccount?: () => void;
};

export function AccountList({ accounts, netWorth, loading = false, onAddAccount }: Props) {
  const { columns } = useMetrics();

  return (
    <View style={{ gap: space.xl }}>
      <GlassCard variant="solid" glow="blue" glowCorner="tr" padding={space.xl} style={{ gap: space.sm }}>
        <Text variant="caption" tone="secondary">
          Total balance
        </Text>
        <MoneyText amount={netWorth} size="display" animate tone={netWorth < 0 ? "negative" : "primary"} />
        <Text variant="caption" tone="secondary">
          {accounts.length === 1 ? "Across 1 account" : `Across ${accounts.length} accounts`}
        </Text>
      </GlassCard>

      {loading && accounts.length === 0 ? (
        <SkeletonRows count={3} />
      ) : accounts.length === 0 ? (
        <EmptyState
          icon="wallet-outline"
          title="No accounts yet"
          message="Add your first account to start tracking balances."
          actionLabel={onAddAccount ? "Add account" : undefined}
          onAction={onAddAccount}
        />
      ) : columns === 2 ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.md }}>
          {accounts.map((a) => (
            <GlassCard key={a.id} padding={space.lg} style={{ width: "48.5%" }}>
              <AccountRow account={a} stacked />
            </GlassCard>
          ))}
        </View>
      ) : (
        <GlassCard style={{ paddingHorizontal: space.lg }}>
          {accounts.map((a, i) => (
            <View key={a.id}>
              {i > 0 && <Divider inset={56} />}
              <AccountRow account={a} />
            </View>
          ))}
        </GlassCard>
      )}
    </View>
  );
}

function AccountRow({ account, stacked = false }: { account: Account; stacked?: boolean }) {
  const icon = (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Ionicons name={TYPE_ICON[account.type]} size={19} color={colors.accentText} />
    </View>
  );
  const title = (
    <View style={{ flex: stacked ? undefined : 1, gap: 2 }}>
      <Text variant="bodyStrong" numberOfLines={1}>
        {account.name}
      </Text>
      <Text variant="caption" tone="secondary">
        {TYPE_LABEL[account.type]}
      </Text>
    </View>
  );
  const balance = (
    <MoneyText amount={account.currentBalance} size="figureSm" tone={account.currentBalance < 0 ? "negative" : "primary"} align={stacked ? "left" : "right"} style={stacked ? undefined : { maxWidth: 150 }} />
  );

  if (stacked) {
    return (
      <View style={{ gap: space.md }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
          {icon}
          {title}
        </View>
        {balance}
      </View>
    );
  }
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: 14 }}>
      {icon}
      {title}
      {balance}
    </View>
  );
}
