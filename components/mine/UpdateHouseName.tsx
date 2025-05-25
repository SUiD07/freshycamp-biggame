'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@supabase/supabase-js'

// เชื่อมต่อ Supabase
import { supabase } from '@/lib/supabase'

export default function UpdateTowerOwnerButton() {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState('')

  const handleClick = () => {
    startTransition(async () => {
      setMessage('')
      let totalUpdated = 0

      for (let i = 1; i <= 12; i++) {
        const thaiHouse = `บ้าน ${i.toString().padStart(2, '0')}`
        const shortCode = `B${i}`

        const { data, error } = await supabase
          .from('snapshots')
          .update({ towerOwner: shortCode })
          .eq('towerOwner', thaiHouse)
          .select()

        if (error) {
          setMessage(`❌ เกิดข้อผิดพลาดที่ ${thaiHouse}: ${error.message}`)
          return
        }

        totalUpdated += data?.length ?? 0
      }

      setMessage(`✅ อัปเดตทั้งหมด ${totalUpdated} รายการ`)
    })
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isPending}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {isPending ? 'กำลังอัปเดต...' : 'เปลี่ยน "บ้าน 01-12" เป็น "B1-12"'}
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  )
}
