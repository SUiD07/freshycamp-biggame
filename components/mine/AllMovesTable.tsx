// components/MovesTable.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Move = {
  id: string;
  house: string;
  node: number;
  round: number;
  count: number;
  created_at: string;
  boat: number | null;
};

export default function MovesTable() {
  const [moves, setMoves] = useState<Move[]>([]);
  const [sortBy, setSortBy] = useState<"node" | "house" | "count">("node");
  const [round, setRound] = useState<number | null>(null);
  const [inputRound, setInputRound] = useState("");

  const fetchMoves = async (sortField: "node" | "house" | "count", roundFilter: number | null) => {
    let query = supabase
      .from("moves")
      .select("*")
      .order("round", { ascending: true })
      .order(sortField, { ascending: true });

    if (roundFilter) {
      query = query.eq("round", roundFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching moves:", error);
    } else {
      setMoves(data || []);
    }
  };

  useEffect(() => {
    fetchMoves(sortBy, round);
  }, [sortBy, round]);

  const handleRoundFilter = () => {
    const num = parseInt(inputRound);
    setRound(isNaN(num) ? null : num);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Sort by:</label>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as "node" | "house" | "count")}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="node">Node</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="count">Count</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Round:</label>
          <Input
            type="number"
            placeholder="เช่น 1, 2, 3"
            className="w-24"
            value={inputRound}
            onChange={(e) => setInputRound(e.target.value)}
          />
          <Button size="sm" onClick={handleRoundFilter}>
            Apply
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setInputRound(""); setRound(null); }}>
            Reset
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>House</TableHead>
            <TableHead>Round</TableHead>
            <TableHead>Node</TableHead>
            <TableHead>Count</TableHead>
            {/* <TableHead>Boat</TableHead> */}
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {moves.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No data found
              </TableCell>
            </TableRow>
          ) : (
            moves.map((move) => (
              <TableRow key={move.id}>
                <TableCell>{move.house}</TableCell>
                <TableCell>{move.round}</TableCell>
                <TableCell>{move.node}</TableCell>
                <TableCell>{move.count}</TableCell>
                {/* <TableCell>{move.boat ?? "-"}</TableCell> */}
                <TableCell>{new Date(move.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
