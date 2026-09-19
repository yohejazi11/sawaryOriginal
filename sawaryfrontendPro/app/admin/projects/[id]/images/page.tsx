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
import { apiGet, apiDelete, apiPatch, apiUpload } from '@/lib/api'

interface ProjectImage {
  id: number
  url: string
  publicId: string
  orderIndex: number
}

interface Project {
  id: number
  name: string
  slug: string
  coverImageUrl: string
  images: ProjectImage[]
}

export default function ProjectImagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [images, setImages] = useState<ProjectImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    const proj = await apiGet<Project>(`/api/projects/${id}`).catch(() => null)
    if (!proj) return
    setProject(proj)
    setImages(proj.images.sort((a, b) => a.orderIndex - b.orderIndex))
  }, [id])

  useEffect(() => { load() }, [load])

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
    previews.forEach(p => form.append('files[]', p.file))
    try {
      await apiUpload(`/api/projects/${id}/images`, form)
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

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return
    const reordered = Array.from(images)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)

    const updated = reordered.map((img, idx) => ({ ...img, orderIndex: idx }))
    setImages(updated)

    await Promise.all(
      updated.map(img => apiPatch(`/api/images/${img.id}/order`, { orderIndex: img.orderIndex })),
    )
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

      {/* Reorderable image grid */}
      {images.length > 0 && (
        <>
          <p className="mb-4 text-xs text-[rgb(240,238,232)]/50">اسحب الصور لإعادة الترتيب. انقر على الصورة لتعيينها كغلاف.</p>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="images" direction="horizontal">
              {provided => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-wrap gap-3"
                >
                  {images.map((img, index) => {
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
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                              {!isCover && (
                                <button
                                  onClick={() => setCover(img.id)}
                                  className="rounded-sm bg-brand-primary px-2 py-1 text-[10px] text-white"
                                >
                                  تعيين غلاف
                                </button>
                              )}
                              <button
                                onClick={() => deleteImage(img.id)}
                                className="rounded-sm px-2 py-1 text-[10px]"
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
          </DragDropContext>
        </>
      )}

      {images.length === 0 && previews.length === 0 && (
        <p className="text-center text-sm text-[rgb(240,238,232)]/40">لا توجد صور بعد</p>
      )}
    </div>
  )
}
