'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5298'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError((data as { message?: string }).message ?? 'بيانات الدخول غير صحيحة')
        return
      }

      const data = await res.json()
      localStorage.setItem('sawary_token', data.token)
      localStorage.setItem('sawary_username', data.username)
      router.push('/admin')
    } catch {
      setError('تعذّر الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-brand-bg"
      dir="rtl"
    >
      <div className="w-full max-w-sm">
        {/* Logo / title */}
        <div className="mb-10 text-center">
          <h1
            className="font-display text-4xl font-bold"
            style={{ color: 'rgb(140, 112, 76)' }}
          >
            سواري
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(240,238,232,0.5)' }}>
            لوحة الإدارة
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-sm border border-brand-primary/20 p-8"
          style={{ background: 'rgb(42, 43, 39)' }}
        >
          <div className="mb-5">
            <label className="mb-1.5 block text-xs tracking-widest text-brand-primary">
              اسم المستخدم
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-4 py-3 text-sm text-[rgb(240,238,232)] outline-none transition-colors focus:border-brand-primary"
            />
          </div>

          <div className="mb-6">
            <label className="mb-1.5 block text-xs tracking-widest text-brand-primary">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-4 py-3 text-sm text-[rgb(240,238,232)] outline-none transition-colors focus:border-brand-primary"
            />
          </div>

          {error && (
            <p className="mb-4 text-center text-sm" style={{ color: '#e07070' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-brand-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? '...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  )
}
