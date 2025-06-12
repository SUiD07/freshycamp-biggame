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
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
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

  async function fetchData(
    setColumns: any,
    setData: any,
    setLoading?: (b: boolean) => void
  ) {
    setLoading?.(true); // เริ่มโหลด
    const snapshots = await fetchAllSnapshots();
    if (!snapshots) {
      setLoading?.(false);
      return;
    }

    console.log("Snapshots from Supabase (all batches):", snapshots);

    // หา nodes, rounds
    const allNodes = Array.from(new Set(snapshots.map((s) => s.node))).sort(
      (a, b) => Number(a) - Number(b)
    );
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
        value: snap.value ?? 0,
        selectedcar: snap.selectedcar?.trim() ? snap.selectedcar : "-",
        tower: snap.tower ? "✅" : "-",
        towerOwner: snap.towerOwner?.trim() ? snap.towerOwner : "-",
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
          //check selectedcar and towerowner
          const isMismatch =
            val.selectedcar !== "-" &&
            val.selectedcar !== "" &&
            val.towerOwner !== "-" &&
            val.towerOwner !== "" &&
            val.selectedcar !== val.towerOwner;

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
                        } ${isMismatch ? "border-red-500 border-2" : ""}`}
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
    setLoading?.(false); // โหลดเสร็จ
  }
  useEffect(() => {
    fetchData(setColumns, setData, setLoading);
  }, []);

  //   fetchData();
  // }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="flex justify-between items-center px-4 pb-2">
        <h2 className="text-sm font-bold">Snapshot Table</h2>
        <button
          onClick={() => fetchData(setColumns, setData, setLoading)}
          disabled={loading}
          className={`px-3 py-1 text-xs rounded text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Loading..." : "🔄 Refresh"}
        </button>
      </div>
      <div className="overflow-auto max-w-full p-4 max-h-[500px]">
        <table className="min-w-max border-collapse border border-gray-300 text-xs">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, columnIndex) => (
                  <th
                    key={header.id}
                    className={`border p-2 text-left whitespace-nowrap bg-gray-100 z-10
                sticky top-0
                ${columnIndex === 0 ? "left-0 z-20 bg-gray-100" : ""}
              `}
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
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell, columnIndex) => (
                  <td
                    key={cell.id}
                    className={`border p-2 whitespace-nowrap bg-white
                ${columnIndex === 0 ? "sticky left-0 z-10 bg-white" : ""}
              `}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
