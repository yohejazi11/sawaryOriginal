'use client'

import { useEffect, useState, useCallback, FormEvent } from 'react'
import Image from 'next/image'
import { apiGet, apiPut, apiPost, apiDelete, apiUpload } from '@/lib/api'
import { type AboutContent, type AboutFaqItem, type AboutStatItem } from '@/lib/about'
import ReorderableList from '@/components/admin/ReorderableList'

type ScalarField = Exclude<keyof AboutContent, 'faqItems' | 'statItems' | 'teamPhotoUrl' | 'teamPhotoWidth' | 'teamPhotoHeight'>
type FormState = Record<ScalarField, string>

const inputClass =
  'w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2.5 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary'
const labelClass = 'mb-1.5 block text-xs text-[rgb(240,238,232)]/60'
const cardClass = 'mb-10 max-w-3xl rounded-sm border border-brand-primary/20 p-6'
const cardStyle = { background: 'rgb(42,43,39)' }

function BilingualRow({
  title, arKey, enKey, form, set, textarea, rows = 3,
}: {
  title: string
  arKey: ScalarField
  enKey: ScalarField
  form: FormState
  set: (key: ScalarField, value: string) => void
  textarea?: boolean
  rows?: number
}) {
  return (
    <div className="mb-4">
      <label className={labelClass}>{title}</label>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <span className="mb-1 block text-[10px] text-[rgb(240,238,232)]/35">عربي</span>
          {textarea ? (
            <textarea dir="rtl" rows={rows} value={form[arKey] ?? ''} onChange={e => set(arKey, e.target.value)} className={inputClass} />
          ) : (
            <input dir="rtl" value={form[arKey] ?? ''} onChange={e => set(arKey, e.target.value)} className={inputClass} />
          )}
        </div>
        <div>
          <span className="mb-1 block text-[10px] text-[rgb(240,238,232)]/35">English</span>
          {textarea ? (
            <textarea dir="ltr" rows={rows} value={form[enKey] ?? ''} onChange={e => set(enKey, e.target.value)} className={inputClass} />
          ) : (
            <input dir="ltr" value={form[enKey] ?? ''} onChange={e => set(enKey, e.target.value)} className={inputClass} />
          )}
        </div>
      </div>
    </div>
  )
}

export default function AboutAdminPage() {
  const [form, setForm] = useState<FormState>({} as FormState)
  const [faqItems, setFaqItems] = useState<AboutFaqItem[]>([])
  const [statItems, setStatItems] = useState<AboutStatItem[]>([])
  const [loadError, setLoadError] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [teamPhotoUrl, setTeamPhotoUrl] = useState('')
  const [teamFile, setTeamFile] = useState<File | null>(null)
  const [teamPreview, setTeamPreview] = useState('')
  const [teamUploading, setTeamUploading] = useState(false)
  const [teamError, setTeamError] = useState('')

  const [faqQuestionAr, setFaqQuestionAr] = useState('')
  const [faqQuestionEn, setFaqQuestionEn] = useState('')
  const [faqAnswerAr, setFaqAnswerAr] = useState('')
  const [faqAnswerEn, setFaqAnswerEn] = useState('')
  const [faqActionLabelAr, setFaqActionLabelAr] = useState('')
  const [faqActionLabelEn, setFaqActionLabelEn] = useState('')
  const [faqActionHref, setFaqActionHref] = useState('')
  const [faqAdding, setFaqAdding] = useState(false)
  const [faqError, setFaqError] = useState('')

  const [statLabelAr, setStatLabelAr] = useState('')
  const [statLabelEn, setStatLabelEn] = useState('')
  const [statValue, setStatValue] = useState('')
  const [statSuffix, setStatSuffix] = useState('')
  const [statAdding, setStatAdding] = useState(false)
  const [statError, setStatError] = useState('')

  const load = useCallback(async () => {
    try {
      const data = await apiGet<AboutContent>('/api/about')
      const { faqItems: faq, statItems: stats, teamPhotoUrl: photo, teamPhotoWidth, teamPhotoHeight, ...scalars } = data
      setForm(scalars as FormState)
      setFaqItems(faq)
      setStatItems(stats)
      setTeamPhotoUrl(photo)
      void teamPhotoWidth
      void teamPhotoHeight
      setLoaded(true)
    } catch {
      setLoadError('تعذّر تحميل بيانات الصفحة.')
    }
  }, [])

  useEffect(() => { load() }, [load])

  function set(key: ScalarField, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)
    try {
      await apiPut('/api/about', form)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في الحفظ')
    } finally {
      setSaving(false)
    }
  }

  function handleTeamFileChange(file: File | null) {
    if (teamPreview) URL.revokeObjectURL(teamPreview)
    setTeamFile(file)
    setTeamPreview(file ? URL.createObjectURL(file) : '')
  }

  async function uploadTeamPhoto() {
    if (!teamFile) return
    setTeamUploading(true)
    setTeamError('')
    try {
      const form = new FormData()
      form.append('image', teamFile)
      const result = await apiUpload<{ teamPhotoUrl: string }>('/api/about/team-photo', form)
      setTeamPhotoUrl(result.teamPhotoUrl)
      handleTeamFileChange(null)
    } catch (err) {
      setTeamError(err instanceof Error ? err.message : 'خطأ في رفع الصورة')
    } finally {
      setTeamUploading(false)
    }
  }

  async function addFaqItem(e: FormEvent) {
    e.preventDefault()
    if (!faqQuestionAr || !faqQuestionEn || !faqAnswerAr || !faqAnswerEn) {
      setFaqError('السؤال والإجابة مطلوبان باللغتين')
      return
    }
    setFaqAdding(true)
    setFaqError('')
    try {
      const item = await apiPost<AboutFaqItem>('/api/about/faq-items', {
        questionAr: faqQuestionAr,
        questionEn: faqQuestionEn,
        answerAr: faqAnswerAr,
        answerEn: faqAnswerEn,
        actionLabelAr: faqActionLabelAr || null,
        actionLabelEn: faqActionLabelEn || null,
        actionHref: faqActionHref || null,
      })
      setFaqItems(prev => [...prev, item])
      setFaqQuestionAr(''); setFaqQuestionEn(''); setFaqAnswerAr(''); setFaqAnswerEn('')
      setFaqActionLabelAr(''); setFaqActionLabelEn(''); setFaqActionHref('')
    } catch (err) {
      setFaqError(err instanceof Error ? err.message : 'خطأ في الإضافة')
    } finally {
      setFaqAdding(false)
    }
  }

  async function deleteFaqItem(id: number) {
    await apiDelete(`/api/about/faq-items/${id}`)
    setFaqItems(prev => prev.filter(f => f.id !== id))
  }

  async function addStatItem(e: FormEvent) {
    e.preventDefault()
    const value = Number(statValue)
    if (!statLabelAr || !statLabelEn || !statValue || Number.isNaN(value)) {
      setStatError('التسمية والقيمة مطلوبتان')
      return
    }
    setStatAdding(true)
    setStatError('')
    try {
      const item = await apiPost<AboutStatItem>('/api/about/stat-items', {
        labelAr: statLabelAr,
        labelEn: statLabelEn,
        value,
        suffix: statSuffix || null,
      })
      setStatItems(prev => [...prev, item])
      setStatLabelAr(''); setStatLabelEn(''); setStatValue(''); setStatSuffix('')
    } catch (err) {
      setStatError(err instanceof Error ? err.message : 'خطأ في الإضافة')
    } finally {
      setStatAdding(false)
    }
  }

  async function deleteStatItem(id: number) {
    await apiDelete(`/api/about/stat-items/${id}`)
    setStatItems(prev => prev.filter(s => s.id !== id))
  }

  if (loadError) return <p className="p-8 text-sm" style={{ color: '#e07070' }}>{loadError}</p>
  if (!loaded) return <p className="p-8 text-[rgb(240,238,232)]/50">جارٍ التحميل…</p>

  return (
    <div dir="rtl">
      <h1 className="mb-8 text-2xl font-bold text-[rgb(240,238,232)]">تعديل صفحة من نحن</h1>

      <form onSubmit={handleSubmit}>
        <div className={cardClass} style={cardStyle}>
          <h2 className="mb-5 text-sm font-medium text-brand-primary">الترحيب (Hero)</h2>
          <BilingualRow title="العنوان" arKey="heroTitleAr" enKey="heroTitleEn" form={form} set={set} />
          <BilingualRow title="النص التعريفي" arKey="heroStatementAr" enKey="heroStatementEn" form={form} set={set} textarea rows={5} />
          <BilingualRow title="تلميح التمرير" arKey="heroScrollHintAr" enKey="heroScrollHintEn" form={form} set={set} />
        </div>

        <div className={cardClass} style={cardStyle}>
          <h2 className="mb-5 text-sm font-medium text-brand-primary">رؤيتنا</h2>
          <BilingualRow title="عنوان القسم" arKey="sectionLabelWhoWeAreAr" enKey="sectionLabelWhoWeAreEn" form={form} set={set} />
          <BilingualRow title="العنوان" arKey="visionTitleAr" enKey="visionTitleEn" form={form} set={set} />
          <BilingualRow title="النص" arKey="visionBodyAr" enKey="visionBodyEn" form={form} set={set} textarea rows={5} />
        </div>

        <div className={cardClass} style={cardStyle}>
          <h2 className="mb-5 text-sm font-medium text-brand-primary">الأرقام (الإحصائيات)</h2>
          <BilingualRow title="عنوان القسم" arKey="sectionLabelStatsAr" enKey="sectionLabelStatsEn" form={form} set={set} />
        </div>

        <div className={cardClass} style={cardStyle}>
          <h2 className="mb-5 text-sm font-medium text-brand-primary">الفريق</h2>
          <BilingualRow title="عنوان القسم" arKey="sectionLabelTeamStructureAr" enKey="sectionLabelTeamStructureEn" form={form} set={set} />
          <BilingualRow title="العنوان" arKey="teamTitleAr" enKey="teamTitleEn" form={form} set={set} />
          <BilingualRow title="النص البديل للصورة" arKey="teamImageAltAr" enKey="teamImageAltEn" form={form} set={set} />
        </div>

        <div className={cardClass} style={cardStyle}>
          <h2 className="mb-5 text-sm font-medium text-brand-primary">عنوان الأسئلة الشائعة</h2>
          <BilingualRow title="عنوان القسم" arKey="sectionLabelFaqAr" enKey="sectionLabelFaqEn" form={form} set={set} />
          <BilingualRow title="العنوان" arKey="faqTitleAr" enKey="faqTitleEn" form={form} set={set} />
        </div>

        <div className={cardClass} style={cardStyle}>
          <h2 className="mb-5 text-sm font-medium text-brand-primary">موقعنا</h2>
          <BilingualRow title="عنوان القسم" arKey="sectionLabelVisitUsAr" enKey="sectionLabelVisitUsEn" form={form} set={set} />
          <BilingualRow title="العنوان" arKey="locationTitleAr" enKey="locationTitleEn" form={form} set={set} />
          <BilingualRow title="العنوان الفعلي" arKey="locationAddressAr" enKey="locationAddressEn" form={form} set={set} />
          <BilingualRow title="عنوان الخريطة" arKey="locationMapTitleAr" enKey="locationMapTitleEn" form={form} set={set} />
          <BilingualRow title="نص الخريطة القادمة" arKey="locationMapComingSoonAr" enKey="locationMapComingSoonEn" form={form} set={set} />
          <BilingualRow title="النص البديل لصورة المعرض" arKey="locationGalleryAltAr" enKey="locationGalleryAltEn" form={form} set={set} />
        </div>

        {error && <p className="mb-4 text-sm" style={{ color: '#e07070' }}>{error}</p>}
        {success && <p className="mb-4 text-sm text-brand-primary">تم الحفظ بنجاح ✓</p>}

        <button
          type="submit"
          disabled={saving}
          className="mb-10 rounded-sm bg-brand-primary px-8 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? '...' : 'حفظ النصوص'}
        </button>
      </form>

      {/* Team photo */}
      <div className={cardClass} style={cardStyle}>
        <h2 className="mb-5 text-sm font-medium text-brand-primary">صورة الفريق</h2>

        {teamPhotoUrl && (
          <div className="mb-4 h-48 w-full max-w-md overflow-hidden rounded-sm border border-brand-primary/20">
            <Image src={teamPhotoUrl} alt="" width={640} height={360} className="h-full w-full object-cover" />
          </div>
        )}

        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={e => handleTeamFileChange(e.target.files?.[0] ?? null)}
          className="w-full max-w-md rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2.5 text-sm text-[rgb(240,238,232)] outline-none file:ml-3 file:rounded-sm file:border-0 file:bg-brand-primary file:px-3 file:py-1.5 file:text-xs file:text-white focus:border-brand-primary"
        />

        {teamPreview && (
          <div className="mt-3 h-32 w-56 overflow-hidden rounded-sm border border-brand-primary/20">
            <Image src={teamPreview} alt="" width={224} height={128} className="h-full w-full object-cover" />
          </div>
        )}

        {teamError && <p className="mt-3 text-sm" style={{ color: '#e07070' }}>{teamError}</p>}

        {teamFile && (
          <button
            onClick={uploadTeamPhoto}
            disabled={teamUploading}
            className="mt-4 rounded-sm bg-brand-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {teamUploading ? 'جارٍ الرفع…' : 'رفع الصورة'}
          </button>
        )}
      </div>

      {/* FAQ items */}
      <div className={cardClass} style={cardStyle}>
        <h2 className="mb-5 text-sm font-medium text-brand-primary">الأسئلة الشائعة</h2>

        <div className="mb-6">
          <ReorderableList
            items={faqItems}
            getId={item => item.id}
            orderEndpoint={id => `/api/about/faq-items/${id}/order`}
            onReordered={setFaqItems}
            onDelete={deleteFaqItem}
            emptyText="لا توجد أسئلة بعد"
            deleteConfirmText="حذف هذا السؤال؟"
            renderItem={item => (
              <div>
                <p className="text-sm text-[rgb(240,238,232)]">{item.questionAr} <span className="text-[rgb(240,238,232)]/40">/ {item.questionEn}</span></p>
                <p className="mt-1 text-xs text-[rgb(240,238,232)]/50">{item.answerAr}</p>
                {item.actionHref && (
                  <p className="mt-1 text-[10px] text-brand-primary">{item.actionLabelAr} → {item.actionHref}</p>
                )}
              </div>
            )}
          />
        </div>

        <form onSubmit={addFaqItem} className="border-t border-brand-primary/15 pt-5">
          <h3 className="mb-3 text-xs font-medium text-[rgb(240,238,232)]/60">إضافة سؤال جديد</h3>
          <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <input dir="rtl" placeholder="السؤال بالعربي" value={faqQuestionAr} onChange={e => setFaqQuestionAr(e.target.value)} className={inputClass} />
            <input dir="ltr" placeholder="Question in English" value={faqQuestionEn} onChange={e => setFaqQuestionEn(e.target.value)} className={inputClass} />
          </div>
          <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <textarea dir="rtl" rows={3} placeholder="الإجابة بالعربي" value={faqAnswerAr} onChange={e => setFaqAnswerAr(e.target.value)} className={inputClass} />
            <textarea dir="ltr" rows={3} placeholder="Answer in English" value={faqAnswerEn} onChange={e => setFaqAnswerEn(e.target.value)} className={inputClass} />
          </div>
          <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <input dir="rtl" placeholder="نص زر الإجراء (اختياري)" value={faqActionLabelAr} onChange={e => setFaqActionLabelAr(e.target.value)} className={inputClass} />
            <input dir="ltr" placeholder="Action label (optional)" value={faqActionLabelEn} onChange={e => setFaqActionLabelEn(e.target.value)} className={inputClass} />
          </div>
          <div className="mb-3">
            <input dir="ltr" placeholder="رابط الإجراء (مثال: /contact)" value={faqActionHref} onChange={e => setFaqActionHref(e.target.value)} className={inputClass} />
          </div>
          {faqError && <p className="mb-3 text-sm" style={{ color: '#e07070' }}>{faqError}</p>}
          <button
            type="submit"
            disabled={faqAdding}
            className="rounded-sm bg-brand-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {faqAdding ? 'جارٍ الإضافة…' : 'إضافة سؤال'}
          </button>
        </form>
      </div>

      {/* Stat items */}
      <div className={cardClass} style={cardStyle}>
        <h2 className="mb-5 text-sm font-medium text-brand-primary">أرقام الإحصائيات</h2>

        <div className="mb-6">
          <ReorderableList
            items={statItems}
            getId={item => item.id}
            orderEndpoint={id => `/api/about/stat-items/${id}/order`}
            onReordered={setStatItems}
            onDelete={deleteStatItem}
            emptyText="لا توجد أرقام بعد"
            deleteConfirmText="حذف هذا الرقم؟"
            renderItem={item => (
              <p className="text-sm text-[rgb(240,238,232)]">
                {item.value}{item.suffix ?? ''} — {item.labelAr} <span className="text-[rgb(240,238,232)]/40">/ {item.labelEn}</span>
              </p>
            )}
          />
        </div>

        <form onSubmit={addStatItem} className="border-t border-brand-primary/15 pt-5">
          <h3 className="mb-3 text-xs font-medium text-[rgb(240,238,232)]/60">إضافة رقم جديد</h3>
          <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <input dir="rtl" placeholder="التسمية بالعربي" value={statLabelAr} onChange={e => setStatLabelAr(e.target.value)} className={inputClass} />
            <input dir="ltr" placeholder="Label in English" value={statLabelEn} onChange={e => setStatLabelEn(e.target.value)} className={inputClass} />
          </div>
          <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <input dir="ltr" type="number" placeholder="القيمة" value={statValue} onChange={e => setStatValue(e.target.value)} className={inputClass} />
            <input dir="ltr" placeholder="لاحقة (مثال: +)" value={statSuffix} onChange={e => setStatSuffix(e.target.value)} className={inputClass} />
          </div>
          {statError && <p className="mb-3 text-sm" style={{ color: '#e07070' }}>{statError}</p>}
          <button
            type="submit"
            disabled={statAdding}
            className="rounded-sm bg-brand-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {statAdding ? 'جارٍ الإضافة…' : 'إضافة رقم'}
          </button>
        </form>
      </div>
    </div>
  )
}
