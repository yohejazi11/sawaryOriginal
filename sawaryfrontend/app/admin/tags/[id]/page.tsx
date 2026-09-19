'use client'

import { use, useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiGet, apiPut } from '@/lib/api'

interface Tag {
  id: number
  nameAr: string
  nameEn: string
  slug: string
  orderIndex: number
}

export default function EditTagPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [tag, setTag] = useState<Tag | null>(null)
  const [loadError, setLoadError] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [slug, setSlug] = useState('')
  const [originalSlug, setOriginalSlug] = useState('')
  const [orderIndex, setOrderIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    apiGet<Tag>(`/api/tags/${id}`).then(tg => {
      if (!tg) return
      setTag(tg)
      setNameAr(tg.nameAr)
      setNameEn(tg.nameEn)
      setSlug(tg.slug)
      setOriginalSlug(tg.slug)
      setOrderIndex(tg.orderIndex)
    }).catch(() => setLoadError('تعذّر تحميل التاق — تأكد من وجوده.'))
  }, [id])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)
    try {
      // Only send the slug if it actually changed — changing it rewrites every URL
      // pointing at this tag, so it must be a deliberate edit, not an accidental resend.
      const payload: Record<string, unknown> = { nameAr, nameEn, orderIndex }
      if (slug !== originalSlug) payload.slug = slug
      await apiPut(`/api/tags/${id}`, payload)
      setOriginalSlug(slug)
      setSuccess(true)
      setTimeout(() => router.push('/admin/tags'), 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في الحفظ')
    } finally {
      setSaving(false)
    }
  }

  if (loadError) return <p className="p-8 text-sm" style={{ color: '#e07070' }}>{loadError}</p>
  if (!tag) return <p className="p-8 text-[rgb(240,238,232)]/50">جارٍ التحميل…</p>

  return (
    <div dir="rtl">
      <div className="mb-8 flex items-center gap-3">
        <Link href="/admin/tags" className="text-xs text-brand-primary hover:underline">
          التاقات →
        </Link>
        <h1 className="text-2xl font-bold text-[rgb(240,238,232)]">تعديل التاق</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-lg rounded-sm border border-brand-primary/20 p-6"
        style={{ background: 'rgb(42,43,39)' }}
      >
        <div className="mb-4">
          <label className="mb-1.5 block text-xs text-[rgb(240,238,232)]/60">الاسم بالعربي</label>
          <input
            value={nameAr}
            onChange={e => setNameAr(e.target.value)}
            required
            className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2.5 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary"
          />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-xs text-[rgb(240,238,232)]/60">الاسم بالإنجليزي</label>
          <input
            value={nameEn}
            onChange={e => setNameEn(e.target.value)}
            required
            dir="ltr"
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
              تنبيه: تغيير الرابط يكسر أي رابط قديم أو صفحة ثابتة تشير لهذا التاق بالرابط الحالي ({originalSlug}).
            </p>
          )}
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
