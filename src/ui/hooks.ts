import { useCallback, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Keyboard, Platform, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { layout } from "./theme";

/* ----------------------------- reduced motion ---------------------------- */

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => alive && setReduced(v));
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return reduced;
}

/* -------------------------------- count up ------------------------------- */

/** Smoothly counts toward `target`. Re-targets from wherever it currently is. */
export function useCountUp(target: number, duration = 780): number {
  const reduced = useReducedMotion();
  const current = useRef(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduced || duration <= 0) {
      current.current = target;
      setDisplay(target);
      return;
    }
    const from = current.current;
    if (from === target) return;
    const start = Date.now();
    let raf = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4); // easeOutQuart — no overshoot
      const value = t >= 1 ? target : from + (target - from) * eased;
      current.current = value;
      setDisplay(value);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduced]);

  return display;
}

/* ------------------------------ chart drawing ---------------------------- */

/**
 * 0 → 1 over `duration` (easeOutCubic), restarting whenever `key` changes.
 * Charts derive their draw-in (stroke length, bar height, arc sweep) from it.
 */
export function useDrawProgress(key: string | number, duration = 1000): number {
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      setProgress(1);
      return;
    }
    setProgress(0);
    const start = Date.now();
    let raf = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      setProgress(1 - Math.pow(1 - t, 3));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [key, duration, reduced]);

  return progress;
}

/* -------------------------------- keyboard ------------------------------- */

export function useKeyboard(): { visible: boolean; height: number } {
  const [state, setState] = useState({ visible: false, height: 0 });
  useEffect(() => {
    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const s = Keyboard.addListener(showEvt, (e) => setState({ visible: true, height: e.endCoordinates.height }));
    const h = Keyboard.addListener(hideEvt, () => setState({ visible: false, height: 0 }));
    return () => {
      s.remove();
      h.remove();
    };
  }, []);
  return state;
}

/* ------------------------------- responsive ------------------------------ */

export type SizeClass = "compact" | "regular" | "wide";

export interface Metrics {
  width: number;
  height: number;
  isLandscape: boolean;
  sizeClass: SizeClass;
  /** Horizontal page padding, already including landscape side insets. */
  gutter: number;
  /** Space kept free at the bottom so content clears the floating dock. */
  dockClearance: number;
  dockHeight: number;
  dockBottom: number;
  insets: { top: number; bottom: number; left: number; right: number };
  /** 1 column on phones, 2 on wide / landscape. */
  columns: 1 | 2;
  contentWidth: number;
}

export function useMetrics(): Metrics {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const sizeClass: SizeClass =
    width < layout.breakpoints.compact ? "compact" : width < layout.breakpoints.wide ? "regular" : "wide";
  const base = sizeClass === "compact" ? 16 : sizeClass === "regular" ? 20 : 28;
  const gutter = base + Math.max(insets.left, insets.right);

  const shortScreen = height < 520;
  const dockHeight = shortScreen ? 56 : 64;
  const dockBottom = Math.max(insets.bottom, 10) + (shortScreen ? 2 : 8);
  const contentWidth = Math.min(width - gutter * 2, layout.maxContentWidth);

  return {
    width,
    height,
    isLandscape: width > height,
    sizeClass,
    gutter,
    dockHeight,
    dockBottom,
    dockClearance: dockHeight + dockBottom + 28,
    insets,
    columns: sizeClass === "wide" ? 2 : 1,
    contentWidth,
  };
}

/** Stable "do this once" helper for one-shot entrance animations. */
export function useOnce(): () => boolean {
  const done = useRef(false);
  return useCallback(() => {
    if (done.current) return false;
    done.current = true;
    return true;
  }, []);
}

/**
 * Remembers the last non-null value. Lets a sheet keep showing its content
 * while it animates closed, after the state that opened it has been cleared.
 */
export function useLatest<T>(value: T | null): T | null {
  const ref = useRef<T | null>(value);
  if (value !== null) ref.current = value;
  return value ?? ref.current;
}
