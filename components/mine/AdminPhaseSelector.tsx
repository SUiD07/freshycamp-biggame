// components/AdminPhaseSelector.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const phases = ['อัพเดตผลการเดินเรียบร้อยแล้ว', 'อัพเดตผลการสู้เรียบร้อยแล้ว', 'อัพเดตผลการสร้างป้อมเรียบร้อยแล้ว', 'อัพเดตผลการสร้างป้อมและชุบชีวิตเรียบร้อยแล้ว', 'รอ'];

export const AdminPhaseSelector = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const updatePhaseAndMessage = async (newPhase: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('phases')
      .update({
        current_phase: newPhase,
        updated_at: new Date().toISOString(),
        admin_message: message,
      })
      .eq('id', 1);
    setLoading(false);
    if (error) alert('Error updating: ' + error.message);
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-bold">เลือก Phase</h2>
      <div className="space-x-2">
        {phases.map((phase) => (
          <button
            key={phase}
            onClick={() => updatePhaseAndMessage(phase)}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {phase}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <label className="block mb-1 font-medium">ข้อความพิเศษ</label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border px-2 py-1 rounded w-full"
          placeholder="พิมพ์ข้อความที่จะแสดง..."
        />
      </div>
    </div>
  );
};
