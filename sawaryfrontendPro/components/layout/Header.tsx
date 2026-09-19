'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizedHref } from '@/lib/i18n';

const NAV = [
  { href: '/',         key: 'nav.home'     },
  { href: '/works',    key: 'nav.works'    },
  { href: '/about',    key: 'nav.about'    },
  { href: '/services', key: 'nav.services' },
  { href: '/contact',  key: 'nav.contact'  },
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Header() {
  const { lang, toggleLang, t } = useLanguage();
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 60);
  });

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0,   opacity: 1  }}
      transition={{ duration: 0.7, ease: EASE }}
      className="fixed inset-x-0 top-0 z-50"
    >
      {/* Glass band — always present so nav stays readable over any hero image,
          strengthens further on scroll. Never fully transparent — the fixed header
          sits over photographic content on several pages (Works gallery, project
          heroes), so it can't rely on the image underneath being dark. */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(52, 50, 41, 0.92)' : 'rgba(52, 50, 41, 0.72)',
          backdropFilter: 'blur(16px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
          boxShadow: scrolled ? '0 2px 32px rgba(0,0,0,0.28)' : 'none',
        }}
      />

      {/* ── Main bar ──────────────────────────────────────────────────────── */}
      {/* textShadow cascades to every label/link below — a second line of defense
          for contrast on top of the glass band, regardless of what image is behind it. */}
      <div
        className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-8 lg:px-20"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}
      >

        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <Link href={localizedHref(lang, '/')} className="group flex items-center gap-3">
          {/* Brand name */}
          <span className="font-display text-2xl font-bold leading-none text-brand-cream transition-colors duration-300 group-hover:text-brand-primary">
            {t('header.brand')}
          </span>

          {/* Thin separator */}
          <span className="hidden h-5 w-px bg-brand-primary/30 sm:block" />

          {/* Sub-label */}
          <span className="hidden text-sm font-medium tracking-[0.24em] text-brand-primary/80 uppercase sm:block">
            {t('header.tagline')}
          </span>
        </Link>

        {/* ── Desktop nav ──────────────────────────────────────────────── */}
        <nav className="hidden items-center gap-8 lg:flex" dir={lang === 'ar' ? 'rtl' : 'ltr'} aria-label="Main navigation">
          {NAV.map(({ href, key }) => (
            <Link
              key={href}
              href={localizedHref(lang, href)}
              className="group relative text-base font-medium tracking-wide text-brand-cream/80 transition-colors duration-200 hover:text-brand-cream"
            >
              {t(key)}
              {/* Underline draws right→left on hover (RTL direction) */}
              <span className="absolute -bottom-0.5 right-0 h-px w-0 bg-brand-primary transition-[width] duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* ── End actions ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-5">

          {/* Language toggle — desktop */}
          <button
            onClick={toggleLang}
            className="hidden cursor-pointer text-sm font-semibold tracking-[0.22em] text-brand-cream/80 uppercase transition-colors duration-200 hover:text-brand-primary lg:block"
            aria-label="Toggle language"
          >
            {lang === 'en' ? 'عربي' : 'EN'}
          </button>

          {/* CTA button — desktop */}
          <Link
            href={localizedHref(lang, '/contact')}
            className="hidden cursor-pointer rounded-full border border-brand-primary/50 px-6 py-2.5 text-sm font-medium text-brand-primary transition-all duration-250 hover:border-brand-primary hover:bg-brand-primary hover:text-white active:scale-[0.97] lg:block"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            {t('common.contactUs')}
          </Link>

          {/* Hamburger — mobile */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="cursor-pointer text-brand-cream/60 transition-colors duration-200 hover:text-brand-cream lg:hidden"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen
                ? <motion.span key="x"   initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}><X    size={20} /></motion.span>
                : <motion.span key="menu" initial={{ rotate:  90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}><Menu size={20} /></motion.span>
              }
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{   opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="relative overflow-hidden border-t border-white/6 bg-brand-charcoal/96 backdrop-blur-md lg:hidden"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            <div className="flex flex-col gap-1 px-8 py-6">
              {NAV.map(({ href, key }, i) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0  }}
                  transition={{ delay: i * 0.05, duration: 0.3, ease: EASE }}
                >
                  <Link
                    href={localizedHref(lang, href)}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3.5 text-base font-light text-brand-cream/65 transition-colors hover:text-brand-cream"
                  >
                    {t(key)}
                  </Link>
                  {i < NAV.length - 1 && (
                    <span className="block h-px bg-white/5" />
                  )}
                </motion.div>
              ))}

              {/* Mobile lang + CTA */}
              <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/6">
                <button
                  onClick={() => { toggleLang(); setMobileOpen(false); }}
                  className="text-sm font-light tracking-[0.22em] text-brand-cream/50 uppercase transition-colors hover:text-brand-primary"
                >
                  {lang === 'en' ? 'عربي' : 'EN'}
                </button>
                <Link
                  href={localizedHref(lang, '/contact')}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-brand-primary/50 px-6 py-2.5 text-sm font-medium text-brand-primary"
                >
                  {t('common.contactUs')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
