import AllMovesTable from "@/components/mine/AllMovesTable";
import SnapshotTable from "@/components/mine/SnapshotTable";
import React from "react";

export default function snap() {
  return (
    <div>
      <SnapshotTable />
      <AllMovesTable />
    </div>
  );
}
