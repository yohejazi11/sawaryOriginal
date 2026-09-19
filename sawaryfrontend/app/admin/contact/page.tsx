'use client'

import { useEffect, useState, useCallback, FormEvent } from 'react'
import { apiGet, apiPut, apiPost, apiDelete } from '@/lib/api'
import { type ContactSettings, type ContactPhoneNumber, type SocialLink } from '@/lib/contact'
import ReorderableList from '@/components/admin/ReorderableList'

const inputClass =
  'w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2.5 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary'
const labelClass = 'mb-1.5 block text-xs text-[rgb(240,238,232)]/60'
const cardClass = 'mb-10 max-w-3xl rounded-sm border border-brand-primary/20 p-6'
const cardStyle = { background: 'rgb(42,43,39)' }

const PLATFORMS = ['instagram', 'x', 'youtube', 'pinterest', 'tiktok', 'other'] as const

export default function ContactAdminPage() {
  const [whatsAppNumber, setWhatsAppNumber] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumbers, setPhoneNumbers] = useState<ContactPhoneNumber[]>([])
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneLabelAr, setPhoneLabelAr] = useState('')
  const [phoneLabelEn, setPhoneLabelEn] = useState('')
  const [phoneAdding, setPhoneAdding] = useState(false)
  const [phoneError, setPhoneError] = useState('')

  const [socialPlatform, setSocialPlatform] = useState<string>(PLATFORMS[0])
  const [socialUrl, setSocialUrl] = useState('')
  const [socialAdding, setSocialAdding] = useState(false)
  const [socialError, setSocialError] = useState('')

  const load = useCallback(async () => {
    try {
      const data = await apiGet<ContactSettings>('/api/contact-settings')
      setWhatsAppNumber(data.whatsAppNumber)
      setEmail(data.email)
      setPhoneNumbers(data.phoneNumbers)
      setSocialLinks(data.socialLinks)
      setLoaded(true)
    } catch {
      setLoadError('تعذّر تحميل إعدادات التواصل.')
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)
    try {
      await apiPut('/api/contact-settings', { whatsAppNumber, email })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في الحفظ')
    } finally {
      setSaving(false)
    }
  }

  async function addPhoneNumber(e: FormEvent) {
    e.preventDefault()
    if (!phoneNumber) {
      setPhoneError('رقم الهاتف مطلوب')
      return
    }
    setPhoneAdding(true)
    setPhoneError('')
    try {
      const item = await apiPost<ContactPhoneNumber>('/api/contact-settings/phone-numbers', {
        number: phoneNumber,
        labelAr: phoneLabelAr || null,
        labelEn: phoneLabelEn || null,
      })
      setPhoneNumbers(prev => [...prev, item])
      setPhoneNumber(''); setPhoneLabelAr(''); setPhoneLabelEn('')
    } catch (err) {
      setPhoneError(err instanceof Error ? err.message : 'خطأ في الإضافة')
    } finally {
      setPhoneAdding(false)
    }
  }

  async function deletePhoneNumber(id: number) {
    await apiDelete(`/api/contact-settings/phone-numbers/${id}`)
    setPhoneNumbers(prev => prev.filter(p => p.id !== id))
  }

  async function addSocialLink(e: FormEvent) {
    e.preventDefault()
    if (!socialUrl) {
      setSocialError('الرابط مطلوب')
      return
    }
    setSocialAdding(true)
    setSocialError('')
    try {
      const item = await apiPost<SocialLink>('/api/contact-settings/social-links', {
        platform: socialPlatform,
        url: socialUrl,
      })
      setSocialLinks(prev => [...prev, item])
      setSocialUrl('')
    } catch (err) {
      setSocialError(err instanceof Error ? err.message : 'خطأ في الإضافة')
    } finally {
      setSocialAdding(false)
    }
  }

  async function deleteSocialLink(id: number) {
    await apiDelete(`/api/contact-settings/social-links/${id}`)
    setSocialLinks(prev => prev.filter(s => s.id !== id))
  }

  if (loadError) return <p className="p-8 text-sm" style={{ color: '#e07070' }}>{loadError}</p>
  if (!loaded) return <p className="p-8 text-[rgb(240,238,232)]/50">جارٍ التحميل…</p>

  return (
    <div dir="rtl">
      <h1 className="mb-8 text-2xl font-bold text-[rgb(240,238,232)]">التواصل والسوشال</h1>

      <form onSubmit={handleSubmit} className={cardClass} style={cardStyle}>
        <h2 className="mb-5 text-sm font-medium text-brand-primary">بيانات التواصل الأساسية</h2>

        <div className="mb-4">
          <label className={labelClass}>رقم واتساب (بدون + أو مسافات، مثال: 966500175000)</label>
          <input dir="ltr" value={whatsAppNumber} onChange={e => setWhatsAppNumber(e.target.value)} required className={inputClass} />
        </div>

        <div className="mb-6">
          <label className={labelClass}>البريد الإلكتروني</label>
          <input dir="ltr" type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} />
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

      {/* Phone numbers */}
      <div className={cardClass} style={cardStyle}>
        <h2 className="mb-5 text-sm font-medium text-brand-primary">أرقام الهاتف</h2>

        <div className="mb-6">
          <ReorderableList
            items={phoneNumbers}
            getId={item => item.id}
            orderEndpoint={id => `/api/contact-settings/phone-numbers/${id}/order`}
            onReordered={setPhoneNumbers}
            onDelete={deletePhoneNumber}
            emptyText="لا توجد أرقام بعد"
            deleteConfirmText="حذف هذا الرقم؟"
            renderItem={item => (
              <p dir="ltr" className="text-sm text-[rgb(240,238,232)]">
                {item.number}
                {(item.labelAr || item.labelEn) && (
                  <span className="text-[rgb(240,238,232)]/40"> — {item.labelAr} / {item.labelEn}</span>
                )}
              </p>
            )}
          />
        </div>

        <form onSubmit={addPhoneNumber} className="border-t border-brand-primary/15 pt-5">
          <h3 className="mb-3 text-xs font-medium text-[rgb(240,238,232)]/60">إضافة رقم جديد</h3>
          <div className="mb-3">
            <input dir="ltr" placeholder="+966500175000" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className={inputClass} />
          </div>
          <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <input dir="rtl" placeholder="تسمية بالعربي (اختياري)" value={phoneLabelAr} onChange={e => setPhoneLabelAr(e.target.value)} className={inputClass} />
            <input dir="ltr" placeholder="Label in English (optional)" value={phoneLabelEn} onChange={e => setPhoneLabelEn(e.target.value)} className={inputClass} />
          </div>
          {phoneError && <p className="mb-3 text-sm" style={{ color: '#e07070' }}>{phoneError}</p>}
          <button
            type="submit"
            disabled={phoneAdding}
            className="rounded-sm bg-brand-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {phoneAdding ? 'جارٍ الإضافة…' : 'إضافة رقم'}
          </button>
        </form>
      </div>

      {/* Social links */}
      <div className={cardClass} style={cardStyle}>
        <h2 className="mb-5 text-sm font-medium text-brand-primary">روابط التواصل الاجتماعي</h2>

        <div className="mb-6">
          <ReorderableList
            items={socialLinks}
            getId={item => item.id}
            orderEndpoint={id => `/api/contact-settings/social-links/${id}/order`}
            onReordered={setSocialLinks}
            onDelete={deleteSocialLink}
            emptyText="لا توجد روابط بعد"
            deleteConfirmText="حذف هذا الرابط؟"
            renderItem={item => (
              <p className="text-sm text-[rgb(240,238,232)]">
                <span className="text-brand-primary">{item.platform}</span>
                <span dir="ltr" className="text-[rgb(240,238,232)]/50"> — {item.url}</span>
              </p>
            )}
          />
        </div>

        <form onSubmit={addSocialLink} className="border-t border-brand-primary/15 pt-5">
          <h3 className="mb-3 text-xs font-medium text-[rgb(240,238,232)]/60">إضافة رابط جديد</h3>
          <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-[auto_1fr]">
            <select
              value={socialPlatform}
              onChange={e => setSocialPlatform(e.target.value)}
              className={inputClass}
            >
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input dir="ltr" placeholder="https://..." value={socialUrl} onChange={e => setSocialUrl(e.target.value)} className={inputClass} />
          </div>
          {socialError && <p className="mb-3 text-sm" style={{ color: '#e07070' }}>{socialError}</p>}
          <button
            type="submit"
            disabled={socialAdding}
            className="rounded-sm bg-brand-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {socialAdding ? 'جارٍ الإضافة…' : 'إضافة رابط'}
          </button>
        </form>
      </div>
    </div>
  )
}
