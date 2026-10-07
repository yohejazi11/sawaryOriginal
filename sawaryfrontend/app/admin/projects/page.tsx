'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { GripVertical } from 'lucide-react'
import { apiGet, apiDelete, apiPatch, apiFetch } from '@/lib/api'

interface ProjectItem {
  id: number
  name: string
  year: string
  isFeatured: boolean
  coverImageUrl: string
  tags: { id: number; nameAr: string; nameEn: string }[]
  imageCount: number
}

interface Tag {
  id: number
  nameAr: string
  nameEn: string
}

// Featured projects always lead on the public site (see ProjectsController.GetAll), so
// they're shown — and dragged — as their own group above the rest.
const GROUPS = [
  { key: 'featured', label: 'المشاريع المميزة — تظهر أولاً في الموقع', featured: true },
  { key: 'regular', label: 'باقي المشاريع', featured: false },
] as const

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [tagFilter, setTagFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  async function load(tagId?: string) {
    setLoading(true)
    const qs = tagId ? `?tagId=${tagId}` : ''
    const [projs, allTags] = await Promise.all([
      apiGet<ProjectItem[]>(`/api/projects${qs}`).catch(() => []),
      apiGet<Tag[]>('/api/tags').catch(() => []),
    ])
    setProjects(projs)
    setTags(allTags)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function handleFilter(tagId: string) {
    setTagFilter(tagId)
    load(tagId || undefined)
  }

  // Persists the full current order (featured group first, then the rest) in one request.
  async function saveOrder(ordered: ProjectItem[]) {
    setSaveState('saving')
    try {
      const res = await apiFetch('/api/projects/reorder', {
        method: 'POST',
        body: JSON.stringify({ ids: ordered.map(p => p.id) }),
      })
      if (!res.ok) throw new Error()
      setSaveState('saved')
      setTimeout(() => setSaveState(s => (s === 'saved' ? 'idle' : s)), 1500)
    } catch {
      setSaveState('error')
    }
  }

  async function toggleFeatured(id: number) {
    const res = await apiPatch<{ isFeatured: boolean }>(`/api/projects/${id}/featured`)
    setProjects(prev => {
      const toggled = prev.map(p => (p.id === id ? { ...p, isFeatured: res?.isFeatured ?? !p.isFeatured } : p))
      // Re-group so the project jumps to its new group, keeping relative order otherwise.
      return [...toggled.filter(p => p.isFeatured), ...toggled.filter(p => !p.isFeatured)]
    })
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`حذف مشروع "${name}"؟`)) return
    try {
      await apiDelete(`/api/projects/${id}`)
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'تعذّر حذف المشروع، يرجى المحاولة مجدداً.')
    }
  }

  function onDragEnd(result: DropResult) {
    const { source, destination } = result
    // Moving between groups is what the "مميز" switch is for — dragging stays within a group.
    if (!destination || source.droppableId !== destination.droppableId || source.index === destination.index) return

    const featured = projects.filter(p => p.isFeatured)
    const regular = projects.filter(p => !p.isFeatured)
    const list = source.droppableId === 'featured' ? featured : regular
    const [moved] = list.splice(source.index, 1)
    list.splice(destination.index, 0, moved)

    const ordered = [...featured, ...regular]
    setProjects(ordered)
    saveOrder(ordered)
  }

  // Reordering a filtered subset would scramble the positions of every hidden project.
  const canReorder = !tagFilter

  return (
    <div dir="rtl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[rgb(240,238,232)]">المشاريع</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/projects/bulk-import"
            className="rounded-sm border border-brand-primary/40 px-5 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10"
          >
            + استيراد جماعي
          </Link>
          <Link
            href="/admin/projects/new"
            className="rounded-sm bg-brand-primary px-5 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            + مشروع جديد
          </Link>
        </div>
      </div>

      {/* Filter + order status */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <select
          value={tagFilter}
          onChange={e => handleFilter(e.target.value)}
          className="rounded-sm border border-brand-primary/25 bg-brand-bg px-4 py-2 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary"
        >
          <option value="">كل التاقات</option>
          {tags.map(tg => (
            <option key={tg.id} value={tg.id}>{tg.nameAr}</option>
          ))}
        </select>
        <p className="text-xs text-[rgb(240,238,232)]/45">
          {canReorder
            ? 'اسحب المشروع من المقبض ⋮⋮ لتغيير ترتيبه في الموقع.'
            : 'الترتيب بالسحب متاح فقط عند عرض كل التاقات.'}
        </p>
        {saveState === 'saving' && <span className="text-xs text-[rgb(240,238,232)]/50">جارٍ حفظ الترتيب…</span>}
        {saveState === 'saved' && <span className="text-xs text-brand-primary">تم حفظ الترتيب ✓</span>}
        {saveState === 'error' && <span className="text-xs" style={{ color: '#e07070' }}>تعذّر حفظ الترتيب — أعد تحميل الصفحة وحاول مجدداً</span>}
      </div>

      {loading ? (
        <p className="text-[rgb(240,238,232)]/50">جارٍ التحميل…</p>
      ) : projects.length === 0 ? (
        <p className="py-8 text-center text-sm text-[rgb(240,238,232)]/40">لا توجد مشاريع</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          {GROUPS.map(group => {
            const items = projects.filter(p => p.isFeatured === group.featured)
            if (items.length === 0) return null
            return (
              <div key={group.key} className="mb-8">
                <h2 className="mb-2 text-xs font-medium text-brand-primary">{group.label} ({items.length})</h2>

                {/* Column headings */}
                <div className="flex items-center gap-4 border-b border-brand-primary/20 px-2 pb-2 text-xs text-brand-primary/80">
                  <span className="w-5" />
                  <span className="w-[60px]">الصورة</span>
                  <span className="flex-1">الاسم</span>
                  <span className="hidden w-48 md:block">التاقات</span>
                  <span className="w-14">السنة</span>
                  <span className="w-12">مميز</span>
                  <span className="w-36">الإجراءات</span>
                </div>

                <Droppable droppableId={group.key} isDropDisabled={!canReorder}>
                  {provided => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {items.map((p, index) => (
                        <Draggable key={p.id} draggableId={String(p.id)} index={index} isDragDisabled={!canReorder}>
                          {(drag, snapshot) => (
                            <div
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              className="flex items-center gap-4 border-b border-brand-primary/10 px-2 py-3 text-sm text-[rgb(240,238,232)]"
                              style={{
                                ...drag.draggableProps.style,
                                background: snapshot.isDragging ? 'rgb(52,53,48)' : undefined,
                                boxShadow: snapshot.isDragging ? '0 8px 24px rgba(0,0,0,0.35)' : undefined,
                              }}
                            >
                              <span
                                {...drag.dragHandleProps}
                                className={`flex w-5 justify-center ${canReorder ? 'cursor-grab text-[rgb(240,238,232)]/40 hover:text-brand-primary active:cursor-grabbing' : 'text-[rgb(240,238,232)]/10'}`}
                                aria-label="اسحب لتغيير الترتيب"
                              >
                                <GripVertical size={18} />
                              </span>

                              <div className="h-[60px] w-[60px] shrink-0 overflow-hidden rounded-sm bg-brand-primary/10">
                                {p.coverImageUrl ? (
                                  <Image src={p.coverImageUrl} alt={p.name} width={60} height={60} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-xs text-brand-primary/30">—</div>
                                )}
                              </div>

                              <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>

                              <div className="hidden w-48 flex-wrap gap-1 text-xs text-[rgb(240,238,232)]/60 md:flex">
                                {p.tags.map(tg => (
                                  <span key={tg.id} className="rounded-sm border border-brand-primary/25 px-1.5 py-0.5">{tg.nameAr}</span>
                                ))}
                              </div>

                              <span className="w-14 text-xs text-[rgb(240,238,232)]/60">{p.year}</span>

                              <span className="w-12">
                                <button
                                  onClick={() => toggleFeatured(p.id)}
                                  className="relative h-5 w-9 rounded-full transition-colors"
                                  style={{ background: p.isFeatured ? 'rgb(140,112,76)' : 'rgba(140,112,76,0.2)' }}
                                  title={p.isFeatured ? 'إلغاء التمييز' : 'تمييز'}
                                >
                                  <span
                                    className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all"
                                    style={{ right: p.isFeatured ? '2px' : '18px' }}
                                  />
                                </button>
                              </span>

                              <div className="flex w-36 gap-3">
                                <Link href={`/admin/projects/${p.id}`} className="text-xs text-brand-primary hover:underline">تعديل</Link>
                                <Link href={`/admin/projects/${p.id}/images`} className="text-xs text-[rgb(240,238,232)]/50 hover:text-brand-primary hover:underline">الصور</Link>
                                <button onClick={() => handleDelete(p.id, p.name)} className="text-xs hover:underline" style={{ color: '#e07070' }}>
                                  حذف
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </DragDropContext>
      )}
    </div>
  )
}
