import { useId, useMemo } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg";

/** SVG ids can't contain the punctuation React puts in useId(). */
export function useSvgId(prefix: string): string {
  const raw = useId();
  return useMemo(() => `${prefix}${raw.replace(/[^a-zA-Z0-9]/g, "")}`, [prefix, raw]);
}

export interface GradientStop {
  offset: number; // 0..1
  color: string; // solid colour; use `opacity` for alpha
  opacity?: number;
}

interface LinearFillProps {
  stops: GradientStop[];
  /** Direction in bounding-box space. Defaults to top → bottom. */
  from?: [number, number];
  to?: [number, number];
  style?: StyleProp<ViewStyle>;
}

/** Fills its parent with a linear gradient. Pointer-transparent. */
export function LinearFill({ stops, from = [0, 0], to = [0, 1], style }: LinearFillProps) {
  const id = useSvgId("lf");
  return (
    <Svg style={[StyleSheet.absoluteFill, style]} width="100%" height="100%" pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]}>
          {stops.map((s, i) => (
            <Stop key={i} offset={s.offset} stopColor={s.color} stopOpacity={s.opacity ?? 1} />
          ))}
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

interface RadialGlowProps {
  color: string;
  /** Peak opacity at the centre. Keep it low — this is light, not paint. */
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * A soft, eased radial light. Four stops approximate a gaussian falloff,
 * which avoids the hard "disc" edge and banding of a two-stop gradient.
 */
export function RadialGlow({ color, opacity = 0.2, style }: RadialGlowProps) {
  const id = useSvgId("rg");
  return (
    <Svg style={[StyleSheet.absoluteFill, style]} width="100%" height="100%" pointerEvents="none">
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset="0.35" stopColor={color} stopOpacity={opacity * 0.55} />
          <Stop offset="0.68" stopColor={color} stopOpacity={opacity * 0.14} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
