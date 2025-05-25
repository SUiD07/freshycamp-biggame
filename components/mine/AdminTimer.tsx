'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export default function AdminTimer() {
  const [inputSeconds, setInputSeconds] = useState(300)

  const startTimer = async () => {
    const now = new Date().toISOString()
    await supabase.from('timer').update({
      is_running: true,
      start_time: now,
      duration_sec: inputSeconds,
    }).eq('id', 1)
  }

  const stopTimer = async () => {
    await supabase.from('timer').update({
      is_running: false,
    }).eq('id', 1)
  }

  const resetTimer = async () => {
    await supabase.from('timer').update({
      is_running: false,
      start_time: null,
      duration_sec: null,
    }).eq('id', 1)
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
        <button onClick={startTimer} className="bg-green-500 text-white px-3 py-1 rounded">Start</button>
        <button onClick={stopTimer} className="bg-yellow-500 text-white px-3 py-1 rounded">Stop</button>
        <button onClick={resetTimer} className="bg-red-500 text-white px-3 py-1 rounded">Reset</button>
      </div>
    </div>
  )
}
