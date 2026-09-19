'use client'

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { apiPatch } from '@/lib/api'

// Generic ordered-list editor shared by every admin CRUD list that needs add/delete/
// reorder (FAQ items, stat items, phone numbers, social links) — same drag-reorder
// mechanics as app/admin/projects/[id]/images/page.tsx (splice locally, then PATCH
// .../order once per item), just vertical instead of horizontal, and presentation-
// agnostic via `renderItem` so each caller supplies its own field layout.
export interface ReorderableListProps<T> {
  items: T[]
  getId: (item: T) => number
  /** PATCH path builder for one item's order endpoint, e.g. id => `/api/about/faq-items/${id}/order` */
  orderEndpoint: (id: number) => string
  onReordered: (items: T[]) => void
  onDelete: (id: number) => void | Promise<void>
  renderItem: (item: T) => React.ReactNode
  emptyText?: string
  deleteConfirmText?: string
}

export default function ReorderableList<T>({
  items,
  getId,
  orderEndpoint,
  onReordered,
  onDelete,
  renderItem,
  emptyText = 'لا توجد عناصر بعد',
  deleteConfirmText = 'هل أنت متأكد من الحذف؟',
}: ReorderableListProps<T>) {
  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return
    const reordered = Array.from(items)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    onReordered(reordered)

    await Promise.all(
      reordered.map((item, idx) => apiPatch(orderEndpoint(getId(item)), { orderIndex: idx })),
    )
  }

  async function handleDelete(id: number) {
    if (!confirm(deleteConfirmText)) return
    await onDelete(id)
  }

  if (items.length === 0) {
    return <p className="text-sm text-[rgb(240,238,232)]/40">{emptyText}</p>
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="reorderable-list">
        {provided => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-2">
            {items.map((item, index) => {
              const id = getId(item)
              return (
                <Draggable key={id} draggableId={String(id)} index={index}>
                  {(drag, snapshot) => (
                    <div
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      {...drag.dragHandleProps}
                      className="flex items-start gap-3 rounded-sm border border-brand-primary/15 p-4"
                      style={{
                        background: 'rgb(38,39,35)',
                        opacity: snapshot.isDragging ? 0.85 : 1,
                        ...drag.draggableProps.style,
                      }}
                    >
                      <div className="min-w-0 flex-1">{renderItem(item)}</div>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); handleDelete(id) }}
                        className="shrink-0 rounded-sm px-2 py-1 text-xs hover:bg-black/20"
                        style={{ color: '#e07070' }}
                      >
                        حذف
                      </button>
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
  )
}
