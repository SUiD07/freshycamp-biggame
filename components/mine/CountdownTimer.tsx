"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

function formatTime(seconds: number | null) {
  if (seconds === null || isNaN(seconds)) return "--:--";
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function CountdownTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  // เปลี่ยน offset ไปเก็บใน useRef
  const offsetRef = useRef(0);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data, error } = await supabase.rpc("get_timer_with_server_time");

      if (error || !data) {
        console.error("Error fetching timer:", error);
        setIsRunning(false);
        setStartTime(null);
        setDuration(null);
        setRemaining(null);
        return;
      }

      if (
        typeof data.is_running !== "boolean" ||
        (data.is_running && !data.start_time) ||
        (data.is_running &&
          (data.duration_sec === null || data.duration_sec === undefined))
      ) {
        console.warn("Timer stopped or invalid data", data);
        setIsRunning(false);
        setStartTime(null);
        setDuration(null);
        setRemaining(null);
        return;
      }

      setIsRunning(data.is_running);
      setStartTime(data.start_time ? new Date(data.start_time) : null);
      const dur = data.is_running
        ? data.duration_sec
        : (data.paused_remaining_sec ?? null);
      setDuration(dur);

      const clientNow = Date.now();
      const serverNow = new Date(data.server_time).getTime();
      offsetRef.current = serverNow - clientNow;

      if (data.is_running && data.start_time && data.duration_sec !== null) {
        const elapsed = Math.floor(
          (serverNow - new Date(data.start_time).getTime()) / 1000
        );
        setRemaining(Math.max(data.duration_sec - elapsed, 0));
      } else if (data.paused_remaining_sec !== null) {
        setRemaining(data.paused_remaining_sec);
      } else {
        setRemaining(null);
      }
    };

    fetchInitialData();

    // ใช้ offsetRef.current ใน listener
    const channel = supabase
      .channel("timer-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "timer" },
        (payload) => {
          const data = payload.new;
          setIsRunning(data.is_running);
          setStartTime(data.start_time ? new Date(data.start_time) : null);

          if (data.is_running) {
            setDuration(data.duration_sec);
          } else {
            setDuration(data.paused_remaining_sec);
          }

          if (
            data.is_running &&
            data.start_time &&
            data.duration_sec !== null
          ) {
            const serverNow = Date.now() + offsetRef.current;
            const elapsed = Math.floor(
              (serverNow - new Date(data.start_time).getTime()) / 1000
            );
            setRemaining(Math.max(data.duration_sec - elapsed, 0));
          } else if (data.paused_remaining_sec !== null) {
            setRemaining(data.paused_remaining_sec);
          } else {
            setRemaining(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // นับถอยหลัง โดยใช้ offsetRef.current
  useEffect(() => {
    if (!isRunning) {
      return;
    }
    if (!startTime || duration === null) {
      setRemaining(duration);
      return;
    }

    const interval = setInterval(() => {
      const adjustedNow = Date.now() + offsetRef.current;
      const elapsed = Math.floor((adjustedNow - startTime.getTime()) / 1000);
      const rem = Math.max(duration - elapsed, 0);
      setRemaining(rem);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, startTime, duration]);

  return (
    <div className="p-4 text-center">
      <h2 className="text-3xl font-bold">⏳ {formatTime(remaining)}</h2>
      <p className="mt-2 text-sm text-gray-600">
        {isRunning ? "🟢 กำลังนับถอยหลัง..." : "⏸️ หยุดอยู่"}
      </p>
    </div>
  );
}
