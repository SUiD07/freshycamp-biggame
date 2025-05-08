'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function MoveForm({ house }: { house: string }) {
  const [round, setRound] = useState(1) // ผู้ใช้เลือก
  const [nodes, setNodes] = useState([{ node: 1, count: 1 }]) // ✅ array ของ node
  const [message, setMessage] = useState('')

  const handleNodeChange = (index: number, key: 'node' | 'count', value: number) => {
    const updated = [...nodes]
    updated[index][key] = value
    setNodes(updated)
  }

  const addNode = () => {
    setNodes([...nodes, { node: 1, count: 1 }])
  }

  const removeNode = (index: number) => {
    setNodes(nodes.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // ✅ ตรวจสอบว่าบ้านนี้ส่งรอบนี้แล้วหรือยัง
    const { data: existing } = await supabase
      .from('moves')
      .select('*')
      .eq('house', house)
      .eq('round', round)

    if (existing && existing.length > 0) {
      setMessage(`❌ บ้าน ${house} ส่งข้อมูลรอบนี้ไปแล้ว`)
      return
    }

    // ✅ เตรียมข้อมูล insert
    const insertData = nodes.map(n => ({
      node: n.node,
      count: n.count,
      round,
      house,
    }))

    const { error } = await supabase.from('moves').insert(insertData)
    setMessage(error ? '❌ เกิดข้อผิดพลาด' : '✅ บันทึกสำเร็จ')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>รอบ: </label>
        <input
          type="number"
          value={round}
          onChange={e => setRound(+e.target.value)}
          className="border px-2"
        />
      </div>

      {nodes.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div>
            <label>Node: </label>
            <input
              type="number"
              value={item.node}
              onChange={e => handleNodeChange(index, 'node', +e.target.value)}
              min={1}
              className="border px-2"
            />
          </div>
          <div>
            <label>จำนวนคน: </label>
            <input
              type="number"
              value={item.count}
              onChange={e => handleNodeChange(index, 'count', +e.target.value)}
              min={1}
              className="border px-2"
            />
          </div>
          <button
            type="button"
            onClick={() => removeNode(index)}
            className="text-red-500"
          >
            ลบ
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addNode}
        className="bg-green-500 text-white px-4 py-1 rounded"
      >
        ➕ เพิ่ม Node
      </button>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        ส่งข้อมูล
      </button>

      {message && <p>{message}</p>}
    </form>
  )
}
