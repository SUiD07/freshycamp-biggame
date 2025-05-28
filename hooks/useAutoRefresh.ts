import { useEffect, useState } from "react";

export function useAutoRefresh(intervalMs: number = 30000, isActive: boolean = true) {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs, isActive]);

  return refreshKey;
}
