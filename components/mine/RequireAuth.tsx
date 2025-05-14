'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, ReactNode } from 'react'

export function RequireHouseAuth({
  expectedHouse,
  children
}: {
  expectedHouse: string
  children: ReactNode
}) {
  const [allowed, setAllowed] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const house = sessionStorage.getItem('loggedInHouse')

    if (house === expectedHouse) {
      setAllowed(true)
    } else {
      router.replace('/login')
    }

    setLoading(false)
  }, [expectedHouse, router])

  if (loading) return <p className="text-center">กำลังโหลด...</p>
  if (!allowed) return null

  return <>{children}</>
}
