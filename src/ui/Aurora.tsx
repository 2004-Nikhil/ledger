import { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, View, useWindowDimensions } from "react-native";
import { RadialGlow } from "./Gradient";
import { useReducedMotion } from "./hooks";
import { colors, material, motion } from "./theme";

interface BlobSpec {
  color: string;
  /** Centre, as a fraction of the viewport. */
  cx: number;
  cy: number;
  /** Radius as a fraction of the longer viewport side. */
  r: number;
  opacity: number;
  /** Drift amplitude in px and period multiplier. */
  ampX: number;
  ampY: number;
  period: number;
}

// Localised lighting: a cool key light top-left, a faint cyan rim top-right,
// a whisper of green mid-right, violet pooling at the bottom. All very low.
const BLOBS: BlobSpec[] = [
  { color: colors.aurora.blue, cx: 0.12, cy: 0.06, r: 0.62, opacity: 0.17, ampX: 34, ampY: 22, period: 1 },
  { color: colors.aurora.cyan, cx: 0.92, cy: 0.02, r: 0.34, opacity: 0.075, ampX: 22, ampY: 30, period: 1.25 },
  { color: colors.aurora.green, cx: 1.0, cy: 0.58, r: 0.5, opacity: 0.06, ampX: 28, ampY: 34, period: 1.5 },
  { color: colors.aurora.violet, cx: 0.06, cy: 0.98, r: 0.55, opacity: 0.085, ampX: 30, ampY: 24, period: 1.15 },
];

function Blob({ spec, reduced }: { spec: BlobSpec; reduced: boolean }) {
  const { width, height } = useWindowDimensions();
  const size = Math.max(width, height) * spec.r * 2;
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) return;
    const loop = (v: Animated.Value, ms: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      );
    const a = loop(x, motion.drift * spec.period);
    const b = loop(y, motion.drift * spec.period * 1.31);
    a.start();
    b.start();
    return () => {
      a.stop();
      b.stop();
    };
  }, [reduced, spec.period, x, y]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        width: size,
        height: size,
        left: width * spec.cx - size / 2,
        top: height * spec.cy - size / 2,
        transform: [
          { translateX: x.interpolate({ inputRange: [0, 1], outputRange: [-spec.ampX, spec.ampX] }) },
          { translateY: y.interpolate({ inputRange: [0, 1], outputRange: [-spec.ampY, spec.ampY] }) },
        ],
      }}
    >
      <RadialGlow color={spec.color} opacity={spec.opacity} />
    </Animated.View>
  );
}

/**
 * The app's atmosphere: obsidian base, slow-drifting localised aurora light,
 * and a barely-there film grain. Rendered once behind the navigator so it
 * persists (and keeps drifting) across tab switches.
 */
export function ScreenBackground() {
  const reduced = useReducedMotion();
  return (
    <View style={[StyleSheet.absoluteFill, styles.base]} pointerEvents="none">
      {BLOBS.map((b, i) => (
        <Blob key={i} spec={b} reduced={reduced} />
      ))}
      <Image
        source={require("./assets/grain.png")}
        resizeMode="repeat"
        style={[StyleSheet.absoluteFill, { width: "100%", height: "100%", opacity: material.grainOpacity }]}
        accessible={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.bg, overflow: "hidden" },
});
