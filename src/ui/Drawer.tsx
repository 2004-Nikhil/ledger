import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Modal, PanResponder, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { IconName } from "./Button";
import { GlassCard } from "./Glass";
import { LinearFill, RadialGlow } from "./Gradient";
import { PressableScale } from "./Pressable";
import { Text } from "./Text";
import { colors, motion, radius, space } from "./theme";

interface DrawerItem {
  name: string;
  href: string;
  label: string;
  hint: string;
  icon: IconName;
  iconActive: IconName;
}

interface DrawerGroup {
  title: string;
  items: DrawerItem[];
}

// The complete map of the app. The dock holds the four most-used; every other
// destination lives here, grouped by intent.
export const DRAWER_GROUPS: DrawerGroup[] = [
  {
    title: "Overview",
    items: [
      { name: "index", href: "/", label: "Home", hint: "Net worth and this month", icon: "home-outline", iconActive: "home" },
      { name: "analytics", href: "/analytics", label: "Analytics", hint: "Trends and category insights", icon: "stats-chart-outline", iconActive: "stats-chart" },
    ],
  },
  {
    title: "Money",
    items: [
      { name: "transactions", href: "/transactions", label: "Activity", hint: "Every transaction, filters, calendar", icon: "swap-horizontal-outline", iconActive: "swap-horizontal" },
      { name: "accounts", href: "/accounts", label: "Accounts", hint: "Balances and transfers", icon: "wallet-outline", iconActive: "wallet" },
      { name: "budgets", href: "/budgets", label: "Budgets", hint: "Monthly limits and categories", icon: "pie-chart-outline", iconActive: "pie-chart" },
    ],
  },
  {
    title: "Plan and grow",
    items: [
      { name: "goals", href: "/goals", label: "Goals", hint: "Savings targets", icon: "flag-outline", iconActive: "flag" },
      { name: "investments", href: "/investments", label: "Investments", hint: "Portfolio and SIPs", icon: "trending-up-outline", iconActive: "trending-up" },
      { name: "lending", href: "/lending", label: "Lend and borrow", hint: "Who owes whom", icon: "people-outline", iconActive: "people" },
    ],
  },
  {
    title: "Manage",
    items: [
      { name: "data", href: "/data", label: "Backup and restore", hint: "Export or import your data", icon: "cloud-upload-outline", iconActive: "cloud-upload" },
    ],
  },
];

function routeNameFromPath(pathname: string): string {
  const seg = pathname.replace(/^\/+/, "").split("/")[0];
  return seg === "" ? "index" : seg;
}

export function Drawer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const active = routeNameFromPath(usePathname());

  const panelWidth = Math.min(332, Math.round(width * 0.86));
  const progress = useRef(new Animated.Value(0)).current;
  const drag = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      drag.setValue(0);
      Animated.timing(progress, { toValue: 1, duration: motion.base + 40, easing: motion.easeOut, useNativeDriver: true }).start();
    } else {
      Animated.timing(progress, { toValue: 0, duration: motion.base, easing: motion.easeInOut, useNativeDriver: true }).start(
        ({ finished }) => finished && setMounted(false)
      );
    }
  }, [visible, progress, drag]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => g.dx < -8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.4,
        onPanResponderMove: (_, g) => drag.setValue(Math.min(0, g.dx)),
        onPanResponderRelease: (_, g) => {
          if (g.dx < -70 || g.vx < -0.6) closeRef.current();
          else Animated.timing(drag, { toValue: 0, duration: motion.base, easing: motion.easeOut, useNativeDriver: true }).start();
        },
        onPanResponderTerminate: () =>
          Animated.timing(drag, { toValue: 0, duration: motion.base, easing: motion.easeOut, useNativeDriver: true }).start(),
      }),
    [drag]
  );

  const translateX = Animated.add(progress.interpolate({ inputRange: [0, 1], outputRange: [-panelWidth, 0] }), drag);
  const version = Constants.expoConfig?.version;

  const go = (item: DrawerItem) => {
    onClose();
    if (item.name !== active) router.navigate(item.href as never);
  };

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
      supportedOrientations={["portrait", "portrait-upside-down", "landscape", "landscape-left", "landscape-right"]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim, opacity: progress }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close menu" />
      </Animated.View>

      <Animated.View
        {...pan.panHandlers}
        accessibilityViewIsModal
        style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: panelWidth, transform: [{ translateX }] }}
      >
        <GlassCard
          variant="float"
          blur
          tint="rgba(10,13,20,0.9)"
          radius={radius.xl}
          style={{ flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, height }}
        >
          <View pointerEvents="none" style={styles.aurora}>
            <RadialGlow color={colors.aurora.blue} opacity={0.2} />
          </View>
          <View pointerEvents="none" style={styles.auroraLow}>
            <RadialGlow color={colors.aurora.violet} opacity={0.1} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: insets.top + space.xl,
              paddingBottom: insets.bottom + space.xl,
              paddingLeft: space.lg + insets.left,
              paddingRight: space.lg,
              gap: space.xl,
            }}
          >
            <View style={styles.brand}>
              <View style={styles.mark}>
                <LinearFill stops={[{ offset: 0, color: "#A9C0FF", opacity: 0.3 }, { offset: 1, color: colors.accent, opacity: 0.08 }]} />
                <Ionicons name="diamond-outline" size={18} color={colors.text} />
              </View>
              <View>
                <Text variant="heading">Ledger</Text>
                <Text variant="caption" tone="secondary">
                  Your money, quietly in order
                </Text>
              </View>
            </View>

            {DRAWER_GROUPS.map((group) => (
              <View key={group.title} style={{ gap: space.xs }}>
                <Text variant="captionStrong" tone="secondary" style={{ paddingHorizontal: space.md, paddingBottom: space.xs }}>
                  {group.title}
                </Text>
                {group.items.map((item) => {
                  const selected = item.name === active;
                  return (
                    <PressableScale
                      key={item.name}
                      onPress={() => go(item)}
                      scale={0.98}
                      accessibilityRole="button"
                      accessibilityLabel={`${item.label}. ${item.hint}`}
                      accessibilityState={{ selected }}
                      style={[styles.item, selected && styles.itemActive]}
                    >
                      {selected && (
                        <>
                          <View pointerEvents="none" style={styles.itemGlow}>
                            <RadialGlow color={colors.aurora.blue} opacity={0.3} />
                          </View>
                          <View style={styles.itemBar} />
                        </>
                      )}
                      <Ionicons name={selected ? item.iconActive : item.icon} size={21} color={selected ? colors.text : colors.textSecondary} />
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyStrong" tone={selected ? "primary" : "secondary"} numberOfLines={1}>
                          {item.label}
                        </Text>
                      </View>
                    </PressableScale>
                  );
                })}
              </View>
            ))}

            <Text variant="caption" tone="muted" style={{ paddingHorizontal: space.md }}>
              {version ? `Ledger ${version} · ` : ""}Stored on this device
            </Text>
          </ScrollView>
        </GlassCard>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  aurora: { position: "absolute", top: -140, left: -140, width: 420, height: 420 },
  auroraLow: { position: "absolute", bottom: -160, right: -160, width: 380, height: 380 },
  brand: { flexDirection: "row", alignItems: "center", gap: space.md, paddingHorizontal: space.sm },
  mark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: colors.accentBorder,
    backgroundColor: colors.accentSoft,
  },
  item: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  itemActive: { backgroundColor: "rgba(79,124,255,0.10)", borderWidth: StyleSheet.hairlineWidth * 1.5, borderColor: colors.accentBorder },
  itemGlow: { position: "absolute", left: -60, top: -40, width: 200, height: 130 },
  itemBar: {
    position: "absolute",
    left: 0,
    top: 14,
    bottom: 14,
    width: 3,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    backgroundColor: colors.aurora.cyan,
  },
});
