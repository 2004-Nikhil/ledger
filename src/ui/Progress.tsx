import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { LinearFill } from "./Gradient";
import { useReducedMotion } from "./hooks";
import { motion, shadow } from "./theme";

export type ProgressTone = "accent" | "positive" | "negative";

const TONE: Record<ProgressTone, { from: string; to: string }> = {
  accent: { from: "#4F7CFF", to: "#45D9FF" },
  positive: { from: "#2BBF88", to: "#35E6A4" },
  negative: { from: "#FF6B7A", to: "#FF9A8A" },
};

/** Thin luminous bar. Fills in once on mount, then eases between values. */
export function ProgressBar({
  value,
  tone = "accent",
  height = 6,
  label,
}: {
  /** 0..1 */
  value: number;
  tone?: ProgressTone;
  height?: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const reduced = useReducedMotion();
  const anim = useRef(new Animated.Value(reduced ? clamped : 0)).current;

  useEffect(() => {
    if (reduced) {
      anim.setValue(clamped);
      return;
    }
    Animated.timing(anim, { toValue: clamped, duration: motion.slow * 1.6, easing: motion.easeOut, useNativeDriver: false }).start();
  }, [clamped, reduced, anim]);

  const t = TONE[tone];
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.track, { height, borderRadius: height / 2 }]}
    >
      <Animated.View
        style={[
          { height, borderRadius: height / 2, backgroundColor: t.from },
          shadow.glow(t.to),
          { width: anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) },
        ]}
      >
        <View style={{ flex: 1, borderRadius: height / 2, overflow: "hidden" }}>
          <LinearFill from={[0, 0]} to={[1, 0]} stops={[{ offset: 0, color: t.from }, { offset: 1, color: t.to }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: "rgba(255,255,255,0.07)", overflow: "visible", justifyContent: "center" },
});
