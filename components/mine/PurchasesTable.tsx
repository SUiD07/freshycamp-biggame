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

interface PurchaseEntry {
  id: number;
  round: number;
  type: string;
  node: number;
  count: number;
  create_at: string | null;
}

export default function PurchasesTable({ house }: { house: string }) {
  const [data, setData] = useState<PurchaseEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select("id, round, type, node, count, create_at")
        .eq("house", house)
        .order("round", { ascending: false });

      if (error) {
        console.error("Error loading purchases:", error);
      } else {
        setData(data || []);
      }

      setLoading(false);
    };

    fetchPurchases();
  }, [house]);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>ประวัติการสร้าง/ชุบชีวิตของ {house}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ) : data.length === 0 ? (
          <p className="text-muted-foreground">ยังไม่มีข้อมูล</p>
        ) : (
          <div className="overflow-y-auto max-h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รอบ</TableHead>
                  <TableHead>Node</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>จำนวน</TableHead>
                  <TableHead>เวลาบันทึก</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.round}</TableCell>
                    <TableCell>{entry.node}</TableCell>
                    <TableCell>{entry.type}</TableCell>
                    <TableCell>{entry.count}</TableCell>
                    <TableCell>
                      {entry.create_at
                        ? new Date(entry.create_at).toLocaleString("th-TH")
                        : "—"}
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
