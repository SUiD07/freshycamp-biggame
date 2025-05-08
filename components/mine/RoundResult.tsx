"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RoundResult() {
  const [round, setRound] = useState(1); // ✅ ใช้ useState
  const [result, setResult] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("moves")
        .select("house, node, count")
        .eq("round", round);

      const nodeMap: Record<number, { house: string; count: number }[]> = {};
      data?.forEach((move) => {
        if (!nodeMap[move.node]) nodeMap[move.node] = [];
        nodeMap[move.node].push({ house: move.house, count: move.count });
      });

      const output = Object.entries(nodeMap).map(([node, moves]) => {
        if (moves.length > 1) {
          return {
            node: +node,
            type: "fight",
            houses: moves.map((m) => m.house),
          };
        } else {
          return {
            node: +node,
            type: "move",
            house: moves[0].house,
            count: moves[0].count,
          };
        }
      });

      setResult(output);
    };

    fetchData();
  }, [round]);

  return (
    <div>
      <div className="mb-2">
        <label>ดูผลรอบที่: </label>
        <input
          type="number"
          value={round}
          onChange={(e) => setRound(+e.target.value)}
          className="border px-2"
        />
      </div>
      {result.map((item, i) => (
        <div key={i} className="p-2 border rounded">
          {item.type === "fight" ? (
            <span>
              ⚔️ Node {item.node}: Fight between {item.houses.join(", ")}
            </span>
          ) : (
            <span>
              🚶 Node {item.node}: {item.count} from {item.house}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
