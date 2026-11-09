import React, { createContext, useContext, useEffect, useState } from "react";
import { BootLoading, BootError } from "@/ui/States";
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
    return <BootLoading label="Setting up database…" />;
  }

  if (status.state === "error") {
    return <BootError message={status.message} />;
  }

  return (
    <ContainerContext.Provider value={status.container}>
      {children}
    </ContainerContext.Provider>
  );
}
