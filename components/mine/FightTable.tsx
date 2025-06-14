"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

type FightEntry = { count: number; house: string };
type Snapshot = {
  node: string;
  round: number;
  fight: FightEntry[];
  value?: number | null;
  selectedcar?: string | null;
};

export default function FightSnapshotsTable() {
  const [data, setData] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSnapshots = async () => {
    setLoading(true);
    const { data: walkData, error: walkError } = await supabase
      .from("snapshots")
      .select("node, round, fight")
      .eq("phase", "เดิน")
      .not("fight", "is", null);

    if (walkError) {
      console.error("Error fetching walk phase:", walkError);
      setLoading(false);
      return;
    }

    const filtered = (walkData ?? []).filter(
      (d) => Array.isArray(d.fight) && d.fight.length > 0
    );

    const { data: fightData, error: fightError } = await supabase
      .from("snapshots")
      .select("node, round, value, selectedcar")
      .eq("phase", "สู้");

    if (fightError) {
      console.error("Error fetching fight phase:", fightError);
      setLoading(false);
      return;
    }

    const merged = filtered.map((item) => {
      const match = (fightData ?? []).find(
        (f) => f.node === item.node && f.round === item.round
      );
      return {
        ...item,
        value: match?.value ?? null,
        selectedcar: match?.selectedcar ?? null,
      };
    });

    setData(merged);
    setLoading(false);
  };

  useEffect(() => {
    fetchSnapshots();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Fight Summary</h2>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <Accordion className="w-[500px]" type="single" collapsible defaultValue="fight-all">
          <AccordionItem value="fight-all">
            <AccordionTrigger>แสดงข้อมูลการต่อสู้ทั้งหมด</AccordionTrigger>
            <AccordionContent>
              <Button onClick={fetchSnapshots}>🔄 รีเฟรชข้อมูลการต่อสู้</Button>
              <Table>
                <div className="max-h-[400px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Round</TableHead>
                      <TableHead>Node</TableHead>
                      <TableHead>Fight</TableHead>
                      <TableHead>บ้านที่ชนะ</TableHead>
                      <TableHead>จำนวนคนที่เหลือ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((snapshot, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{snapshot.round}</TableCell>
                        <TableCell>{snapshot.node}</TableCell>
                        <TableCell>
                          <ul className="list-disc pl-4 space-y-1">
                            {snapshot.fight.map((entry, i) => (
                              <li key={i}>
                                <span className="font-medium">
                                  {entry.house}
                                </span>
                                : {entry.count} คน
                              </li>
                            ))}
                          </ul>
                        </TableCell>
                        <TableCell>{snapshot.selectedcar ?? "-"}</TableCell>
                        <TableCell>{snapshot.value ?? "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </div>
              </Table>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
