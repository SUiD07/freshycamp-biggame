"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RoundResult() {
  const [round, setRound] = useState(1);
  const [result, setResult] = useState<any[]>([]);
  const [houses, setHouses] = useState<string[]>([]);
  const [nodes, setNodes] = useState<number[]>([]);
  const [matrix, setMatrix] = useState<Record<number, Record<string, number>>>(
    {}
  );

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("moves")
        .select("house, node, count")
        .eq("round", round);

      // ✅ logic เดิมสำหรับผลลัพธ์ fight/move
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

      // ✅ กำหนดบ้านทั้งหมดล่วงหน้า (1-12)
      const allHouses = Array.from(
        { length: 12 },
        (_, i) => `บ้าน ${String(i + 1).padStart(2, "0")}`
      );
      // ✅ เรียงลำดับเลขบ้าน (จริงๆ ไม่ต้อง sort เพราะ array ถูกสร้างเรียงแล้ว)
      setHouses(allHouses);

      const uniqueNodes = Array.from({ length: 60 }, (_, i) => i + 1); // node 1-60
      setNodes(uniqueNodes);

      const matrixData: Record<number, Record<string, number>> = {};
      uniqueNodes.forEach((node) => {
        matrixData[node] = {};
        allHouses.forEach((house) => {
          matrixData[node][house] = 0; // default = 0
        });
      });

      data?.forEach((d) => {
        matrixData[d.node][d.house] = d.count;
      });

      setMatrix(matrixData);
    };

    fetchData();
  }, [round]);

  const handleCopy = () => {
    let text = "Node \\ บ้าน\t" + houses.join("\t") + "\n";
    nodes.forEach((node) => {
      text += `Node ${node}\t`;
      houses.forEach((house) => {
        text += `${matrix[node]?.[house] ?? 0}\t`;
      });
      text += "\n";
    });

    // คัดลอกไปยัง clipboard
    navigator.clipboard.writeText(text).then(() => {
      alert("คัดลอกตารางเรียบร้อยแล้ว!");
    });
  };

  return (
    <div>
      <div className="mb-4">
        <label>ดูผลรอบที่: </label>
        <input
          type="number"
          value={round}
          onChange={(e) => setRound(+e.target.value)}
          className="border px-2"
        />
      </div>

      {/* แสดงผลการกรอก */}
      {result.map((item, i) => (
        <div key={i} className="p-2 border rounded mb-1">
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

      {/* ตาราง Matrix */}
      <div className="mt-6 overflow-auto">
        <h3 className="font-bold">Matrix Node-House (รอบ {round})</h3>
        <button
          className="mb-4 p-2 bg-blue-500 text-white rounded"
          onClick={handleCopy}
        >
          คัดลอกตาราง
        </button>
        <table className="border-collapse border">
          <thead>
            <tr>
              <th className="border p-2">Node \ บ้าน</th>
              {houses.map((house) => (
                <th key={house} className="border p-2">
                  {house}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nodes.map((node) => (
              <tr key={node}>
                <td className="border p-2 font-semibold">Node {node}</td>
                {houses.map((house) => (
                  <td key={house} className="border p-2 text-center">
                    {matrix[node]?.[house] ?? 0}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
