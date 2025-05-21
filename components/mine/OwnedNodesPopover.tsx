"use client"

import { useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Fight = {
  house: string
  count: number
}

type Node = {
  id: string
  selectedcar?: string | null
  fight?: Fight[]
  value:string
}

export default function OwnedNodePopover({ houseId }: { houseId: string }) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fetchNodes = async () => {
      const { data, error } = await supabase.from("nodes").select("*")
      if (error) {
        console.error("Failed to fetch nodes:", error)
      } else {
        setNodes(data)
      }
      setLoading(false)
    }

    fetchNodes()
  }, [])

  // node ที่เจ้าของเป็นบ้านเรา
  const ownedNodes = nodes.filter((node) => node.selectedcar === houseId)

  // node ที่กำลังมี fight และบ้านเราอยู่ใน fight นั้น
  const fightingNodes = nodes.filter(
    (node) => node.fight?.some((f) => f.house === houseId)
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          {loading ? "กำลังโหลด..." : "ดู Node ที่เป็นเจ้าของและสู้กัน"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="bg-white shadow-lg rounded p-4 max-w-sm max-h-60 overflow-auto">
        <h4 className="font-bold mb-2">Node ที่บ้าน {houseId} เป็นเจ้าของ:</h4>
        {ownedNodes.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1 mb-4">
            {ownedNodes.map((node) => (
              <li key={node.id}>Node {node.id} - คนในจุดนี้: {node.value ?? "0"} คน</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 mb-4">ยังไม่มี node ที่คุณเป็นเจ้าของ</p>
        )}

        <h4 className="font-bold mb-2">Node ที่กำลังสู้กัน:</h4>
        {fightingNodes.length > 0 ? (
          <ul className="list-disc pl-5 space-y-2">
            {fightingNodes.map((node) => {
              // ข้อมูล fight ทั้งหมดใน node นั้น
              const fightList = node.fight || []

              // ฝ่ายบ้านเรา
              const ourFight = fightList.find((f) => f.house === houseId)

              // ฝ่ายตรงข้ามทั้งหมด (บ้านอื่นๆ ใน fight)
              const enemies = fightList.filter((f) => f.house !== houseId)

              return (
                <li key={node.id}>
                  <strong>Node {node.id}</strong> <br />
                  - บ้านเรา: {ourFight?.count ?? 0} คน <br />
                  - ฝ่ายตรงข้าม:{" "}
                  {enemies.length > 0 ? (
                    enemies.map((enemy, idx) => (
                      <span key={enemy.house}>
                        {enemy.house} ({enemy.count} คน)
                        {idx < enemies.length - 1 ? ", " : ""}
                      </span>
                    ))
                  ) : (
                    <span>ไม่มีฝ่ายตรงข้าม</span>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-gray-500">ไม่มีการสู้ในขณะนี้</p>
        )}
      </PopoverContent>
    </Popover>
  )
}
