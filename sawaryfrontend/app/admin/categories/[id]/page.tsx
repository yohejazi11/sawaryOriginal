'use client'

import { use, useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiGet, apiPut } from '@/lib/api'

interface Category {
  id: number
  name: string
  slug: string
  type: string
  orderIndex: number
}

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [loadError, setLoadError] = useState('')
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [originalSlug, setOriginalSlug] = useState('')
  const [type, setType] = useState('')
  const [orderIndex, setOrderIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    apiGet<Category>(`/api/categories/${id}`).then(cat => {
      if (!cat) return
      setCategory(cat)
      setName(cat.name)
      setSlug(cat.slug)
      setOriginalSlug(cat.slug)
      setType(cat.type)
      setOrderIndex(cat.orderIndex)
    }).catch(() => setLoadError('تعذّر تحميل التصنيف — تأكد من وجوده.'))
  }, [id])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)
    try {
      // Only send the slug if it actually changed — changing it rewrites every URL
      // pointing at this category, so it must be a deliberate edit, not an accidental resend.
      const payload: Record<string, unknown> = { name, type, orderIndex }
      if (slug !== originalSlug) payload.slug = slug
      await apiPut(`/api/categories/${id}`, payload)
      setOriginalSlug(slug)
      setSuccess(true)
      setTimeout(() => router.push('/admin/categories'), 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في الحفظ')
    } finally {
      setSaving(false)
    }
  }

  if (loadError) return <p className="p-8 text-sm" style={{ color: '#e07070' }}>{loadError}</p>
  if (!category) return <p className="p-8 text-[rgb(240,238,232)]/50">جارٍ التحميل…</p>

  return (
    <div dir="rtl">
      <div className="mb-8 flex items-center gap-3">
        <Link href="/admin/categories" className="text-xs text-brand-primary hover:underline">
          التصنيفات →
        </Link>
        <h1 className="text-2xl font-bold text-[rgb(240,238,232)]">تعديل التصنيف</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-lg rounded-sm border border-brand-primary/20 p-6"
        style={{ background: 'rgb(42,43,39)' }}
      >
        <div className="mb-4">
          <label className="mb-1.5 block text-xs text-[rgb(240,238,232)]/60">الاسم</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2.5 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary"
          />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-xs text-[rgb(240,238,232)]/60">الرابط (slug)</label>
          <input
            value={slug}
            onChange={e => setSlug(e.target.value)}
            dir="ltr"
            className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2.5 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary"
          />
          {slug !== originalSlug && (
            <p className="mt-1.5 text-xs" style={{ color: '#e0a070' }}>
              تنبيه: تغيير الرابط يكسر أي رابط قديم أو صفحة ثابتة تشير لهذا التصنيف بالرابط الحالي ({originalSlug}).
            </p>
          )}
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-xs text-[rgb(240,238,232)]/60">النوع</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2.5 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary"
          >
            <option value="execution">execution</option>
            <option value="design">design</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="mb-1.5 block text-xs text-[rgb(240,238,232)]/60">الترتيب</label>
          <input
            type="number"
            value={orderIndex}
            onChange={e => setOrderIndex(Number(e.target.value))}
            className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2.5 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary"
          />
        </div>

        {error && <p className="mb-4 text-sm" style={{ color: '#e07070' }}>{error}</p>}
        {success && <p className="mb-4 text-sm text-brand-primary">تم الحفظ بنجاح ✓</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-sm bg-brand-primary px-8 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? '...' : 'حفظ'}
        </button>
      </form>
    </div>
  )
}
