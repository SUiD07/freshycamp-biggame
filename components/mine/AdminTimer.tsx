'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminTimer() {
  const [inputSeconds, setInputSeconds] = useState(300)

  // เริ่มจับเวลา (Start หรือ Resume)
  const startTimer = async () => {
    const { data, error } = await supabase.from('timer').select().eq('id', 1).single()

    if (error || !data) {
      console.error('Error fetching timer:', error)
      return
    }

    const now = new Date().toISOString()
    const resumeDuration = data.paused_remaining_sec ?? inputSeconds

    const { error: updateError } = await supabase.from('timer').update({
      is_running: true,
      start_time: now,
      duration_sec: resumeDuration,
      paused_remaining_sec: null, // ล้างค่าค้างเมื่อ Resume
    }).eq('id', 1)

    if (updateError) {
      console.error('Error starting timer:', updateError)
    }
  }

  // หยุดจับเวลา (Pause)
  const stopTimer = async () => {
    const { data, error } = await supabase.from('timer').select().eq('id', 1).single()

    if (error || !data) {
      console.error('Error fetching timer:', error)
      return
    }

    if (!data.is_running || !data.start_time || !data.duration_sec) {
      console.warn('Timer is not running or missing data')
      return
    }

    const elapsed = Math.floor((Date.now() - new Date(data.start_time).getTime()) / 1000)
    const remaining = Math.max(data.duration_sec - elapsed, 0)

    const { error: updateError } = await supabase.from('timer').update({
      is_running: false,
      paused_remaining_sec: remaining,
    }).eq('id', 1)

    if (updateError) {
      console.error('Error stopping timer:', updateError)
    }
  }

  // รีเซ็ตเวลา
  const resetTimer = async () => {
    const { error } = await supabase.from('timer').update({
      is_running: false,
      start_time: null,
      duration_sec: null,
      paused_remaining_sec: null,
    }).eq('id', 1)

    if (error) {
      console.error('Error resetting timer:', error)
    }
  }

  return (
    <div className="p-4 border rounded shadow w-80">
      <h2 className="text-xl font-bold mb-4">Admin Timer Control</h2>

      <input
        type="number"
        value={inputSeconds}
        onChange={(e) => setInputSeconds(parseInt(e.target.value))}
        placeholder="ระบุจำนวนวินาที"
        className="border p-2 w-full"
      />

      <div className="mt-4 space-x-2">
        <button
          onClick={startTimer}
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          Start / Resume
        </button>
        <button
          onClick={stopTimer}
          className="bg-yellow-500 text-white px-3 py-1 rounded"
        >
          Pause
        </button>
        <button
          onClick={resetTimer}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
