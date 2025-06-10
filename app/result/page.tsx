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
  const supabase = createClient();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); // State for user ID
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // Fetch nodes data (assuming this is still needed)
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

  // Fetch user ID and autoRefresh setting from Supabase
  useEffect(() => {
    const fetchUserAndSettings = async () => {
      setIsLoading(true);
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("User not logged in or error:", userError);
          // Handle unauthenticated state appropriately (e.g., redirect to login)
          return;
        }

        setUserId(user.id);

        // Fetch autoRefresh setting from user_settings table
        const { data, error } = await supabase
          .from("user_settings")
          .select("auto_refresh")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 = no rows found, ignore if no setting yet
          console.error("Error fetching user setting:", error);
          // Optionally, display an error message to the user
        }

        const autoRefreshValue = data?.auto_refresh ?? false;
        setAutoRefresh(autoRefreshValue);
      } catch (err) {
        console.error("Unexpected error fetching user and settings:", err);
        // Handle unexpected errors (e.g., network issues)
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndSettings();
  }, []);

  // Toggle handler
  const toggleAutoRefresh = async () => {
    if (!userId) {
      console.error("No user ID available to save setting");
      return;
    }

    const newValue = !autoRefresh;

    try {
      // Upsert the setting in Supabase
      const { error } = await supabase
        .from("user_settings")
        .upsert(
          { user_id: userId, auto_refresh: newValue },
          { onConflict: "user_id" } // If user_id exists, update; otherwise, insert
        );

      if (error) {
        console.error("Error saving autoRefresh setting:", error);
        // Optionally, display an error message to the user
        return; // Exit if upsert fails
      }

      setAutoRefresh(newValue); // Update state only after successful upsert
    } catch (err) {
      console.error("Unexpected error toggling auto refresh:", err);
      // Handle unexpected errors (e.g., network issues)
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // Or a more sophisticated loading indicator
  }

  return (
    <>
      <div className="font-bold text-2xl text-center bg-gray-300">ดูผลการกรอก</div>
      <h2 className="text-lg font-semibold">สรุปสถานะ</h2>
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Auto Refresh Control</h1>
        <button
          onClick={toggleAutoRefresh}
          className={`px-6 py-3 rounded text-white font-semibold ${
            autoRefresh
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
          disabled={!userId} // Disable the button if userId is null
        >
          {autoRefresh ? "หยุด Auto Refresh" : "เริ่ม Auto Refresh"}
        </button>
        {!userId && <p>Loading user data...</p>} {/* Display a loading message */}
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
