"use client";
import React from "react";
import CreateSnapshotMoveButton from "@/components/mine/CreateMoveSnapshot";
import UpdateNodesFromSnapshotButton from "@/components/mine/UpdateMapFromSnapshot";

export default function Nan() {
  return (
    <div>
      <CreateSnapshotMoveButton />
      <UpdateNodesFromSnapshotButton/>
    </div>
  );
}
