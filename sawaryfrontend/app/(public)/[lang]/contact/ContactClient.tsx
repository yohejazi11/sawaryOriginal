'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Phone, MessageCircle, Mail } from 'lucide-react'
import Footer from '@/components/sections/Footer'
import { iconForPlatform } from '@/components/ui/SocialIcons'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'

const EASE = [0.22, 1, 0.36, 1] as const

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const rise = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-5">
      <span className="h-px flex-1 bg-brand-primary/35" />
      <span className="shrink-0 text-sm font-light tracking-[0.3em] text-brand-primary uppercase">
        {children}
      </span>
      <span className="h-px flex-1 bg-brand-primary/35" />
    </div>
  )
}

export default function ContactClient() {
  const { t, lang } = useLanguage()
  const { email, whatsAppNumber, phoneNumbers, socialLinks } = useSiteSettings()
  const primaryPhone = phoneNumbers[0]?.number

  const CONTACT_INFO = [
    ...(primaryPhone
      ? [{ Icon: Phone, ...t('contact.info.phone'), value: primaryPhone, href: `tel:${primaryPhone}` }]
      : []),
    { Icon: MessageCircle, ...t('contact.info.whatsapp'), href: `https://wa.me/${whatsAppNumber}` },
    { Icon: Mail, ...t('contact.info.email'), value: email, href: `mailto:${email}` },
  ]

  const SOCIALS = socialLinks.map((link) => ({
    Icon: iconForPlatform(link.platform),
    label: link.platform,
    href: link.url,
  }))

  return (
    <main className="min-h-screen bg-brand-bg" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* Page header */}
      <section className="flex flex-col items-center justify-center px-6 pb-20 pt-36">
        <motion.h1
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="font-display mb-6 text-center text-6xl font-bold text-brand-cream md:text-8xl"
        >
          {t('contact.pageTitle')}
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
          className="h-px w-24 bg-brand-primary/40"
        />
      </section>

      {/* Contact info */}
      <section className="mx-auto max-w-4xl px-8 pb-28 md:px-20">
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {CONTACT_INFO.map(({ Icon, label, value, href }) => (
            <motion.a
              key={label}
              variants={rise}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group relative flex flex-col items-center gap-4 overflow-hidden rounded-sm border border-brand-primary/15 p-10 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/50"
              style={{ background: 'rgb(42,43,39)' }}
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-brand-primary/40 text-brand-primary transition-colors duration-300 group-hover:border-brand-primary group-hover:bg-brand-primary/10">
                <Icon size={22} strokeWidth={1.4} />
              </span>
              <span className="text-sm font-light tracking-[0.25em] text-brand-primary uppercase">
                {label}
              </span>
              <span className="text-base text-brand-cream/80">{value}</span>
            </motion.a>
          ))}
        </motion.div>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mt-16"
        >
          <SectionLabel>{t('contact.social.title')}</SectionLabel>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {SOCIALS.map(({ Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="group flex h-12 w-12 items-center justify-center rounded-full border border-brand-primary/30 text-brand-primary transition-all duration-300 hover:scale-110 hover:border-brand-primary hover:bg-brand-primary/10"
              >
                <Icon size={18} />
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
