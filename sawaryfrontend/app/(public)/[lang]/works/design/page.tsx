import { redirect } from 'next/navigation'
import { localizedHref, type Locale } from '@/lib/i18n'

export default async function WorksDesignPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  redirect(`${localizedHref(lang, '/works')}#design-projects`)
}
