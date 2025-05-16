'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const ClaimTowerPage = () => {
  const supabase = createClient()
  const [round, setRound] = useState<number>(1)
  const [loading, setLoading] = useState(false)

  // ฟังก์ชันแปลงจาก "บ้าน 01" → "B1"
  const convertHouseToCode = (house: string): string => {
    const match = house.match(/บ้าน\s*(\d+)/)
    if (!match) return house
    return 'B' + parseInt(match[1], 10).toString()
  }

  const handleClaimTower = async () => {
    setLoading(true)

    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('node, house, type')
      .eq('round', round)
      .ilike('type', '%fort%')

    if (error || !purchases || purchases.length === 0) {
      alert('ไม่พบการซื้อ ป้อม ในรอบนี้')
      setLoading(false)
      return
    }

    for (const purchase of purchases) {
      const nodeId = purchase.node.toString()
      const convertedHouse = convertHouseToCode(purchase.house)

      const { error: updateError } = await supabase
        .from('nodes')
        .update({
          tower: true,
          towerOwner: convertedHouse,
        })
        .eq('id', nodeId)

      if (updateError) {
        console.error(`อัปเดต node ${nodeId} ล้มเหลว`, updateError)
      }
    }

    alert('อัปเดต ป้อม สำเร็จ')
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Update ป้อม</h1>

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

      <Button onClick={handleClaimTower} disabled={loading}>
        {loading ? 'กำลังอัปเดต...' : 'อัปเดตป้อม'}
      </Button>
    </div>
  )
}

export default ClaimTowerPage
