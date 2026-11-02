import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, type IconName } from "./Button";
import { GlassCard } from "./Glass";
import { RadialGlow } from "./Gradient";
import { useReducedMotion } from "./hooks";
import { Text } from "./Text";
import { colors, motion, radius, space } from "./theme";

/** An empty screen is an invitation to act, not a dead end. */
export function EmptyState({
  icon = "sparkles-outline",
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon?: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyOrb}>
        <RadialGlow color={colors.aurora.blue} opacity={0.22} />
        <View style={styles.emptyIcon}>
          <Ionicons name={icon} size={22} color={colors.accentText} />
        </View>
      </View>
      <Text variant="subheading" style={{ textAlign: "center" }}>
        {title}
      </Text>
      {message ? (
        <Text variant="caption" tone="secondary" style={{ textAlign: "center", maxWidth: 280 }}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} variant="glass" size="sm" style={{ marginTop: 6 }} /> : null}
    </View>
  );
}

/** Something failed — say what, and offer the way out. */
export function ErrorNotice({ message, onRetry, title = "Something went wrong" }: { message: string; onRetry?: () => void; title?: string }) {
  return (
    <GlassCard
      quiet
      radius={radius.md}
      padding={space.lg}
      style={{ borderColor: colors.negativeBorder, backgroundColor: colors.negativeSoft, gap: space.sm }}
      accessibilityRole="alert"
    >
      <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
        <Ionicons name="alert-circle-outline" size={20} color={colors.negative} style={{ marginTop: 1 }} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong">{title}</Text>
          <Text variant="caption" tone="secondary">
            {message}
          </Text>
        </View>
      </View>
      {onRetry ? <Button label="Try again" variant="glass" size="sm" icon="refresh-outline" onPress={onRetry} /> : null}
    </GlassCard>
  );
}

/** Placeholder block that breathes while data loads. */
export function Skeleton({ height = 16, width = "100%", r = 8, style }: { height?: number; width?: number | `${number}%`; r?: number; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  const pulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: motion.easeInOut, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 900, easing: motion.easeInOut, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reduced, pulse]);
  return <Animated.View style={[{ height, width, borderRadius: r, backgroundColor: "rgba(255,255,255,0.07)", opacity: pulse }, style]} />;
}

export function SkeletonRows({ count = 3 }: { count?: number }) {
  return (
    <View style={{ gap: 18 }} accessibilityLabel="Loading" accessibilityRole="progressbar">
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Skeleton width={40} height={40} r={20} />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton width="55%" height={14} />
            <Skeleton width="35%" height={11} />
          </View>
          <Skeleton width={64} height={14} />
        </View>
      ))}
    </View>
  );
}

/** Full-screen boot states (rendered by AppProvider before the DB is ready). */
export function BootLoading({ label = "Setting up your ledger" }: { label?: string }) {
  return (
    <View style={styles.boot}>
      <View style={styles.bootOrb}>
        <RadialGlow color={colors.aurora.blue} opacity={0.3} />
      </View>
      <ActivityIndicator size="small" color={colors.accentText} />
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
    </View>
  );
}

export function BootError({ message }: { message: string }) {
  return (
    <View style={styles.boot}>
      <Ionicons name="alert-circle-outline" size={28} color={colors.negative} />
      <Text variant="heading">Ledger couldn't start</Text>
      <Text variant="caption" tone="secondary" style={{ textAlign: "center", maxWidth: 320 }}>
        {message}
      </Text>
      <Text variant="caption" tone="muted" style={{ textAlign: "center", maxWidth: 320 }}>
        Close and reopen the app. Your data is untouched.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: "center", gap: 8, paddingVertical: 32, paddingHorizontal: 16 },
  emptyOrb: { width: 96, height: 96, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: colors.border,
  },
  boot: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 32, backgroundColor: colors.bg },
  bootOrb: { position: "absolute", width: 420, height: 420 },
});
