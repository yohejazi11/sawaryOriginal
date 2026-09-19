'use client'

import { useEffect, useState, FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { apiGet, apiPost, apiDelete } from '@/lib/api'
import { type ApiServiceSection } from '@/lib/services'

export default function AdminServicesPage() {
  const [sections, setSections] = useState<ApiServiceSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [orderIndex, setOrderIndex] = useState(0)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const data = await apiGet<ApiServiceSection[]>('/api/service-sections')
      setSections(data)
    } catch {
      setError('تعذّر تحميل أقسام الخدمات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setCreateError('')
    setCreating(true)
    try {
      await apiPost('/api/service-sections', { title, description, orderIndex })
      setTitle(''); setDescription(''); setOrderIndex(0)
      await load()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'خطأ في الإنشاء')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('هل أنت متأكد من حذف هذا القسم وجميع بطاقاته؟')) return
    try {
      await apiDelete(`/api/service-sections/${id}`)
      setSections(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'تعذّر الحذف')
    }
  }

  return (
    <div dir="rtl">
      <h1 className="mb-8 text-2xl font-bold text-[rgb(240,238,232)]">أقسام الخدمات</h1>

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="mb-10 rounded-sm border border-brand-primary/20 p-6"
        style={{ background: 'rgb(42,43,39)' }}
      >
        <h2 className="mb-5 text-sm font-medium text-brand-primary">قسم جديد</h2>
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-[rgb(240,238,232)]/60">العنوان</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[rgb(240,238,232)]/60">الترتيب</label>
            <input
              type="number"
              value={orderIndex}
              onChange={e => setOrderIndex(Number(e.target.value))}
              className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-xs text-[rgb(240,238,232)]/60">الوصف</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary"
          />
        </div>
        {createError && <p className="mb-3 text-sm" style={{ color: '#e07070' }}>{createError}</p>}
        <button
          type="submit"
          disabled={creating}
          className="rounded-sm bg-brand-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {creating ? '...' : 'إضافة'}
        </button>
      </form>

      {/* List */}
      {loading ? (
        <p className="text-[rgb(240,238,232)]/50">جارٍ التحميل…</p>
      ) : error ? (
        <p style={{ color: '#e07070' }}>{error}</p>
      ) : sections.length === 0 ? (
        <p className="text-[rgb(240,238,232)]/40">لا توجد أقسام بعد</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sections.map(s => (
            <div
              key={s.id}
              className="flex items-center gap-4 rounded-sm border border-brand-primary/20 p-4"
              style={{ background: 'rgb(42,43,39)' }}
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm border border-brand-primary/20 bg-brand-bg">
                {s.heroImageUrl && (
                  <Image src={s.heroImageUrl} alt="" width={64} height={64} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[rgb(240,238,232)]">{s.title}</p>
                <p className="text-xs text-[rgb(240,238,232)]/50">
                  {s.cards.length > 0 ? `${s.cards.length} بطاقة` : 'لا توجد بطاقات — سيظهر "قريباً"'}
                </p>
              </div>
              <div className="flex gap-3">
                <Link href={`/admin/services/${s.id}`} className="text-xs text-brand-primary hover:underline">تعديل</Link>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-xs hover:underline"
                  style={{ color: '#e07070' }}
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
