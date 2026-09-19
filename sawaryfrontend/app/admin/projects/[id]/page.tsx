'use client'

import { use, useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { apiGet, apiPut, apiUpload, apiPatch } from '@/lib/api'

interface Tag { id: number; nameAr: string; nameEn: string }
interface ProjectImage { id: number; url: string }
interface UploadResult { uploaded: ProjectImage[]; errors: { file: string; message: string }[] }
interface Project {
  id: number; name: string; description: string
  location: string; year: string; coverImageUrl: string
  tags: Tag[]
}

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [tags, setTags] = useState<Tag[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [year, setYear] = useState('')
  const [tagIds, setTagIds] = useState<number[]>([])
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    Promise.all([
      apiGet<Project>(`/api/projects/${id}`).catch(() => null),
      apiGet<Tag[]>('/api/tags').catch(() => []),
    ]).then(([proj, allTags]) => {
      setTags(allTags)
      if (proj) {
        setName(proj.name); setDescription(proj.description)
        setLocation(proj.location); setYear(proj.year)
        setTagIds(proj.tags.map(t => t.id))
        setCoverImageUrl(proj.coverImageUrl)
      }
    })
  }, [id])

  function toggleTag(tagId: number) {
    setTagIds(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId])
  }

  function handleCoverChange(file: File | null) {
    if (coverPreview) URL.revokeObjectURL(coverPreview)
    setCoverFile(file)
    setCoverPreview(file ? URL.createObjectURL(file) : '')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(''); setSuccess(false); setSaving(true)
    try {
      await apiPut(`/api/projects/${id}`, { name, description, location, year, tagIds })
      if (coverFile) {
        const form = new FormData()
        form.append('files', coverFile)
        const result = await apiUpload<UploadResult>(`/api/projects/${id}/images`, form)
        if (result.uploaded[0]) {
          await apiPatch(`/api/projects/${id}/cover`, { imageId: result.uploaded[0].id })
        } else if (result.errors[0]) {
          throw new Error(result.errors[0].message)
        }
      }
      setSuccess(true)
      setTimeout(() => { router.refresh(); router.push('/admin/projects') }, 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في الحفظ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div dir="rtl">
      <div className="mb-8 flex items-center gap-3">
        <Link href="/admin/projects" className="text-xs text-brand-primary hover:underline">المشاريع →</Link>
        <h1 className="text-2xl font-bold text-[rgb(240,238,232)]">تعديل المشروع</h1>
        <Link href={`/admin/projects/${id}/images`} className="mr-auto rounded-sm border border-brand-primary/30 px-4 py-1.5 text-xs text-brand-primary hover:bg-brand-primary/10">
          إدارة الصور
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl rounded-sm border border-brand-primary/20 p-6"
        style={{ background: 'rgb(42,43,39)' }}
      >
        <div className="mb-4">
          <label className="mb-1.5 block text-xs text-[rgb(240,238,232)]/60">الاسم</label>
          <input value={name} onChange={e => setName(e.target.value)} required
            className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2.5 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary" />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-xs text-[rgb(240,238,232)]/60">الوصف</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
            className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2.5 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary" />
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-[rgb(240,238,232)]/60">الموقع</label>
            <input value={location} onChange={e => setLocation(e.target.value)}
              className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2.5 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[rgb(240,238,232)]/60">السنة</label>
            <input value={year} onChange={e => setYear(e.target.value)}
              className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2.5 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary" />
          </div>
        </div>
        <div className="mb-6">
          <label className="mb-1.5 block text-xs text-[rgb(240,238,232)]/60">التاقات (اختياري، تقدر تختار أكثر من وحدة)</label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tg => {
              const active = tagIds.includes(tg.id)
              return (
                <button
                  key={tg.id}
                  type="button"
                  onClick={() => toggleTag(tg.id)}
                  className="rounded-full border px-3 py-1.5 text-xs transition-colors"
                  style={{
                    borderColor: active ? 'rgb(190,156,100)' : 'rgba(190,156,100,0.3)',
                    background: active ? 'rgb(190,156,100)' : 'transparent',
                    color: active ? '#fff' : 'rgb(240,238,232)',
                  }}
                >
                  {tg.nameAr}
                </button>
              )
            })}
            {tags.length === 0 && (
              <p className="text-xs text-[rgb(240,238,232)]/40">لا توجد تاقات بعد — <Link href="/admin/tags" className="text-brand-primary hover:underline">أضف تاقاً</Link></p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-1.5 block text-xs text-[rgb(240,238,232)]/60">صورة الغلاف</label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={e => handleCoverChange(e.target.files?.[0] ?? null)}
            className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2.5 text-sm text-[rgb(240,238,232)] outline-none file:ml-3 file:rounded-sm file:border-0 file:bg-brand-primary file:px-3 file:py-1.5 file:text-xs file:text-white focus:border-brand-primary"
          />
          {(coverPreview || coverImageUrl) && (
            <div className="mt-3 h-32 w-32 overflow-hidden rounded-sm border border-brand-primary/20">
              <Image src={coverPreview || coverImageUrl} alt="" width={128} height={128} className="h-full w-full object-cover" />
            </div>
          )}
        </div>

        {error && <p className="mb-4 text-sm" style={{ color: '#e07070' }}>{error}</p>}
        {success && <p className="mb-4 text-sm text-brand-primary">تم الحفظ ✓</p>}

        <button type="submit" disabled={saving}
          className="rounded-sm bg-brand-primary px-8 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">
          {saving ? '...' : 'حفظ'}
        </button>
      </form>
    </div>
  )
}
