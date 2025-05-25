"use client";

import { useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { CellContext } from "@tanstack/react-table";

import { supabase } from "@/lib/supabase";

// phaseOrder ภาษาไทยตาม Supabase
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
    async function fetchAllSnapshots() {
      let allSnapshots: any[] = [];
      let from = 0;
      const batchSize = 1000;
      let keepFetching = true;

      while (keepFetching) {
        const to = from + batchSize - 1;
        const { data: snapshots, error } = await supabase
          .from("snapshots")
          .select("*")
          .range(from, to);

        if (error) {
          console.error("Error fetching snapshots:", error);
          break;
        }

        if (!snapshots || snapshots.length === 0) {
          keepFetching = false;
          break;
        }

        allSnapshots = allSnapshots.concat(snapshots);

        if (snapshots.length < batchSize) {
          // ได้ข้อมูลน้อยกว่า batchSize แสดงว่า fetch ครบแล้ว
          keepFetching = false;
        } else {
          // เตรียมดึง batch ถัดไป
          from += batchSize;
        }
      }

      return allSnapshots;
    }

    async function fetchData() {
      const snapshots = await fetchAllSnapshots();

      if (!snapshots) return;

      console.log("Snapshots from Supabase (all batches):", snapshots);

      // หา nodes, rounds
      const allNodes = Array.from(new Set(snapshots.map((s) => s.node))).sort();
      const allRounds = Array.from(new Set(snapshots.map((s) => s.round))).sort(
        (a, b) => a - b
      );

      // สร้าง allPhaseRoundKeys
      const allPhaseRoundKeys: string[] = [];
      for (const round of allRounds) {
        for (const phase of phaseOrder) {
          allPhaseRoundKeys.push(`${phase} (รอบ ${round})`);
        }
      }

      // เตรียม rawMap ให้ครบทุก node-phase-round แม้ไม่มีข้อมูล
      const rawMap: Record<
        string,
        Record<string, Record<number, Record<string, any>>>
      > = {};

      for (const node of allNodes) {
        rawMap[node] = {};
        for (const phase of phaseOrder) {
          rawMap[node][phase] = {};
          for (const round of allRounds) {
            rawMap[node][phase][round] = {
              value: "-",
              selectedcar: "-",
              tower: "-",
              towerOwner: "-",
              fight: "-",
            };
          }
        }
      }

      // เติมข้อมูลจริงลงไป
      for (const snap of snapshots) {
        rawMap[snap.node][snap.phase][snap.round] = {
          value: snap.value ?? "-",
          selectedcar: snap.selectedcar ?? "-",
          tower: snap.tower ? "✅" : "-",
          towerOwner: snap.towerOwner ?? "-",
          fight:
            snap.fight && snap.fight.length ? JSON.stringify(snap.fight) : "-",
        };
      }

      // Pivoted Data
      const pivoted = allNodes.map((node) => {
        const row: Record<string, any> = { node };
        for (const key of allPhaseRoundKeys) {
          const [phase, roundStr] = key.split(" (รอบ ");
          const round = Number(roundStr.replace(")", ""));
          row[key] = rawMap[node][phase][round];
        }
        return row;
      });

      // สร้าง Columns
      const dynamicCols: ColumnDef<any>[] = [
        {
          accessorKey: "node",
          header: "Node",
        },
        ...allPhaseRoundKeys.map((key) => ({
          accessorKey: key,
          header: key,
          cell: ({ getValue, row, column }: CellContext<any, any>) => {
            const val = getValue() as Record<string, any>;
            const node = row.original.node;

            const [phaseTH, roundStr] = column.id.split(" (รอบ ");
            const round = Number(roundStr.replace(")", ""));
            const phaseIndex = phaseOrder.indexOf(phaseTH);

            let prevVal = null;
            if (phaseIndex === 0) {
              const prevRound = round - 1;
              if (prevRound > 0) {
                prevVal = rawMap[node]?.["สู้"]?.[prevRound] || null;
              }
            } else {
              const prevPhase = phaseOrder[phaseIndex - 1];
              prevVal = rawMap[node]?.[prevPhase]?.[round] || null;
            }

            return (
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
            );
          },
        })),
      ];

      setColumns(dynamicCols);
      setData(pivoted);
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
