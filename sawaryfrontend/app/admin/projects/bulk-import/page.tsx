'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { apiGet, apiPost, apiUpload } from '@/lib/api'
import { type ApiTag } from '@/lib/projects'
import {
  type GroupResult,
  type StagedProjectFile,
  readWebkitDirectoryInput,
  readDroppedItems,
  groupIntoProjects,
  cleanProjectName,
} from '@/lib/folderImport'

const MAX_FILES_PER_UPLOAD = 20

interface ImportRow {
  folderName: string
  name: string
  files: StagedProjectFile[]
  status: 'pending' | 'creating' | 'uploading' | 'done' | 'error'
  uploadedCount: number
  projectId?: number
  errorMessage?: string
  // Files the backend skipped (too large, wrong type) — the row still finishes as
  // 'done' with everything else, this just lists what didn't make it.
  skippedFiles: { file: string; message: string }[]
}

interface UploadResult {
  uploaded: { id: number }[]
  errors: { file: string; message: string }[]
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

// e.g. "دورة المياه (5)، المكتب (4)، بدون قسم (3)" — lets the admin sanity-check the
// detected section grouping before committing to the import.
function sectionBreakdown(files: StagedProjectFile[]): string {
  const order: string[] = []
  const counts = new Map<string, number>()
  let ungrouped = 0
  for (const { sectionName } of files) {
    if (sectionName === null) { ungrouped++; continue }
    if (!counts.has(sectionName)) order.push(sectionName)
    counts.set(sectionName, (counts.get(sectionName) ?? 0) + 1)
  }
  if (order.length === 0) return ''
  const parts = order.map(name => `${name} (${counts.get(name)})`)
  if (ungrouped > 0) parts.push(`بدون قسم (${ungrouped})`)
  return parts.join('، ')
}

export default function BulkImportPage() {
  const [tags, setTags] = useState<ApiTag[]>([])
  const [tagIds, setTagIds] = useState<number[]>([])
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [rows, setRows] = useState<ImportRow[]>([])
  const [phase, setPhase] = useState<'pick' | 'import'>('pick')
  const [running, setRunning] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [pickError, setPickError] = useState('')
  const [skippedFolders, setSkippedFolders] = useState<string[]>([])
  const dirInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    apiGet<ApiTag[]>('/api/tags').then(setTags).catch(() => {})
  }, [])

  function toggleTag(id: number) {
    setTagIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])
  }

  function loadGroups({ groups, skippedFolders }: GroupResult) {
    if (groups.length === 0) {
      setPickError(
        skippedFolders.length > 0
          ? `لم يحتوِ أي مجلد فرعي على صور (${skippedFolders.join('، ')}).`
          : 'لم يتم العثور على أي مجلد فرعي يحتوي على صور داخل المجلد المختار.',
      )
      setSkippedFolders([])
      return
    }
    setPickError('')
    setSkippedFolders(skippedFolders)
    setRows(groups.map(g => ({
      folderName: g.folderName,
      name: cleanProjectName(g.folderName),
      files: g.files,
      status: 'pending',
      uploadedCount: 0,
      skippedFiles: [],
    })))
  }

  function handleDirInputChange(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    loadGroups(groupIntoProjects(readWebkitDirectoryInput(fileList)))
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (!e.dataTransfer.items || e.dataTransfer.items.length === 0) return
    try {
      const staged = await readDroppedItems(e.dataTransfer.items)
      loadGroups(groupIntoProjects(staged))
    } catch {
      setPickError('تعذّرت قراءة المجلد المسحوب. جرّب اختيار المجلد عبر النقر بدلاً من السحب.')
    }
  }

  function updateRow(index: number, patch: Partial<ImportRow>) {
    setRows(prev => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  async function startImport() {
    setPhase('import')
    setRunning(true)

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      updateRow(i, { status: 'creating', errorMessage: undefined })
      try {
        const created = await apiPost<{ id: number }>('/api/projects', {
          name: row.name,
          description: '',
          location: '',
          year,
          tagIds,
        })
        updateRow(i, { status: 'uploading', projectId: created.id })

        // Group by detected section (first-seen order); files with no section upload last.
        const sectionOrder: string[] = []
        const bySection = new Map<string, File[]>()
        const ungroupedFiles: File[] = []
        for (const { file, sectionName } of row.files) {
          if (sectionName === null) { ungroupedFiles.push(file); continue }
          if (!bySection.has(sectionName)) { bySection.set(sectionName, []); sectionOrder.push(sectionName) }
          bySection.get(sectionName)!.push(file)
        }

        const sectionIdByName = new Map<string, number>()
        for (const name of sectionOrder) {
          const section = await apiPost<{ id: number }>(`/api/projects/${created.id}/sections`, {
            nameAr: name,
            nameEn: name,
          })
          sectionIdByName.set(name, section.id)
        }

        let uploaded = 0
        const skipped: { file: string; message: string }[] = []
        for (const name of sectionOrder) {
          const sectionId = sectionIdByName.get(name)!
          for (const batch of chunk(bySection.get(name)!, MAX_FILES_PER_UPLOAD)) {
            const form = new FormData()
            batch.forEach(f => form.append('files', f))
            form.append('sectionId', String(sectionId))
            const result = await apiUpload<UploadResult>(`/api/projects/${created.id}/images`, form)
            uploaded += result.uploaded.length
            skipped.push(...result.errors)
            updateRow(i, { uploadedCount: uploaded, skippedFiles: [...skipped] })
          }
        }
        for (const batch of chunk(ungroupedFiles, MAX_FILES_PER_UPLOAD)) {
          const form = new FormData()
          batch.forEach(f => form.append('files', f))
          const result = await apiUpload<UploadResult>(`/api/projects/${created.id}/images`, form)
          uploaded += result.uploaded.length
          skipped.push(...result.errors)
          updateRow(i, { uploadedCount: uploaded, skippedFiles: [...skipped] })
        }

        updateRow(i, { status: 'done' })
      } catch (err) {
        updateRow(i, { status: 'error', errorMessage: err instanceof Error ? err.message : 'خطأ غير متوقع' })
      }
    }

    setRunning(false)
  }

  const doneCount = rows.filter(r => r.status === 'done').length
  const errorCount = rows.filter(r => r.status === 'error').length
  const processedCount = doneCount + errorCount
  const overallPct = rows.length ? Math.round((processedCount / rows.length) * 100) : 0

  return (
    <div dir="rtl">
      <div className="mb-8 flex items-center gap-3">
        <Link href="/admin/projects" className="text-xs text-brand-primary hover:underline">المشاريع →</Link>
        <h1 className="text-2xl font-bold text-[rgb(240,238,232)]">استيراد جماعي للمشاريع</h1>
      </div>

      {phase === 'pick' && (
        <div className="max-w-2xl">
          <p className="mb-5 text-sm text-[rgb(240,238,232)]/60">
            اختر أو اسحب مجلداً رئيسياً يحتوي على مجلدات فرعية — كل مجلد فرعي سيصبح مشروعاً
            مستقلاً، وكل الصور بداخله سترفع وتُربط به تلقائياً.
          </p>

          <div
            onClick={() => dirInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className="mb-6 cursor-pointer rounded-sm border-2 border-dashed p-12 text-center transition-colors"
            style={{ borderColor: dragOver ? 'rgb(140,112,76)' : 'rgba(140,112,76,0.3)' }}
          >
            <p className="text-sm text-[rgb(240,238,232)]/50">
              اسحب المجلد الرئيسي هنا أو انقر لاختياره
            </p>
            <input
              ref={dirInputRef}
              type="file"
              // @ts-expect-error -- non-standard attributes, required for folder selection
              webkitdirectory=""
              directory=""
              multiple
              className="hidden"
              onChange={e => handleDirInputChange(e.target.files)}
            />
          </div>

          {pickError && <p className="mb-6 text-sm" style={{ color: '#e07070' }}>{pickError}</p>}

          {rows.length > 0 && (
            <div
              className="rounded-sm border border-brand-primary/20 p-6"
              style={{ background: 'rgb(42,43,39)' }}
            >
              <h2 className="mb-4 text-sm font-medium text-brand-primary">
                {rows.length} مشروع سيتم إنشاؤه
              </h2>

              {skippedFolders.length > 0 && (
                <p className="mb-4 text-xs text-[rgb(240,238,232)]/50">
                  تم تجاهل {skippedFolders.length} مجلد لعدم احتوائه على صور: {skippedFolders.join('، ')}
                </p>
              )}

              <div className="mb-5">
                <label className="mb-1.5 block text-xs text-[rgb(240,238,232)]/60">السنة (لكل المشاريع)</label>
                <input
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  className="w-full max-w-xs rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2.5 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary"
                />
              </div>

              <div className="mb-5">
                <label className="mb-1.5 block text-xs text-[rgb(240,238,232)]/60">التاقات (اختياري، لكل المشاريع — تقدر تختار أكثر من وحدة)</label>
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
                </div>
              </div>

              <div className="mb-5 flex flex-col gap-2">
                {rows.map((row, i) => (
                  <div key={row.folderName} className="flex items-center gap-3 rounded-sm border border-brand-primary/10 p-3">
                    <input
                      value={row.name}
                      onChange={e => updateRow(i, { name: e.target.value })}
                      className="flex-1 rounded-sm border border-brand-primary/20 bg-brand-bg px-2.5 py-1.5 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary"
                    />
                    <span className="shrink-0 text-xs text-[rgb(240,238,232)]/40">
                      {row.files.length} صورة{sectionBreakdown(row.files) && ` — ${sectionBreakdown(row.files)}`}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={startImport}
                className="rounded-sm bg-brand-primary px-8 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                بدء الاستيراد
              </button>
            </div>
          )}
        </div>
      )}

      {phase === 'import' && (
        <div className="max-w-2xl">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-[rgb(240,238,232)]/70">
                {running ? 'جارٍ الاستيراد…' : 'اكتمل الاستيراد'}
              </span>
              <span className="text-brand-primary">{processedCount} / {rows.length}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-brand-primary/15">
              <div
                className="h-full rounded-full bg-brand-primary transition-all duration-300"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>

          {!running && (
            <p className="mb-6 text-sm text-[rgb(240,238,232)]/70">
              {doneCount} من {rows.length} مشروع تم إنشاؤها بنجاح
              {errorCount > 0 && <span style={{ color: '#e07070' }}> — {errorCount} فشل</span>}
            </p>
          )}

          <div className="flex flex-col gap-2">
            {rows.map(row => (
              <div
                key={row.folderName}
                className="flex items-center justify-between gap-3 rounded-sm border p-4"
                style={{
                  borderColor: row.status === 'error' ? 'rgba(224,112,112,0.4)' : 'rgba(140,112,76,0.2)',
                  background: 'rgb(42,43,39)',
                }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[rgb(240,238,232)]">{row.name}</p>
                  {row.status === 'error' ? (
                    <p className="mt-1 text-xs" style={{ color: '#e07070' }}>{row.errorMessage}</p>
                  ) : (
                    <p className="mt-1 text-xs text-[rgb(240,238,232)]/50">
                      {row.uploadedCount} / {row.files.length} صورة مرفوعة
                    </p>
                  )}
                  {row.skippedFiles.length > 0 && (
                    <p className="mt-1 text-xs" style={{ color: '#e0a070' }}>
                      تم تجاوز {row.skippedFiles.length} صورة: {row.skippedFiles.map(s => `${s.file} (${s.message})`).join('، ')}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {row.status === 'creating' && <span className="text-xs text-brand-primary">جارٍ الإنشاء…</span>}
                  {row.status === 'uploading' && <span className="text-xs text-brand-primary">جارٍ الرفع…</span>}
                  {row.status === 'done' && (
                    <>
                      <span style={{ color: 'rgb(140,112,76)' }}>✓</span>
                      {row.projectId && (
                        <Link href={`/admin/projects/${row.projectId}`} className="text-xs text-brand-primary hover:underline">
                          تعديل →
                        </Link>
                      )}
                    </>
                  )}
                  {row.status === 'error' && <span style={{ color: '#e07070' }}>✕</span>}
                  {row.status === 'pending' && <span className="text-xs text-[rgb(240,238,232)]/30">قيد الانتظار</span>}
                </div>
              </div>
            ))}
          </div>

          {!running && (
            <Link
              href="/admin/projects"
              className="mt-6 inline-block rounded-sm bg-brand-primary px-8 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              الذهاب إلى المشاريع
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
