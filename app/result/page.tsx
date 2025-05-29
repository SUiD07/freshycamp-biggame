"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import React from "react";
// import NodeUpdater from "@/components/mine/NodeUpdater";
import RoundResult from "@/components/mine/RoundResult";
import PurchaseSummary from "@/components/mine/PurchasesSummary";
import dynamic from 'next/dynamic';
import ClaimTowerPage from "../updateTower/page";

export default function admin() {
  //const house = "บ้าน 01"; // ปรับตามผู้ใช้งานที่ login
  const [autoRefresh, setAutoRefresh] = useState(false);
  const supabase = createClient();
    const [nodes, setNodes] = useState<any>([]);
    const fetchUser = async () => {
      let { data, error } = await supabase.from("nodes").select("*");
  
      if (!data || error) {
        console.log("error", error);
      }
      setNodes(data);
    };
    useEffect(() => {
      fetchUser();
    }, []);
    const RoundResult = dynamic(() => import('@/components/mine/RoundResult'), { ssr: false });
  useEffect(() => {
    const stored = localStorage.getItem("autoRefresh");
    setAutoRefresh(stored === "true");
  }, []);

  // Toggle handler
  const toggleAutoRefresh = () => {
    const newValue = !autoRefresh;
    setAutoRefresh(newValue);
    localStorage.setItem("autoRefresh", newValue.toString());
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
        <RoundResult/>
        <PurchaseSummary/>
        <ClaimTowerPage/>
    </>
  );
}
