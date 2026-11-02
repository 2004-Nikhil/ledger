import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton } from "./Button";
import { GlassCard } from "./Glass";
import { Text } from "./Text";
import { colors, motion, radius, space } from "./theme";

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const ORIENTATIONS = ["portrait", "portrait-upside-down", "landscape", "landscape-left", "landscape-right"] as const;

/**
 * Frosted bottom sheet. Slides up on a smooth ease (no spring), dismisses by
 * scrim tap, close button, hardware back, or dragging the handle down. Keeps
 * itself above the keyboard and scrolls when content is taller than the screen.
 */
export function Sheet({ visible, onClose, title, subtitle, children }: SheetProps) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;
  const drag = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      drag.setValue(0);
      Animated.timing(progress, { toValue: 1, duration: motion.base + 60, easing: motion.easeOut, useNativeDriver: true }).start();
    } else {
      Animated.timing(progress, { toValue: 0, duration: motion.base, easing: motion.easeInOut, useNativeDriver: true }).start(
        ({ finished }) => finished && setMounted(false)
      );
    }
  }, [visible, progress, drag]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => g.dy > 3,
        onPanResponderMove: (_, g) => drag.setValue(Math.max(0, g.dy)),
        onPanResponderRelease: (_, g) => {
          if (g.dy > 110 || g.vy > 0.9) closeRef.current();
          else Animated.timing(drag, { toValue: 0, duration: motion.base, easing: motion.easeOut, useNativeDriver: true }).start();
        },
        onPanResponderTerminate: () =>
          Animated.timing(drag, { toValue: 0, duration: motion.base, easing: motion.easeOut, useNativeDriver: true }).start(),
      }),
    [drag]
  );

  const translateY = Animated.add(
    progress.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }),
    drag
  );

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
      supportedOrientations={ORIENTATIONS as unknown as ("portrait" | "landscape")[]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim, opacity: progress }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" accessibilityRole="button" />
      </Animated.View>

      <KeyboardAvoidingView behavior="padding" style={styles.kav} pointerEvents="box-none">
        <Animated.View
          style={{
            width: "100%",
            maxWidth: Math.min(width, 600),
            alignSelf: "center",
            maxHeight: height - insets.top - 12,
            transform: [{ translateY }],
          }}
          accessibilityViewIsModal
        >
          <GlassCard
            variant="float"
            blur
            tint={colors.sheet}
            radius={radius.xl}
            style={{
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              maxHeight: height - insets.top - 12,
            }}
          >
            <View {...pan.panHandlers} style={styles.headerWrap}>
              <View style={styles.grabber} />
              <View style={styles.header}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="heading" accessibilityRole="header">
                    {title}
                  </Text>
                  {subtitle ? (
                    <Text variant="caption" tone="secondary">
                      {subtitle}
                    </Text>
                  ) : null}
                </View>
                <IconButton icon="close" size={40} accessibilityLabel="Close" onPress={onClose} />
              </View>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              showsVerticalScrollIndicator={false}
              style={{ flexShrink: 1 }}
              contentContainerStyle={{ paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: Math.max(insets.bottom, 12) + space.xl }}
            >
              {children}
            </ScrollView>
          </GlassCard>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1, justifyContent: "flex-end" },
  headerWrap: { paddingHorizontal: space.xl, paddingTop: 10, paddingBottom: space.md },
  grabber: { alignSelf: "center", width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.22)", marginBottom: space.md },
  header: { flexDirection: "row", alignItems: "center", gap: space.md },
});
