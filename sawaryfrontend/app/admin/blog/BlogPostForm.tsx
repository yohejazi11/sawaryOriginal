'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { apiFetch, apiPost, apiUpload } from '@/lib/api'
import { type ApiBlogPost } from '@/lib/blog'

const inputClass =
  'w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2.5 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary'
const labelClass = 'mb-1.5 block text-xs text-[rgb(240,238,232)]/60'
const cardStyle = { background: 'rgb(42,43,39)' }

// Shared by /admin/blog/new (no `initial`) and /admin/blog/[id] (editing).
// The cover image is optional on create — it's uploaded right after the post is saved.
export default function BlogPostForm({ initial }: { initial?: ApiBlogPost }) {
  const router = useRouter()
  const isEdit = !!initial

  const [titleAr, setTitleAr] = useState(initial?.titleAr ?? '')
  const [titleEn, setTitleEn] = useState(initial?.titleEn ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [excerptAr, setExcerptAr] = useState(initial?.excerptAr ?? '')
  const [excerptEn, setExcerptEn] = useState(initial?.excerptEn ?? '')
  const [contentAr, setContentAr] = useState(initial?.contentAr ?? '')
  const [contentEn, setContentEn] = useState(initial?.contentEn ?? '')
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false)
  const [coverUrl, setCoverUrl] = useState(initial?.coverImageUrl ?? '')

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function handleCoverChange(file: File | null) {
    if (coverPreview) URL.revokeObjectURL(coverPreview)
    setCoverFile(file)
    setCoverPreview(file ? URL.createObjectURL(file) : '')
  }

  async function uploadCover(postId: number) {
    if (!coverFile) return
    const form = new FormData()
    form.append('image', coverFile)
    const result = await apiUpload<{ coverImageUrl: string }>(`/api/blog/${postId}/cover`, form)
    setCoverUrl(result.coverImageUrl)
    handleCoverChange(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)

    const body = {
      titleAr, titleEn,
      slug: slug.trim() || null,
      excerptAr, excerptEn,
      contentAr, contentEn,
      isPublished,
    }

    try {
      if (isEdit) {
        const res = await apiFetch(`/api/blog/${initial.id}`, { method: 'PUT', body: JSON.stringify(body) })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error((err as { message?: string }).message ?? 'خطأ في الحفظ')
        }
        const saved = (await res.json()) as ApiBlogPost
        setSlug(saved.slug)
        await uploadCover(initial.id)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 1500)
      } else {
        const created = await apiPost<ApiBlogPost>('/api/blog', body)
        await uploadCover(created.id)
        router.replace(`/admin/blog/${created.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في الحفظ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-4xl flex-col gap-6">
      {/* Titles + slug */}
      <div className="rounded-sm border border-brand-primary/20 p-6" style={cardStyle}>
        <h2 className="mb-5 text-sm font-medium text-brand-primary">العنوان والرابط</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>العنوان (العربية)</label>
            <input dir="rtl" value={titleAr} onChange={e => setTitleAr(e.target.value)} required maxLength={250} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>العنوان (الإنجليزية)</label>
            <input dir="ltr" value={titleEn} onChange={e => setTitleEn(e.target.value)} required maxLength={250} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>الرابط (slug) — اختياري، يُنشأ تلقائياً من العنوان الإنجليزي</label>
            <input dir="ltr" value={slug} onChange={e => setSlug(e.target.value)} maxLength={200} placeholder="my-article-title" className={inputClass} />
            {slug && (
              <p className="mt-1.5 text-xs text-[rgb(240,238,232)]/40" dir="ltr">/blog/{slug}</p>
            )}
          </div>
        </div>
      </div>

      {/* Cover */}
      <div className="rounded-sm border border-brand-primary/20 p-6" style={cardStyle}>
        <h2 className="mb-5 text-sm font-medium text-brand-primary">صورة الغلاف</h2>
        {(coverPreview || coverUrl) && (
          <div className="relative mb-4 h-56 w-full overflow-hidden rounded-sm border border-brand-primary/20">
            <Image src={coverPreview || coverUrl} alt="" fill className="object-cover" sizes="900px" unoptimized={!!coverPreview} />
          </div>
        )}
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={e => handleCoverChange(e.target.files?.[0] ?? null)}
          className={`${inputClass} file:ml-3 file:rounded-sm file:border-0 file:bg-brand-primary file:px-3 file:py-1.5 file:text-xs file:text-white`}
        />
        <p className="mt-2 text-xs text-[rgb(240,238,232)]/40">تُرفع الصورة عند الضغط على حفظ. (jpg, png, webp — حتى 20MB)</p>
      </div>

      {/* Excerpt */}
      <div className="rounded-sm border border-brand-primary/20 p-6" style={cardStyle}>
        <h2 className="mb-5 text-sm font-medium text-brand-primary">المقتطف (يظهر في قائمة المقالات ونتائج البحث)</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>المقتطف (العربية)</label>
            <textarea dir="rtl" value={excerptAr} onChange={e => setExcerptAr(e.target.value)} rows={3} maxLength={600} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>المقتطف (الإنجليزية)</label>
            <textarea dir="ltr" value={excerptEn} onChange={e => setExcerptEn(e.target.value)} rows={3} maxLength={600} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-sm border border-brand-primary/20 p-6" style={cardStyle}>
        <h2 className="mb-2 text-sm font-medium text-brand-primary">المحتوى</h2>
        <p className="mb-5 text-xs leading-relaxed text-[rgb(240,238,232)]/45">
          سطر فارغ = فقرة جديدة · ابدأ السطر بـ <code dir="ltr">## </code> لعنوان فرعي · ابدأ الأسطر بـ <code dir="ltr">- </code> لقائمة نقطية.
          إذا تُرك المحتوى الإنجليزي فارغاً يُعرض المحتوى العربي في النسخة الإنجليزية.
        </p>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>المحتوى (العربية) *</label>
            <textarea dir="rtl" value={contentAr} onChange={e => setContentAr(e.target.value)} required rows={16} className={`${inputClass} leading-relaxed`} />
          </div>
          <div>
            <label className={labelClass}>المحتوى (الإنجليزية)</label>
            <textarea dir="ltr" value={contentEn} onChange={e => setContentEn(e.target.value)} rows={16} className={`${inputClass} leading-relaxed`} />
          </div>
        </div>
      </div>

      {/* Publish + save */}
      <div className="flex flex-wrap items-center gap-6 rounded-sm border border-brand-primary/20 p-6" style={cardStyle}>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-[rgb(240,238,232)]">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={e => setIsPublished(e.target.checked)}
            className="h-4 w-4 accent-[rgb(190,156,100)]"
          />
          منشور (يظهر في الموقع)
        </label>

        <button
          type="submit"
          disabled={saving}
          className="rounded-sm bg-brand-primary px-8 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? '...' : isEdit ? 'حفظ التعديلات' : 'إنشاء المقال'}
        </button>

        {isEdit && initial.isPublished && slug && (
          <a href={`/blog/${slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-primary hover:underline">
            عرض في الموقع ↗
          </a>
        )}

        {error && <p className="w-full text-sm" style={{ color: '#e07070' }}>{error}</p>}
        {success && <p className="w-full text-sm text-brand-primary">تم الحفظ بنجاح ✓</p>}
      </div>
    </form>
  )
}
