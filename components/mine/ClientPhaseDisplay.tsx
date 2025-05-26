// components/ClientPhaseDisplay.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const ClientPhaseDisplay = () => {
  const [phase, setPhase] = useState<string>('กำลังโหลด...');
  const [time, setTime] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const fetchInitialPhase = async () => {
      const { data } = await supabase
        .from('phases')
        .select('current_phase, updated_at, admin_message')
        .eq('id', 1)
        .single();
      if (data) {
        setPhase(data.current_phase);
        setTime(new Date(data.updated_at).toLocaleString());
        setMessage(data.admin_message || '');
      }
    };

    fetchInitialPhase();

    const channel = supabase
      .channel('realtime-phase')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'phases' },
        (payload) => {
          const newPhase = (payload.new as any).current_phase;
          const newTime = (payload.new as any).updated_at;
          const newMessage = (payload.new as any).admin_message;
          setPhase(newPhase);
          setTime(new Date(newTime).toLocaleString());
          setMessage(newMessage || '');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">Phase ปัจจุบัน</h2>
      <p className="text-xl">{phase}</p>
      <p className="text-sm text-gray-600">อัพเดตล่าสุด: {time}</p>
      {message && (
        <div className="mt-4 p-3 border rounded bg-yellow-100">
          <strong>ข้อความพิเศษ:</strong> {message}
        </div>
      )}
    </div>
  );
};
