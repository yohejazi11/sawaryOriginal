'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import '../globals.css'
import { zawi } from '@/lib/fonts'

// Reads the JWT's `exp` claim client-side (no signature check — the API is still the
// authority on validity) purely to decide whether the admin shell should render at all.
// Without this, a merely-present-but-expired token in localStorage would pass the old
// `if (!token)` check and briefly show the full admin UI before the first API call 401s.
function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1]
    if (!payload) return true
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const { exp } = JSON.parse(json) as { exp?: number }
    return !exp || exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const [username, setUsername] = useState('')

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    // Login page never needs a token — render it immediately
    if (isLoginPage) {
      setReady(true)
      return
    }

    const token = localStorage.getItem('sawary_token')
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('sawary_token')
      localStorage.removeItem('sawary_username')
      router.replace('/admin/login')
      return
    }

    setUsername(localStorage.getItem('sawary_username') ?? 'admin')
    setReady(true)
  }, [router, isLoginPage])

  const navLinks = [
    { href: '/admin',            label: 'الرئيسية'    },
    { href: '/admin/tags',       label: 'التاقات'      },
    { href: '/admin/projects',   label: 'المشاريع'    },
    { href: '/admin/services',   label: 'الخدمات'     },
    { href: '/admin/about',      label: 'صفحة من نحن' },
    { href: '/admin/contact',    label: 'التواصل والسوشال' },
  ]

  return (
    <html lang="ar" dir="rtl" className={`${zawi.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full font-sans">
        {!ready ? (
          <div className="min-h-screen bg-brand-bg" />
        ) : isLoginPage ? (
          children
        ) : (
          <div className="flex min-h-screen bg-brand-bg" dir="rtl">
            {/* Sidebar */}
            <aside
              className="flex w-56 shrink-0 flex-col border-l border-brand-primary/15"
              style={{ background: 'rgb(38, 39, 35)' }}
            >
              <div className="px-6 py-7">
                <span className="font-display text-2xl font-bold text-brand-primary">سواري</span>
              </div>

              <nav className="flex flex-col gap-1 px-3">
                {navLinks.map(link => {
                  const active =
                    pathname === link.href ||
                    (link.href !== '/admin' && pathname.startsWith(link.href))
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-sm px-4 py-2.5 text-sm transition-colors"
                      style={{
                        background: active ? 'rgba(140,112,76,0.15)' : 'transparent',
                        color: active ? 'rgb(140,112,76)' : 'rgba(240,238,232,0.65)',
                      }}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-auto border-t border-brand-primary/15 px-6 py-5">
                <p className="mb-3 text-xs text-[rgb(240,238,232)]/40">{username}</p>
                <button
                  onClick={() => {
                    localStorage.removeItem('sawary_token')
                    localStorage.removeItem('sawary_username')
                    router.replace('/admin/login')
                  }}
                  className="w-full rounded-sm border border-brand-primary/30 py-2 text-xs text-brand-primary transition-colors hover:bg-brand-primary/10"
                >
                  تسجيل الخروج
                </button>
              </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto p-8">{children}</main>
          </div>
        )}
      </body>
    </html>
  )
}
