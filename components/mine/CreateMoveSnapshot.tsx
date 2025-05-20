"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface FightEntry {
  house: string;
  count: number;
}

const ALL_NODE_IDS = Array.from({ length: 60 }, (_, i) => (i + 1).toString());

// ฟังก์ชันแปลงชื่อบ้าน
function convertHouseName(house: string): string {
  const match = house.trim().match(/บ้าน\s*0*(\d+)/);
  if (match) {
    return `B${parseInt(match[1], 10)}`;
  }
  return house.trim(); // fallback
}

export default function CreateSnapshotMoveButton() {
  const [round, setRound] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const handleSnapshot = async () => {
    setLoading(true);

    // ดึง snapshot ล่าสุดจากรอบก่อนหน้า (โดยไม่จำกัด phase เฉพาะ)
    const { data: latestSnapshots, error: fetchError } = await supabase
      .from("snapshots")
      .select("node, selectedcar, tower, towerOwner")
      .eq("round", round - 1);

    if (fetchError) {
      console.error("Error fetching latest snapshot", fetchError);
      alert("ไม่สามารถดึง snapshot รอบก่อนหน้าได้");
      setLoading(false);
      return;
    }

    // สร้างแผนที่ข้อมูลเดิมจาก snapshot ล่าสุด
    const latestMap = new Map<
      string,
      { selectedcar: string; tower: boolean; towerOwner: string }
    >();
    latestSnapshots?.forEach((snap) => {
      latestMap.set(String(snap.node), {
        selectedcar: snap.selectedcar || "",
        tower: snap.tower || false,
        towerOwner: snap.towerOwner || "",
      });
    });

    // ดึง moves ของรอบนี้
    const { data: moves, error } = await supabase
      .from("moves")
      .select("house, node, count")
      .eq("round", round);

    if (error || !moves) {
      console.error("Error fetching moves", error);
      alert("ไม่พบข้อมูล moves");
      setLoading(false);
      return;
    }

    // รวม moves ตาม node
    const nodeMap: Record<string, FightEntry[]> = {};
    moves.forEach((move) => {
      const nodeId = String(move.node);
      if (!nodeMap[nodeId]) nodeMap[nodeId] = [];
      nodeMap[nodeId].push({ house: move.house.trim(), count: move.count });
    });

    const snapshotData: any[] = [];

    for (const node in nodeMap) {
      const entries = nodeMap[node];

      if (entries.length > 1) {
        // มีหลายบ้านเลือก node เดียวกัน → fight
        // แปลงชื่อบ้านใน fight เป็น B1, B2, ...
        const fightEntries = entries.map((entry) => ({
          house: convertHouseName(entry.house),
          count: entry.count,
        }));
        snapshotData.push({
          node,
          phase: "เดิน",
          round,
          value: null,
          selectedcar: "",
          tower: latestMap.get(node)?.tower || false,
          ship: [],
          fight: fightEntries,
          towerOwner: latestMap.get(node)?.towerOwner || "",
        });
      } else {
        const entry = entries[0];
        snapshotData.push({
          node,
          phase: "เดิน",
          round,
          value: entry.count,
          selectedcar: convertHouseName(entry.house),
          tower: latestMap.get(node)?.tower || false,
          ship: [],
          fight: [],
          towerOwner: latestMap.get(node)?.towerOwner || "",
        });
      }
    }

    // เติม node ที่ไม่มีข้อมูล move แต่มีข้อมูลจาก snapshot ก่อนหน้า
    ALL_NODE_IDS.forEach((nodeId) => {
      if (!snapshotData.find((s) => s.node === nodeId)) {
        const prev = latestMap.get(nodeId);
        snapshotData.push({
          node: nodeId,
          phase: "เดิน",
          round,
          value: null,
          selectedcar: prev?.selectedcar || "",
          tower: prev?.tower || false,
          ship: [],
          fight: [],
          towerOwner: prev?.towerOwner || "",
        });
      }
    });

    // เพิ่ม snapshot
    const { error: insertError } = await supabase
      .from("snapshots")
      .insert(snapshotData);

    if (insertError) {
      console.error("Insert error", insertError);
      alert("เกิดข้อผิดพลาดในการสร้าง snapshot");
    } else {
      alert("สร้าง Snapshot สำเร็จ");
    }

    setLoading(false);
  };

  return (
    <div className="p-4 border rounded shadow max-w-md">
      <label className="mr-2 font-semibold">รอบ:</label>
      <input
        type="number"
        value={round}
        onChange={(e) => setRound(Number(e.target.value))}
        className="border px-2 py-1 mr-4 w-24"
        min={0}
      />
      <button
        onClick={handleSnapshot}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "กำลังสร้าง..." : "สร้าง Snapshot Phase เดิน"}
      </button>
    </div>
  );
}
