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

  useEffect(() => {
    const fetchShips = async () => {
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

    fetchShips();
  }, [house]);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>การใช้เรือของ {house}</CardTitle>
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
        )}
      </CardContent>
    </Card>
  );
}
