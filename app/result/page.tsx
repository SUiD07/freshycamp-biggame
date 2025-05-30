"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import React from "react";
import dynamic from "next/dynamic";
import RoundResult from "@/components/mine/RoundResult";
import PurchaseSummary from "@/components/mine/PurchasesSummary";
import ClaimTowerPage from "../updateTower/page";

export default function Admin() {
  const [autoRefresh, setAutoRefresh] = useState(true); // default to true
  const supabase = createClient();
  const [nodes, setNodes] = useState<any>([]);

  const fetchUser = async () => {
    let { data, error } = await supabase.from("nodes").select("*");
    if (!data || error) {
      console.log("error", error);
      return;
    }
    setNodes(data);
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchUser();
  }, []);

  // Auto refresh effect: fetch data every 5 seconds if autoRefresh is true
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      fetchUser();
    }, 5000); // refresh every 5 seconds (adjust as needed)

    // Cleanup interval on unmount or when autoRefresh changes
    return () => clearInterval(intervalId);
  }, [autoRefresh]);

  // Load autoRefresh state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("autoRefresh");
    if (stored !== null) {
      setAutoRefresh(stored === "true");
    }
  }, []);

  // Save autoRefresh state to localStorage on change
  useEffect(() => {
    localStorage.setItem("autoRefresh", autoRefresh.toString());
  }, [autoRefresh]);

  // Toggle handler
  const toggleAutoRefresh = () => {
    setAutoRefresh((prev) => !prev);
  };

  return (
    <>
      <div className="font-bold text-2xl text-center bg-gray-300">ดูผลการกรอก</div>
      <h2 className="text-lg font-semibold">สรุปสถานะ</h2>
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Auto Refresh Control</h1>
        <button
          onClick={toggleAutoRefresh}
          className={`px-6 py-3 rounded text-white font-semibold ${
            autoRefresh ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {autoRefresh ? "หยุด Auto Refresh" : "เริ่ม Auto Refresh"}
        </button>
        <p className="mt-4 text-gray-600">
          สถานะปัจจุบัน: <strong>{autoRefresh ? "เปิด" : "ปิด"}</strong>
        </p>
      </div>
      <RoundResult />
      <PurchaseSummary />
      <ClaimTowerPage />
    </>
  );
}
