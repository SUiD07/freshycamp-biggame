// src/context/AutoRefreshContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface AutoRefreshContextType {
  isAutoRefresh: boolean;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
}

const AutoRefreshContext = createContext<AutoRefreshContextType | undefined>(undefined);

export const AutoRefreshProvider = ({ children }: { children: ReactNode }) => {
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);

  const startAutoRefresh = () => setIsAutoRefresh(true);
  const stopAutoRefresh = () => setIsAutoRefresh(false);

  return (
    <AutoRefreshContext.Provider value={{ isAutoRefresh, startAutoRefresh, stopAutoRefresh }}>
      {children}
    </AutoRefreshContext.Provider>
  );
};

export const useAutoRefreshContext = () => {
  const context = useContext(AutoRefreshContext);
  if (!context) {
    throw new Error("useAutoRefreshContext must be used within AutoRefreshProvider");
  }
  return context;
};
