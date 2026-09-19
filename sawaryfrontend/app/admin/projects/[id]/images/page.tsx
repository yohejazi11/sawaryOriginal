'use client'

import { use, useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd'
import { apiGet, apiPost, apiPut, apiDelete, apiPatch, apiUpload } from '@/lib/api'

interface ProjectImage {
  id: number
  url: string
  publicId: string
  orderIndex: number
  sectionId: number | null
}

interface ProjectSection {
  id: number
  nameAr: string
  nameEn: string
  orderIndex: number
  images: ProjectImage[]
}

interface UploadResult {
  uploaded: ProjectImage[]
  errors: { file: string; message: string }[]
}

interface Project {
  id: number
  name: string
  slug: string
  coverImageUrl: string
  images: ProjectImage[]
  sections: ProjectSection[]
}

interface Group {
  key: string
  id: number | null
  label: string
  images: ProjectImage[]
}

export default function ProjectImagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [images, setImages] = useState<ProjectImage[]>([])
  const [sections, setSections] = useState<ProjectSection[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSectionId, setUploadSectionId] = useState<number | null>(null)
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const [newSectionAr, setNewSectionAr] = useState('')
  const [newSectionEn, setNewSectionEn] = useState('')
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null)
  const [editNameAr, setEditNameAr] = useState('')
  const [editNameEn, setEditNameEn] = useState('')

  const load = useCallback(async () => {
    const proj = await apiGet<Project>(`/api/projects/${id}`).catch(() => null)
    if (!proj) return
    setProject(proj)
    setSections([...proj.sections].sort((a, b) => a.orderIndex - b.orderIndex))
    const all = [...proj.images, ...proj.sections.flatMap(s => s.images)]
    setImages(all)
  }, [id])

  useEffect(() => { load() }, [load])

  const sortedSections = [...sections].sort((a, b) => a.orderIndex - b.orderIndex)

  const groups: Group[] = [
    ...sortedSections.map(s => ({
      key: `section-${s.id}`,
      id: s.id,
      label: `${s.nameAr} / ${s.nameEn}`,
      images: images.filter(i => i.sectionId === s.id).sort((a, b) => a.orderIndex - b.orderIndex),
    })),
    {
      key: 'ungrouped',
      id: null,
      label: 'بدون قسم',
      images: images.filter(i => i.sectionId === null).sort((a, b) => a.orderIndex - b.orderIndex),
    },
  ]

  // ── Drag-over / drop on upload zone ───────────────────────────────────────
  function onDragOver(e: React.DragEvent) { e.preventDefault() }
  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    addFiles(Array.from(e.dataTransfer.files))
  }

  function addFiles(files: File[]) {
    const valid = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f.name))
    const newPreviews = valid.map(f => ({ file: f, url: URL.createObjectURL(f) }))
    setPreviews(prev => [...prev, ...newPreviews].slice(0, 20))
  }

  function removePreview(i: number) {
    setPreviews(prev => {
      URL.revokeObjectURL(prev[i].url)
      return prev.filter((_, idx) => idx !== i)
    })
  }

  async function uploadAll() {
    if (previews.length === 0) return
    setUploading(true)
    setUploadError('')
    const form = new FormData()
    previews.forEach(p => form.append('files', p.file))
    if (uploadSectionId !== null) form.append('sectionId', String(uploadSectionId))
    try {
      const result = await apiUpload<UploadResult>(`/api/projects/${id}/images`, form)
      if (result.errors.length > 0) {
        setUploadError(`تم رفع ${result.uploaded.length} صورة، وتعذّر رفع: ${result.errors.map(e => `${e.file} (${e.message})`).join('، ')}`)
      }
      setPreviews([])
      await load()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'خطأ في الرفع')
    } finally {
      setUploading(false)
    }
  }

  async function deleteImage(imgId: number) {
    if (!confirm('حذف هذه الصورة؟')) return
    await apiDelete(`/api/images/${imgId}`)
    setImages(prev => prev.filter(i => i.id !== imgId))
  }

  async function setCover(imgId: number) {
    await apiPatch(`/api/projects/${id}/cover`, { imageId: imgId })
    setProject(prev => prev ? { ...prev, coverImageUrl: images.find(i => i.id === imgId)?.url ?? prev.coverImageUrl } : prev)
  }

  async function moveImageToSection(imgId: number, sectionId: number | null) {
    await apiPatch(`/api/images/${imgId}/section`, { sectionId })
    await load()
  }

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return
    const { source, destination } = result
    // Cross-group drag isn't supported here — use the "نقل إلى..." dropdown instead.
    if (source.droppableId !== destination.droppableId) return

    const group = groups.find(g => g.key === source.droppableId)
    if (!group) return

    const reordered = Array.from(group.images)
    const [moved] = reordered.splice(source.index, 1)
    reordered.splice(destination.index, 0, moved)
    const updated = reordered.map((img, idx) => ({ ...img, orderIndex: idx }))

    setImages(prev => prev.map(img => updated.find(u => u.id === img.id) ?? img))

    await Promise.all(
      updated.map(img => apiPatch(`/api/images/${img.id}/order`, { orderIndex: img.orderIndex })),
    )
  }

  async function addSection() {
    if (!newSectionAr.trim() || !newSectionEn.trim()) return
    await apiPost(`/api/projects/${id}/sections`, { nameAr: newSectionAr.trim(), nameEn: newSectionEn.trim() })
    setNewSectionAr('')
    setNewSectionEn('')
    await load()
  }

  function startEditSection(s: ProjectSection) {
    setEditingSectionId(s.id)
    setEditNameAr(s.nameAr)
    setEditNameEn(s.nameEn)
  }

  async function saveSectionEdit(sectionId: number) {
    await apiPut(`/api/sections/${sectionId}`, { nameAr: editNameAr.trim(), nameEn: editNameEn.trim() })
    setEditingSectionId(null)
    await load()
  }

  async function deleteSection(sectionId: number) {
    if (!confirm('حذف هذا القسم؟ الصور بداخله سترجع إلى "بدون قسم".')) return
    await apiDelete(`/api/sections/${sectionId}`)
    await load()
  }

  async function moveSection(sectionId: number, direction: -1 | 1) {
    const idx = sortedSections.findIndex(s => s.id === sectionId)
    const swapIdx = idx + direction
    if (swapIdx < 0 || swapIdx >= sortedSections.length) return
    const a = sortedSections[idx]
    const b = sortedSections[swapIdx]
    await Promise.all([
      apiPatch(`/api/sections/${a.id}/order`, { orderIndex: b.orderIndex }),
      apiPatch(`/api/sections/${b.id}/order`, { orderIndex: a.orderIndex }),
    ])
    await load()
  }

  if (!project) return <p className="p-8 text-[rgb(240,238,232)]/50">جارٍ التحميل…</p>

  return (
    <div dir="rtl">
      <div className="mb-8 flex items-center gap-3">
        <Link href={`/admin/projects/${id}`} className="text-xs text-brand-primary hover:underline">
          {project.name} →
        </Link>
        <h1 className="text-2xl font-bold text-[rgb(240,238,232)]">الصور</h1>
      </div>

      {/* Sections management */}
      <div className="mb-8 rounded-sm border border-brand-primary/20 p-4">
        <h2 className="mb-3 text-sm font-bold text-[rgb(240,238,232)]">الأقسام</h2>

        {sortedSections.length > 0 && (
          <div className="mb-4 space-y-2">
            {sortedSections.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                {editingSectionId === s.id ? (
                  <>
                    <input
                      value={editNameAr}
                      onChange={e => setEditNameAr(e.target.value)}
                      placeholder="الاسم بالعربي"
                      className="flex-1 rounded-sm border border-brand-primary/30 bg-transparent px-2 py-1 text-sm text-[rgb(240,238,232)]"
                    />
                    <input
                      value={editNameEn}
                      onChange={e => setEditNameEn(e.target.value)}
                      placeholder="Name in English"
                      dir="ltr"
                      className="flex-1 rounded-sm border border-brand-primary/30 bg-transparent px-2 py-1 text-sm text-[rgb(240,238,232)]"
                    />
                    <button onClick={() => saveSectionEdit(s.id)} className="rounded-sm bg-brand-primary px-2 py-1 text-xs text-white">
                      حفظ
                    </button>
                    <button onClick={() => setEditingSectionId(null)} className="rounded-sm border border-brand-primary/30 px-2 py-1 text-xs text-[rgb(240,238,232)]/70">
                      إلغاء
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-[rgb(240,238,232)]">{s.nameAr} / {s.nameEn}</span>
                    <button onClick={() => moveSection(s.id, -1)} disabled={i === 0} className="px-2 text-xs text-brand-primary disabled:opacity-30">
                      ↑
                    </button>
                    <button onClick={() => moveSection(s.id, 1)} disabled={i === sortedSections.length - 1} className="px-2 text-xs text-brand-primary disabled:opacity-30">
                      ↓
                    </button>
                    <button onClick={() => startEditSection(s)} className="rounded-sm border border-brand-primary/30 px-2 py-1 text-xs text-[rgb(240,238,232)]/70">
                      تعديل
                    </button>
                    <button onClick={() => deleteSection(s.id)} className="rounded-sm px-2 py-1 text-xs" style={{ background: '#7a2020', color: '#fca5a5' }}>
                      حذف
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={newSectionAr}
            onChange={e => setNewSectionAr(e.target.value)}
            placeholder="اسم القسم بالعربي"
            className="flex-1 rounded-sm border border-brand-primary/30 bg-transparent px-2 py-1 text-sm text-[rgb(240,238,232)]"
          />
          <input
            value={newSectionEn}
            onChange={e => setNewSectionEn(e.target.value)}
            placeholder="Section name in English"
            dir="ltr"
            className="flex-1 rounded-sm border border-brand-primary/30 bg-transparent px-2 py-1 text-sm text-[rgb(240,238,232)]"
          />
          <button
            onClick={addSection}
            disabled={!newSectionAr.trim() || !newSectionEn.trim()}
            className="rounded-sm bg-brand-primary px-4 py-1.5 text-xs font-medium text-white disabled:opacity-40"
          >
            إضافة قسم
          </button>
        </div>
      </div>

      {/* Upload zone */}
      <div
        ref={dropRef}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className="mb-6 cursor-pointer rounded-sm border-2 border-dashed border-brand-primary/30 p-10 text-center transition-colors hover:border-brand-primary/60"
      >
        <p className="text-sm text-[rgb(240,238,232)]/50">
          اسحب الصور هنا أو انقر للاختيار (jpg, png, webp — حد أقصى 10 ميجا/صورة، 20 صورة)
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          className="hidden"
          onChange={e => addFiles(Array.from(e.target.files ?? []))}
        />
      </div>

      {/* Previews before upload */}
      {previews.length > 0 && (
        <div className="mb-6">
          <p className="mb-3 text-sm text-brand-primary">{previews.length} صورة جاهزة للرفع</p>
          <div className="mb-3 flex items-center gap-2 text-sm text-[rgb(240,238,232)]/70">
            <label htmlFor="upload-section">أضف الصور إلى:</label>
            <select
              id="upload-section"
              value={uploadSectionId ?? ''}
              onChange={e => setUploadSectionId(e.target.value ? Number(e.target.value) : null)}
              className="rounded-sm border border-brand-primary/30 bg-transparent px-2 py-1 text-sm text-[rgb(240,238,232)]"
            >
              <option value="">بدون قسم</option>
              {sortedSections.map(s => (
                <option key={s.id} value={s.id}>{s.nameAr} / {s.nameEn}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-3">
            {previews.map((p, i) => (
              <div key={p.url} className="group relative h-24 w-24 overflow-hidden rounded-sm border border-brand-primary/20">
                <Image src={p.url} alt="" fill className="object-cover" sizes="96px" />
                <button
                  onClick={() => removePreview(i)}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ color: '#e07070' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          {uploadError && <p className="mt-3 text-sm" style={{ color: '#e07070' }}>{uploadError}</p>}
          <button
            onClick={uploadAll}
            disabled={uploading}
            className="mt-4 rounded-sm bg-brand-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {uploading ? 'جارٍ الرفع…' : 'رفع الصور'}
          </button>
        </div>
      )}

      {/* Reorderable image groups */}
      {images.length > 0 && (
        <>
          <p className="mb-4 text-xs text-[rgb(240,238,232)]/50">اسحب الصور لإعادة ترتيبها داخل نفس القسم. انقر على الصورة لتعيينها كغلاف.</p>
          <DragDropContext onDragEnd={onDragEnd}>
            {groups.map(group => group.images.length > 0 && (
              <div key={group.key} className="mb-8">
                <h3 className="mb-3 text-sm font-bold text-brand-primary">{group.label}</h3>
                <Droppable droppableId={group.key} direction="horizontal">
                  {provided => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex flex-wrap gap-3"
                    >
                      {group.images.map((img, index) => {
                        const isCover = img.url === project.coverImageUrl
                        return (
                          <Draggable key={img.id} draggableId={String(img.id)} index={index}>
                            {(drag, snapshot) => (
                              <div
                                ref={drag.innerRef}
                                {...drag.draggableProps}
                                {...drag.dragHandleProps}
                                className="group relative h-32 w-32 overflow-hidden rounded-sm border transition-colors"
                                style={{
                                  borderColor: isCover ? 'rgb(140,112,76)' : 'rgba(140,112,76,0.2)',
                                  opacity: snapshot.isDragging ? 0.8 : 1,
                                  ...drag.draggableProps.style,
                                }}
                              >
                                <Image
                                  src={img.url}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="128px"
                                />

                                {isCover && (
                                  <span className="absolute right-1 top-1 rounded-sm bg-brand-primary px-1.5 py-0.5 text-[10px] text-white">
                                    غلاف
                                  </span>
                                )}

                                {/* Hover actions */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                                  {!isCover && (
                                    <button
                                      onClick={() => setCover(img.id)}
                                      className="w-full rounded-sm bg-brand-primary px-2 py-1 text-[10px] text-white"
                                    >
                                      تعيين غلاف
                                    </button>
                                  )}
                                  <select
                                    value={img.sectionId ?? ''}
                                    onChange={e => moveImageToSection(img.id, e.target.value ? Number(e.target.value) : null)}
                                    onClick={e => e.stopPropagation()}
                                    className="w-full rounded-sm border border-white/30 bg-black/40 px-1 py-1 text-[10px] text-white"
                                  >
                                    <option value="">بدون قسم</option>
                                    {sortedSections.map(s => (
                                      <option key={s.id} value={s.id}>{s.nameAr}</option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => deleteImage(img.id)}
                                    className="w-full rounded-sm px-2 py-1 text-[10px]"
                                    style={{ background: '#7a2020', color: '#fca5a5' }}
                                  >
                                    حذف
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </DragDropContext>
        </>
      )}

      {images.length === 0 && previews.length === 0 && (
        <p className="text-center text-sm text-[rgb(240,238,232)]/40">لا توجد صور بعد</p>
      )}
    </div>
  )
}
