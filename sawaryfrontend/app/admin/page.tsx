'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiGet } from '@/lib/api'

interface Stats {
  tags: number
  projects: number
  images: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    Promise.all([
      apiGet<{ length: number }>('/api/tags').catch(() => ({ length: 0 })),
      apiGet<Array<{ imageCount: number }>>('/api/projects').catch(() => []),
    ]).then(([tags, projects]) => {
      const tagArr = Array.isArray(tags) ? tags : []
      const projArr = Array.isArray(projects) ? projects : []
      setStats({
        tags: tagArr.length,
        projects: projArr.length,
        images: projArr.reduce((sum, p) => sum + (p.imageCount ?? 0), 0),
      })
    })
  }, [])

  const statCards = [
    { label: 'التاقات', value: stats?.tags ?? '—', href: '/admin/tags' },
    { label: 'المشاريع', value: stats?.projects ?? '—', href: '/admin/projects' },
    { label: 'الصور الإجمالية', value: stats?.images ?? '—', href: '/admin/projects' },
  ]

  return (
    <div dir="rtl">
      <h1 className="mb-8 text-2xl font-bold text-[rgb(240,238,232)]">الرئيسية</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map(card => (
          <Link
            key={card.label}
            href={card.href}
            aria-label={`${card.label}: ${card.value}`}
            className="rounded-sm border border-brand-primary/20 p-6 transition-colors hover:border-brand-primary/50"
            style={{ background: 'rgb(42,43,39)' }}
          >
            <p className="mb-2 text-xs tracking-widest text-brand-primary" aria-hidden>{card.label}</p>
            <p className="text-4xl font-bold text-[rgb(240,238,232)]" aria-hidden>{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12 flex gap-4">
        <Link
          href="/admin/projects/new"
          className="rounded-sm bg-brand-primary px-6 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          + مشروع جديد
        </Link>
        <Link
          href="/admin/tags"
          className="rounded-sm border border-brand-primary/40 px-6 py-3 text-sm text-brand-primary hover:bg-brand-primary/10"
        >
          إدارة التاقات
        </Link>
      </div>
    </div>
  )
}
