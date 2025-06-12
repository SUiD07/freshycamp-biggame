"use client";

import { Node } from "./NodesTable";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

export function NodeTableView({
  nodes,
  onCopyRow,
}: {
  nodes: Node[];
  onCopyRow: (row: Node) => void;
}) {
  return (
    <div className="max-h-[500px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Top</TableHead>
            <TableHead>Left</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>SelectedCar</TableHead>
            <TableHead>Tower</TableHead>
            <TableHead>Ship</TableHead>
            <TableHead>Fight</TableHead>
            <TableHead>TowerOwner</TableHead>
            <TableHead>Copy</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {nodes.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={10}
                className="text-center text-muted-foreground"
              >
                No data found
              </TableCell>
            </TableRow>
          ) : (
            nodes.map((node) => (
              <TableRow key={node.id}>
                <TableCell>{node.id}</TableCell>
                <TableCell>{node.top ?? "-"}</TableCell>
                <TableCell>{node.left ?? "-"}</TableCell>
                <TableCell>{node.value ?? "-"}</TableCell>
                <TableCell>{node.selectedcar ?? "-"}</TableCell>
                <TableCell>{node.tower === true ? "true" : "false"}</TableCell>
                <TableCell>{node.ship?.join(", ") ?? "-"}</TableCell>
                <TableCell>{node.fight?.length ?? 0}</TableCell>
                <TableCell>{node.towerOwner ?? "-"}</TableCell>
                <TableCell>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onCopyRow(node)}
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
  );
}
