'use client'

import { useEffect, useState, FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { apiGet, apiPost, apiDelete, apiUpload } from '@/lib/api'
import { type ApiServiceSection } from '@/lib/services'

export default function AdminServicesPage() {
  const [sections, setSections] = useState<ApiServiceSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [titleAr, setTitleAr] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [descriptionAr, setDescriptionAr] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [orderIndex, setOrderIndex] = useState(0)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
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

  function handleImageChange(file: File | null) {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(file)
    setImagePreview(file ? URL.createObjectURL(file) : '')
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setCreateError('')
    setCreating(true)
    try {
      const created = await apiPost<ApiServiceSection>('/api/service-sections', { titleAr,titleEn, descriptionAr,descriptionEn, orderIndex })
      // The image goes to the existing hero endpoint once the section has an id.
      if (imageFile) {
        const form = new FormData()
        form.append('image', imageFile)
        try {
          await apiUpload(`/api/service-sections/${created.id}/hero`, form)
        } catch (err) {
          setCreateError(`تم إنشاء القسم لكن تعذّر رفع الصورة${err instanceof Error ? `: ${err.message}` : ''} — يمكنك رفعها من صفحة التعديل.`)
        }
      }
      setTitleAr(''); setTitleEn(''); setDescriptionAr(''); setDescriptionEn(''); setOrderIndex(0)
      handleImageChange(null)
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
            <label className="mb-1 block text-xs text-[rgb(240,238,232)]/60">العنوان (العربية)</label>
            <input
              value={titleAr}
              onChange={e => setTitleAr(e.target.value)}
              required
              className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-[rgb(240,238,232)]/60">العنوان (الإنجليزية)</label>
            <input
              value={titleEn}
              onChange={e => setTitleEn(e.target.value)}
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
          <label className="mb-1 block text-xs text-[rgb(240,238,232)]/60">الوصف (العربية)</label>
          <textarea
            value={descriptionAr}
            onChange={e => setDescriptionAr(e.target.value)}
            rows={3}
            className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary"
          />
        </div>
                <div className="mb-4">
          <label className="mb-1 block text-xs text-[rgb(240,238,232)]/60">الوصف (الإنجليزية)</label>
          <textarea
            value={descriptionEn}
            onChange={e => setDescriptionEn(e.target.value)}
            rows={3}
            className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary"
          />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-xs text-[rgb(240,238,232)]/60">صورة الخدمة (اختياري — jpg, png, webp حتى 20MB)</label>
          <input
            // Remount when the selection is cleared so the native input forgets the old file.
            key={imageFile ? 'selected' : 'empty'}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={e => handleImageChange(e.target.files?.[0] ?? null)}
            className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2 text-sm text-[rgb(240,238,232)] outline-none file:ml-3 file:rounded-sm file:border-0 file:bg-brand-primary file:px-3 file:py-1.5 file:text-xs file:text-white focus:border-brand-primary"
          />
          {imagePreview && (
            <div className="relative mt-3 h-32 w-48 overflow-hidden rounded-sm border border-brand-primary/20">
              <Image src={imagePreview} alt="" fill className="object-cover" sizes="192px" unoptimized />
              <button
                type="button"
                onClick={() => handleImageChange(null)}
                className="absolute left-1.5 top-1.5 rounded-sm bg-black/60 px-2 py-0.5 text-xs text-white hover:bg-black/80"
              >
                إزالة
              </button>
            </div>
          )}
        </div>
        {createError &&<p className="mb-3 text-sm" style={{ color: '#e07070' }}>{createError}</p>}
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
