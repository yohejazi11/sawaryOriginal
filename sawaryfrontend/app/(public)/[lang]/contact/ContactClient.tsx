'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Phone, MessageCircle, Mail } from 'lucide-react'
import { MdArrowOutward } from 'react-icons/md'
import Footer from '@/components/sections/Footer'
import Reveal from '@/components/ui/Reveal'
import { iconForPlatform } from '@/components/ui/SocialIcons'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'

const EASE = [0.22, 1, 0.36, 1] as const

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
    <main className="flex min-h-screen flex-col bg-[#F4EFE3] text-[#343229]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <section className="flex w-full flex-col px-[32px] max-sm:px-4 pb-[96px] pt-36 max-sm:pt-28">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <motion.h1
          className="text-[clamp(2.5rem,6vw,4.5rem)] leading-tight"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
        >
          {t('contact.pageTitle')}
        </motion.h1>

        {/* ── Contact cards — numbered like the service cards, turn dark on hover ── */}
        <div className="mt-[64px] grid w-full grid-cols-1 gap-2 md:grid-cols-3">
          {CONTACT_INFO.map(({ Icon, label, value, href }, i) => {
            const external = href.startsWith('http')
            return (
              <Reveal key={label} variant="curtain" delay={i * 0.15} duration={1.1}>
                <a
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className="group relative flex h-[320px] flex-col justify-between rounded-[25px] border border-[#343229] p-8 transition-colors duration-300 hover:bg-[#343229] hover:text-[#F4EFE3]"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-current">
                      <Icon size={22} strokeWidth={1.4} />
                    </span>
                    <span
                      aria-hidden
                      className="select-none text-[64px] font-semibold leading-none text-transparent [-webkit-text-stroke:1.5px_#343229] group-hover:[-webkit-text-stroke-color:#F4EFE3]"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex items-end justify-between gap-4">
                    <div className="flex min-w-0 flex-col gap-2">
                      <span className="text-[16px] opacity-60">{label}</span>
                      <span className="truncate text-[22px] font-medium md:text-[24px]" dir={href.startsWith('mailto') || href.startsWith('tel') ? 'ltr' : undefined}>
                        {value}
                      </span>
                    </div>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#343229] text-[22px] text-[#F4EFE3] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#F4EFE3] group-hover:text-[#343229]">
                      <MdArrowOutward />
                    </span>
                  </div>
                </a>
              </Reveal>
            )
          })}
        </div>

        {/* ── Social links ────────────────────────────────────────────────── */}
        {SOCIALS.length > 0 && (
          <div className="mt-[96px] flex w-full items-center justify-between gap-[32px] max-sm:flex-col max-sm:items-start">
            <Reveal>
              <h2 className="text-[clamp(2rem,5vw,4rem)] leading-tight">{t('contact.social.title')}</h2>
            </Reveal>
            <Reveal delay={0.15} className="flex flex-wrap items-center gap-2">
              {SOCIALS.map(({ Icon, label, href }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center gap-2 rounded-[15px] border border-[#343229] px-6 py-2 text-[16px] capitalize transition-all duration-300 hover:bg-[#343229] hover:text-[#F4EFE3]"
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}
            </Reveal>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
