"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Phase = "เดิน" | "สู้" | "สร้าง";
interface FightEntry {
  house: string;
  count: number;
}
const phaseOrder: Record<Phase, number> = {
  เดิน: 1,
  สู้: 2,
  สร้าง: 3,
};

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

  //🧱🧱🧱🧱🧱🧱🧱🧱fight phase🧱🧱🧱🧱🧱🧱🧱🧱
  const handleFightPhase = async () => {
    setLoading(true);

    // 1. ดึง snapshot รอบก่อนหน้า (phase ใดก็ได้)
    const { data: previousSnapshots, error: snapError } = await supabase
      .from("snapshots")
      .select("node, selectedcar, towerOwner")
      .eq("round", round - 1);

    if (snapError) {
      console.error("Error fetching previous snapshots", snapError);
      alert("ไม่สามารถดึง snapshot รอบก่อนหน้าได้");
      setLoading(false);
      return;
    }

    const previousMap = new Map<
      string,
      { selectedcar: string; towerOwner: string | null }
    >();
    previousSnapshots?.forEach((s) => {
      previousMap.set(s.node, {
        selectedcar: s.selectedcar || "",
        towerOwner: s.towerOwner || null,
      });
    });

    // 2. ดึงข้อมูล fight ของรอบนี้
    const { data: fightData, error: fightError } = await supabase
      .from("fight")
      .select("node, house, count, tower")
      .eq("round", round);

    if (fightError) {
      console.error("Error fetching fight data", fightError);
      alert("ไม่สามารถดึงข้อมูล fight ได้");
      setLoading(false);
      return;
    }

    // 3. สร้าง snapshot สำหรับ phase "สู้"
    const fightSnapshots = fightData
      .filter((row) => row.node && row.node !== "0")
      .map((row) => {
        const nodeId = String(row.node);
        const tower = !!row.tower;
        const previous = previousMap.get(nodeId);

        return {
          node: nodeId,
          phase: "สู้",
          round,
          value: row.count,
          selectedcar: row.house?.trim() || previous?.selectedcar || "",
          tower,
          ship: [],
          fight: null,
          towerOwner: tower ? previous?.towerOwner || null : null,
        };
      });

    // 4. เพิ่ม snapshot phase "สู้"
    const { error: insertError } = await supabase
      .from("snapshots")
      .insert(fightSnapshots);

    if (insertError) {
      console.error("Insert error", insertError);
      alert("เกิดข้อผิดพลาดในการสร้าง Snapshot Phase สู้");
    } else {
      alert("สร้าง Snapshot Phase สู้ สำเร็จ");
    }

    setLoading(false);
  };
  //🧱🧱🧱🧱🧱🧱🧱🧱 สร้างป้อม phase🧱🧱🧱🧱🧱🧱🧱🧱
  const handleBuildPhase = async () => {
    setLoading(true);

    // 1. ดึง snapshot ทั้งหมดของ round นี้
    const { data: allSnapshots, error: snapError } = await supabase
      .from("snapshots")
      .select("node, phase, selectedcar, tower, towerOwner, fight, value")
      .eq("round", round);

    if (snapError || !allSnapshots) {
      console.error("Error fetching snapshots", snapError);
      alert("ไม่สามารถดึง snapshot รอบนี้ได้");
      setLoading(false);
      return;
    }

    // 2. หา phase ล่าสุดของแต่ละ node
    const phaseOrder = { เดิน: 1, สู้: 2, สร้าง: 3 };
    const latestByNode = new Map<string, any>();
    allSnapshots.forEach((snap) => {
      const nodeId = String(snap.node);
      const existing = latestByNode.get(nodeId);
      if (
        !existing ||
        (phaseOrder[snap.phase as Phase] ?? 0) >
          (phaseOrder[existing.phase as Phase] ?? 0)
      ) {
        latestByNode.set(nodeId, snap);
      }
    });

    // 3. ดึง purchases ที่เกี่ยวข้องกับการสร้างป้อม
    const { data: purchaseData, error: purchaseError } = await supabase
      .from("purchases")
      .select("node, house")
      .eq("round", round)
      .eq("type", "fort");

    if (purchaseError) {
      console.error("Error fetching purchases", purchaseError);
      alert("ไม่สามารถดึงข้อมูล purchases ได้");
      setLoading(false);
      return;
    }

    const purchaseMap = new Map<string, string>();
    purchaseData?.forEach((p) => {
      const nodeId = String(p.node);
      if (nodeId && nodeId !== "0") {
        purchaseMap.set(nodeId, p.house.trim());
      }
    });

    // 4. สร้าง snapshot ใหม่สำหรับ phase 'สร้าง'
    const buildSnapshots = Array.from(latestByNode.entries()).map(
      ([nodeId, snap]) => {
        const overrideHouse = purchaseMap.get(nodeId);
        const isTower = overrideHouse ? true : snap.tower || false;

        return {
          node: nodeId,
          phase: "สร้าง",
          round,
          selectedcar: snap.selectedcar || "",
          tower: isTower,
          towerOwner: isTower ? overrideHouse || snap.towerOwner : null,
          fight: snap.fight || [],
          value: snap.value ?? null,
          ship: [],
        };
      }
    );

    // 5. แทรก snapshot
    const { error: insertError } = await supabase
      .from("snapshots")
      .insert(buildSnapshots);

    if (insertError) {
      console.error("Insert error", insertError);
      alert("เกิดข้อผิดพลาดในการสร้าง Snapshot Phase สร้าง");
    } else {
      alert("สร้าง Snapshot Phase สร้าง สำเร็จ");
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
      <button
        onClick={handleFightPhase}
        disabled={loading}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mt-4"
      >
        {loading ? "กำลังสร้าง..." : "สร้าง Snapshot Phase สู้"}
      </button>
      <button
        onClick={handleBuildPhase}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2"
      >
        {loading ? "กำลังสร้าง..." : "สร้าง Snapshot Phase สร้าง"}
      </button>
    </div>
  );
}
