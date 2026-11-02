import { useCallback, useState, type ReactNode } from "react";
import { FlatList, Platform, RefreshControl, ScrollView, View, type ListRenderItem, type StyleProp, type ViewStyle } from "react-native";
import { IconButton } from "./Button";
import { useKeyboard, useMetrics } from "./hooks";
import { useShell } from "./Shell";
import { Text } from "./Text";
import { colors, layout, space } from "./theme";

export function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  const { openDrawer } = useShell();
  return (
    <View style={{ gap: space.lg }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: space.md }}>
        <IconButton icon="menu-outline" accessibilityLabel="Open menu" onPress={openDrawer} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>{right}</View>
      </View>
      <View style={{ gap: 4 }}>
        <Text variant="title" accessibilityRole="header" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="body" tone="secondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export interface ScreenProps {
  title?: string;
  subtitle?: string;
  /** Header actions, right-aligned beside the menu button's row. */
  right?: ReactNode;
  /** Replace the standard header entirely (Home does this). */
  header?: ReactNode;
  onRefresh?: () => Promise<unknown> | void;
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * The page frame for every screen: safe-area aware, gutters that adapt to
 * phone size and rotation, a centred max-width column on tablets, and
 * bottom space that clears the floating dock (or the keyboard).
 */
export function Screen({ title, subtitle, right, header, onRefresh, children, contentStyle }: ScreenProps) {
  const m = useMetrics();
  const kb = useKeyboard();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  // iOS insets the scroll view itself (automaticallyAdjustKeyboardInsets);
  // on Android we make room ourselves so focused inputs can scroll into view.
  const bottom = kb.visible ? (Platform.OS === "android" ? kb.height + space.xl : space.xl) : m.dockClearance;

  return (
    <ScrollView
      style={{ flex: 1 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accentText}
            colors={[colors.accent]}
            progressBackgroundColor={colors.surfaceRaised}
          />
        ) : undefined
      }
      contentContainerStyle={{
        alignItems: "center",
        paddingTop: m.insets.top + space.md,
        paddingBottom: bottom,
        paddingHorizontal: m.gutter,
      }}
    >
      <View style={[{ width: "100%", maxWidth: layout.maxContentWidth, gap: space.xl }, contentStyle]}>
        {header ?? (title ? <ScreenHeader title={title} subtitle={subtitle} right={right} /> : null)}
        {children}
      </View>
    </ScrollView>
  );
}

/** A titled group of content, with an optional trailing action. */
export function Section({
  title,
  action,
  children,
  gap = space.md,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  gap?: number;
}) {
  return (
    <View style={{ gap }}>
      {title ? (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 32 }}>
          <Text variant="heading" accessibilityRole="header">
            {title}
          </Text>
          {action}
        </View>
      ) : null}
      {children}
    </View>
  );
}

/** Hairline divider for lists inside a card. */
export function Divider({ inset = 0 }: { inset?: number }) {
  return <View style={{ height: 1, marginLeft: inset, backgroundColor: colors.hairline }} />;
}


export interface ListScreenProps<T> extends Omit<ScreenProps, "children" | "header" | "contentStyle"> {
  data: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string;
  /** Controls that sit under the title (search, segmented control, calendar…). */
  headerExtra?: ReactNode;
  empty?: ReactNode;
}

/**
 * Same frame as Screen, but the page IS the list, so long collections are
 * virtualised instead of rendering every row up front.
 */
export function ListScreen<T>({ title, subtitle, right, onRefresh, data, renderItem, keyExtractor, headerExtra, empty }: ListScreenProps<T>) {
  const m = useMetrics();
  const kb = useKeyboard();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  const bottom = kb.visible ? (Platform.OS === "android" ? kb.height + space.xl : space.xl) : m.dockClearance;
  const column: ViewStyle = { width: "100%", maxWidth: layout.maxContentWidth, alignSelf: "center" };

  const row: ListRenderItem<T> = ({ item, index }) => <View style={column}>{renderItem(item, index)}</View>;

  return (
    <FlatList
      data={data}
      renderItem={row}
      keyExtractor={keyExtractor}
      style={{ flex: 1 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}
      initialNumToRender={14}
      windowSize={9}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accentText} colors={[colors.accent]} progressBackgroundColor={colors.surfaceRaised} />
        ) : undefined
      }
      contentContainerStyle={{ paddingTop: m.insets.top + space.md, paddingBottom: bottom, paddingHorizontal: m.gutter }}
      ListHeaderComponent={
        <View style={[column, { gap: space.xl, paddingBottom: space.md }]}>
          {title ? <ScreenHeader title={title} subtitle={subtitle} right={right} /> : null}
          {headerExtra}
        </View>
      }
      ListEmptyComponent={<View style={column}>{empty}</View>}
    />
  );
}
