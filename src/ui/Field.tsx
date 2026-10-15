import { forwardRef, useRef, useState, type ComponentProps } from "react";
import { Animated, StyleSheet, Switch, TextInput, View, type TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { colors, fonts, motion, radius } from "./theme";

export interface TextFieldProps extends Omit<TextInputProps, "style"> {
  label?: string;
  helper?: string;
  error?: string | null;
  /** A quiet leading glyph such as the currency symbol. */
  prefix?: string;
  /** Leading icon (search fields). */
  icon?: ComponentProps<typeof Ionicons>["name"];
  /** "lg" is for the single hero amount in a form. */
  size?: "md" | "lg";
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, helper, error, prefix, icon, size = "md", onFocus, onBlur, editable = true, ...input },
  ref
) {
  const focus = useRef(new Animated.Value(0)).current;
  const [focused, setFocused] = useState(false);

  const to = (v: number) =>
    Animated.timing(focus, { toValue: v, duration: motion.base, easing: motion.easeOut, useNativeDriver: false }).start();

  const borderColor = error
    ? colors.negativeBorder
    : focus.interpolate({ inputRange: [0, 1], outputRange: [colors.border, colors.accentBorder] });
  const backgroundColor = focus.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,255,255,0.04)", "rgba(79,124,255,0.07)"],
  });

  const large = size === "lg";

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text variant="captionStrong" tone="secondary">
          {label}
        </Text>
      ) : null}
      <Animated.View
        style={[
          styles.box,
          { minHeight: large ? 68 : 52, borderColor, backgroundColor, opacity: editable ? 1 : 0.5 },
        ]}
      >
        {icon ? <Ionicons name={icon} size={18} color={colors.textSecondary} style={{ marginRight: 10 }} /> : null}
        {prefix ? (
          <Text variant={large ? "figure" : "body"} tone={focused || input.value ? "secondary" : "muted"} style={styles.prefix}>
            {prefix}
          </Text>
        ) : null}
        <TextInput
          ref={ref}
          editable={editable}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          cursorColor={colors.accent}
          keyboardAppearance="dark"
          accessibilityLabel={label ?? input.placeholder}
          maxFontSizeMultiplier={1.3}
          {...input}
          onFocus={(e) => {
            setFocused(true);
            to(1);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            to(0);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            large && styles.inputLarge,
            input.multiline && { minHeight: 88, textAlignVertical: "top", paddingTop: 14 },
          ]}
        />
      </Animated.View>
      {error ? (
        <InlineError message={error} />
      ) : helper ? (
        <Text variant="caption" tone="secondary">
          {helper}
        </Text>
      ) : null}
    </View>
  );
});

/** Form / action error. Announced by screen readers. */
export function InlineError({ message }: { message: string }) {
  return (
    <View style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Ionicons name="alert-circle-outline" size={16} color={colors.negative} style={{ marginTop: 1 }} />
      <Text variant="caption" tone="negative" style={{ flex: 1 }}>
        {message}
      </Text>
    </View>
  );
}

export function SwitchRow({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.switchRow}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong">{label}</Text>
        {description ? (
          <Text variant="caption" tone="secondary">
            {description}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={label}
        trackColor={{ false: "rgba(255,255,255,0.12)", true: "rgba(79,124,255,0.7)" }}
        thumbColor={colors.text}
        ios_backgroundColor="rgba(255,255,255,0.12)"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  box: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    paddingHorizontal: 16,
  },
  prefix: { marginRight: 6 },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  inputLarge: { fontFamily: fonts.light, fontSize: 30, letterSpacing: -0.6 },
  error: { flexDirection: "row", gap: 6, alignItems: "flex-start" },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 4 },
});
