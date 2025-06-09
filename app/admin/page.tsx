"use client";
import React from "react";
import CreateSnapshotMoveButton from "@/components/mine/CreateMoveSnapshot";
import UpdateNodesFromSnapshotButton from "@/components/mine/UpdateMapFromSnapshot";
import UpdateTowerOwnerButton from "@/components/mine/UpdateHouseName";
import AdminTimer from "@/components/mine/AdminTimer";
import SnapshotTable from "@/components/mine/SnapshotTable";
import { AdminPhaseSelector } from "@/components/mine/AdminPhaseSelector";
import { AdminPhaseLogger } from "@/components/mine/AdminPhaseLogger";
import Link from "next/link";
import { Link2Icon } from "lucide-react";

export default function Nan() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <div>
          <CreateSnapshotMoveButton />
          <UpdateNodesFromSnapshotButton />
          <UpdateTowerOwnerButton />
          {/* <AdminTimer/> */}
          <iframe
            src="https://keepthescore.com/embed/snhqhpqlmvtgp/"
            width="600"
            height="400"
            // frameborder="0"
            // style="border:1px solid #ccc;"
          ></iframe>
          <Link2Icon />
          <Link
            href="https://keepthescore.com/board/snhqhpqlmvtgp/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex bg-slate-200"
          >
            เปิดสกอร์บอร์ด
          </Link>
          https://keepthescore.com/embed/snhqhpqlmvtgp/
          <Link href="https://keepthescore.com/login/?next=/">login</Link>
          <div>sirada.uth@docchula.com</div>
          <div>1234567890</div>
          {/* <AdminPhaseSelector/> */}
          {/* <AdminPhaseLogger/> */}
          {/* <SnapshotTable/> */}
        </div>
      </div>
    </main>
  );
}
