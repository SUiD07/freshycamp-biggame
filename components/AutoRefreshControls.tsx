import React from "react";
import { useAutoRefreshContext } from "@/context/AutoRefreshContext";

export default function AutoRefreshControls() {
  const { isAutoRefresh, startAutoRefresh, stopAutoRefresh, toggleAutoRefresh } = useAutoRefreshContext();

  return (
    <div className="space-x-2">
      <button onClick={startAutoRefresh} className="px-4 py-2 bg-green-600 text-white rounded">
        Start Auto Refresh
      </button>
      <button onClick={stopAutoRefresh} className="px-4 py-2 bg-red-600 text-white rounded">
        Stop Auto Refresh
      </button>
      <button onClick={toggleAutoRefresh} className="px-4 py-2 bg-blue-600 text-white rounded">
        {isAutoRefresh ? "Pause" : "Resume"} Auto Refresh
      </button>
    </div>
  );
}
