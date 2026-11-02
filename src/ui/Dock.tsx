import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { IconName } from "./Button";
import { GlassCard } from "./Glass";
import { LinearFill, RadialGlow } from "./Gradient";
import { useKeyboard, useMetrics, useReducedMotion } from "./hooks";
import { PressableScale } from "./Pressable";
import { useShell } from "./Shell";
import { Text } from "./Text";
import { colors, layout, motion, radius } from "./theme";

interface DockRoute {
  name: string;
  label: string;
  icon: IconName;
  iconActive: IconName;
}

// The four most-used destinations. Everything else lives in the side drawer.
const LEFT: DockRoute[] = [
  { name: "index", label: "Home", icon: "home-outline", iconActive: "home" },
  { name: "transactions", label: "Activity", icon: "swap-horizontal-outline", iconActive: "swap-horizontal" },
];
const RIGHT: DockRoute[] = [
  { name: "accounts", label: "Accounts", icon: "wallet-outline", iconActive: "wallet" },
  { name: "budgets", label: "Budgets", icon: "pie-chart-outline", iconActive: "pie-chart" },
];
const SLOTS = 5; // 2 left + add + 2 right
const SLOT_OF: Record<string, number> = { index: 0, transactions: 1, accounts: 3, budgets: 4 };

const PAD = 8;

export function Dock({ state, navigation }: BottomTabBarProps) {
  const m = useMetrics();
  const kb = useKeyboard();
  const reduced = useReducedMotion();
  const { openQuickAdd } = useShell();

  const activeName = state.routes[state.index]?.name;
  const activeSlot = activeName !== undefined ? SLOT_OF[activeName] : undefined;
  const onDock = activeSlot !== undefined;

  const compact = m.sizeClass === "compact";
  const edge = compact ? 24 : 32;
  const dockWidth = Math.min(m.width - Math.max(edge, (m.insets.left + m.insets.right) / 2 + 24), layout.dockMaxWidth);
  const slotW = (dockWidth - PAD * 2) / SLOTS;

  // Indicator glides between slots; fades out on drawer-only destinations.
  const pos = useRef(new Animated.Value(activeSlot ?? 0)).current;
  const lit = useRef(new Animated.Value(onDock ? 1 : 0)).current;
  useEffect(() => {
    const dur = reduced ? 0 : 320;
    if (activeSlot !== undefined) {
      Animated.timing(pos, { toValue: activeSlot, duration: dur, easing: motion.easeOut, useNativeDriver: true }).start();
    }
    Animated.timing(lit, { toValue: onDock ? 1 : 0, duration: dur ? 220 : 0, easing: motion.easeOut, useNativeDriver: true }).start();
  }, [activeSlot, onDock, pos, lit, reduced]);

  // Tuck away while typing.
  const hide = useRef(new Animated.Value(0)).current;
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    setHidden(kb.visible);
    Animated.timing(hide, { toValue: kb.visible ? 1 : 0, duration: reduced ? 0 : 200, easing: motion.easeOut, useNativeDriver: true }).start();
  }, [kb.visible, hide, reduced]);

  const press = (name: string) => {
    const route = state.routes.find((r) => r.name === name);
    if (!route) return;
    const focused = state.routes[state.index]?.name === name;
    const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
    if (!focused && !event.defaultPrevented) navigation.navigate(route.name as never);
  };

  const renderItem = (r: DockRoute) => {
    const focused = activeName === r.name;
    return (
      <Pressable
        key={r.name}
        onPress={() => press(r.name)}
        accessibilityRole="tab"
        accessibilityLabel={r.label}
        accessibilityState={{ selected: focused }}
        style={{ width: slotW, height: "100%", alignItems: "center", justifyContent: "center", gap: 3 }}
      >
        <Ionicons name={focused ? r.iconActive : r.icon} size={22} color={focused ? colors.text : colors.textSecondary} />
        <Text
          variant="micro"
          tone={focused ? "primary" : "secondary"}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          maxFontSizeMultiplier={1.15}
          style={{ maxWidth: slotW - 2, fontSize: compact ? 11 : 12 }}
        >
          {r.label}
        </Text>
      </Pressable>
    );
  };

  const fade = hide.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  return (
    <>
    {/* Content dissolves into the background beneath the dock. */}
    <Animated.View pointerEvents="none" style={[styles.scrim, { height: m.dockClearance + 28, opacity: fade }]}>
      <LinearFill
        stops={[
          { offset: 0, color: colors.bg, opacity: 0 },
          { offset: 0.6, color: colors.bg, opacity: 0.88 },
          { offset: 1, color: colors.bg, opacity: 0.99 },
        ]}
      />
    </Animated.View>
    <Animated.View
      pointerEvents={hidden ? "none" : "box-none"}
      style={[
        styles.anchor,
        {
          bottom: m.dockBottom,
          opacity: fade,
          transform: [{ translateY: hide.interpolate({ inputRange: [0, 1], outputRange: [0, 24] }) }],
        },
      ]}
    >
      <GlassCard
        variant="float"
        blur
        radius={radius.dock}
        style={{ width: dockWidth, height: m.dockHeight, borderColor: "rgba(255,255,255,0.11)" }}
        accessibilityRole="tablist"
      >
        <View style={[styles.row, { paddingHorizontal: PAD }]}>
          {/* Luminous indicator: a small aurora light under the active icon. */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              {
                width: slotW,
                opacity: lit,
                transform: [{ translateX: Animated.multiply(pos, slotW) }],
              },
            ]}
          >
            <View style={styles.indicatorGlow}>
              <RadialGlow color={colors.aurora.blue} opacity={0.42} />
            </View>
            <View style={styles.indicatorBar}>
              <LinearFill
                from={[0, 0]}
                to={[1, 0]}
                stops={[
                  { offset: 0, color: colors.aurora.blue, opacity: 0 },
                  { offset: 0.5, color: "#A9C0FF", opacity: 1 },
                  { offset: 1, color: colors.aurora.cyan, opacity: 0 },
                ]}
              />
            </View>
          </Animated.View>

          {LEFT.map(renderItem)}

          <View style={{ width: slotW, alignItems: "center", justifyContent: "center" }}>
            <View pointerEvents="none" style={styles.addGlow}>
              <RadialGlow color={colors.aurora.blue} opacity={0.5} />
            </View>
            <PressableScale
              onPress={openQuickAdd}
              scale={0.94}
              accessibilityRole="button"
              accessibilityLabel="Log a transaction"
              hitSlop={6}
              style={styles.add}
            >
              <LinearFill
                stops={[
                  { offset: 0, color: "#A9C0FF", opacity: 0.32 },
                  { offset: 1, color: colors.accent, opacity: 0.1 },
                ]}
              />
              <Ionicons name="add" size={26} color={colors.text} />
            </PressableScale>
          </View>

          {RIGHT.map(renderItem)}
        </View>
      </GlassCard>
    </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  scrim: { position: "absolute", left: 0, right: 0, bottom: 0 },
  anchor: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  row: { flex: 1, flexDirection: "row", alignItems: "center" },
  indicator: { position: "absolute", left: PAD, top: 0, bottom: 0, alignItems: "center" },
  indicatorGlow: { position: "absolute", top: -6, width: 84, height: 60 },
  indicatorBar: { position: "absolute", bottom: 5, width: 22, height: 2, borderRadius: 1, overflow: "hidden" },
  addGlow: { position: "absolute", width: 96, height: 96 },
  add: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "rgba(79,124,255,0.22)",
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: colors.accentBorder,
  },
});
