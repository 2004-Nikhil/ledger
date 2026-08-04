import React, { createContext, useContext, useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { buildContainer, type AppContainer } from "./container";

const ContainerContext = createContext<AppContainer | null>(null);

/** Screens/hooks call this instead of importing the container module directly. */
export function useAppContainer(): AppContainer {
  const container = useContext(ContainerContext);
  if (!container) {
    throw new Error("useAppContainer must be called from inside <AppProvider>.");
  }
  return container;
}

type Status =
  | { state: "loading" }
  | { state: "ready"; container: AppContainer }
  | { state: "error"; message: string };

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>({ state: "loading" });

  useEffect(() => {
    let cancelled = false;

    buildContainer()
      .then((container) => {
        if (!cancelled) setStatus({ state: "ready", container });
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        if (!cancelled) setStatus({ state: "error", message });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status.state === "loading") {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.label}>Setting up database…</Text>
      </View>
    );
  }

  if (status.state === "error") {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Database failed to start</Text>
        <Text style={styles.label}>{status.message}</Text>
      </View>
    );
  }

  return (
    <ContainerContext.Provider value={status.container}>
      {children}
    </ContainerContext.Provider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
  label: { color: "#6b7280", fontSize: 14, textAlign: "center" },
  error: { color: "#dc2626", fontSize: 16, fontWeight: "600" },
});
