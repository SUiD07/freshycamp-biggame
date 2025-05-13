"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type RawPurchase = {
  node: number;
  house: string;
  type: string;
  count: number;
};

type AggregatedPurchase = {
  house: string;
  ALIVE?: number;
  FORTRESS?: number;
  BOAT?: number;
};

type DisplayRow = {
  node: number;
  houses: AggregatedPurchase[];
};

export default function PurchasesTable() {
  const [round, setRound] = useState(1);
  const [data, setData] = useState<DisplayRow[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: purchases, error } = await supabase
        .from("purchases")
        .select("node, house, type, count")
        .eq("round", round);

      if (error) {
        console.error("Error fetching purchases:", error);
        return;
      }

      const validKeys: (keyof AggregatedPurchase)[] = ["ALIVE", "FORTRESS", "BOAT"];
      const typeMap: Record<string, keyof AggregatedPurchase> = {
        revive: "ALIVE",
        fort: "FORTRESS",
        ship: "BOAT",
      };

      const nodeMap = new Map<number, Map<string, AggregatedPurchase>>();

      purchases?.forEach((row) => {
        const node = row.node;
        const house = row.house;
        const typeKey = typeMap[row.type];

        if (!validKeys.includes(typeKey)) return;

        if (!nodeMap.has(node)) {
          nodeMap.set(node, new Map());
        }

        const houseMap = nodeMap.get(node)!;

        if (!houseMap.has(house)) {
          houseMap.set(house, { house });
        }

        const agg = houseMap.get(house)!;
        const key = typeKey as keyof AggregatedPurchase;
        const currentValue = agg[key] ?? 0;

        (agg as any)[key] = (typeof currentValue === "number" ? currentValue : 0) + row.count;
      });

      // สร้างข้อมูลให้ครบ 60 node
      const fullData: DisplayRow[] = [];
      for (let i = 1; i <= 60; i++) {
        const houseMap = nodeMap.get(i);
        const houses: AggregatedPurchase[] = [];

        if (houseMap) {
          houseMap.forEach((houseData) => {
            const cleaned: AggregatedPurchase = { house: houseData.house };
            if (houseData.ALIVE) cleaned.ALIVE = houseData.ALIVE;
            if (houseData.FORTRESS) cleaned.FORTRESS = houseData.FORTRESS;
            if (houseData.BOAT) cleaned.BOAT = houseData.BOAT;
            houses.push(cleaned);
          });
        }

        fullData.push({ node: i, houses });
      }

      setData(fullData);
    };

    fetchData();
  }, [round]);

  return (
    <div className="space-y-4">
      <div>
        <label className="font-medium">ดูผลรอบที่: </label>
        <input
          type="number"
          value={round}
          onChange={(e) => setRound(+e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="border border-collapse w-full text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1 text-center">NODE</th>
              <th className="border px-2 py-1 text-center">HOUSE</th>
              <th className="border px-2 py-1 text-center">HOLYWATER</th>
              <th className="border px-2 py-1 text-center">FORTRESS</th>
              <th className="border px-2 py-1 text-center">BOAT</th>
            </tr>
          </thead>
          <tbody>
            {data.map((nodeRow, i) =>
              nodeRow.houses.length > 0 ? (
                nodeRow.houses.map((houseData, idx) => (
                  <tr key={`${i}-${idx}`}>
                    <td className="border px-2 py-1 text-center">
                      {idx === 0 ? nodeRow.node : ""}
                    </td>
                    <td className="border px-2 py-1 text-center">{houseData.house}</td>
                    <td className="border px-2 py-1 text-center">{houseData.ALIVE || ""}</td>
                    <td className="border px-2 py-1 text-center">{houseData.FORTRESS || ""}</td>
                    <td className="border px-2 py-1 text-center">{houseData.BOAT || ""}</td>
                  </tr>
                ))
              ) : (
                <tr key={`empty-${i}`}>
                  <td className="border px-2 py-1 text-center">{nodeRow.node}</td>
                  <td className="border px-2 py-1 text-center text-gray-400 italic" colSpan={4}>
                    ไม่มีการซื้อ
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
