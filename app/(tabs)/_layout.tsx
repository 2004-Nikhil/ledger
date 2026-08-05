import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type IconName = ComponentProps<typeof Ionicons>["name"];

function tabIcon(name: IconName) {
  return ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={name} color={color} size={size} />
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="index" options={{ title: "Dashboard", tabBarIcon: tabIcon("home") }} />
      <Tabs.Screen name="accounts" options={{ title: "Accounts", tabBarIcon: tabIcon("wallet") }} />
      <Tabs.Screen name="transactions" options={{ title: "Transactions", tabBarIcon: tabIcon("swap-horizontal") }} />
      <Tabs.Screen name="budgets" options={{ title: "Budgets", tabBarIcon: tabIcon("pie-chart") }} />
      <Tabs.Screen name="goals" options={{ title: "Goals", tabBarIcon: tabIcon("flag") }} />
      <Tabs.Screen name="investments" options={{ title: "Investments", tabBarIcon: tabIcon("trending-up") }} />
    </Tabs>
  );
}
