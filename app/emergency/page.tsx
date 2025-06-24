// components/SnapshotsTable.tsx
"use client";

import { useEffect, useState } from "react";
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import NodesTable from "@/components/mine/NodesTable";
import MoveForm from "@/components/mine/MoveForm";
import PurchaseForm from "@/components/mine/PurchasesForm";
import { PasswordProtectedRoute } from "@/components/mine/PasswordProtectedRoute";

type Snapshot = {
  node: string;
  phase: string;
  round: number;
  value: number | null;
  selectedcar: string | null;
  tower: boolean | null;
  ship: string[] | null;
  fight: any[] | null;
  towerOwner: string | null;
  created_at: string;
};

export default function SnapshotsTable() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [round, setRound] = useState<string>("");
  const [phase, setPhase] = useState<string>("");

  //   const supabase = createClientComponentClient();

  const fetchSnapshots = async () => {
    let query = supabase
      .from("snapshots")
      .select("*")
      .order("node", { ascending: true });

    if (round) query = query.eq("round", parseInt(round));
    if (phase) query = query.eq("phase", phase);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching snapshots:", error);
    } else {
      setSnapshots(data || []);
    }
  };

  const handleCopy = (data: Snapshot[] | Snapshot) => {
    let textToCopy = "";

    // ถ้าเป็น Array (copy all) หรือ Object (copy row)
    let dataArray = Array.isArray(data) ? data : [data];

    // ✅ เรียงตาม node โดยแปลงเป็นเลขก่อน
    dataArray = [...dataArray].sort(
      (a, b) => parseInt(a.node, 10) - parseInt(b.node, 10)
    );

    // ✅ เพิ่ม header
    textToCopy +=
      [
        "node",
        "phase",
        "round",
        "value",
        "selectedcar",
        "tower",
        "ship",
        "fight",
        "towerOwner",
        "created_at",
      ].join("\t") + "\n";

    // เพิ่ม data rows
    dataArray.forEach((item) => {
      textToCopy +=
        [
          item.node,
          item.phase,
          item.round,
          item.value ?? "",
          item.selectedcar ?? "",
          item.tower === true ? "true" : "false",
          item.ship?.join(", ") ?? "",
          JSON.stringify(item.fight ?? []), // ✅ แสดง fight เต็มแบบ JSON
          item.towerOwner ?? "",
          new Date(item.created_at).toLocaleString(),
        ].join("\t") + "\n";
    });

    navigator.clipboard.writeText(textToCopy).then(() => {
      alert("Copied in Excel format!");
    });
  };

  useEffect(() => {
    fetchSnapshots();
  }, []);
  const [houseInput, setHouseInput] = useState<string>("");

  return (
    <PasswordProtectedRoute>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">เลือกบ้าน:</label>
          <Select
            value={houseInput}
            onValueChange={(value) => setHouseInput(value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="เลือกบ้าน" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="บ้าน 01">บ้าน 01</SelectItem>
              <SelectItem value="บ้าน 02">บ้าน 02</SelectItem>
              <SelectItem value="บ้าน 03">บ้าน 03</SelectItem>
              <SelectItem value="บ้าน 04">บ้าน 04</SelectItem>
              <SelectItem value="บ้าน 05">บ้าน 05</SelectItem>
              <SelectItem value="บ้าน 06">บ้าน 06</SelectItem>
              <SelectItem value="บ้าน 07">บ้าน 07</SelectItem>
              <SelectItem value="บ้าน 08">บ้าน 08</SelectItem>
              <SelectItem value="บ้าน 09">บ้าน 09</SelectItem>
              <SelectItem value="บ้าน 10">บ้าน 10</SelectItem>
              <SelectItem value="บ้าน 11">บ้าน 11</SelectItem>
              <SelectItem value="บ้าน 12">บ้าน 12</SelectItem>
              {/* เพิ่มตามจำนวนบ้านที่คุณมี */}
            </SelectContent>
          </Select>
        </div>
        {houseInput && <MoveForm house={houseInput} />}
        {houseInput && <PurchaseForm house={houseInput} />}

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Round:</label>
            <Input
              type="number"
              placeholder="รอบเช่น 1"
              className="w-24"
              value={round}
              onChange={(e) => setRound(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Phase:</label>
            <Select value={phase} onValueChange={(value) => setPhase(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="เลือก Phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="เดิน">เดิน</SelectItem>
                <SelectItem value="สู้">สู้</SelectItem>
                <SelectItem value="สร้าง">สร้าง</SelectItem>
                <SelectItem value="ชุบ">ชุบ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={fetchSnapshots}>Fetch Data</Button>
          <Button
            variant="outline"
            onClick={() => {
              setRound("");
              setPhase("");
              fetchSnapshots();
            }}
          >
            Reset
          </Button>
          <Button variant="secondary" onClick={() => handleCopy(snapshots)}>
            <Copy className="w-4 h-4 mr-1" /> Copy All
          </Button>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Node</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead>Round</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>SelectedCar</TableHead>
                <TableHead>Tower</TableHead>
                <TableHead>Ship</TableHead>
                <TableHead>Fight</TableHead>
                <TableHead>TowerOwner</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Copy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshots.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="text-center text-muted-foreground"
                  >
                    No data found
                  </TableCell>
                </TableRow>
              ) : (
                [...snapshots]
                  .sort((a, b) => {
                    // แปลง node เป็น number เพื่อเรียงแบบเลข
                    const nodeA = parseInt(a.node, 10);
                    const nodeB = parseInt(b.node, 10);
                    if (nodeA !== nodeB) return nodeA - nodeB;

                    // ถ้า node เท่ากัน ให้เรียง round
                    if (a.round !== b.round) return a.round - b.round;

                    // ถ้า round เท่ากัน เรียง phase ตามตัวอักษร
                    return a.phase.localeCompare(b.phase);
                  })
                  .map((snap, idx) => (
                    <TableRow
                      key={`${snap.node}-${snap.round}-${snap.phase}-${idx}`}
                    >
                      <TableCell>{snap.node}</TableCell>
                      <TableCell>{snap.phase}</TableCell>
                      <TableCell>{snap.round}</TableCell>
                      <TableCell>{snap.value ?? "-"}</TableCell>
                      <TableCell>{snap.selectedcar ?? "-"}</TableCell>
                      <TableCell>
                        {snap.tower === true ? "true" : "false"}
                      </TableCell>
                      <TableCell>{snap.ship?.join(", ") ?? "-"}</TableCell>
                      <TableCell>
                        <pre className="whitespace-pre-wrap max-w-xs break-words">
                          {JSON.stringify(snap.fight, null, 2)}
                        </pre>
                      </TableCell>
                      <TableCell>{snap.towerOwner ?? "-"}</TableCell>
                      <TableCell>
                        {new Date(snap.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleCopy(snap)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>
        <div>Nodes Table</div>
        <NodesTable />
      </div>
    </PasswordProtectedRoute>
  );
}
