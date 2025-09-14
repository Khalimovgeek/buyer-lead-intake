'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleLogin() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', { method: 'POST' })
      if (!res.ok) throw new Error('Login failed')
      const data = await res.json()
      // Store token in cookie (simple example using document.cookie)
      document.cookie = `auth_token=${data.token}; path=/`
      router.push('/buyers')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Login Demo</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Login as Demo User'}
      </button>
    </main>
  )
}
