"use client";

import { useEffect, useState } from "react";
// import { createClient } from "@supabase/supabase-js";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { CellContext } from "@tanstack/react-table";

import { supabase } from "@/lib/supabase";

const phaseMap: Record<string, string> = {
  build: "สร้าง",
  revive: "ชุบ",
  walk: "เดิน",
  fight: "สู้",
};

// ลำดับ phase เพื่อดู phase ก่อนหน้า
const phaseOrder = ["สร้าง", "ชุบ", "เดิน", "สู้"];

type SnapshotData = {
  node: string;
  phase: string;
  round: number;
  value: number | null;
  selectedcar: string | null;
  tower: boolean | null;
  towerOwner: string | null;
  fight: any[] | null;
};

export default function SnapshotTable() {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<ColumnDef<any>[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: snapshots, error } = await supabase
        .from("snapshots")
        .select("*");

      if (error) {
        console.error("Error fetching snapshots:", error);
        return;
      }

      // pivoted[node][phase_round] = {...fields}
      const pivoted: Record<string, any> = {};
      const columnKeysSet = new Set<string>();

      snapshots?.forEach((snap: SnapshotData) => {
        const phaseTH = phaseMap[snap.phase] || snap.phase;
        const key = `${phaseTH} (รอบ ${snap.round})`;

        if (!pivoted[snap.node]) {
          pivoted[snap.node] = { node: snap.node };
        }

        pivoted[snap.node][key] = {
          value: snap.value ?? "-",
          selectedcar: snap.selectedcar ?? "-",
          tower: snap.tower ? "✅" : "-",
          towerOwner: snap.towerOwner ?? "-",
          fight:
            snap.fight && snap.fight.length ? JSON.stringify(snap.fight) : "-",
        };

        columnKeysSet.add(key);
      });

      // จัดเรียง column ตาม round + phaseOrder
      const sortedKeys = Array.from(columnKeysSet).sort((a, b) => {
        const [phaseA, roundAStr] = a.split(" (รอบ ");
        const [phaseB, roundBStr] = b.split(" (รอบ ");
        const roundA = Number(roundAStr.replace(")", ""));
        const roundB = Number(roundBStr.replace(")", ""));
        const indexA = phaseOrder.indexOf(phaseA);
        const indexB = phaseOrder.indexOf(phaseB);

        // เรียงลำดับตาม round ก่อน จากนั้นตาม phaseOrder
        if (roundA !== roundB) {
          return roundA - roundB;
        }
        return indexA - indexB;
      });

      // สร้าง map: node -> phaseTH -> round -> data
      const rawMap: Record<
        string,
        Record<string, Record<number, Record<string, any>>>
      > = {};

      snapshots.forEach((snap: SnapshotData) => {
        const phaseTH = phaseMap[snap.phase] || snap.phase;
        if (!rawMap[snap.node]) rawMap[snap.node] = {};
        if (!rawMap[snap.node][phaseTH]) rawMap[snap.node][phaseTH] = {};
        rawMap[snap.node][phaseTH][snap.round] = {
          value: snap.value ?? "-",
          selectedcar: snap.selectedcar ?? "-",
          tower: snap.tower ? "✅" : "-",
          towerOwner: snap.towerOwner ?? "-",
          fight:
            snap.fight && snap.fight.length ? JSON.stringify(snap.fight) : "-",
        };
      });

      const dynamicCols: ColumnDef<any>[] = [
        {
          accessorKey: "node",
          header: "Node",
        },
        ...sortedKeys.map((key) => {
          const [phaseTH, roundStr] = key.split(" (รอบ ");
          const round = Number(roundStr.replace(")", ""));

          // หา phase ก่อนหน้า
          const phaseIndex = phaseOrder.indexOf(phaseTH);
          const prevPhaseTH =
            phaseIndex > 0 ? phaseOrder[phaseIndex - 1] : null;

          return {
            accessorKey: key,
            header: key,
            cell: ({ getValue, row, column }: CellContext<any, any>) => {
              const val = getValue() as Record<string, any>;
              const node = row.original.node;

              // ดึง phase และ round จาก column.id เช่น "สร้าง (รอบ 1)"
              const colId = column.id;
              const [phaseTH, roundStr] = colId.split(" (รอบ ");
              const round = Number(roundStr.replace(")", ""));
              const phaseIndex = phaseOrder.indexOf(phaseTH);

              // หา phase ก่อนหน้าแบบพิเศษ
              let prevVal = null;
              if (phaseIndex === 0) {
                // ถ้า phase แรก คือ "สร้าง" ให้เทียบกับ "สู้" รอบก่อนหน้า
                const prevRound = round - 1;
                if (prevRound > 0) {
                  prevVal = rawMap[node]?.["สู้"]?.[prevRound] || null;
                }
              } else {
                // phase ปกติ เทียบกับ phase ก่อนหน้า รอบเดียวกัน
                const prevPhaseTH = phaseOrder[phaseIndex - 1];
                prevVal =
                  prevPhaseTH && rawMap[node]?.[prevPhaseTH]?.[round]
                    ? rawMap[node][prevPhaseTH][round]
                    : null;
              }

              return val ? (
                <table className="border border-gray-300 text-xs w-full">
                  <tbody>
                    <tr>
                      {Object.entries(val).map(([k, v]) => {
                        const changed = prevVal ? prevVal[k] !== v : false;
                        return (
                          <td
                            key={k}
                            className={`border px-1 font-semibold ${
                              changed ? "bg-green-200" : ""
                            }`}
                          >
                            <div className="font-bold">{k}</div>
                            <div>{v}</div>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              ) : null;
            },
          };
        }),
      ];

      setColumns(dynamicCols);
      setData(Object.values(pivoted));
    }

    fetchData();
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto max-w-[900px] p-4">
      <table className="min-w-max border-collapse border border-gray-300 text-xs">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="border p-2 text-left whitespace-nowrap"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 align-top">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="border p-2 align-top whitespace-nowrap"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
