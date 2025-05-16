"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ClaimTowerPage = () => {
  const supabase = createClient();
  const [round, setRound] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  // ฟังก์ชันแปลงจาก "บ้าน 01" → "B1"
  const convertHouseToCode = (house: string): string => {
    const match = house.match(/บ้าน\s*(\d+)/);
    if (!match) return house;
    return "B" + parseInt(match[1], 10).toString();
  };

  const handleClaimTower = async () => {
    setLoading(true);

    const { data: purchases, error } = await supabase
      .from("purchases")
      .select("node, house, type")
      .eq("round", round)
      .ilike("type", "%fort%");

    if (error || !purchases || purchases.length === 0) {
      alert("ไม่พบการซื้อ ป้อม ในรอบนี้");
      setLoading(false);
      return;
    }

    for (const purchase of purchases) {
      const nodeId = purchase.node.toString();
      const convertedHouse = convertHouseToCode(purchase.house);

      const { error: updateError } = await supabase
        .from("nodes")
        .update({
          tower: true,
          towerOwner: convertedHouse,
        })
        .eq("id", nodeId);

      if (updateError) {
        console.error(`อัปเดต node ${nodeId} ล้มเหลว`, updateError);
      }
    }

    alert("อัปเดต ป้อม สำเร็จ");
    setLoading(false);
  };

  const handleReviveUpdate = async () => {
    setLoading(true);

    const { data: revives, error } = await supabase
      .from("purchases")
      .select("node, count, house")
      .eq("round", round)
      .eq("type", "revive");

    if (error || !revives || revives.length === 0) {
      alert("ไม่พบรายการชุบชีวิตในรอบนี้");
      setLoading(false);
      return;
    }

    for (const revive of revives) {
      const nodeId = revive.node.toString();
      const convertedHouse = convertHouseToCode(revive.house);

      const { data: currentNode, error: readError } = await supabase
        .from("nodes")
        .select("value")
        .eq("id", nodeId)
        .single();

      if (readError || !currentNode) {
        console.error(`ไม่พบ node id=${nodeId} หรือดึงข้อมูลไม่สำเร็จ`);
        continue;
      }

      const currentValue = parseInt(currentNode.value ?? "0", 10);
      const newValue = currentValue + (revive.count ?? 0);

      const { error: updateError } = await supabase
        .from("nodes")
        .update({
          value: newValue.toString(),
          selectedcar: convertedHouse,
        })
        .eq("id", nodeId);

      if (updateError) {
        console.error(`อัปเดต node ${nodeId} ล้มเหลว`, updateError);
      }
    }

    alert("อัปเดตค่าชุบชีวิตและ selectedcar สำเร็จ");
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">จัดการ ป้อม & ชุบชีวิต</h1>

      <div>
        <Label htmlFor="round">เลือกรอบ</Label>
        <Input
          id="round"
          type="number"
          value={round}
          min={1}
          onChange={(e) => setRound(Number(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <Button
          onClick={handleClaimTower}
          disabled={loading}
          className="w-full"
        >
          {loading ? "กำลังอัปเดต ป้อม..." : "อัปเดตป้อม"}
        </Button>

        <Button
          onClick={handleReviveUpdate}
          disabled={loading}
          variant="secondary"
          className="w-full"
        >
          {loading ? "กำลังอัปเดตชุบชีวิต..." : "อัปเดตชุบชีวิต (เพิ่ม value)"}
        </Button>
      </div>
    </div>
  );
};

export default ClaimTowerPage;
