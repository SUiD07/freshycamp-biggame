"use client";
import React from "react";
import CreateSnapshotMoveButton from "@/components/mine/CreateMoveSnapshot";
import UpdateNodesFromSnapshotButton from "@/components/mine/UpdateMapFromSnapshot";
import UpdateTowerOwnerButton from "@/components/mine/UpdateHouseName";
import AdminTimer from "@/components/mine/AdminTimer";

export default function Nan() {
  return (
    <div>
      <CreateSnapshotMoveButton />
      <UpdateNodesFromSnapshotButton/>
      <UpdateTowerOwnerButton/>
      <AdminTimer/>
    </div>
  );
}
