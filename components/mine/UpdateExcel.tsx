'use client'
import { useState } from "react";

export default function UpdatePage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdate = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/sync");
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ อัปเดตข้อมูลสำเร็จ: ${data.rows} แถว`);
      } else {
        setMessage(`❌ ข้อผิดพลาด: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>อัปเดตข้อมูลจาก Excel</h1>
      <button
        onClick={handleUpdate}
        disabled={loading}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "กำลังอัปโหลด..." : "อัปเดตข้อมูล"}
      </button>
      {message && <p style={{ marginTop: 20 }}>{message}</p>}
    </div>
  );
}
