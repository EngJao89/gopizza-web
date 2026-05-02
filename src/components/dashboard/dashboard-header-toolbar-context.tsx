"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

export type DashboardHeaderToolbarConfig = Readonly<{
  title: string;
  onClear: () => void;
}>;

type DashboardHeaderToolbarContextValue = Readonly<{
  config: DashboardHeaderToolbarConfig | null;
  setConfig: Dispatch<SetStateAction<DashboardHeaderToolbarConfig | null>>;
}>;

const DashboardHeaderToolbarContext =
  createContext<DashboardHeaderToolbarContextValue | null>(null);

export function DashboardHeaderToolbarProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [config, setConfig] = useState<DashboardHeaderToolbarConfig | null>(
    null,
  );

  const value = useMemo(
    () => ({ config, setConfig }),
    [config],
  );

  return (
    <DashboardHeaderToolbarContext.Provider value={value}>
      {children}
    </DashboardHeaderToolbarContext.Provider>
  );
}

export function useDashboardHeaderToolbar() {
  const ctx = useContext(DashboardHeaderToolbarContext);
  if (!ctx) {
    throw new Error(
      "useDashboardHeaderToolbar must be used within DashboardHeaderToolbarProvider",
    );
  }
  return ctx;
}
