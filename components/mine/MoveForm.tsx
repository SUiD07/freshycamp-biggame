"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MoveForm({ house }: { house: string }) {
  const [round, setRound] = useState(1);
  const [nodes, setNodes] = useState([{ node: 1, count: 1 }]);
  const [ships, setShips] = useState([{ node: 1, boat: 0 }]);
  const [message, setMessage] = useState("");

  const handleNodeChange = (
    index: number,
    key: "node" | "count",
    value: number
  ) => {
    const updated = [...nodes];
    updated[index][key] = value;
    setNodes(updated);
  };

  const handleShipChange = (
    index: number,
    key: "node" | "boat",
    value: number
  ) => {
    const updated = [...ships];
    updated[index][key] = value;
    setShips(updated);
  };

  const addNode = () => {
    setNodes([...nodes, { node: 1, count: 1 }]);
  };

  const addShip = () => {
    setShips([...ships, { node: 1, boat: 0 }]);
  };

  const removeNode = (index: number) => {
    setNodes(nodes.filter((_, i) => i !== index));
  };

  const removeShip = (index: number) => {
    setShips(ships.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ ตรวจสอบว่าบ้านนี้ส่งรอบนี้แล้วหรือยัง
    const { data: existing } = await supabase
      .from("moves")
      .select("*")
      .eq("house", house)
      .eq("round", round);

    if (existing && existing.length > 0) {
      setMessage(`❌ ${house} ส่งข้อมูลรอบนี้ไปแล้ว`);
      return;
    }

    // ✨ เตรียมข้อมูล moves
    const moveData = nodes.map((n) => ({
      node: n.node,
      count: n.count,
      round,
      house,
    }));

    // ✨ เตรียมข้อมูล ship
    const shipData = ships
      .filter((s) => s.boat > 0) // ส่งเฉพาะข้อมูลที่มีเรือ
      .map((s) => ({
        node: s.node,
        boat: s.boat,
        round,
        house,
      }));

    const { error: moveError } = await supabase.from("moves").insert(moveData);
    if (moveError) {
      setMessage("❌ เกิดข้อผิดพลาดขณะบันทึก moves");
      return;
    }

    if (shipData.length > 0) {
      const { error: shipError } = await supabase.from("ship").insert(shipData);
      if (shipError) {
        setMessage("❌ เกิดข้อผิดพลาดขณะบันทึก ship");
        return;
      }
    }

    setMessage("✅ บันทึกสำเร็จ");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>รอบ: </label>
        <input
          type="number"
          value={round}
          onChange={(e) => setRound(+e.target.value)}
          className="border px-2"
        />
      </div>

      <div>
        <h2 className="font-bold">🧍‍♂️ ข้อมูลจำนวนคนในแต่ละ Node (หลังจากเดิน)</h2>
        {nodes.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div>
              <label>Node: </label>
              <input
                type="number"
                value={item.node}
                onChange={(e) =>
                  handleNodeChange(index, "node", +e.target.value)
                }
                min={1}
                className="border px-2"
              />
            </div>
            <div>
              <label>จำนวนคน: </label>
              <input
                type="number"
                value={item.count}
                onChange={(e) =>
                  handleNodeChange(index, "count", +e.target.value)
                }
                min={1}
                className="border px-2"
              />
            </div>
            <button
              type="button"
              onClick={() => removeNode(index)}
              className="text-red-500"
            >
              ลบ
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addNode}
          className="bg-green-500 text-white px-4 py-1 rounded"
        >
          ➕ เพิ่ม Node
        </button>
      </div>

      <div>
        <h2 className="font-bold">⛵ ข้อมูลการใช้เรือ</h2>
        {ships.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div>
              <label>Nodeต้นทางที่ใช้เรือ: </label>
              <input
                type="number"
                value={item.node}
                onChange={(e) =>
                  handleShipChange(index, "node", +e.target.value)
                }
                min={1}
                className="border px-2"
              />
            </div>
            <div>
              <label>จำนวนเรือ: </label>
              <input
                type="number"
                value={item.boat}
                onChange={(e) =>
                  handleShipChange(index, "boat", +e.target.value)
                }
                min={0}
                className="border px-2"
              />
            </div>
            <button
              type="button"
              onClick={() => removeShip(index)}
              className="text-red-500"
            >
              ลบ
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addShip}
          className="bg-green-500 text-white px-4 py-1 rounded"
        >
          ➕ เพิ่มเรือ
        </button>
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        ส่งข้อมูล
      </button>

      <div className="text-red-700">
        <p>
          ใน 1 รอบทุกบ้านสามารถกรอกข้อมูลได้เพียง{" "}
          <span className="font-bold text-xl">ครั้งเดียวเท่านั้น</span>
        </p>
        <p>ตรวจสอบข้อมูลให้ดีก่อนกดส่งข้อมูล</p>
        <p>
          บ้านเดียวกัน รอบเดียวกัน node เดียวกัน insert ซ้ำ จะขึ้น error
        </p>
      </div>

      {message && <p>{message}</p>}
    </form>
  );
}
