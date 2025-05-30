"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Item = { node: number; count: number };

export default function PurchaseForm({ house }: { house: string }) {
  const [round, setRound] = useState(1);
  const [forts, setForts] = useState<Item[]>([{ node: 1, count: 0 }]);
  const [ships, setShips] = useState<Item[]>([{ node: 1, count: 0 }]);
  const [revives, setRevives] = useState<Item[]>([{ node: 1, count: 0 }]);
  const [message, setMessage] = useState("");

  const addItem = (setter: React.Dispatch<React.SetStateAction<Item[]>>) => {
    setter((prev) => [...prev, { node: 1, count: 0 }]);
  };

  const removeItem = (
    index: number,
    setter: React.Dispatch<React.SetStateAction<Item[]>>
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (
    index: number,
    key: "node" | "count",
    value: number,
    setter: React.Dispatch<React.SetStateAction<Item[]>>
  ) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index][key] = value;
      return updated;
    });
  };

  const hasDuplicateNode = (items: Item[]) => {
    const nodes = items.map((i) => i.node);
    return new Set(nodes).size !== nodes.length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasDuplicateNode(forts)) {
      setMessage("❌ สร้างป้อม: มี Node ซ้ำ");
      return;
    }
    if (hasDuplicateNode(ships)) {
      setMessage("❌ สร้างเรือ: มี Node ซ้ำ");
      return;
    }
    if (hasDuplicateNode(revives)) {
      setMessage("❌ ชุบชีวิต: มี Node ซ้ำ");
      return;
    }

    const { data: existing } = await supabase
      .from("purchases")
      .select("*")
      .eq("house", house)
      .eq("round", round);

    if (existing && existing.length > 0) {
      setMessage(`❌ ${house} ส่งข้อมูลรอบนี้ไปแล้ว`);
      return;
    }

    const insertData = [
      ...forts.map((item) => ({
        type: "fort",
        node: item.node,
        count: item.count,
        round,
        house,
      })),
      ...ships.map((item) => ({
        type: "ship",
        node: item.node,
        count: item.count,
        round,
        house,
      })),
      ...revives.map((item) => ({
        type: "revive",
        node: item.node,
        count: item.count,
        round,
        house,
      })),
    ];

    const { error } = await supabase.from("purchases").insert(insertData);

    setMessage(error ? "❌ เกิดข้อผิดพลาด" : "✅ บันทึกสำเร็จ");
  };

  const renderForm = (
    label: string,
    items: Item[],
    setter: React.Dispatch<React.SetStateAction<Item[]>>
  ) => (
    <div className="border p-4 rounded space-y-2">
      <h3 className="font-bold">{label}</h3>
      <div>
        <label>รอบ: </label>
        <input
          type="number"
          value={round}
          onChange={(e) => setRound(+e.target.value)}
          className="border px-2"
        />
      </div>
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 items-center">
          <div>
            <label>Node: </label>
            <input
              type="number"
              value={item.node}
              onChange={(e) =>
                handleChange(index, "node", +e.target.value, setter)
              }
              min={1}
              className="border px-2"
            />
          </div>
          <div>
            <label>จำนวน: </label>
            <input
              type="number"
              value={item.count}
              onChange={(e) =>
                handleChange(index, "count", +e.target.value, setter)
              }
              min={1}
              className="border px-2"
            />
          </div>
          <button
            type="button"
            onClick={() => removeItem(index, setter)}
            className="text-red-500"
          >
            ลบ
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => addItem(setter)}
        className="bg-green-500 text-white px-4 py-1 rounded"
      >
        ➕ เพิ่ม Node
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-red-600">
        <li>
          สร้างป้อมได้ที่<span className="font-bold"> node ของบ้านตัวเอง</span>
        </li>
        <li>1 node สร้างได้แค่ป้อมเดียว</li>
      </div>
      {renderForm("กรอกการสร้างป้อม", forts, setForts)}
      <div className="text-red-600">
        <li>
          สามารถสร้างเรือที่
          <span className="font-bold"> node ของบ้านตัวเอง</span>เท่านั้น
        </li>
      </div>
      {renderForm("กรอกการสร้างเรือ", ships, setShips)}
      <div className="text-red-600">
        <li>กรอกจำนวนคนที่ต้องการชุบ</li>
        <li>
          ชุบคนได้ที่ <span className="font-bold">node ที่มีป้อม</span>
          ของบ้านตัวเองเท่านั้น
        </li>
      </div>
      {renderForm("กรอกการชุบชีวิต", revives, setRevives)}


      <div>ถ้าไม่ต้องการสร้างหรือชุบให้กด "ลบ" ออก</div>
      <div>Node ในหมวดเดียวกันห้ามซ้ำ แต่คนละหมวดซ้ำได้</div>
      <div className="text-red-700">
        ใน 1 รอบทุกบ้านสามารถกรอกข้อมูลได้เพียง
        <span className="font-bold text-xl">ครั้งเดียวเท่านั้น</span>
        <div>ตรวจสอบข้อมูลให้ดีก่อนกดส่งข้อมูล</div>
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        ส่งข้อมูลทั้งหมด
      </button>
      {message && <p>{message}</p>}
      <div>
        กดส่งแล้วสามารถตรวจสอบได้ว่าข้อมูลถูกส่งไปถูกต้องหรือไม่ทางตารางด้านล่าง
        กดรีเฟรชที่มุม
        <span className="font-bold text-xl">ขวาบนของทุกตาราง</span>{" "}
        ข้อมูลผิดรีบแจ้งสตาฟ
      </div>
    </form>
  );
}
