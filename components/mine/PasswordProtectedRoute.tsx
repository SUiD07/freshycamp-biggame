// components/PasswordProtectedRoute.tsx
'use client'

import { useState, createContext, useContext, ReactNode } from 'react'

const PASSWORD = 'PASSWORD'

const AuthContext = createContext({
  isAuthenticated: false,
  setAuthenticated: (auth: boolean) => {},
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setAuthenticated] = useState(false)

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

export const PasswordProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, setAuthenticated } = useAuth()
  const [password, setPassword] = useState('')

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="mb-2">🔐 รหัสผ่าน:</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2"
        />
        <button
          onClick={() => {
            if (password === PASSWORD) {
              console.log('✅ Correct password')
              setAuthenticated(true)
            } else {
              alert('❌ รหัสไม่ถูกต้อง')
            }
          }}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          เข้าสู่ระบบ
        </button>
      </div>
    )
  }

  return <>{children}</>
}
