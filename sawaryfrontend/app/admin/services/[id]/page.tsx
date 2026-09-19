'use client'

import { use, useEffect, useState, useCallback, FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { apiGet, apiPut, apiDelete, apiUpload } from '@/lib/api'
import { type ApiServiceSection } from '@/lib/services'

export default function EditServiceSectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [section, setSection] = useState<ApiServiceSection | null>(null)
  const [loadError, setLoadError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [orderIndex, setOrderIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [heroFile, setHeroFile] = useState<File | null>(null)
  const [heroPreview, setHeroPreview] = useState('')
  const [heroUploading, setHeroUploading] = useState(false)
  const [heroError, setHeroError] = useState('')

  const [cardTitle, setCardTitle] = useState('')
  const [cardFile, setCardFile] = useState<File | null>(null)
  const [cardPreview, setCardPreview] = useState('')
  const [cardUploading, setCardUploading] = useState(false)
  const [cardError, setCardError] = useState('')

  const load = useCallback(async () => {
    try {
      const data = await apiGet<ApiServiceSection>(`/api/service-sections/${id}`)
      setSection(data)
      setTitle(data.title)
      setDescription(data.description ?? '')
      setOrderIndex(data.orderIndex)
    } catch {
      setLoadError('تعذّر تحميل القسم — تأكد من وجوده.')
    }
  }, [id])

  useEffect(() => { load() }, [load])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)
    try {
      await apiPut(`/api/service-sections/${id}`, { title, description, orderIndex })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في الحفظ')
    } finally {
      setSaving(false)
    }
  }

  function handleHeroChange(file: File | null) {
    if (heroPreview) URL.revokeObjectURL(heroPreview)
    setHeroFile(file)
    setHeroPreview(file ? URL.createObjectURL(file) : '')
  }

  async function uploadHero() {
    if (!heroFile) return
    setHeroUploading(true)
    setHeroError('')
    try {
      const form = new FormData()
      form.append('image', heroFile)
      const result = await apiUpload<{ heroImageUrl: string }>(`/api/service-sections/${id}/hero`, form)
      setSection(prev => prev ? { ...prev, heroImageUrl: result.heroImageUrl } : prev)
      handleHeroChange(null)
    } catch (err) {
      setHeroError(err instanceof Error ? err.message : 'خطأ في رفع الصورة')
    } finally {
      setHeroUploading(false)
    }
  }

  function handleCardFileChange(file: File | null) {
    if (cardPreview) URL.revokeObjectURL(cardPreview)
    setCardFile(file)
    setCardPreview(file ? URL.createObjectURL(file) : '')
  }

  async function addCard(e: FormEvent) {
    e.preventDefault()
    if (!cardFile) { setCardError('اختر صورة للبطاقة'); return }
    setCardUploading(true)
    setCardError('')
    try {
      const form = new FormData()
      form.append('title', cardTitle)
      form.append('image', cardFile)
      await apiUpload(`/api/service-sections/${id}/cards`, form)
      setCardTitle('')
      handleCardFileChange(null)
      await load()
    } catch (err) {
      setCardError(err instanceof Error ? err.message : 'خطأ في الإضافة')
    } finally {
      setCardUploading(false)
    }
  }

  async function deleteCard(cardId: number) {
    if (!confirm('حذف هذه البطاقة؟')) return
    try {
      await apiDelete(`/api/service-cards/${cardId}`)
      setSection(prev => prev ? { ...prev, cards: prev.cards.filter(c => c.id !== cardId) } : prev)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'تعذّر الحذف')
    }
  }

  if (loadError) return <p className="p-8 text-sm" style={{ color: '#e07070' }}>{loadError}</p>
  if (!section) return <p className="p-8 text-[rgb(240,238,232)]/50">جارٍ التحميل…</p>

  return (
    <div dir="rtl">
      <div className="mb-8 flex items-center gap-3">
        <Link href="/admin/services" className="text-xs text-brand-primary hover:underline">أقسام الخدمات →</Link>
        <h1 className="text-2xl font-bold text-[rgb(240,238,232)]">تعديل القسم</h1>
      </div>

      {/* Section details form */}
      <form
        onSubmit={handleSubmit}
        className="mb-10 max-w-xl rounded-sm border border-brand-primary/20 p-6"
        style={{ background: 'rgb(42,43,39)' }}
      >
        <div className="mb-4">
          <label className="mb-1.5 block text-xs text-[rgb(240,238,232)]/60">العنوان</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2.5 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary"
          />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-xs text-[rgb(240,238,232)]/60">الوصف</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2.5 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary"
          />
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

      {/* Hero image */}
      <div
        className="mb-10 max-w-xl rounded-sm border border-brand-primary/20 p-6"
        style={{ background: 'rgb(42,43,39)' }}
      >
        <h2 className="mb-5 text-sm font-medium text-brand-primary">صورة الغلاف (Hero)</h2>

        {section.heroImageUrl && (
          <div className="mb-4 h-40 w-full overflow-hidden rounded-sm border border-brand-primary/20">
            <Image src={section.heroImageUrl} alt="" width={640} height={320} className="h-full w-full object-cover" />
          </div>
        )}

        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={e => handleHeroChange(e.target.files?.[0] ?? null)}
          className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2.5 text-sm text-[rgb(240,238,232)] outline-none file:ml-3 file:rounded-sm file:border-0 file:bg-brand-primary file:px-3 file:py-1.5 file:text-xs file:text-white focus:border-brand-primary"
        />

        {heroPreview && (
          <div className="mt-3 h-32 w-32 overflow-hidden rounded-sm border border-brand-primary/20">
            <Image src={heroPreview} alt="" width={128} height={128} className="h-full w-full object-cover" />
          </div>
        )}

        {heroError && <p className="mt-3 text-sm" style={{ color: '#e07070' }}>{heroError}</p>}

        {heroFile && (
          <button
            onClick={uploadHero}
            disabled={heroUploading}
            className="mt-4 rounded-sm bg-brand-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {heroUploading ? 'جارٍ الرفع…' : 'رفع الصورة'}
          </button>
        )}
      </div>

      {/* Cards */}
      <div
        className="max-w-xl rounded-sm border border-brand-primary/20 p-6"
        style={{ background: 'rgb(42,43,39)' }}
      >
        <h2 className="mb-5 text-sm font-medium text-brand-primary">البطاقات</h2>

        {section.cards.length === 0 ? (
          <p className="mb-5 text-xs text-[rgb(240,238,232)]/40">
            لا توجد بطاقات بعد — سيظهر هذا القسم بحالة &quot;قريباً&quot; في الموقع.
          </p>
        ) : (
          <div className="mb-6 flex flex-wrap gap-3">
            {section.cards.map(card => (
              <div key={card.id} className="group relative h-28 w-28 overflow-hidden rounded-sm border border-brand-primary/20">
                <Image src={card.imageUrl} alt="" fill className="object-cover" sizes="112px" />
                <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-1 text-center text-[10px] text-white">
                  {card.title}
                </div>
                <button
                  onClick={() => deleteCard(card.id)}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ color: '#fca5a5' }}
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={addCard} className="border-t border-brand-primary/15 pt-5">
          <h3 className="mb-3 text-xs font-medium text-[rgb(240,238,232)]/60">إضافة بطاقة جديدة</h3>
          <div className="mb-3">
            <label className="mb-1.5 block text-xs text-[rgb(240,238,232)]/60">العنوان</label>
            <input
              value={cardTitle}
              onChange={e => setCardTitle(e.target.value)}
              required
              className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary"
            />
          </div>
          <div className="mb-3">
            <label className="mb-1.5 block text-xs text-[rgb(240,238,232)]/60">الصورة</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={e => handleCardFileChange(e.target.files?.[0] ?? null)}
              className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2.5 text-sm text-[rgb(240,238,232)] outline-none file:ml-3 file:rounded-sm file:border-0 file:bg-brand-primary file:px-3 file:py-1.5 file:text-xs file:text-white focus:border-brand-primary"
            />
            {cardPreview && (
              <div className="mt-3 h-24 w-24 overflow-hidden rounded-sm border border-brand-primary/20">
                <Image src={cardPreview} alt="" width={96} height={96} className="h-full w-full object-cover" />
              </div>
            )}
          </div>
          {cardError && <p className="mb-3 text-sm" style={{ color: '#e07070' }}>{cardError}</p>}
          <button
            type="submit"
            disabled={cardUploading}
            className="rounded-sm bg-brand-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {cardUploading ? 'جارٍ الإضافة…' : 'إضافة بطاقة'}
          </button>
        </form>
      </div>
    </div>
  )
}
