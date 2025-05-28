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

  const handleMoveChange = (
    fromNode: string,
    index: number,
    key: "toNode" | "count" | "boat",
    value: string | number
  ) => {
    const updated = [...moves];
    const idx = updated.findIndex(
      (m, i) => m.fromNode === fromNode && i === index
    );
    if (idx !== -1) {
      if (key === "count" || key === "boat") {
        updated[idx][key] = Number(value);
      } else {
        updated[idx][key] = String(value);
      }
    }
    setMoves(updated);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCounts()) return;
    if (hasDuplicateToNodePerFromNode()) return;

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Button
        type="button"
        onClick={fetchNodes}
        className="px-3 py-1 rounded hover:bg-slate-600"
      >
        🔄 รีเฟรชข้อมูล
      </Button>
      {message && <p className="text-red-600">{message}</p>}

      <div>
        <label>รอบ: </label>
        <input
          type="number"
          value={round}
          onChange={(e) => setRound(+e.target.value)}
          className="border px-2"
        />
      </div>

      {currentNodes.map((n) => {
        const nodeMoves = moves
          .map((m, idx) => ({ ...m, idx }))
          .filter((m) => m.fromNode === n.node);

        return (
          <div key={n.node} className="border p-2 rounded">
            <h2 className="font-bold text-lg">
              🟢 Node {n.node} (คนมีอยู่จริง: {nodeValues[n.node] ?? 0})
            </h2>

            {nodeMoves.map((m) => (
              <div key={m.idx} className="flex items-center gap-2 my-1">
                ➡️ ไป Node:
                <input
                  type="text"
                  value={m.toNode}
                  onChange={(e) =>
                    handleMoveChange(n.node, m.idx, "toNode", e.target.value)
                  }
                  className="border px-2"
                />
                กี่คน:
                <input
                  type="number"
                  value={m.count}
                  min={0}
                  onChange={(e) =>
                    handleMoveChange(n.node, m.idx, "count", +e.target.value)
                  }
                  className="border px-2"
                />
                🚢 เรือ:
                <input
                  type="number"
                  value={m.boat}
                  min={0}
                  onChange={(e) =>
                    handleMoveChange(n.node, m.idx, "boat", +e.target.value)
                  }
                  className="border px-2"
                />
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
            ))}

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
      <Card className="w-3/5 mx-auto">
        <CardHeader>
          <CardTitle className="bg-purple-300">ตรวจสอบข้อมูลการกรอก</CardTitle>
          <CardDescription>ตรวจสอบข้อมูลการกรอก</CardDescription>
        </CardHeader>
        <CardContent>
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
          <div>Node ในหมวดเดียวกันห้ามซ้ำ แต่คนละหมวดซ้ำได้</div>
          <button
            type="submit"
            className="my-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            ส่งข้อมูล
          </button>

          {message && <p className="text-red-600">{message}</p>}
        </CardContent>
        {/* <CardFooter>
          <p>Card Footer</p>
        </CardFooter> */}
      </Card>
    </form>
  );
}
