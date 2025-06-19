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
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

export default function Nan() {
  const handleRefreshMap = async () => {
    await supabase
      .from("map_refresh_trigger")
      .update({ triggered_at: new Date().toISOString() })
      .eq("id", 1);

    toast({
      title: "รีเฟรชแผนที่แล้ว",
      description: "ทุกหน้าที่เปิดแผนที่จะโหลดข้อมูลใหม่",
    });
  };

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <div>
          <CreateSnapshotMoveButton />
          <UpdateNodesFromSnapshotButton />
          <UpdateTowerOwnerButton />
          <Button onClick={handleRefreshMap}>🔄 รีเฟรชข้อมูลแผนที่</Button>
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
          {/* 🤯🤯🤯🤯🤯🤯🤯🤯🤯🤯 */}
          <AdminPhaseLogger />
          {/* 🤯🤯🤯🤯🤯🤯🤯🤯🤯🤯 */}
          {/* <SnapshotTable/> */}
        </div>
      </div>
    </main>
  );
}
