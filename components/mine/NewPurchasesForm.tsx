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
  const [forts, setForts] = useState<Item[]>([{ node: 0, count: 1 }]);
  const [ships, setShips] = useState<Item[]>([{ node: 0, count: 0 }]);
  const [revives, setRevives] = useState<Item[]>([{ node: 0, count: 0 }]);
  const [message, setMessage] = useState("");

  const addItem = (
    setter: React.Dispatch<React.SetStateAction<Item[]>>,
    label: string
  ) => {
    setter((prev) => [
      ...prev,
      { node: 0, count: label.includes("กรอกการสร้างป้อม") ? 1 : 0 },
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
  // ใช้ตรวจว่า node ≤ 0 (เช่น null, 0, หรือ -1)
  const hasInvalidNode = (items: Item[]) => items.some((i) => i.node <= 0);
  const isReviveValid = (): { valid: boolean; totalSum: number } => {
    const reviveTotal = revives.reduce((sum, r) => sum + r.count, 0);
    const totalCurrentValue = allNodes
      .filter((n: any) => n.selectedcar === houseT)
      .reduce((sum, n: any) => sum + (parseInt(n.value) || 0), 0);

    const totalSum = totalCurrentValue + reviveTotal;
    console.log(allNodes.filter((n: any) => n.selectedcar === houseT));

    return { valid: totalSum <= 24, totalSum };
  };
  const [initialFortOptions, setInitialFortOptions] = useState<number[]>([]);
  const [initialShipOptions, setInitialShipOptions] = useState<number[]>([]);
  const [initialReviveOptions, setInitialReviveOptions] = useState<number[]>(
    []
  );

  useEffect(() => {
    const fetchOptions = async () => {
      const { data, error } = await supabase
        .from("nodes")
        .select("id, towerOwner, selectedcar, tower");

      if (error || !data) return;

      setInitialFortOptions(
        data
          .filter((n) => n.selectedcar === houseT && !n.tower)
          .map((n) => +n.id)
      );
      setInitialShipOptions(
        data.filter((n) => n.selectedcar === houseT).map((n) => +n.id)
      );
      setInitialReviveOptions(
        data.filter((n) => n.towerOwner === houseT).map((n) => +n.id)
      );
    };

    fetchOptions();
  }, [houseT]);

  const validateWithBackend = async (): Promise<boolean> => {
    const { data, error } = await supabase
      .from("nodes")
      .select("id, towerOwner, selectedcar, tower, value");

    if (error || !data) {
      setMessage("❌ ตรวจสอบข้อมูลล่าสุดจากระบบไม่สำเร็จ");
      return false;
    }

    console.log("✅ ดึงข้อมูล backend สำเร็จ");
    console.log("🔎 Backend Nodes:", data);
    console.log("📝 Frontend - forts:", forts);
    console.log("📝 Frontend - ships:", ships);
    console.log("📝 Frontend - revives:", revives);

    const problems: string[] = [];

    // 🔍 Step 1: ตรวจ forts
    console.log("🔍 Step 1: ตรวจสร้างป้อม");
    forts.forEach((item) => {
      const node = data.find((n) => +n.id === item.node);
      if (!node) {
        console.log(`❌ Node ${item.node} ไม่พบใน backend`);
        problems.push(`❌ Node ${item.node} หายไปจากระบบ`);
      } else {
        console.log(
          `➡️ ตรวจ Node ${item.node}: selectedcar=${node.selectedcar}, tower=${node.tower}`
        );
        if (node.selectedcar !== houseT || node.tower === true) {
          problems.push(
            `❌ Node ${item.node} ไม่สามารถสร้างป้อมได้อีกแล้ว กรุณากดรีเฟรชเพื่ออัพเดตข้อมูลให้เป็นปัจจุบัน`
          );
        }
      }
    });

    // 🔍 Step 2: ตรวจ ships
    console.log("🔍 Step 2: ตรวจสร้างเรือ");
    ships.forEach((item) => {
      const node = data.find((n) => +n.id === item.node);
      if (!node) {
        console.log(`❌ Node ${item.node} ไม่พบใน backend`);
        problems.push(`❌ Node ${item.node} หายไปจากระบบ`);
      } else {
        console.log(
          `➡️ ตรวจ Node ${item.node}: selectedcar=${node.selectedcar}`
        );
        if (node.selectedcar !== houseT) {
          problems.push(
            `❌ Node ${item.node} ไม่สามารถสร้างเรือได้ กรุณากดรีเฟรชเพื่ออัพเดตข้อมูลให้เป็นปัจจุบัน`
          );
        }
      }
    });

    // 🔍 Step 3: ตรวจ revives
    console.log("🔍 Step 3: ตรวจชุบชีวิต");
    revives.forEach((item) => {
      const node = data.find((n) => +n.id === item.node);
      if (!node) {
        console.log(`❌ Node ${item.node} ไม่พบใน backend`);
        problems.push(`❌ Node ${item.node} หายไปจากระบบ`);
      } else {
        console.log(`➡️ ตรวจ Node ${item.node}: towerOwner=${node.towerOwner}`);
        if (node.towerOwner !== houseT) {
          problems.push(
            `❌ Node ${item.node} ไม่สามารถใช้ชุบชีวิตได้ กรุณากดรีเฟรชเพื่ออัพเดตข้อมูลให้เป็นปัจจุบัน`
          );
        }
      }
    });

    // 🔍 Step 4: ตรวจรวมคนไม่เกิน 24
    console.log("🔍 Step 4: ตรวจจำนวนคนรวม (value + revive)");

    const reviveTotal = revives.reduce((sum, r) => sum + r.count, 0);
    const currentTotal = data
      .filter((n) => n.selectedcar === houseT)
      .reduce((sum, n) => sum + (parseInt(n.value) || 0), 0);
    const total = reviveTotal + currentTotal;

    console.log(
      `➡️ คนในสนาม: ${currentTotal}, คนที่จะชุบ: ${reviveTotal}, รวม: ${total}`
    );
    if (total > 24) {
      problems.push(
        `❌ จำนวนคนรวมในสนาม + ชุบ (${total}) เกิน 24 คน กรุณากดรีเฟรชเพื่ออัพเดตข้อมูลให้เป็นปัจจุบัน`
      );
    }

    // 🔍 Step 5: ตรวจสอบว่า option ที่โหลดมา ยังอยู่ใน backend
    console.log(
      "🔍 Step 5: ตรวจสอบว่าตัวเลือก Node ทั้งหมดที่ผู้ใช้เห็นตอนโหลดฟอร์ม ยังมีอยู่ในระบบ"
    );

    // 1. Backend ปัจจุบัน
    const currentFortIds = data
      .filter((n) => n.selectedcar === houseT && !n.tower)
      .map((n) => +n.id);

    const currentShipIds = data
      .filter((n) => n.selectedcar === houseT)
      .map((n) => +n.id);

    const currentReviveIds = data
      .filter((n) => n.towerOwner === houseT)
      .map((n) => +n.id);

    // 2. เปรียบเทียบกับ options ที่เคยโหลดไว้ตอนเปิด form
    const missingFortIds = initialFortOptions.filter(
      (id) => !currentFortIds.includes(id)
    ); // หายไปจาก backend
    const extraFortIds = currentFortIds.filter(
      (id) => !initialFortOptions.includes(id)
    ); // เพิ่มขึ้นจาก backend

    const missingShipIds = initialShipOptions.filter(
      (id) => !currentShipIds.includes(id)
    );
    const extraShipIds = currentShipIds.filter(
      (id) => !initialShipOptions.includes(id)
    );

    const missingReviveIds = initialReviveOptions.filter(
      (id) => !currentReviveIds.includes(id)
    );
    const extraReviveIds = currentReviveIds.filter(
      (id) => !initialReviveOptions.includes(id)
    );

    if (missingFortIds.length > 0) {
      problems.push(
        `⚠️ Node สร้างป้อมบางจุด (์ Node ${missingFortIds.join(", ")}) ปัจจุบันสร้างป้อมไม่ได้ตรงนี้ กรุณากดทั้งปุ่ม"รีเฟรชข้อมูลแผนที่"และ"รีเฟรชฟอร์มกรอกข้อมูล"`
      );
    }
    if (extraFortIds.length > 0) {
      problems.push(
        `⚠️ พบ Node สร้างป้อมใหม่ (${extraFortIds.join(", ")}) เพิ่มเข้ามา กรุณากดทั้งปุ่ม"รีเฟรชข้อมูลแผนที่"และ"รีเฟรชฟอร์มกรอกข้อมูล`
      );
    }

    if (missingShipIds.length > 0) {
      problems.push(
        `⚠️ Node สร้างเรือบางจุด (${missingShipIds.join(", ")}) ปัจจุบันสร้างเรือไม่ได้ตรงนี้ กรุณากดทั้งปุ่ม"รีเฟรชข้อมูลแผนที่"และ"รีเฟรชฟอร์มกรอกข้อมูล`
      );
    }
    if (extraShipIds.length > 0) {
      problems.push(
        `⚠️ พบ Node สร้างเรือใหม่ (${extraShipIds.join(", ")}) เพิ่มเข้ามา ปัจจุบันสร้างป้อมไม่ได้ตรงนี้ กรุณากดทั้งปุ่ม"รีเฟรชข้อมูลแผนที่"และ"รีเฟรชฟอร์มกรอกข้อมูล`
      );
    }

    if (missingReviveIds.length > 0) {
      problems.push(
        `⚠️ Node ชุบชีวิตบางจุด (${missingReviveIds.join(", ")}) ปัจจุบันชุบชีวิตไม่ได้ตรงนี้ กรุณากดทั้งปุ่ม"รีเฟรชข้อมูลแผนที่"และ"รีเฟรชฟอร์มกรอกข้อมูล`
      );
    }
    if (extraReviveIds.length > 0) {
      problems.push(
        `⚠️ พบ Node ชุบชีวิตใหม่ (${extraReviveIds.join(", ")}) เพิ่มเข้ามา กรุณากดทั้งปุ่ม"รีเฟรชข้อมูลแผนที่"และ"รีเฟรชฟอร์มกรอกข้อมูล`
      );
    }

    // ❗ สรุป
    if (problems.length > 0) {
      console.log("❗ พบปัญหา:");
      problems.forEach((p) => console.log(p));
      setMessage(problems.join("\n"));
      return false;
    }

    console.log("✅ ผ่านการตรวจสอบ backend ทุกเงื่อนไข");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("⏳ กำลังตรวจสอบข้อมูล...");

    // ✅ ตรวจสอบข้อมูลล่าสุดจาก backend
    const isValid = await validateWithBackend();
    if (!isValid) return;
    
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
    if (hasInvalidNode(forts)) {
      setMessage("❌ สร้างป้อม: กรุณาเลือก Node ให้ครบ");
      return;
    }
    if (hasInvalidNode(ships)) {
      setMessage("❌ สร้างเรือ: กรุณาเลือก Node ให้ครบ");
      return;
    }
    if (hasInvalidNode(revives)) {
      setMessage("❌ ชุบชีวิต: กรุณาเลือก Node ให้ครบ");
      return;
    }
    const { valid, totalSum } = isReviveValid();
    if (!valid) {
      setMessage(
        `❌ จำนวนคนรวมชุบและในสนามตอนนี้คือ ${totalSum} คน ซึ่งเกิน 24 คนแล้ว`
      );
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
              {(label.includes("กรอกการสร้างป้อม")
                ? validFortNodes
                : label.includes("กรอกการสร้างเรือ")
                  ? validShipNodes
                  : label.includes("กรอกการชุบชีวิต")
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
      .select("id, towerOwner, selectedcar, tower, value");

    if (!error && data) {
      setAllNodes(data);

      /// node สำหรับชุบชีวิต (towerOwner === houseT)
      const valid = data
        .filter((node) => node.towerOwner === houseT)
        .map((node) => +node.id);
      setValidReviveNodes(valid);
      // node สำหรับสร้างป้อม (selectedcar === houseT และ tower === false)
      const validFort = data
        .filter(
          (node) =>
            node.selectedcar === houseT &&
            (node.tower === false || node.tower === null)
        )
        .map((node) => parseInt(node.id));
      setValidFortNodes(validFort);
      // node สำหรับสร้างเรือ (selectedcar === houseT) ไม่ต้องเช็ค tower
      const validShip = data
        .filter((node) => node.selectedcar === houseT)
        .map((node) => parseInt(node.id));
      setValidShipNodes(validShip);

      setInitialFortOptions(validFort);
      setInitialShipOptions(validShip);
      setInitialReviveOptions(valid);

      // *** รีเซ็ตฟอร์ม ***/
      setForts([{ node: 0, count: 1 }]);
      setShips([{ node: 0, count: 0 }]);
      setRevives([{ node: 0, count: 0 }]);

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
  //   const [validBuildNodes, setValidBuildNodes] = useState<number[]>([]);
  const [validFortNodes, setValidFortNodes] = useState<number[]>([]);
  const [validShipNodes, setValidShipNodes] = useState<number[]>([]);

  //   useEffect(() => {
  //     const fetchValidReviveNodes = async () => {
  //       const { data, error } = await supabase
  //         .from("nodes")
  //         .select("id, towerOwner")
  //         .eq("towerOwner", houseT);

  //       if (!error && data) {
  //         setValidReviveNodes(data.map((node) => +node.id));
  //       }
  //     };

  //     fetchValidReviveNodes();
  //   }, [house]);
  useEffect(() => {
    const channel = supabase
      .channel("purchaseform-refresh")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "map_refresh_trigger",
          filter: "id=eq.1", // ตรวจเฉพาะแถว id = 1
        },
        () => {
          console.log("🔁 รีโหลด node ใหม่ใน NewPurchaseForm");
          refreshNodes(); // เรียกโหลดใหม่
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-[500px]">
      <Button type="button" onClick={refreshNodes} className="text-sm ml-2">
        🔄 รีเฟรชฟอร์มกรอกข้อมูล
      </Button>
      {message && <p className="whitespace-pre-line">{message}</p>}

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
      {message && <p className="whitespace-pre-line">{message}</p>}
      <div>
        กดส่งแล้วสามารถตรวจสอบได้ว่าข้อมูลถูกส่งไปถูกต้องหรือไม่ทางตารางด้านล่าง
        กดรีเฟรชที่มุม
        <span className="font-bold text-xl">ขวาบนของทุกตาราง</span>{" "}
        ข้อมูลผิดรีบแจ้งสตาฟ
      </div>
    </form>
  );
}
