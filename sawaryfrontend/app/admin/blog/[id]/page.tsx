'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { apiGet } from '@/lib/api'
import { type ApiBlogPost } from '@/lib/blog'
import BlogPostForm from '../BlogPostForm'

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [post, setPost] = useState<ApiBlogPost | null>(null)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    apiGet<ApiBlogPost>(`/api/blog/admin/${id}`)
      .then(setPost)
      .catch(() => setLoadError('تعذّر تحميل المقال — تأكد من وجوده.'))
  }, [id])

  if (loadError) return <p className="p-8 text-sm" style={{ color: '#e07070' }}>{loadError}</p>
  if (!post) return <p className="p-8 text-[rgb(240,238,232)]/50">جارٍ التحميل…</p>

  return (
    <div dir="rtl">
      <div className="mb-8 flex items-center gap-3">
        <Link href="/admin/blog" className="text-xs text-brand-primary hover:underline">المدونة →</Link>
        <h1 className="text-2xl font-bold text-[rgb(240,238,232)]">تعديل المقال</h1>
      </div>
      {/* key: remount the form with fresh state if the loaded post changes */}
      <BlogPostForm key={post.id} initial={post} />
    </div>
  )
}
