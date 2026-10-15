import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PressableScale } from "./Pressable";
import { Text } from "./Text";
import { colors, motion, radius } from "./theme";
import type { IconName } from "./Button";

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  accessibilityLabel?: string;
}

/** Selectable glass pill. Selected = a faint aurora-blue wash and edge, never a solid fill. */
export function Chip({ label, selected = false, onPress, icon, accessibilityLabel }: ChipProps) {
  return (
    <PressableScale
      onPress={onPress}
      scale={0.97}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
      style={{
        minHeight: 38,
        paddingHorizontal: 16,
        borderRadius: radius.pill,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: StyleSheet.hairlineWidth * 1.5,
        borderColor: selected ? colors.accentBorder : colors.border,
        backgroundColor: selected ? colors.accentSoft : colors.glass,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {icon ? <Ionicons name={icon} size={14} color={selected ? colors.text : colors.textSecondary} /> : null}
        <Text variant="captionStrong" tone={selected ? "primary" : "secondary"} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

/** Horizontal, edge-bleeding chip scroller. `bleed` = the parent's horizontal padding. */
export function ChipRow({ children, bleed = 0, style }: { children: ReactNode; bleed?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      style={[{ flexGrow: 0, marginHorizontal: -bleed }, style]}
      contentContainerStyle={{ gap: 8, paddingHorizontal: bleed, alignItems: "center" }}
    >
      {children}
    </ScrollView>
  );
}

/** Wrapping variant for short option sets. */
export function ChipWrap({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{children}</View>;
}

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

/** Glass segmented control. The thumb glides — it doesn't jump — between options. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const [width, setWidth] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const placed = useRef(false);
  const inner = Math.max(0, width - 8);
  const thumb = options.length ? inner / options.length : 0;
  const index = Math.max(0, options.findIndex((o) => o.value === value));

  useEffect(() => {
    if (!thumb) return;
    if (!placed.current) {
      x.setValue(index * thumb);
      placed.current = true;
      return;
    }
    Animated.timing(x, { toValue: index * thumb, duration: motion.base, easing: motion.easeOut, useNativeDriver: true }).start();
  }, [index, thumb, x]);

  return (
    <View
      accessibilityRole="tablist"
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[
        {
          flexDirection: "row",
          padding: 4,
          borderRadius: radius.pill,
          borderWidth: StyleSheet.hairlineWidth * 1.5,
          borderColor: colors.border,
          backgroundColor: "rgba(255,255,255,0.035)",
        },
        style,
      ]}
    >
      {thumb > 0 && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            bottom: 4,
            width: thumb,
            borderRadius: radius.pill,
            backgroundColor: "rgba(255,255,255,0.10)",
            borderWidth: StyleSheet.hairlineWidth * 1.5,
            borderColor: "rgba(255,255,255,0.14)",
            transform: [{ translateX: x }],
          }}
        />
      )}
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <PressableScale
            key={o.value}
            onPress={() => onChange(o.value)}
            scale={0.98}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={o.label}
            style={{ flex: 1, minHeight: 40, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 }}
          >
            <Text variant="captionStrong" tone={selected ? "primary" : "secondary"} numberOfLines={1}>
              {o.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
