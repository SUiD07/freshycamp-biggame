"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function MoveForm({ house }: { house: string }) {
  const [round, setRound] = useState(1);
  const [currentNodes, setCurrentNodes] = useState<
    { node: string; count: number }[]
  >([]);
  const [moves, setMoves] = useState<
    { fromNode: string; toNode: string; count: number; boat: number }[]
  >([]);
  const [message, setMessage] = useState("");

  // เก็บจำนวนคนจริงในแต่ละ node
  const [nodeValues, setNodeValues] = useState<Record<string, number>>({});

  // ย้าย fetchNodes ออกมาเป็นฟังก์ชันทั่วไป
  const fetchNodes = async () => {
    setMessage("🔄 กำลังโหลดข้อมูล...");
    const { data, error } = await supabase
      .from("nodes")
      .select("id, selectedcar, value")
      .eq("selectedcar", house);

    if (error) {
      setMessage("❌ ไม่สามารถดึงข้อมูล node ได้");
      return;
    }

    if (data && data.length > 0) {
      const formattedNodes = data.map((n) => ({
        node: n.id,
        // count: 1, // ค่าเริ่มต้นใส่ 1 คน ต่อ node (ใช้แสดงในหัวข้อ)
        count: Number(n.value) || 0, // ใช้ค่า value จากฐานข้อมูลแทน 1
      }));

      setCurrentNodes(formattedNodes);

      // สร้าง moves เริ่มต้น โดยให้ toNode = fromNode (default ไป node ตัวเอง)
      setMoves(
        formattedNodes.map((n) => ({
          fromNode: n.node,
          toNode: n.node,
          count: Number(n.count), // นำค่าที่ได้มาใช้เลย
          boat: 0,
        }))
      );

      // เก็บ value ของแต่ละ node (จำนวนคนจริงใน node)
      const valuesMap: Record<string, number> = {};
      data.forEach((n) => {
        valuesMap[n.id] = Number(n.value) || 0;
      });
      setNodeValues(valuesMap);
      setMessage("✅ โหลดข้อมูลสำเร็จ");
    }
  };

  useEffect(() => {
    fetchNodes();
  }, [house]);

  const [isSpecialHouse, setIsSpecialHouse] = useState(false);
  useEffect(() => {
    const checkSpecialHouse = async () => {
      const formatted = formatHouseName(house); // เช่น "บ้าน 03"
      const { data, error } = await supabase
        .from("special_houses")
        .select("*")
        .eq("house", formatted)
        .single();
      if (error) console.error("❌ โหลด special house error", error);
      console.log("🏠 ตรวจ special house:", formatted, !!data);

      setIsSpecialHouse(!!data);
    };

    checkSpecialHouse();
  }, [house]);
  const handleMoveChange = (
    fromNode: string,
    index: number,
    key: "toNode" | "count",
    value: string | number
  ) => {
    const updated = [...moves];
    const idx = updated.findIndex(
      (m, i) => m.fromNode === fromNode && i === index
    );

    if (idx !== -1) {
      const from = Number(fromNode);
      const validHarbors = harborsPerNode[from] ?? [];
      const move = updated[idx];

      // อัปเดตค่าที่เปลี่ยน
      if (key === "count") {
        move.count = Number(value);
      } else if (key === "toNode") {
        move.toNode = String(value);
      }

      // ตรวจสอบปลายทางใหม่และอัปเดตจำนวนเรือเสมอ
      const to = Number(move.toNode);
      const count = move.count;
      const boatUnit = isSpecialHouse ? 6 : 5;
      move.boat = validHarbors.includes(to) ? Math.ceil(count / boatUnit) : 0;

      setMoves(updated);
    }
  };

  const addMove = (fromNode: string) => {
    setMoves([...moves, { fromNode, toNode: fromNode, count: 1, boat: 0 }]);
  };

  const removeMove = (fromNode: string, index: number) => {
    const filtered = moves.filter(
      (m, i) => !(m.fromNode === fromNode && i === index)
    );

    // ต้องมีอย่างน้อย 1 move ต่อ fromNode
    const remainingForNode = filtered.filter((m) => m.fromNode === fromNode);
    if (remainingForNode.length === 0) {
      setMessage("❌ ต้องมีอย่างน้อย 1 Node ที่จะไป");
      return;
    }

    setMoves(filtered);
  };

  // ตรวจสอบจำนวนคนรวมจากแต่ละ fromNode ต้องไม่เกิน value จริง
  const validateCounts = () => {
    const sums: Record<string, number> = {};

    moves.forEach((m) => {
      if (!sums[m.fromNode]) sums[m.fromNode] = 0;
      sums[m.fromNode] += m.count;
    });

    for (const node in nodeValues) {
      const expected = nodeValues[node] || 0;
      const actual = sums[node] || 0;

      if (actual !== expected) {
        setMessage(
          `❌ จำนวนคนที่ส่งจาก Node ${node} ต้องเท่ากับจำนวนคนที่มีอยู่จริง (${expected} คน) แต่กรอก ${actual} คน`
        );
        return false;
      }
    }
    return true;
  };
  // check backend ว่าข้อมูลnode ต้นทางตรงกับข้อมูลปัจจุบันไหม
  const validateWithBackend = async () => {
    const { data, error } = await supabase
      .from("nodes")
      .select("id, value")
      .eq("selectedcar", house);

    if (error || !data) {
      setMessage("❌ ตรวจสอบข้อมูลล่าสุดจากระบบไม่สำเร็จ");
      return false;
    }

    const backendNodeMap: Record<string, number> = {};
    data.forEach((n) => {
      backendNodeMap[n.id] = Number(n.value) || 0;
    });

    const frontendNodes = Object.keys(nodeValues);
    const backendNodes = Object.keys(backendNodeMap);
    const problems: string[] = [];

    // 🔍 1. Node หายไปจากตาราง
    for (const node of frontendNodes) {
      if (!backendNodes.includes(node)) {
        problems.push(
          `⚠️ Node ${node} ไม่มีอยู่ในข้อมูลล่าสุด กรุณากดทั้งปุ่ม"รีเฟรชข้อมูลแผนที่"และ"รีเฟรชฟอร์มกรอกข้อมูล"`
        );
      }
    }

    // 🔍 2. Node ใหม่เพิ่มเข้ามา
    for (const node of backendNodes) {
      if (!frontendNodes.includes(node)) {
        problems.push(
          `⚠️ มี Node ใหม่ (${node}) ในข้อมูลล่าสุด กรุณากดทั้งปุ่ม"รีเฟรชข้อมูลแผนที่"และ"รีเฟรชฟอร์มกรอกข้อมูล"`
        );
      }
    }

    // 🔍 3. จำนวนคนเปลี่ยน
    for (const node of frontendNodes) {
      const local = nodeValues[node];
      const backend = backendNodeMap[node];
      if (local !== backend) {
        problems.push(
          `⚠️ จำนวนคนใน Node ${node} เปลี่ยนจาก ${local} เป็น ${backend} คน กรุณากดทั้งปุ่ม"รีเฟรชข้อมูลแผนที่"และ"รีเฟรชฟอร์มกรอกข้อมูล"`
        );
      }
    }

    // ✅ ✅ ✅ 🔍 4. ตรวจสอบว่า fromNode ที่อยู่ใน moves มีอยู่ใน backend จริงไหม
    const fromNodesInMoves = Array.from(new Set(moves.map((m) => m.fromNode)));
    for (const fromNode of fromNodesInMoves) {
      if (!backendNodeMap.hasOwnProperty(fromNode)) {
        problems.push(
          `❌ มี Node ${fromNode} อยู่ในฟอร์ม แต่ไม่มีในระบบ กรุณากดทั้งปุ่ม"รีเฟรชข้อมูลแผนที่"และ"รีเฟรชฟอร์มกรอกข้อมูล"`
        );
      }
    }
    if (problems.length > 0) {
      setMessage(problems.join("\n"));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("⏳ กำลังตรวจสอบข้อมูล...");

    if (!validateCounts()) return;
    if (hasDuplicateToNodePerFromNode()) return;
    const isValid = await validateWithBackend();
    if (!isValid) return;

    const formattedHouse = formatHouseName(house);

    const { data: existing } = await supabase
      .from("moves")
      .select("*")
      .eq("house", formattedHouse)
      .eq("round", round);

    if (existing && existing.length > 0) {
      setMessage(`❌ ${formattedHouse} ส่งข้อมูลรอบนี้ไปแล้ว`);
      return;
    }

    // รวม toNode ซ้ำจาก fromNode ต่างกัน
    const filteredMoves = moves.filter((m) => m.count > 0);
    const aggregatedMoves: Record<string, { count: number; boat: number }> = {};

    filteredMoves.forEach((m) => {
      const key = `${m.toNode}`;
      if (!aggregatedMoves[key]) {
        aggregatedMoves[key] = { count: 0, boat: 0 };
      }
      aggregatedMoves[key].count += m.count;
      aggregatedMoves[key].boat += m.boat;
    });

    const moveData = Object.entries(aggregatedMoves).map(
      ([toNode, { count, boat }]) => ({
        node: toNode,
        count,
        boat,
        round,
        house: formattedHouse,
      })
    );

    const { error } = await supabase.from("moves").insert(moveData);
    if (error) {
      setMessage("❌ เกิดข้อผิดพลาดขณะบันทึกข้อมูล");
      return;
    }

    // 🔥 รวมเรือจาก fromNode เดียวกัน
    const shipSums: Record<string, number> = {};
    moves.forEach((m) => {
      if (m.boat > 0 && m.count > 0) {
        if (!shipSums[m.fromNode]) shipSums[m.fromNode] = 0;
        shipSums[m.fromNode] += m.boat;
      }
    });

    const shipData = Object.entries(shipSums).map(([fromNode, boat]) => ({
      house: formattedHouse,
      round,
      node: Number(fromNode),
      boat,
    }));

    const { error: shipError } = await supabase.from("ship").insert(shipData);

    if (shipError) {
      setMessage("❌ เกิดข้อผิดพลาดขณะบันทึกข้อมูลเรือ");
      return;
    }
    setMessage("✅ บันทึกสำเร็จ");
  };

  const formatHouseName = (houseCode: string) => {
    // ลบตัวอักษร B ออก
    const numPart = houseCode.replace(/^B/, "");
    // เติม 0 ข้างหน้า ถ้าน้อยกว่า 10
    const numFormatted = numPart.padStart(2, "0");
    return `บ้าน ${numFormatted}`;
  };

  // ตรวจสอบว่าแต่ละ fromNode ไม่ซ้ำ toNode กัน
  const hasDuplicateToNodePerFromNode = () => {
    const map = new Map<string, Set<string>>();

    moves.forEach((m) => {
      if (!map.has(m.fromNode)) {
        map.set(m.fromNode, new Set());
      }
      const toSet = map.get(m.fromNode)!;
      if (toSet.has(m.toNode)) {
        setMessage(
          `❌ จาก Node ${m.fromNode} ไม่สามารถส่งไปยัง Node ${m.toNode} ซ้ำกันได้`
        );
        return true;
      }
      toSet.add(m.toNode);
    });

    return false;
  };
  ///////////
  const [previewMoveData, setPreviewMoveData] = useState<any[]>([]);
  const [previewShipData, setPreviewShipData] = useState<any[]>([]);

  useEffect(() => {
    const formattedHouse = formatHouseName(house);

    // รวม toNode ซ้ำจาก fromNode ต่างกัน
    const filteredMoves = moves.filter((m) => m.count > 0);
    const aggregatedMoves: Record<string, { count: number; boat: number }> = {};

    filteredMoves.forEach((m) => {
      const key = `${m.toNode}`;
      if (!aggregatedMoves[key]) {
        aggregatedMoves[key] = { count: 0, boat: 0 };
      }
      aggregatedMoves[key].count += m.count;
      aggregatedMoves[key].boat += m.boat;
    });

    const moveData = Object.entries(aggregatedMoves).map(
      ([toNode, { count, boat }]) => ({
        node: toNode,
        count,
        boat,
        round,
        house: formattedHouse,
      })
    );

    const shipSums: Record<string, number> = {};
    moves.forEach((m) => {
      if (m.boat > 0 && m.count > 0) {
        if (!shipSums[m.fromNode]) shipSums[m.fromNode] = 0;
        shipSums[m.fromNode] += m.boat;
      }
    });
    const shipData = Object.entries(shipSums).map(([fromNode, boat]) => ({
      house: formattedHouse,
      round,
      node: Number(fromNode),
      boat,
    }));

    setPreviewMoveData(moveData);
    setPreviewShipData(shipData);
  }, [moves, house, round]);

  //node ปลายทาง
  const allowedDestinations: Record<number, number[]> = {
    1: [1, 2, 3, 40],
    2: [
      2, 1, 3, 39, 5, 7, 11, 14, 17, 21, 24, 27, 31, 35, 38, 41, 43, 44, 46, 47,
      49, 50, 52,
    ],
    3: [3, 1, 2, 4, 5],
    4: [4, 3, 5, 6],
    5: [
      5, 3, 4, 6, 7, 2, 11, 14, 17, 21, 24, 27, 31, 35, 38, 41, 43, 44, 46, 47,
      49, 50, 52,
    ],
    6: [6, 4, 5, 7, 8],
    7: [
      7, 5, 6, 8, 9, 2, 11, 14, 17, 21, 24, 27, 31, 35, 38, 41, 43, 44, 46, 47,
      49, 50, 52,
    ],
    8: [8, 6, 7, 9],
    9: [9, 7, 8, 10],
    10: [10, 9, 11, 12],
    11: [
      11, 10, 12, 13, 2, 5, 7, 14, 17, 21, 24, 27, 31, 35, 38, 41, 43, 44, 46,
      47, 49, 50, 52,
    ],
    12: [12, 10, 11, 13],
    13: [13, 11, 12, 14, 15],
    14: [
      14, 13, 15, 16, 2, 5, 7, 11, 17, 21, 24, 27, 31, 35, 38, 41, 43, 44, 46,
      47, 49, 50, 52,
    ],
    15: [15, 13, 14, 16],
    16: [16, 14, 15, 17, 18],
    17: [
      17, 16, 18, 19, 2, 5, 7, 11, 14, 21, 24, 27, 31, 35, 38, 41, 43, 44, 46,
      47, 49, 50, 52,
    ],
    18: [18, 16, 17, 19],
    19: [19, 17, 18, 20],
    20: [20, 19, 21, 22],
    21: [
      21, 20, 22, 23, 2, 5, 7, 11, 14, 17, 24, 27, 31, 35, 38, 41, 43, 44, 46,
      47, 49, 50, 52,
    ],
    22: [22, 20, 21, 23],
    23: [23, 21, 22, 24, 25],
    24: [
      24, 23, 25, 26, 27, 2, 5, 7, 11, 14, 17, 21, 31, 35, 38, 41, 43, 44, 46,
      47, 49, 50, 52,
    ],
    25: [25, 23, 24, 26],
    26: [26, 24, 25, 27, 28],
    27: [
      27, 24, 26, 28, 29, 2, 5, 7, 11, 14, 17, 21, 31, 35, 38, 41, 43, 44, 46,
      47, 49, 50, 52,
    ],
    28: [28, 26, 27, 29],
    29: [29, 27, 28, 30, 31],
    30: [30, 29, 31, 32],
    31: [
      31, 29, 30, 32, 2, 5, 7, 11, 14, 17, 21, 24, 27, 35, 38, 41, 43, 44, 46,
      47, 49, 50, 52,
    ],
    32: [32, 30, 31, 33],
    33: [33, 32, 34, 35],
    34: [34, 33, 35, 36],
    35: [
      35, 33, 34, 36, 2, 5, 7, 11, 14, 17, 21, 24, 27, 31, 38, 41, 43, 44, 46,
      47, 49, 50, 52,
    ],
    36: [36, 34, 35, 37, 38],
    37: [37, 36, 38, 39],
    38: [
      38, 36, 37, 39, 2, 5, 7, 11, 14, 17, 21, 24, 27, 31, 35, 41, 43, 44, 46,
      47, 49, 50, 52,
    ],
    39: [39, 2, 37, 38, 40],
    40: [40, 1, 39],
    41: [
      41, 42, 52, 53, 2, 5, 7, 11, 14, 17, 21, 24, 27, 31, 35, 38, 43, 44, 46,
      47, 49, 50,
    ],
    42: [42, 41, 43, 59],
    43: [
      43, 42, 44, 54, 2, 5, 7, 11, 14, 17, 21, 24, 27, 31, 35, 38, 41, 46, 47,
      49, 50, 52,
    ],
    44: [
      44, 43, 45, 54, 2, 5, 7, 11, 14, 17, 21, 24, 27, 31, 35, 38, 41, 46, 47,
      49, 50, 52,
    ],
    45: [45, 44, 46, 60],
    46: [
      46, 45, 47, 55, 2, 5, 7, 11, 14, 17, 21, 24, 27, 31, 35, 38, 41, 43, 44,
      49, 50, 52,
    ],
    47: [
      47, 46, 48, 55, 2, 5, 7, 11, 14, 17, 21, 24, 27, 31, 35, 38, 41, 43, 44,
      49, 50, 52,
    ],
    48: [48, 47, 49, 56],
    49: [
      49, 48, 50, 56, 58, 2, 5, 7, 11, 14, 17, 21, 24, 27, 31, 35, 38, 41, 43,
      44, 46, 47, 52,
    ],
    50: [
      50, 49, 51, 57, 58, 2, 5, 7, 11, 14, 17, 21, 24, 27, 31, 35, 38, 41, 43,
      44, 46, 47, 52,
    ],
    51: [51, 50, 52, 57],
    52: [
      52, 41, 51, 53, 2, 5, 7, 11, 14, 17, 21, 24, 27, 31, 35, 38, 43, 44, 46,
      47, 49, 50,
    ],
    53: [53, 41, 52, 59],
    54: [54, 43, 44, 59, 60],
    55: [55, 46, 47, 60],
    56: [56, 48, 49, 58, 60],
    57: [57, 50, 51, 58, 59],
    58: [58, 49, 50, 56, 57, 59, 60],
    59: [59, 42, 53, 54, 57, 58, 60],
    60: [60, 45, 54, 55, 56, 58, 59],
  };
  const harborsPerNode: Record<number, number[]> = {
    1: [],
    2: [
      5, 7, 11, 14, 17, 21, 24, 27, 31, 35, 38, 41, 43, 44, 46, 47, 49, 50, 52,
    ],
    3: [],
    4: [],
    5: [2, 11, 14, 17, 21, 24, 27, 31, 35, 38, 41, 43, 44, 46, 47, 49, 50, 52],
    6: [],
    7: [2, 11, 14, 17, 21, 24, 27, 31, 35, 38, 41, 43, 44, 46, 47, 49, 50, 52],
    8: [],
    9: [],
    10: [],
    11: [
      2, 5, 7, 14, 17, 21, 24, 27, 31, 35, 38, 41, 43, 44, 46, 47, 49, 50, 52,
    ],
    12: [],
    13: [],
    14: [
      2, 5, 7, 11, 17, 21, 24, 27, 31, 35, 38, 41, 43, 44, 46, 47, 49, 50, 52,
    ],
    15: [],
    16: [],
    17: [
      2, 5, 7, 11, 14, 21, 24, 27, 31, 35, 38, 41, 43, 44, 46, 47, 49, 50, 52,
    ],
    18: [],
    19: [],
    20: [],
    21: [
      2, 5, 7, 11, 14, 17, 24, 27, 31, 35, 38, 41, 43, 44, 46, 47, 49, 50, 52,
    ],
    22: [],
    23: [],
    24: [2, 5, 7, 11, 14, 17, 21, 31, 35, 38, 41, 43, 44, 46, 47, 49, 50, 52],
    25: [],
    26: [],
    27: [2, 5, 7, 11, 14, 17, 21, 31, 35, 38, 41, 43, 44, 46, 47, 49, 50, 52],
    28: [],
    29: [],
    30: [],
    31: [
      2, 5, 7, 11, 14, 17, 21, 24, 27, 35, 38, 41, 43, 44, 46, 47, 49, 50, 52,
    ],
    32: [],
    33: [],
    34: [],
    35: [
      2, 5, 7, 11, 14, 17, 21, 24, 27, 31, 38, 41, 43, 44, 46, 47, 49, 50, 52,
    ],
    36: [],
    37: [],
    38: [
      2, 5, 7, 11, 14, 17, 21, 24, 27, 31, 35, 41, 43, 44, 46, 47, 49, 50, 52,
    ],
    39: [],
    40: [],
    41: [2, 5, 7, 11, 14, 17, 21, 24, 27, 31, 35, 38, 43, 44, 46, 47, 49, 50],
    42: [],
    43: [2, 5, 7, 11, 14, 17, 21, 24, 27, 31, 35, 38, 41, 46, 47, 49, 50, 52],
    44: [2, 5, 7, 11, 14, 17, 21, 24, 27, 31, 35, 38, 41, 46, 47, 49, 50, 52],
    45: [],
    46: [2, 5, 7, 11, 14, 17, 21, 24, 27, 31, 35, 38, 41, 43, 44, 49, 50, 52],
    47: [2, 5, 7, 11, 14, 17, 21, 24, 27, 31, 35, 38, 41, 43, 44, 49, 50, 52],
    48: [],
    49: [2, 5, 7, 11, 14, 17, 21, 24, 27, 31, 35, 38, 41, 43, 44, 46, 47, 52],
    50: [2, 5, 7, 11, 14, 17, 21, 24, 27, 31, 35, 38, 41, 43, 44, 46, 47, 52],
    51: [],
    52: [2, 5, 7, 11, 14, 17, 21, 24, 27, 31, 35, 38, 43, 44, 46, 47, 49, 50],
    53: [],
    54: [],
    55: [],
    56: [],
    57: [],
    58: [],
    59: [],
    60: [],
  };

  useEffect(() => {
    const channel = supabase
      .channel("map-refresh-channel")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "map_refresh_trigger",
          filter: "id=eq.1",
        },
        (payload) => {
          console.log("⚡ รีโหลด node ใน MoveForm เพราะแผนที่ถูกรีเฟรช");
          fetchNodes(); // โหลดข้อมูลใหม่ของ node เฉพาะบ้านนี้
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-[600px] max-sm:w-full max-sm:max-w-[600px] max-sm:mx-auto max-sm:px-4">
      <div>
        สตาฟแจ้งrefresh map{"->"}กด refresh map ด้านบน{"->"}กดปุ่ม refresh
        ข้อมูลที่บรรทัดถัดไป
        <span className="font-bold">ก่อนกรอกข้อมูลทุกครั้ง</span>
        {"->"}แล้วค่อยกรอกข้อมูลการเดิน
      </div>
      <Button
        type="button"
        onClick={fetchNodes}
        className="px-3 py-1 rounded hover:bg-slate-600"
      >
        🔄 รีเฟรชฟอร์มกรอกข้อมูล "เดิน"
      </Button>
      {message && <p className="text-red-600 whitespace-pre-line">{message}</p>}

      <div>
        <label htmlFor="round-select">รอบ: </label>
        <select
          id="round-select"
          value={round}
          onChange={(e) => setRound(+e.target.value)}
          className="border px-2"
        >
          {Array.from({ length: 50 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>

      {currentNodes.map((n) => {
        const nodeMoves = moves
          .map((m, idx) => ({ ...m, idx }))
          .filter((m) => m.fromNode === n.node);

        return (
          <div key={n.node} className="border p-2 rounded">
            <h2 className="font-bold text-lg">
              🟢 Node {n.node} (มีคนอยู่: {nodeValues[n.node] ?? 0})
              <span className="text-red-600 text-sm">
                <br />
                จำนวนคนที่ส่งไปที่ Node ต่างๆ
                ต้องรวมแล้วเท่ากับจำนวนคนที่มีอยู่ก่อนเดิน
              </span>
              <span className="text-blue-600 text-sm">
                <br />
                จำนวนเรือที่ต้องใช้จะขึ้นอัตโนมัติ หากตัวเลขขึ้นผิดให้แจ้ง
              </span>
            </h2>

            {nodeMoves.map((m) => {
              const fromNode = Number(n.node); // แปลงให้แน่ใจว่าเป็น number
              const destinations = allowedDestinations[fromNode] ?? [];
              const validHarbors = harborsPerNode[fromNode] ?? [];
              return (
                <div key={m.idx} className="flex flex-wrap md:flex-nowrap items-center gap-2 my-1">
                  <label htmlFor={`toNode-${n.node}-${m.idx}`}>ไป Node:</label>
                  <select
                    id={`toNode-${n.node}-${m.idx}`}
                    name={`toNode-${n.node}-${m.idx}`}
                    value={m.toNode}
                    onChange={(e) =>
                      handleMoveChange(n.node, m.idx, "toNode", +e.target.value)
                    }
                    className="border px-2"
                  >
                    <option value="">-- เลือก Node --</option>
                    {destinations.map((dest: number) => (
                      <option key={dest} value={dest}>
                        {dest}
                      </option>
                    ))}
                  </select>
                  <label htmlFor={`count-${n.node}-${m.idx}`}>กี่คน:</label>
                  <select
                    id={`count-${n.node}-${m.idx}`}
                    name={`count-${n.node}-${m.idx}`}
                    value={m.count}
                    onChange={(e) =>
                      handleMoveChange(n.node, m.idx, "count", +e.target.value)
                    }
                    className="border px-2"
                  >
                    {Array.from({ length: 25 }, (_, i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                  <label htmlFor={`boat-${n.node}-${m.idx}`}>🚢 เรือ:</label>{" "}
                  <select
                    id={`boat-${n.node}-${m.idx}`}
                    name={`boat-${n.node}-${m.idx}`}
                    value={m.boat}
                    disabled
                    className="border px-2 bg-gray-100 text-gray-500"
                  >
                    <option value={m.boat}>{m.boat}</option>
                  </select>
                  {nodeMoves.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMove(n.node, m.idx)}
                      className="text-red-500"
                    >
                      ❌ ลบ
                    </button>
                  )}
                </div>
              );
            })}
            {isSpecialHouse ? 
              <div className="font-bold">
                บ้านของคุณมีสัตว์วิเศษ <span className="bg-yellow-300">PEGASUS</span> เรือจะบรรจุคนได้มากสุด<span className="
                bg-yellow-300"> 6 </span> คนต่อ 1
                ลำ
              </div>:<div className="font-bold">เรือจะบรรจุคนได้มากสุด 5 คนต่อ 1
                ลำ</div>
            }

            <button
              type="button"
              onClick={() => addMove(n.node)}
              className="text-blue-500"
            >
              ➕ เพิ่ม Node ที่จะไป
            </button>
          </div>
        );
      })}

      {/* <h3>🔎 ข้อมูลที่จะส่งไป (Preview Real-time)</h3>

<h4>📦 Move Data</h4>
<pre>{JSON.stringify(previewMoveData, null, 2)}</pre>

<h4>🚢 Ship Data</h4>
<pre>{JSON.stringify(previewShipData, null, 2)}</pre> */}
      <Card className="w-4/5 mx-auto">
        <CardHeader>
          <CardTitle className="bg-purple-300">ตรวจสอบข้อมูลการกรอก</CardTitle>
          <CardDescription>ตรวจสอบข้อมูลการกรอก</CardDescription>
        </CardHeader>
        <CardContent>
          <span className="text-red-600 font-bold">
            <br />
            อ่านก่อนกดส่งข้อมูล
          </span>
          <h3 className="font-bold text-lg mt-6">📦 ข้อมูลการเดิน</h3>
          <div>หลังการเดินจะมีคนเหลืออยู่ที่ node ดังนี้</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รอบ</TableHead>
                <TableHead>Node ปลายทาง</TableHead>
                <TableHead>จำนวนคน</TableHead>
                {/* <TableHead>เรือ</TableHead> */}
                <TableHead>บ้าน</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewMoveData.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.round}</TableCell>
                  <TableCell>{row.node}</TableCell>
                  <TableCell>{row.count}</TableCell>
                  {/* <TableCell>{row.boat}</TableCell> */}
                  <TableCell>{row.house}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* ตาราง Ship Data */}
          <h3 className="font-bold text-lg mt-6">🚢 เรือที่ใช้</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รอบ</TableHead>
                <TableHead>Node ต้นทาง</TableHead>
                <TableHead>จำนวนเรือ</TableHead>
                <TableHead>บ้าน</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewShipData.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.round}</TableCell>
                  <TableCell>{row.node}</TableCell>
                  <TableCell>{row.boat}</TableCell>
                  <TableCell>{row.house}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="text-red-700 mt-6">
            ใน 1 รอบทุกบ้านสามารถกรอกข้อมูลได้เพียง
            <span className="font-bold text-xl">ครั้งเดียวเท่านั้น</span>
            <div>ตรวจสอบข้อมูลให้ดีก่อนกดส่งข้อมูล</div>
          </div>
          {/* <div>Node ในหมวดเดียวกันห้ามซ้ำ แต่คนละหมวดซ้ำได้</div> */}
          <button
            type="submit"
            className="my-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            ส่งข้อมูล
          </button>

          {message && (
            <p className="text-red-600 whitespace-pre-line">{message}</p>
          )}
          <div>
            กดส่งแล้วสามารถตรวจสอบได้ว่าข้อมูลถูกส่งไปถูกต้องหรือไม่ทางตารางด้านล่าง
            กดรีเฟรชที่มุม
            <span className="font-bold text-xl">ขวาบนของทุกตาราง</span>{" "}
            ข้อมูลผิดรีบแจ้งสตาฟ
          </div>
        </CardContent>
        {/* <CardFooter>
          <p>Card Footer</p>
        </CardFooter> */}
      </Card>
    </form>
  );
}
