'use client'

import { useEffect, useState, FormEvent } from 'react'
import Link from 'next/link'
import { apiGet, apiPost, apiDelete } from '@/lib/api'

interface Category {
  id: number
  name: string
  slug: string
  type: string
  orderIndex: number
  projectCount: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [type, setType] = useState('execution')
  const [orderIndex, setOrderIndex] = useState(0)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const data = await apiGet<Category[]>('/api/categories')
      setCategories(data)
    } catch {
      setError('تعذّر تحميل التصنيفات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setCreateError('')
    setCreating(true)
    try {
      await apiPost('/api/categories', { name, type, orderIndex, slug: slug || undefined })
      setName(''); setSlug(''); setType('execution'); setOrderIndex(0)
      await load()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'خطأ في الإنشاء')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: number, projectCount: number) {
    if (projectCount > 0) { alert('لا يمكن حذف تصنيف يحتوي على مشاريع'); return }
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    try {
      await apiDelete(`/api/categories/${id}`)
      setCategories(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'تعذّر الحذف')
    }
  }

  return (
    <div dir="rtl">
      <h1 className="mb-8 text-2xl font-bold text-[rgb(240,238,232)]">التصنيفات</h1>

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="mb-10 rounded-sm border border-brand-primary/20 p-6"
        style={{ background: 'rgb(42,43,39)' }}
      >
        <h2 className="mb-5 text-sm font-medium text-brand-primary">تصنيف جديد</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-[rgb(240,238,232)]/60">الاسم</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('يرجى ملء هذا الحقل.')}
              onInput={e => (e.target as HTMLInputElement).setCustomValidity('')}
              className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[rgb(240,238,232)]/60">الرابط (slug)</label>
            <input
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="يُنشأ تلقائياً من الاسم"
              dir="ltr"
              className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2 text-sm text-[rgb(240,238,232)] outline-none placeholder:text-[rgb(240,238,232)]/30 focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[rgb(240,238,232)]/60">النوع</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary"
            >
              <option value="execution">execution</option>
              <option value="design">design</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-[rgb(240,238,232)]/60">الترتيب</label>
            <input
              type="number"
              value={orderIndex}
              onChange={e => setOrderIndex(Number(e.target.value))}
              className="w-full rounded-sm border border-brand-primary/25 bg-brand-bg px-3 py-2 text-sm text-[rgb(240,238,232)] outline-none focus:border-brand-primary"
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-[rgb(240,238,232)]/40">
          الاسم إذا كُتب بالعربية فقط، يُنشئ رابطاً عشوائياً غير مفهوم ما لم تحدّد رابطاً صريحاً هنا. للتصنيفات الأساسية (سكني/تجاري) استخدم: residential، commercial.
        </p>
        {createError && <p className="mt-3 text-sm" style={{ color: '#e07070' }}>{createError}</p>}
        <button
          type="submit"
          disabled={creating}
          className="mt-4 rounded-sm bg-brand-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {creating ? '...' : 'إضافة'}
        </button>
      </form>

      {/* Table */}
      {loading ? (
        <p className="text-[rgb(240,238,232)]/50">جارٍ التحميل…</p>
      ) : error ? (
        <p style={{ color: '#e07070' }}>{error}</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-primary/20 text-right text-xs text-brand-primary">
              <th className="pb-3">الاسم</th>
              <th className="pb-3">الرابط</th>
              <th className="pb-3">النوع</th>
              <th className="pb-3">المشاريع</th>
              <th className="pb-3">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id} className="border-b border-brand-primary/10 text-[rgb(240,238,232)]">
                <td className="py-3">{c.name}</td>
                <td className="py-3 text-xs text-[rgb(240,238,232)]/50" dir="ltr">{c.slug}</td>
                <td className="py-3 text-xs text-[rgb(240,238,232)]/60">{c.type}</td>
                <td className="py-3">{c.projectCount}</td>
                <td className="py-3 flex gap-3">
                  <Link href={`/admin/categories/${c.id}`} className="text-brand-primary hover:underline text-xs">تعديل</Link>
                  <button
                    onClick={() => handleDelete(c.id, c.projectCount)}
                    className="text-xs hover:underline"
                    style={{ color: '#e07070' }}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
