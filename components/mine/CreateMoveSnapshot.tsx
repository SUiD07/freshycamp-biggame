"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Phase = "เดิน" | "สู้" | "สร้าง" | "ชุบ";
interface FightEntry {
  house: string;
  count: number;
}
const phaseOrder: Record<Phase, number> = {
  สร้าง: 1,
  ชุบ: 2,
  เดิน: 3,
  สู้: 4,
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
    // 👈
    console.log(`=== เริ่มสร้าง snapshot รอบ ${round} ===`);
    console.log(`ดึง snapshot phase "ชุบ" จากรอบ ${round}...`);
    // 1. ดึง snapshot ทั้งหมดย้อนหลัง (เรียงจากรอบล่าสุดไปก่อน)
    //ตอนนี้แก้เป็น ดึง snapshot phase "ชุบ" จาก round ก่อนหน้า
    const { data: pastSnapshots, error: fetchError } = await supabase
      .from("snapshots")
      .select("node, round, selectedcar, tower, towerOwner")
      .eq("phase", "ชุบ")
      .eq("round", round); // 👈 ใช้ round เดียวกับ snapshot "เดิน"F

    if (fetchError) {
      console.error("Error fetching snapshots", fetchError);
      alert("ไม่สามารถดึง snapshot ก่อนหน้าได้");
      setLoading(false);
      return;
    }
    console.log(`ดึง snapshot สำเร็จ จำนวน ${pastSnapshots?.length || 0} แถว`);

    // 2. สร้าง map ของ snapshot ล่าสุดแต่ละ node
    const latestMap = new Map<
      string,
      { selectedcar: string; tower: boolean; towerOwner: string }
    >();

    for (const snap of pastSnapshots || []) {
      const nodeId = String(snap.node);
      if (!latestMap.has(nodeId)) {
        latestMap.set(nodeId, {
          selectedcar: snap.selectedcar || "",
          tower: snap.tower || false,
          towerOwner: snap.towerOwner || "",
        });
      }
    }
    console.log(`สร้าง latestMap สำหรับ node จำนวน ${latestMap.size}`);
    // 3. ดึง moves ของรอบนี้
    console.log(`ดึง moves ของรอบ ${round}...`);
    const { data: moves, error: moveError } = await supabase
      .from("moves")
      .select("house, node, count")
      .eq("round", round);

    if (moveError || !moves) {
      console.error("Error fetching moves", moveError);
      alert("ไม่พบข้อมูล moves");
      setLoading(false);
      return;
    }
    console.log(`ดึง moves สำเร็จ จำนวน ${moves.length} แถว`);
    // 4. รวม moves ตาม node
    const nodeMap: Record<string, FightEntry[]> = {};
    for (const move of moves) {
      const nodeId = String(move.node);
      if (!nodeMap[nodeId]) nodeMap[nodeId] = [];
      nodeMap[nodeId].push({
        house: move.house.trim(),
        count: move.count,
      });
    }
    console.log(
      `แยก moves ตาม node ได้ทั้งหมด ${Object.keys(nodeMap).length} node`
    );
    // 5. สร้าง snapshotData สำหรับรอบนี้
    const snapshotData: any[] = [];

    for (const node in nodeMap) {
      const entries = nodeMap[node];
      const previous = latestMap.get(node);

      if (entries.length > 1) {
        // มีการต่อสู้
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
          tower: previous?.tower || false,
          ship: [],
          fight: fightEntries,
          towerOwner: previous?.towerOwner || "",
        });
      } else {
        const entry = entries[0];
        snapshotData.push({
          node,
          phase: "เดิน",
          round,
          value: entry.count,
          selectedcar: convertHouseName(entry.house),
          tower: previous?.tower || false,
          ship: [],
          fight: [],
          towerOwner: previous?.towerOwner || "",
        });
      }
    }
    console.log(
      `สร้าง snapshotData เรียบร้อย จำนวน ${snapshotData.length} รายการ`
    );
    // 6. เติม node ที่ไม่มี move แต่เคยมีค่าในอดีต
    let fillCount = 0;
    for (const nodeId of ALL_NODE_IDS) {
      if (!snapshotData.find((s) => s.node === nodeId)) {
        const previous = latestMap.get(nodeId);
        snapshotData.push({
          node: nodeId,
          phase: "เดิน",
          round,
          value: null,
          selectedcar: previous?.selectedcar || "",
          tower: previous?.tower || false,
          ship: [],
          fight: [],
          towerOwner: previous?.towerOwner || "",
        });
        fillCount++;
      }
    }
    console.log(`เติม node ที่ไม่มี move อีก ${fillCount} node`);
    // 7. บันทึก snapshot
    const { error: insertError } = await supabase
      .from("snapshots")
      .insert(snapshotData);

    if (insertError) {
      console.error("Insert error", insertError);
      alert("เกิดข้อผิดพลาดในการสร้าง snapshot");
    } else {
      alert("สร้าง Snapshot สำเร็จ");
      console.log("บันทึก snapshot สำเร็จ");
    }

    setLoading(false);
  };

  //🧱🧱🧱🧱🧱🧱🧱🧱fight phase🧱🧱🧱🧱🧱🧱🧱🧱
  const handleFightPhase = async () => {
    setLoading(true);

    // 1. ดึง snapshot ล่าสุดสุดของแต่ละ node (ไม่สนว่าจะอยู่ round ไหนหรือ phase ไหน)
    // 1. ดึง snapshot phase เดิน ของรอบเดียวกัน
    const { data: allSnapshots, error: snapError } = await supabase
      .from("snapshots")
      .select("node, selectedcar, towerOwner, round, phase")
      .eq("round", round)
      .eq("phase", "เดิน");

    if (snapError) {
      console.error("Error fetching 'เดิน' phase snapshots", snapError);
      alert("ไม่สามารถดึง snapshot ของ phase เดิน ได้");
      setLoading(false);
      return;
    }

    // 2. สร้าง map จาก node เพื่อเก็บ snapshot ล่าสุดสุดต่อ node
    const latestMap = new Map<
      string,
      { selectedcar: string; towerOwner: string | null }
    >();
    allSnapshots?.forEach((snap) => {
      if (!latestMap.has(snap.node)) {
        latestMap.set(snap.node, {
          selectedcar: snap.selectedcar || "",
          towerOwner: snap.towerOwner || null,
        });
      }
    });

    // 3. ดึงข้อมูล fight ของรอบนี้
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

    // 4. สร้าง snapshot สำหรับ phase "สู้"
    const fightSnapshots = fightData
      .filter((row) => row.node && row.node !== "0")
      .map((row) => {
        const nodeId = String(row.node);
        const tower = !!row.tower;
        const previous = latestMap.get(nodeId);

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

    // 5. เพิ่ม snapshot phase "สู้"
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

    // 1. ดึง snapshot phase สู้ round-1
    const { data: allSnapshots, error: snapError } = await supabase
      .from("snapshots")
      .select(
        "node, phase, selectedcar, tower, towerOwner, fight, value, round"
      )
      .eq("round", round - 1)
      .eq("phase", "สู้");

    if (snapError || !allSnapshots) {
      console.error("Error fetching snapshots", snapError);
      alert("ไม่สามารถดึง snapshot ได้");
      setLoading(false);
      return;
    }

    // 2. หา snapshot ล่าสุดของแต่ละ node จากรอบล่าสุดและ phase ล่าสุด (สร้าง < เดิน < สู้)
    // const phaseOrder = { สร้าง: 1, เดิน: 2, สู้: 3 }; ใช้ globalแทน
    const latestByNode = new Map<string, any>();

    allSnapshots.forEach((snap) => {
      const nodeId = String(snap.node);
      const existing = latestByNode.get(nodeId);

      if (
        !existing ||
        snap.round > existing.round ||
        (snap.round === existing.round &&
          (phaseOrder[snap.phase as keyof typeof phaseOrder] ?? 0) >
            (phaseOrder[existing.phase as keyof typeof phaseOrder] ?? 0))
      ) {
        latestByNode.set(nodeId, snap);
      }
    });

    // 3. ดึง purchases ที่เกี่ยวข้องกับการสร้างป้อมของ round ปัจจุบัน
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
          round, // รอบปัจจุบัน
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
  ////////////////
  // const reviveHouseMap = new Map<string, string>();

  const handleRevivePhase = async () => {
    setLoading(true);

    // 1. ดึง snapshots phase = "สร้าง" ในรอบเดียวกัน
    const { data: baseSnapshots, error: snapError } = await supabase
      .from("snapshots")
      .select(
        "node, round, phase, selectedcar, tower, towerOwner, fight, value"
      )
      .eq("round", round)
      .eq("phase", "สร้าง");

    if (snapError || !baseSnapshots || baseSnapshots.length === 0) {
      console.error("Error fetching build-phase snapshots", snapError);
      alert("ไม่พบ snapshot phase สร้าง ในรอบนี้");
      setLoading(false);
      return;
    }

    // 2. ดึง purchases รอบนี้ type = "revive"
    const { data: revivePurchases, error: purchaseError } = await supabase
      .from("purchases")
      .select("node, count, house")
      .eq("round", round)
      .eq("type", "revive");

    if (purchaseError) {
      console.error("Error fetching revive purchases", purchaseError);
      alert("ไม่สามารถดึงข้อมูลการชุบชีวิตได้");
      setLoading(false);
      return;
    }

    const reviveMap = new Map<string, number>();
    const reviveHouseMap = new Map<string, string>();
    revivePurchases.forEach((p) => {
      const nodeId = String(p.node);
      if (nodeId && nodeId !== "0" && p.count > 0) {
        reviveMap.set(nodeId, (reviveMap.get(nodeId) || 0) + p.count);
        reviveHouseMap.set(nodeId, p.house); // เก็บ house ด้วย
      }
    });

    // 3. สร้าง snapshot ใหม่ (phase = "ชุบ")
    const newSnapshots = baseSnapshots.map((snap) => {
      const nodeId = String(snap.node);
      const reviveValue = reviveMap.get(nodeId) || 0;

      return {
        node: nodeId,
        phase: "ชุบ",
        round,
        selectedcar:
          reviveValue > 0
            ? convertHouseName(reviveHouseMap.get(nodeId) || "")
            : snap.selectedcar || "",
        tower: snap.tower,
        towerOwner: snap.towerOwner,
        fight: snap.fight || [],
        value: (snap.value || 0) + reviveValue,
        ship: [],
      };
    });

    // 4. แทรก snapshot ใหม่
    const { error: insertError } = await supabase
      .from("snapshots")
      .insert(newSnapshots);

    if (insertError) {
      console.error("Insert error", insertError);
      alert("เกิดข้อผิดพลาดในการสร้าง Snapshot Phase ชุบ");
    } else {
      alert("สร้าง Snapshot Phase ชุบ สำเร็จ");
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
        onClick={handleBuildPhase}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2"
      >
        {loading ? "กำลังสร้าง..." : "สร้าง Snapshot Phase สร้าง"}
      </button>
      <button
        onClick={handleRevivePhase}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "กำลังสร้าง..." : "สร้าง Snapshot Phase ชุบ"}
      </button>
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
    </div>
  );
}
