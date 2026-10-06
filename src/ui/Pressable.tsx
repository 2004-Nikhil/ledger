import { useRef, type ReactNode } from "react";
import { Animated, Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { useReducedMotion } from "./hooks";
import { motion } from "./theme";

// Style keys that describe where the control sits (they belong on the hit
// target). Everything else (fill, border, radius, padding) lives on the
// visual layer that compresses on press.
const LAYOUT_KEYS = new Set([
  "flex", "flexGrow", "flexShrink", "flexBasis", "alignSelf",
  "width", "minWidth", "maxWidth", "height", "minHeight", "maxHeight",
  "margin", "marginTop", "marginBottom", "marginLeft", "marginRight",
  "marginHorizontal", "marginVertical", "marginStart", "marginEnd",
  "position", "top", "left", "right", "bottom", "zIndex",
]);

function splitStyle(style: StyleProp<ViewStyle>): { layout: ViewStyle; visual: ViewStyle } {
  const flat = (StyleSheet.flatten(style) ?? {}) as Record<string, unknown>;
  const layout: Record<string, unknown> = {};
  const visual: Record<string, unknown> = {};
  for (const key of Object.keys(flat)) (LAYOUT_KEYS.has(key) ? layout : visual)[key] = flat[key];
  return { layout: layout as ViewStyle, visual: visual as ViewStyle };
}

export interface PressableScaleProps extends Omit<PressableProps, "style" | "children"> {
  style?: StyleProp<ViewStyle>;
  /** Target scale while pressed. Default compresses ~2.5%. */
  scale?: number;
  children?: ReactNode;
}

/**
 * A pressable that compresses by 2–3% on touch. The scale is applied to the
 * visual layer only, so the hit target never jitters under the finger.
 */
export function PressableScale({
  style,
  scale = motion.pressScale,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: PressableScaleProps) {
  const value = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();
  const { layout, visual } = splitStyle(style);

  const animate = (to: number) =>
    Animated.timing(value, { toValue: to, duration: motion.fast, easing: motion.easeOut, useNativeDriver: true }).start();

  return (
    <Pressable
      {...rest}
      style={layout}
      onPressIn={(e) => {
        if (!reduced) animate(scale);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (!reduced) animate(1);
        onPressOut?.(e);
      }}
    >
      <Animated.View style={[visual, { flexGrow: 1, transform: [{ scale: value }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
