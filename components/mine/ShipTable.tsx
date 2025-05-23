"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button"; // นำเข้าปุ่ม

interface ShipEntry {
  id: string;
  node: number;
  round: number;
  boat: number;
  created_at: string;
}

export default function ShipTable({ house }: { house: string }) {
  const [ships, setShips] = useState<ShipEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShips = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ship")
      .select("id, node, round, boat, created_at")
      .eq("house", house)
      .order("round", { ascending: false });

    if (error) {
      console.error("Error loading ship entries:", error);
    } else {
      setShips(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchShips();
  }, [house]);

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>การใช้เรือของ {house}</CardTitle>
        <Button onClick={fetchShips} disabled={loading} variant="outline" size="sm">
          {loading ? "กำลังโหลด..." : "รีเฟรช"}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ) : ships.length === 0 ? (
          <p className="text-muted-foreground">ยังไม่มีข้อมูล</p>
        ) : (
          <div className="overflow-y-auto max-h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รอบ</TableHead>
                  <TableHead>Node</TableHead>
                  <TableHead>จำนวนเรือ</TableHead>
                  <TableHead>เวลาบันทึก</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ships.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.round}</TableCell>
                    <TableCell>{entry.node}</TableCell>
                    <TableCell>{entry.boat}</TableCell>
                    <TableCell>
                      {new Date(entry.created_at).toLocaleString("th-TH")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
