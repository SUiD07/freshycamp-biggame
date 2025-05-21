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

interface Move {
  id: string;
  house: string;
  node: number;
  round: number;
  count: number;
  created_at: string;
  boat: number | null;
}

export default function MyMovesTable({ house }: { house: string }) {
  const [moves, setMoves] = useState<Move[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMoves = async () => {
      const { data, error } = await supabase
        .from("moves")
        .select("*")
        .eq("house", house)
        .order("round", { ascending: false });

      if (error) {
        console.error("Error fetching moves:", error);
      } else {
        setMoves(data || []);
      }
      setLoading(false);
    };

    fetchMoves();
  }, [house]);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>การเคลื่อนที่ของ {house}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ) : moves.length === 0 ? (
          <p className="text-muted-foreground">ยังไม่มีข้อมูล</p>
        ) : (
          <div className="overflow-y-auto max-h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รอบ</TableHead>
                  <TableHead>Node</TableHead>
                  <TableHead>จำนวนคน</TableHead>
                  {/* <TableHead>เรือ</TableHead> */}
                  <TableHead>เวลา</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {moves.map((move) => (
                  <TableRow key={move.id}>
                    <TableCell>{move.round}</TableCell>
                    <TableCell>{move.node}</TableCell>
                    <TableCell>{move.count}</TableCell>
                    {/* <TableCell>{move.boat ?? "-"}</TableCell> */}
                    <TableCell>
                      {new Date(move.created_at).toLocaleString("th-TH")}
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
