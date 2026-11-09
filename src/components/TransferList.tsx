import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Transfer } from "@/features/transfers/types";
import type { Account } from "@/features/accounts/types";
import { Divider, GlassCard, MoneyText, Text, colors, space } from "@/ui";
import { formatDisplayDate } from "@/utils/date";

type Props = {
  transfers: Transfer[];
  accountsById: Map<string, Account>;
};

export function TransferList({ transfers, accountsById }: Props) {
  if (transfers.length === 0) return null;

  return (
    <GlassCard style={{ paddingHorizontal: space.lg }}>
      {transfers.map((item, i) => {
        const from = accountsById.get(item.fromAccountId)?.name ?? "Unknown";
        const to = accountsById.get(item.toAccountId)?.name ?? "Unknown";
        return (
          <View key={item.id}>
            {i > 0 && <Divider />}
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: 14 }}
              accessible
              accessibilityLabel={`Transfer from ${from} to ${to}, ${formatDisplayDate(item.date)}`}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {from}
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.accentText} />
                  <Text variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {to}
                  </Text>
                </View>
                <Text variant="caption" tone="secondary">
                  {formatDisplayDate(item.date)}
                </Text>
              </View>
              <MoneyText amount={item.amount} size="figureSm" style={{ maxWidth: 140 }} align="right" />
            </View>
          </View>
        );
      })}
    </GlassCard>
  );
}
