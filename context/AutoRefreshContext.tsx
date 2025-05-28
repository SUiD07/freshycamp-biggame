// /context/AutoRefreshContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface AutoRefreshContextType {
  isAutoRefresh: boolean;
  toggleAutoRefresh: () => void;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
}

const AutoRefreshContext = createContext<AutoRefreshContextType | undefined>(undefined);

export function AutoRefreshProvider({ children }: { children: ReactNode }) {
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  const startAutoRefresh = () => setIsAutoRefresh(true);
  const stopAutoRefresh = () => setIsAutoRefresh(false);
  const toggleAutoRefresh = () => setIsAutoRefresh((prev) => !prev);

  return (
    <AutoRefreshContext.Provider value={{ isAutoRefresh, toggleAutoRefresh, startAutoRefresh, stopAutoRefresh }}>
      {children}
    </AutoRefreshContext.Provider>
  );
}

// Named export of the hook
export function useAutoRefreshContext() {
  const context = useContext(AutoRefreshContext);
  if (!context) throw new Error("useAutoRefreshContext must be used within AutoRefreshProvider");
  return context;
}
