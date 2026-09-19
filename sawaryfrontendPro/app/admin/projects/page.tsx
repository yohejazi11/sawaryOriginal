'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { apiGet, apiDelete, apiPatch } from '@/lib/api'

interface ProjectItem {
  id: number
  name: string
  year: string
  isFeatured: boolean
  coverImageUrl: string
  category: { id: number; name: string }
  imageCount: number
}

interface Category {
  id: number
  name: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [catFilter, setCatFilter] = useState('')
  const [loading, setLoading] = useState(true)

  async function load(categoryId?: string) {
    setLoading(true)
    const qs = categoryId ? `?categoryId=${categoryId}` : ''
    const [projs, cats] = await Promise.all([
      apiGet<ProjectItem[]>(`/api/projects${qs}`).catch(() => []),
      apiGet<Category[]>('/api/categories').catch(() => []),
    ])
    setProjects(projs)
    setCategories(cats)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function handleFilter(categoryId: string) {
    setCatFilter(categoryId)
    load(categoryId || undefined)
  }

  async function toggleFeatured(id: number) {
    const res = await apiPatch<{ isFeatured: boolean }>(`/api/projects/${id}/featured`)
    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, isFeatured: res?.isFeatured ?? !p.isFeatured } : p)),
    )
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`حذف مشروع "${name}"؟`)) return
    try {
      await apiDelete(`/api/projects/${id}`)
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'تعذّر حذف المشروع، يرجى المحاولة مجدداً.')
    }
  }

  return (
    <div dir="rtl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[rgb(240,238,232)]">المشاريع</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/projects/bulk-import"
            className="rounded-sm border border-brand-primary/40 px-5 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10"
          >
            + استيراد جماعي
          </Link>
          <Link
            href="/admin/projects/new"
            className="rounded-sm bg-brand-primary px-5 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            + مشروع جديد
          </Link>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={catFilter}
          onChange={e => handleFilter(e.target.value)}
          className="rounded-sm border border-brand-primary/25 bg-brand-bg px-4 py-2 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary"
        >
          <option value="">كل التصنيفات</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-[rgb(240,238,232)]/50">جارٍ التحميل…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-primary/20 text-right text-xs text-brand-primary">
                <th className="pb-3">الصورة</th>
                <th className="pb-3">الاسم</th>
                <th className="pb-3">التصنيف</th>
                <th className="pb-3">السنة</th>
                <th className="pb-3">مميز</th>
                <th className="pb-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} className="border-b border-brand-primary/10 text-[rgb(240,238,232)]">
                  <td className="py-3">
                    <div className="h-[60px] w-[60px] overflow-hidden rounded-sm bg-brand-primary/10">
                      {p.coverImageUrl ? (
                        <Image
                          src={p.coverImageUrl}
                          alt={p.name}
                          width={60}
                          height={60}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-brand-primary/30 text-xs">—</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 font-medium">{p.name}</td>
                  <td className="py-3 text-xs text-[rgb(240,238,232)]/60">{p.category?.name}</td>
                  <td className="py-3 text-xs text-[rgb(240,238,232)]/60">{p.year}</td>
                  <td className="py-3">
                    <button
                      onClick={() => toggleFeatured(p.id)}
                      className="relative h-5 w-9 rounded-full transition-colors"
                      style={{ background: p.isFeatured ? 'rgb(140,112,76)' : 'rgba(140,112,76,0.2)' }}
                      title={p.isFeatured ? 'إلغاء التمييز' : 'تمييز'}
                    >
                      <span
                        className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all"
                        style={{ right: p.isFeatured ? '2px' : '18px' }}
                      />
                    </button>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-3">
                      <Link href={`/admin/projects/${p.id}`} className="text-xs text-brand-primary hover:underline">تعديل</Link>
                      <Link href={`/admin/projects/${p.id}/images`} className="text-xs text-[rgb(240,238,232)]/50 hover:text-brand-primary hover:underline">الصور</Link>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="text-xs hover:underline"
                        style={{ color: '#e07070' }}
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {projects.length === 0 && (
            <p className="py-8 text-center text-sm text-[rgb(240,238,232)]/40">لا توجد مشاريع</p>
          )}
        </div>
      )}
    </div>
  )
}
