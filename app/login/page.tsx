'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const housePasswords: Record<string, string> = {
//   '01': 'alpha123',
//   '02': 'beta234',
//   '03': 'gamma345',
//   '04': 'delta456',
//   '05': 'epsilon567',
//   '06': 'zeta678',
//   '07': 'eta789',
//   '08': 'theta890',
//   '09': 'iota901',
//   '10': 'kappa012',
//   '11': 'lambda123',
//   '12': 'mu234',
  // '01': '01',
  // '02': '02',
  // '03': '03',
  // '04': '04',
  // '05': '05',
  // '06': '06',
  // '07': '07',
  // '08': '08',
  // '09': '09',
  // '10': '10',
  // '11': '11',
  // '12': '12',
  '01': '01gamebig',
  '02': '02gamebig',
  '03': '03gamebig',
  '04': '04gamebig',
  '05': '05gamebig',
  '06': '06gamebig',
  '07': '07gamebig',
  '08': '08gamebig',
  '09': '09gamebig',
  '10': '10gamebig',
  '11': '11gamebig',
  '12': '12gamebig',
}

export default function LoginPage() {
  const [house, setHouse] = useState('01')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = () => {
    if (password === housePasswords[house]) {
      sessionStorage.setItem('loggedInHouse', house)
      router.push(`/form/${house}`)
    } else {
      setError('รหัสไม่ถูกต้อง')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">เข้าสู่ระบบ</h1>

      <select
        value={house}
        onChange={(e) => {
          setHouse(e.target.value)
          setError('')
        }}
        className="border px-4 py-2 rounded"
      >
        {[...Array(12)].map((_, i) => {
          const id = String(i + 1).padStart(2, '0')
          return <option key={id} value={id}>บ้าน {id}</option>
        })}
      </select>

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border px-4 py-2 rounded w-64"
        placeholder="รหัสผ่าน"
      />

      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        เข้าสู่ระบบ
      </button>

      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
