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

  const keywordColors: Record<string, string> = {
    เดิน: "bg-sky-200 text-sky-800",
    สู้: "bg-rose-200 text-rose-800",
    สร้าง: "bg-emerald-200 text-emerald-800",
    ชุบ: "bg-indigo-200 text-indigo-800",
  };

  const highlightMultipleKeywords = (text: string, keywords: string[]) => {
    const regex = new RegExp(`(${keywords.join("|")})`, "g");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, index) =>
          keywords.includes(part) ? (
            <span
              key={index}
              className={`font-semibold px-1 rounded ${keywordColors[part]}`}
            >
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };

  // ✅ ขอสิทธิ์แจ้งเตือน
  // useEffect(() => {
  //   if (typeof window !== "undefined" && "Notification" in window) {
  //     Notification.requestPermission();
  //   }
  // }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission().then((permission) => {
        console.log("🔔 Notification permission:", permission);
      });
    }
  }, []);

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
          setTimeout(() => setHighlight(false), 3000); // เน้น 3 วินาที
          if (Notification.permission === "granted") {
            new Notification("📢 มี Phase ใหม่!", {
              body: `${newLog.phase} - ${newLog.message}`,
              icon: "/fortress.svg", // แนะนำใส่ไอคอนเล็ก ๆ
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!latest) return <div className="p-4">กำลังโหลดข้อความล่าสุด...</div>;

  return (
    <div
      className={`p-4 transition-all duration-1000 ${
        highlight ? "bg-blue-100" : "bg-yellow-100"
      }`}
    >
      {/* <h2 className="text-lg font-bold">Phase ปัจจุบัน</h2> */}
      {/* <div>
        <strong>Phase:</strong> {latest.status}
      </div> */}
      <div
        className={`transition-all duration-1000 ${
          highlight ? "bg-blue-100" : "bg-yellow-100"
        }`}
      >
        <strong>Status:</strong>{" "}
        {highlightMultipleKeywords(latest.phase, [
          "เดิน",
          "สู้",
          "สร้าง",
          "ชุบ",
        ])}
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
