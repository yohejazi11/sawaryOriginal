'use client'

import Link from 'next/link'
import BlogPostForm from '../BlogPostForm'

export default function NewBlogPostPage() {
  return (
    <div dir="rtl">
      <div className="mb-8 flex items-center gap-3">
        <Link href="/admin/blog" className="text-xs text-brand-primary hover:underline">المدونة →</Link>
        <h1 className="text-2xl font-bold text-[rgb(240,238,232)]">مقال جديد</h1>
      </div>
      <BlogPostForm />
    </div>
  )
}
