'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function UpdateNodesFromSnapshotButton() {
  const [round, setRound] = useState<number>(1);
  const [phase, setPhase] = useState<string>('เดิน');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);

    // ดึง snapshot ตาม round และ phase ที่เลือก
    const { data: snapshots, error } = await supabase
      .from('snapshots')
      .select('node, value, selectedcar, tower, ship, fight, towerOwner')
      .eq('round', round)
      .eq('phase', phase);

    if (error || !snapshots) {
      console.error('Error fetching snapshots', error);
      alert('ไม่พบข้อมูล snapshot');
      setLoading(false);
      return;
    }

    // อัปเดตทีละ node → อาจจะใช้ upsert ถ้า nodes มี key เป็น id
    const updates = snapshots.map((snap) => ({
      id: snap.node,
      value: snap.value ?? null,
      selectedcar: snap.selectedcar ?? null,
      tower: snap.tower ?? null,
      ship: snap.ship ?? [],
      fight: snap.fight ?? [],
      towerOwner: snap.towerOwner ?? null,
    }));

    // วนอัปเดต node ทีละตัว
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('nodes')
        .update({
          value: update.value,
          selectedcar: update.selectedcar,
          tower: update.tower,
          ship: update.ship,
          fight: update.fight,
          towerOwner: update.towerOwner,
        })
        .eq('id', update.id);

      if (updateError) {
        console.error(`Update error for node ${update.id}`, updateError);
      }
    }

    alert('อัปเดต Nodes สำเร็จจาก Snapshot');
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded shadow max-w-md mt-4">
      <div className="mb-2">
        <label className="mr-2 font-semibold">รอบ:</label>
        <input
          type="number"
          value={round}
          onChange={(e) => setRound(Number(e.target.value))}
          className="border px-2 py-1 w-24"
          min={0}
        />
      </div>
      <div className="mb-4">
        <label className="mr-2 font-semibold">Phase:</label>
        <select
          value={phase}
          onChange={(e) => setPhase(e.target.value)}
          className="border px-2 py-1"
        >
          <option value="เดิน">เดิน</option>
          <option value="ต่อสู้">ต่อสู้</option>
          <option value="สร้าง">สร้าง</option>
          <option value="ชุบ">ชุบ</option>
        </select>
      </div>
      <button
        onClick={handleUpdate}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {loading ? 'กำลังอัปเดต...' : 'อัปเดต Nodes จาก Snapshot'}
      </button>
    </div>
  );
}
