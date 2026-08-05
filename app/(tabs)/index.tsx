import { View, Text, StyleSheet } from "react-native";
import { useAppContainer } from "@/composition/AppProvider";

export default function DashboardScreen() {
  // Just reading `db` off the container proves it's wired end to end —
  // if this renders, migrations already ran successfully on this device.
  useAppContainer();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.status}>Database connection: ready</Text>
      <Text style={styles.hint}>
        This is a placeholder — the real dashboard (income/expense summary,
        charts) arrives once the Accounts and Transactions features are built.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12 },
  title: { fontSize: 22, fontWeight: "600" },
  status: { fontSize: 16, color: "#16a34a", fontWeight: "500" },
  hint: { fontSize: 13, color: "#6b7280", lineHeight: 18 },
});
