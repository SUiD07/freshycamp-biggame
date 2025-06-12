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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!latest) return <div className="p-4">กำลังโหลดข้อความล่าสุด...</div>;

  return (
    <div className="p-4">
      {/* <h2 className="text-lg font-bold">Phase ปัจจุบัน</h2> */}
      {/* <div>
        <strong>Phase:</strong> {latest.status}
      </div> */}
      <div>
        <strong>Status:</strong> {latest.phase}
      </div>
      <div className="text-sm text-gray-600">
        {new Date(latest.created_at).toLocaleString()}
      </div>
      {latest.message && (
        <div className="p-2 border rounded bg-red-600 text-white">
          <strong>ข้อความ:</strong> {latest.message}
        </div>
      )}
    </div>
  );
};
