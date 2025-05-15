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
  const [matrixBoat, setMatrixBoat] = useState<
    Record<number, Record<string, number>>
  >({});

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("moves")
        .select("house, node, count, boat")
        .eq("round", round);
      // ✅ กำหนดบ้านทั้งหมดล่วงหน้า (1-12)
      const allHouses = Array.from(
        { length: 12 },
        (_, i) => `บ้าน ${String(i + 1).padStart(2, "0")}`
      );
      setHouses(allHouses);

      const uniqueNodes = Array.from({ length: 60 }, (_, i) => i + 1);
      setNodes(uniqueNodes);

      // ✅ reset matrix ใหม่ทุกครั้ง
      const matrixData: Record<number, Record<string, number>> = {};
      const boatMatrixData: Record<number, Record<string, number>> = {};
      uniqueNodes.forEach((node) => {
        matrixData[node] = {};
        boatMatrixData[node] = {};
        allHouses.forEach((house) => {
          matrixData[node][house] = 0;
          boatMatrixData[node][house] = 0;
        });
      });

      // ✅ ใส่ค่าของรอบนั้น
      data?.forEach((d) => {
        if (matrixData[d.node]) {
          matrixData[d.node][d.house] = d.count;
          boatMatrixData[d.node][d.house] = d.boat ?? 0;
        }
      });

      setMatrix(matrixData);
      setMatrixBoat(boatMatrixData);

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
            houses: moves.map((m) => ({ house: m.house, count: m.count })),
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

  const handleCopy = () => {
    let text = "";
    nodes.forEach((node) => {
      const row = houses
        .map((house) =>
          matrix[node]?.[house] === 0 ? "" : matrix[node]?.[house]
        )
        .join("\t");
      text += row + "\n";
    });
    navigator.clipboard.writeText(text).then(() => {
      alert("คัดลอกตัวเลขในตารางเรียบร้อยแล้ว!");
    });
  };

  const handleCopyBoat = () => {
    let text = "";
    nodes.forEach((node) => {
      const row = houses
        .map((house) =>
          matrixBoat[node]?.[house] === 0 ? "" : matrixBoat[node]?.[house]
        )
        .join("\t");
      text += row + "\n";
    });
    navigator.clipboard.writeText(text).then(() => {
      alert("คัดลอกข้อมูลเรือในตารางเรียบร้อยแล้ว!");
    });
  };

  const formatHouseName = (houseNumber: number) => {
    return `B${houseNumber}`;
  };

  const handleResetAndUpdate = async () => {
    try {
      // ✅ 1. Reset (ทุกค่า ยกเว้น top, left, id, tower, ship, towerOwner)
      const { error: resetError } = await supabase
        .from("nodes")
        .update({
          value: null,
          selectedcar: null,
          // tower: false,
          // ship: null,
          fight: null,
          // towerOwner: null,
        })
        .neq("id", ""); // update ทุก row

      if (resetError) throw resetError;

      // ✅ 2. ดึง moves รอบปัจจุบัน
      const { data: movesData, error: movesError } = await supabase
        .from("moves")
        .select("house, node, count")
        .eq("round", round);

      if (movesError) throw movesError;

      // ✅ 3. group ข้อมูลตาม node
      const nodeMap: Record<string, { house: string; count: number }[]> = {};
      movesData?.forEach((move) => {
        const nodeId = String(move.node);
        if (!nodeMap[nodeId]) nodeMap[nodeId] = [];
        nodeMap[nodeId].push({ house: move.house, count: move.count });
      });

      // ✅ 4. update nodes ทีละ node
      for (const [nodeId, moves] of Object.entries(nodeMap)) {
        if (moves.length > 1) {
          // 🔥 fight → json array ของ {house, count}
          const fightData = moves.map((m) => ({
            house: formatHouseName(Number(m.house.slice(-2))),
            count: m.count,
          }));
          const { error: fightError } = await supabase
            .from("nodes")
            .update({ fight: fightData })
            .eq("id", nodeId);

          if (fightError) throw fightError;
        } else {
          // ✅ move ปกติ
          const m = moves[0];
          const { error: moveError } = await supabase
            .from("nodes")
            .update({
              selectedcar: formatHouseName(Number(m.house.slice(-2))),
              value: String(m.count), // เพราะ value เป็น text
            })
            .eq("id", nodeId);
          if (moveError) throw moveError;
        }
      }

      alert("รีเซ็ตและอัพเดตข้อมูลสำเร็จ!");
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        alert("เกิดข้อผิดพลาด: " + err.message);
      } else {
        alert("เกิดข้อผิดพลาดที่ไม่รู้จัก");
      }
    }
  };
  // เรือ
  const getBoatList = () => {
    const rows: { node: number; boatCount: string; house: string }[] = [];

    nodes.forEach((node) => {
      const found = houses
        .map((house) => ({
          house,
          boatCount: matrixBoat[node]?.[house] || 0,
        }))
        .filter((r) => r.boatCount > 0);

      if (found.length > 0) {
        found.forEach((f) =>
          rows.push({
            node,
            boatCount: String(f.boatCount),
            house: f.house,
          })
        );
      } else {
        rows.push({ node, boatCount: "", house: "" });
      }
    });

    return rows;
  };

  return (
    <div>
      <button
        className="p-2 bg-red-500 text-white rounded"
        onClick={handleResetAndUpdate}
      >
        Reset & Update Nodes in MAP
      </button>
      <button
        className="mb-4 p-2 bg-blue-500 text-white rounded"
        onClick={handleCopy}
      >
        คัดลอกตารางคน
      </button>
      <button
        className="mb-4 p-2 bg-purple-600 text-white rounded"
        onClick={() => {
          const text = getBoatList()
            .map((r) => r.boatCount) // ✅ เอาเฉพาะจำนวนเรือ
            .join("\n");

          navigator.clipboard.writeText(text).then(() => {
            alert("คัดลอกเฉพาะจำนวนเรือเรียบร้อยแล้ว!");
          });
        }}
      >
        คัดลอกจำนวนเรือที่ใช้
      </button>
      <a
        href="#section1"
        className="bg-green-500 rounded mb-4 p-2 text-white"
      >
        ไปที่ตารางสร้างชุบ
      </a>

      <div className="mb-4">
        <label>ดูผลรอบที่: </label>
        <input
          type="number"
          value={round}
          onChange={(e) => setRound(+e.target.value)}
          className="border px-2"
        />
      </div>

      <div className="max-h-[200px] overflow-x-auto">
        {result.map((item, i) => (
          <div key={i} className="p-2 border rounded mb-1">
            {item.type === "fight" ? (
              <span>
                ⚔️ Node {item.node}: Fight between{" "}
                {item.houses
                  .map(
                    (h: { house: string; count: number }) =>
                      `${h.house} (${h.count} คน)`
                  )
                  .join(", ")}
              </span>
            ) : (
              <span>
                🚶 Node {item.node}: {item.count} คน - {item.house}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-auto">
        <h3 className="font-bold">Matrix Node-House (รอบ {round})</h3>
        <button
          className="mb-4 p-2 bg-blue-500 text-white rounded"
          onClick={handleCopy}
        >
          คัดลอกตารางคน
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
                    {matrix[node]?.[house] === 0 ? "" : matrix[node]?.[house]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="">
        <label>ดูผลรอบที่: </label>
        <input
          type="number"
          value={round}
          onChange={(e) => setRound(+e.target.value)}
          className="border px-2"
        />
      </div>
      <div className="mt-5 overflow-auto">
        <h3 className="font-bold">รายการการใช้เรือ (รอบ {round})</h3>
        <button
          className="mb-4 p-2 bg-purple-600 text-white rounded"
          onClick={() => {
            const text = getBoatList()
              .map((r) => r.boatCount) // ✅ เอาเฉพาะจำนวนเรือ
              .join("\n");

            navigator.clipboard.writeText(text).then(() => {
              alert("คัดลอกเฉพาะจำนวนเรือเรียบร้อยแล้ว!");
            });
          }}
        >
          คัดลอกจำนวนเรือที่ใช้
        </button>
        <table className="border-collapse border w-full">
          <thead>
            <tr>
              <th className="border p-2 text-center">Node</th>
              <th className="border p-2 text-center">จำนวนเรือ</th>
              <th className="border p-2 text-center">
                บ้านเจ้าของเรือ
                <br />
                (ใส่ให้ดูง่ายๆเฉยๆ)
              </th>
            </tr>
          </thead>
          <tbody>
            {getBoatList().map((row, idx) => (
              <tr key={idx}>
                <td className="border p-2 text-center">{row.node}</td>
                <td className="border p-2 text-center">{row.boatCount}</td>
                <td className="border p-2 text-center">{row.house}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <br id="section1"/>
    </div>
  );
}
