'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { apiGet, apiDelete, apiFetch } from '@/lib/api'
import { formatPostDate, type ApiBlogPostList } from '@/lib/blog'

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<ApiBlogPostList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => {
    apiGet<ApiBlogPostList[]>('/api/blog/admin')
      .then(setPosts)
      .catch(() => setError('تعذّر تحميل المقالات'))
      .finally(() => setLoading(false))
  }, [])

  async function togglePublished(post: ApiBlogPostList) {
    setBusyId(post.id)
    try {
      const res = await apiFetch(`/api/blog/${post.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isPublished: !post.isPublished }),
      })
      if (!res.ok) throw new Error()
      const saved = (await res.json()) as ApiBlogPostList
      setPosts(prev => prev.map(p => (p.id === post.id ? { ...p, ...saved } : p)))
    } catch {
      alert('تعذّر تغيير حالة النشر')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('هل أنت متأكد من حذف هذا المقال نهائياً؟')) return
    try {
      await apiDelete(`/api/blog/${id}`)
      setPosts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'تعذّر الحذف')
    }
  }

  return (
    <div dir="rtl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[rgb(240,238,232)]">المدونة</h1>
        <Link
          href="/admin/blog/new"
          className="rounded-sm bg-brand-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + مقال جديد
        </Link>
      </div>

      {loading ? (
        <p className="text-[rgb(240,238,232)]/50">جارٍ التحميل…</p>
      ) : error ? (
        <p style={{ color: '#e07070' }}>{error}</p>
      ) : posts.length === 0 ? (
        <p className="text-[rgb(240,238,232)]/40">لا توجد مقالات بعد — ابدأ بإضافة أول مقال.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map(p => (
            <div
              key={p.id}
              className="flex items-center gap-4 rounded-sm border border-brand-primary/20 p-4"
              style={{ background: 'rgb(42,43,39)' }}
            >
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-sm border border-brand-primary/20 bg-brand-bg">
                {p.coverImageUrl && (
                  <Image src={p.coverImageUrl} alt="" fill className="object-cover" sizes="96px" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[rgb(240,238,232)]">{p.titleAr}</p>
                <p className="truncate text-xs text-[rgb(240,238,232)]/50" dir="ltr">/blog/{p.slug}</p>
                <p className="mt-1 text-xs text-[rgb(240,238,232)]/40">
                  {p.isPublished && p.publishedAt
                    ? `نُشر ${formatPostDate(p.publishedAt, 'ar')}`
                    : `أُنشئ ${formatPostDate(p.createdAt, 'ar')}`}
                </p>
              </div>

              <span
                className="shrink-0 rounded-full px-3 py-1 text-xs"
                style={
                  p.isPublished
                    ? { background: 'rgba(110,180,120,0.15)', color: 'rgb(140,200,150)' }
                    : { background: 'rgba(240,238,232,0.08)', color: 'rgba(240,238,232,0.55)' }
                }
              >
                {p.isPublished ? 'منشور' : 'مسودة'}
              </span>

              <div className="flex shrink-0 gap-4">
                <button
                  onClick={() => togglePublished(p)}
                  disabled={busyId === p.id}
                  className="text-xs text-brand-primary hover:underline disabled:opacity-50"
                >
                  {p.isPublished ? 'إلغاء النشر' : 'نشر'}
                </button>
                <Link href={`/admin/blog/${p.id}`} className="text-xs text-brand-primary hover:underline">تعديل</Link>
                <button onClick={() => handleDelete(p.id)} className="text-xs hover:underline" style={{ color: '#e07070' }}>
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
