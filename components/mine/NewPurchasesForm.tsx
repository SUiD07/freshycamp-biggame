"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { Button } from "../ui/button";

type Item = { node: number; count: number };

export default function NewPurchaseForm({
  house,
  houseT,
}: {
  house: string;
  houseT: string;
}) {
  const [round, setRound] = useState(1);
  const [forts, setForts] = useState<Item[]>([{ node: 1, count: 0 }]);
  const [ships, setShips] = useState<Item[]>([{ node: 1, count: 0 }]);
  const [revives, setRevives] = useState<Item[]>([{ node: 1, count: 0 }]);
  const [message, setMessage] = useState("");

  const addItem = (
    setter: React.Dispatch<React.SetStateAction<Item[]>>,
    label: string
  ) => {
    setter((prev) => [
      ...prev,
      { node: 1, count: label.includes("กรอกการสร้างป้อม") ? 1 : 0 },
    ]);
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
    const hasZeroCount = (items: Item[]) => items.some((i) => i.count <= 0);

    if (hasZeroCount(forts)) {
      setMessage("❌ สร้างป้อม: จำนวนต้องมากกว่า 0 หรือกดลบออก");
      return;
    }
    if (hasZeroCount(ships)) {
      setMessage("❌ สร้างเรือ: จำนวนต้องมากกว่า 0 หรือกดลบออก");
      return;
    }
    if (hasZeroCount(revives)) {
      setMessage("❌ ชุบชีวิต: จำนวนต้องมากกว่า 0 หรือกดลบออก");
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
    setter: React.Dispatch<React.SetStateAction<Item[]>>,
    prefix: string
  ) => (
    <div className="border p-4 rounded space-y-2">
      <h3 className="font-bold">{label}</h3>
      <div>
        <label htmlFor={`${prefix}-round-select`}>รอบ: </label>{" "}
        <select
          id={`${prefix}-round-select`}
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
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 items-center">
          <div>
            <label htmlFor={`${prefix}-node-select-${index}`}>
              เลือก Node:{" "}
            </label>{" "}
            <select
              id={`${prefix}-node-select-${index}`}
              value={item.node > 0 ? item.node : ""}
              onChange={(e) =>
                handleChange(index, "node", +e.target.value, setter)
              }
              className="border px-2 py-1"
            >
              <option value="">-- กรุณาเลือก --</option>
              {(label.includes("กรอกการชุบชีวิต")
                ? validReviveNodes
                : Array.from({ length: 60 }, (_, i) => i + 1)
              ).map((nodeId) => (
                <option key={nodeId} value={nodeId}>
                  {nodeId}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${prefix}-count-select-${index}`}>จำนวน: </label>{" "}
            {label.includes("กรอกการสร้างป้อม") ? (
              <>
                <span className="px-2 py-1 border rounded bg-gray-100">1</span>
                <input type="hidden" value={1} onChange={() => {}} />
              </>
            ) : (
              <select
                id={`${prefix}-count-select-${index}`}
                value={item.count > 0 ? item.count : ""}
                onChange={(e) =>
                  handleChange(index, "count", +e.target.value, setter)
                }
                className="border px-2 py-1"
              >
                <option value="">-- กรุณาเลือก --</option>
                {Array.from({ length: 20 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {label.includes("กรอกการสร้างเรือ")
                      ? `${i + 1} ลำ`
                      : label.includes("กรอกการชุบชีวิต")
                        ? `${i + 1} คน`
                        : i + 1}
                  </option>
                ))}
              </select>
            )}
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
        onClick={() => addItem(setter, label)}
        className="bg-green-500 text-white px-4 py-1 rounded"
      >
        ➕ เพิ่ม Node
      </button>
    </div>
  );
  //   เฉพาะnode ที่มีป้อม
  const refreshNodes = async () => {
    setMessage("🔄 กำลังโหลดข้อมูล...");
    const { data, error } = await supabase
      .from("nodes")
      .select("id, towerOwner");

    if (!error && data) {
      setAllNodes(data);

      // อัปเดต node ที่มีป้อมของ houseT สำหรับการ revive
      const valid = data
        .filter((node) => node.towerOwner === houseT)
        .map((node) => +node.id);
      setValidReviveNodes(valid);

      setMessage("✅ โหลดข้อมูลสำเร็จ");
    } else {
      setMessage("❌ ไม่สามารถดึงข้อมูล node ได้");
    }
  };

  const [allNodes, setAllNodes] = useState<
    { id: number; towerOwner: string }[]
  >([]);
  const [validReviveNodes, setValidReviveNodes] = useState<number[]>([]);
  useEffect(() => {
    refreshNodes();
  }, [houseT]);

  useEffect(() => {
    const fetchValidReviveNodes = async () => {
      const { data, error } = await supabase
        .from("nodes")
        .select("id, towerOwner")
        .eq("towerOwner", houseT);

      if (!error && data) {
        setValidReviveNodes(data.map((node) => +node.id));
      }
    };

    fetchValidReviveNodes();
  }, [house]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-[500px]">
      <Button type="button" onClick={refreshNodes} className="text-sm ml-2">
        🔄 รีเฟรชข้อมูล
      </Button>
      {message && <p>{message}</p>}

      <div className="text-red-600">
        <li>
          สร้างป้อมได้ที่<span className="font-bold"> node ของบ้านตัวเอง</span>
        </li>
        <li>1 node สร้างได้แค่ป้อมเดียว</li>
      </div>
      {renderForm("กรอกการสร้างป้อม", forts, setForts, "fort")}
      <div className="text-red-600">
        <li>
          สามารถสร้างเรือที่
          <span className="font-bold"> node ของบ้านตัวเอง</span>เท่านั้น
        </li>
      </div>
      {renderForm("กรอกการสร้างเรือ", ships, setShips, "ship")}
      <div className="text-red-600">
        <li>กรอกจำนวนคนที่ต้องการชุบ</li>
        <li>
          ชุบคนได้ที่ <span className="font-bold">node ที่มีป้อม</span>
          ของบ้านตัวเองเท่านั้น
        </li>
      </div>
      {renderForm("กรอกการชุบชีวิต", revives, setRevives, "revive")}

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
