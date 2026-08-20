import { View, Text, Pressable, StyleSheet } from "react-native";
import { formatMonthLabel } from "@/utils/date";

type Props = {
  month: string;
  onPrevious: () => void;
  onNext: () => void;
};

export function MonthNavigator({ month, onPrevious, onNext }: Props) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onPrevious} hitSlop={10}>
        <Text style={styles.arrow}>{"\u2039"}</Text>
      </Pressable>
      <Text style={styles.label}>{formatMonthLabel(month)}</Text>
      <Pressable onPress={onNext} hitSlop={10}>
        <Text style={styles.arrow}>{"\u203A"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20, paddingVertical: 4 },
  arrow: { fontSize: 24, color: "#2563eb", fontWeight: "700", paddingHorizontal: 8 },
  label: { fontSize: 16, fontWeight: "600", minWidth: 160, textAlign: "center" },
});
