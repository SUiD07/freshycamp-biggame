"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

// phase message ทั้งหมด
const phases = [
  "อัพเดตผลการเดินเรียบร้อยแล้ว refresh map ได้เลย",
  "อัพเดตผลการสู้เรียบร้อยแล้ว refresh map ได้เลย",
  "อัพเดตผลการสร้างป้อมเรียบร้อยแล้ว refresh map ได้เลย",
  "อัพเดตผลการสร้างป้อมและชุบชีวิตเรียบร้อยแล้ว refresh map ได้เลย",
  "รอ",
];

const statuses = ['Preparing Phase', 'Fighting Phase'];

// กำหนดสีแต่ละ keyword
const keywordColors: Record<string, string> = {
  เดิน: "bg-sky-200 text-sky-800",
  สู้: "bg-rose-200 text-rose-800",
  สร้าง: "bg-emerald-200 text-emerald-800",
  ชุบ: "bg-indigo-200 text-indigo-800",
};

// ฟังก์ชันไฮไลต์คำด้วยสีที่กำหนด
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

export const AdminPhaseLogger = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedPhase, setSelectedPhase] = useState(phases[0]);
  const [selectedStatus, setSelectedStatus] = useState(statuses[0]);

  const logPhaseAndMessage = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('phase_logs')
      .insert([
      {
        phase: selectedPhase,
        message: message,
        status: selectedStatus,
      },
    ]);
    setLoading(false);
    if (error) alert('Error: ' + error.message);
    else setMessage('');
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-bold">เพิ่ม Phase, Status และข้อความใหม่</h2>

      <div>
        <label className="block mb-1 font-medium">เลือก Phase</label>

        {/* แสดง preview ที่ไฮไลต์ */}
        <div className="mb-2">
          <strong>แสดงตัวอย่าง:</strong>{" "}
          {highlightMultipleKeywords(selectedPhase, [
            "เดิน",
            "สู้",
            "สร้าง",
            "ชุบ",
          ])}
        </div>

        {/* dropdown */}
        <select
          value={selectedPhase}
          onChange={(e) => setSelectedPhase(e.target.value)}
          className="border px-2 py-1 rounded w-full"
        >
          {phases.map((phase) => (
            <option key={phase} value={phase}>
              {phase}
            </option>
          ))}
        </select>
      </div>

      {/* <div>
        <label className="block mb-1 font-medium">เลือก Status</label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border px-2 py-1 rounded w-full"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div> */}

      <div>
        <label className="block mb-1 font-medium">ข้อความพิเศษ</label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border px-2 py-1 rounded w-full"
          placeholder="พิมพ์ข้อความ..."
        />
      </div>

      <button
        onClick={logPhaseAndMessage}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        บันทึกข้อความ
      </button>
    </div>
  );
};
