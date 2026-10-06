import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface ShellValue {
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  quickAddOpen: boolean;
  openQuickAdd: () => void;
  closeQuickAdd: () => void;
}

const ShellContext = createContext<ShellValue | null>(null);

/** Lets any screen open the side drawer or the quick-add sheet without prop drilling. */
export function ShellProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const value = useMemo<ShellValue>(
    () => ({
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      quickAddOpen,
      openQuickAdd: () => setQuickAddOpen(true),
      closeQuickAdd: () => setQuickAddOpen(false),
    }),
    [drawerOpen, quickAddOpen]
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell(): ShellValue {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used inside <ShellProvider>.");
  return ctx;
}
