'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function CountdownTimer() {
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    const channel = supabase
      .channel('timer-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'timer' }, (payload) => {
        const data = payload.new
        setIsRunning(data.is_running)
        setStartTime(data.start_time ? new Date(data.start_time) : null)
        setDuration(data.duration_sec)
      })
      .subscribe()

    supabase.from('timer').select('*').eq('id', 1).single().then(({ data }) => {
      setIsRunning(data.is_running)
      setStartTime(data.start_time ? new Date(data.start_time) : null)
      setDuration(data.duration_sec)
    })

    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    if (!isRunning || !startTime || duration === null) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000)
      const rem = Math.max(duration - elapsed, 0)
      setRemaining(rem)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, startTime, duration])

  return (
    <div className="p-4 text-center">
      <h2 className="text-3xl font-bold">⏳ {formatTime(remaining)}</h2>
      <p className="mt-2 text-sm text-gray-600">
        {isRunning ? '🟢 กำลังนับถอยหลัง...' : '⏸️ หยุดอยู่'}
      </p>
    </div>
  )
}
