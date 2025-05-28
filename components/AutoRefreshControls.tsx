// src/components/AutoRefreshControl.tsx
import React from "react";
import { useAutoRefreshContext } from "@/context/AutoRefreshContext";

export default function AutoRefreshControl() {
  const { isAutoRefresh, startAutoRefresh, stopAutoRefresh } = useAutoRefreshContext();

  return (
    <div className="flex gap-2">
      <button
        onClick={startAutoRefresh}
        disabled={isAutoRefresh}
        className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
      >
        Start Auto Refresh
      </button>
      <button
        onClick={stopAutoRefresh}
        disabled={!isAutoRefresh}
        className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
      >
        Stop Auto Refresh
      </button>
      <span className="self-center ml-4 font-semibold">
        Auto Refresh is {isAutoRefresh ? "ON" : "OFF"}
      </span>
    </div>
  );
}
