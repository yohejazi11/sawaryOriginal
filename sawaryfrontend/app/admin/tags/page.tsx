'use client'

import { useEffect, useState, FormEvent } from 'react'
import Link from 'next/link'
import { apiGet, apiPost, apiDelete } from '@/lib/api'

interface Tag {
  id: number
  nameAr: string
  nameEn: string
  slug: string
  orderIndex: number
  projectCount: number
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [nameAr, setNameAr] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [slug, setSlug] = useState('')
  const [orderIndex, setOrderIndex] = useState(0)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const data = await apiGet<Tag[]>('/api/tags')
      setTags(data)
    } catch {
      setError('تعذّر تحميل التاقات')
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
      await apiPost('/api/tags', { nameAr, nameEn, orderIndex, slug: slug || undefined })
      setNameAr(''); setNameEn(''); setSlug(''); setOrderIndex(0)
      await load()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'خطأ في الإنشاء')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('هل أنت متأكد من الحذف؟ سيُزال هذا التاق من كل المشاريع المرتبطة به.')) return
    try {
      await apiDelete(`/api/tags/${id}`)
      setTags(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'تعذّر الحذف')
    }
  }

  return (
    <div dir="rtl">
      <h1 className="mb-8 text-2xl font-bold text-[rgb(240,238,232)]">التاقات</h1>

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="mb-10 rounded-sm border border-brand-primary/20 p-6"
        style={{ background: 'rgb(42,43,39)' }}
      >
        <h2 className="mb-5 text-sm font-medium text-brand-primary">تاق جديد</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-[rgb(240,238,232)]/60">الاسم بالعربي</label>
            <input
              value={nameAr}
              onChange={e => setNameAr(e.target.value)}
              required
              onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('يرجى ملء هذا الحقل.')}
              onInput={e => (e.target as HTMLInputElement).setCustomValidity('')}
              className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[rgb(240,238,232)]/60">الاسم بالإنجليزي</label>
            <input
              value={nameEn}
              onChange={e => setNameEn(e.target.value)}
              required
              dir="ltr"
              onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('يرجى ملء هذا الحقل.')}
              onInput={e => (e.target as HTMLInputElement).setCustomValidity('')}
              className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[rgb(240,238,232)]/60">الرابط (slug)</label>
            <input
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="يُنشأ تلقائياً من الاسم الإنجليزي"
              dir="ltr"
              className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2 text-sm text-[rgb(240,238,232)] outline-none placeholder:text-[rgb(240,238,232)]/30 focus:border-brand-primary"
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
        <p className="mt-3 text-xs text-[rgb(240,238,232)]/40">
          للتاقات الأساسية اللي تعتمد عليها صفحات الخدمات، استخدم هذي الروابط بالضبط: commercial، residential، design.
        </p>
        {createError && <p className="mt-3 text-sm" style={{ color: '#e07070' }}>{createError}</p>}
        <button
          type="submit"
          disabled={creating}
          className="mt-4 rounded-sm bg-brand-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {creating ? '...' : 'إضافة'}
        </button>
      </form>

      {/* Table */}
      {loading ? (
        <p className="text-[rgb(240,238,232)]/50">جارٍ التحميل…</p>
      ) : error ? (
        <p style={{ color: '#e07070' }}>{error}</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-primary/20 text-right text-xs text-brand-primary">
              <th className="pb-3">الاسم</th>
              <th className="pb-3">الرابط</th>
              <th className="pb-3">المشاريع</th>
              <th className="pb-3">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {tags.map(tg => (
              <tr key={tg.id} className="border-b border-brand-primary/10 text-[rgb(240,238,232)]">
                <td className="py-3">{tg.nameAr} / {tg.nameEn}</td>
                <td className="py-3 text-xs text-[rgb(240,238,232)]/50" dir="ltr">{tg.slug}</td>
                <td className="py-3">{tg.projectCount}</td>
                <td className="py-3 flex gap-3">
                  <Link href={`/admin/tags/${tg.id}`} className="text-brand-primary hover:underline text-xs">تعديل</Link>
                  <button
                    onClick={() => handleDelete(tg.id)}
                    className="text-xs hover:underline"
                    style={{ color: '#e07070' }}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
