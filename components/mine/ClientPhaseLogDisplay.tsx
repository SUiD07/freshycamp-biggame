"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type LogEntry = {
  id: number;
  phase: string;
  message: string;
  status: string;
  created_at: string;
};

export const ClientPhaseLogDisplay = () => {
  const [latest, setLatest] = useState<LogEntry | null>(null);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    const fetchLatestLog = async () => {
      const { data } = await supabase
        .from("phase_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) setLatest(data);
    };

    fetchLatestLog();

    const channel = supabase
      .channel("realtime-phase-logs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "phase_logs" },
        (payload) => {
          const newLog = payload.new as LogEntry;
          setLatest(newLog);
          setHighlight(true);
          setTimeout(() => setHighlight(false), 1000); // เน้น 1 วินาที
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!latest) return <div className="p-4">กำลังโหลดข้อความล่าสุด...</div>;

  return (
    <div className={`p-4 transition-all duration-1000 ${
          highlight ? "bg-blue-100" : "bg-yellow-100"
        }`}>
      {/* <h2 className="text-lg font-bold">Phase ปัจจุบัน</h2> */}
      {/* <div>
        <strong>Phase:</strong> {latest.status}
      </div> */}
      <div
        className={`transition-all duration-1000 ${
          highlight ? "bg-blue-100" : "bg-yellow-100"
        }`}
      >
        <strong>Status:</strong> {latest.phase}
      </div>

      <div className="text-sm text-gray-600">
        {new Date(latest.created_at).toLocaleString()}
      </div>

      {latest.message && (
        <div
          className={`text-white p-2 border rounded transition-all duration-1000 ${
            highlight ? "bg-blue-500" : "bg-red-600"
          }`}
        >
          <strong>ข้อความ:</strong> {latest.message}
        </div>
      )}
    </div>
  );
};
