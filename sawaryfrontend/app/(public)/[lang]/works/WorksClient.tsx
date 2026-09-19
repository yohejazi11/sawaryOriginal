'use client';

import { useEffect, useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';
import Footer from '@/components/sections/Footer';
import PortfolioCard from '@/components/ui/PortfolioCard';
import { type ApiProjectList } from '@/lib/projects';
import { translateCategory } from '@/lib/categoryLabels';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizedHref, type Locale } from '@/lib/i18n';
import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

// Same dot-grid texture used in Footer.tsx — kept local since every section file in this
// codebase defines its own design tokens rather than importing a shared one.
const DOT_PATTERN =
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='1' fill='rgba(190%2C156%2C100%2C0.09)'/%3E%3C/svg%3E")`;

// ── Shared helpers ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-5">
            <span className="h-px flex-1 bg-brand-primary/35" />
            <span className="shrink-0 text-sm font-light tracking-[0.3em] text-brand-primary uppercase">
                {children}
            </span>
            <span className="h-px flex-1 bg-brand-primary/35" />
        </div>
    );
}

function EmptyState({ title, body }: { title: string; body: string }) {
    return (
        <div className="mx-auto max-w-5xl px-8 md:px-20">
            <div className="flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-brand-primary/25 py-20 text-center">
                <ImageOff size={28} strokeWidth={1.3} className="text-brand-primary" />
                <p className="text-lg font-semibold text-brand-cream">{title}</p>
                <p className="max-w-sm text-sm font-light text-brand-cream/50">{body}</p>
            </div>
        </div>
    );
}

function subtitleFor(p: ApiProjectList, t: (key: string) => string, showCategory: boolean): string | undefined {
    const parts = [
        showCategory ? translateCategory(t, p.category?.slug || p.category?.name) : null,
        p.location || null,
    ].filter(Boolean);
    return parts.length ? parts.join(' — ') : undefined;
}

function PortfolioGrid({
    projects,
    lang,
    t,
    showCategory,
}: {
    projects: ApiProjectList[]
    lang: Locale
    t: (key: string) => string
    showCategory: boolean
}) {
    return (
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-3 sm:grid-cols-2 md:gap-3 lg:grid-cols-3 xl:grid-cols-4">
            {projects
                .filter((p) => p.coverImageUrl)
                .map((p, i) => (
                    <PortfolioCard
                        key={p.id}
                        href={localizedHref(lang, `/works/project/${p.id}`)}
                        image={p.coverImageUrl}
                        name={p.name}
                        subtitle={subtitleFor(p, t, showCategory)}
                        priority={i < 4}
                    />
                ))}
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function WorksClient({ initialProjects }: { initialProjects: ApiProjectList[] }) {
    const { t, lang } = useLanguage();

    const executionProjects = initialProjects.filter((p) => p.category?.type === 'execution');
    const designProjects = initialProjects.filter((p) => p.category?.type === 'design');

    // Scroll-spy — drives the pill tabs' active state as the user scrolls past each
    // section, since both sections render simultaneously (the tabs are anchor-scroll
    // shortcuts, not a content switcher) and a static active state would be misleading.
    const [activeSection, setActiveSection] = useState<'execution' | 'design'>('execution');
    const executionSectionRef = useRef<HTMLElement>(null);
    const designSectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id === 'execution-projects' ? 'execution' : 'design');
                    }
                });
            },
            { rootMargin: '-35% 0px -55% 0px' },
        );
        if (executionSectionRef.current) observer.observe(executionSectionRef.current);
        if (designSectionRef.current) observer.observe(designSectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <main className="min-h-screen bg-brand-bg" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {/* ── Page Header — minimal, typographic, spacious ───────────────────── */}
            <section className="flex flex-col items-center justify-center px-6 pb-8 pt-32 md:pt-36">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: EASE }}
                    className="font-display mb-10 text-center text-5xl font-bold text-brand-cream md:text-7xl"
                >
                    {t('nav.works')}
                </motion.h1>

                {/* Segmented pill control — real background/border/active-state tabs */}
                <motion.nav
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
                    className="inline-flex items-center gap-1 rounded-full border border-brand-primary/25 bg-brand-cream/[0.04] p-1 backdrop-blur-sm"
                    aria-label={t('nav.works')}
                >
                    <a
                        href="#execution-projects"
                        aria-current={activeSection === 'execution' ? 'true' : undefined}
                        className={`rounded-full px-6 py-2.5 text-sm font-light tracking-[0.15em] uppercase transition-all duration-300 ${
                            activeSection === 'execution'
                                ? 'bg-brand-primary text-white shadow-md shadow-black/20'
                                : 'text-brand-cream/60 hover:text-brand-cream'
                        }`}
                    >
                        {t('worksPage.executionTab')}
                    </a>
                    <a
                        href="#design-projects"
                        aria-current={activeSection === 'design' ? 'true' : undefined}
                        className={`rounded-full px-6 py-2.5 text-sm font-light tracking-[0.15em] uppercase transition-all duration-300 ${
                            activeSection === 'design'
                                ? 'bg-brand-primary text-white shadow-md shadow-black/20'
                                : 'text-brand-cream/60 hover:text-brand-cream'
                        }`}
                    >
                        {t('worksPage.designTab')}
                    </a>
                </motion.nav>
            </section>

            {/* ── Transition — replaces the old empty gap with a soft visual bridge
                between the hero and the gallery: a faint dot-grid texture, a warm radial
                glow, and a thin gradient line that draws in on first view. ──────────── */}
            <div className="relative h-20 md:h-28" aria-hidden>
                <div
                    className="absolute inset-0 opacity-70"
                    style={{ backgroundImage: DOT_PATTERN, backgroundRepeat: 'repeat' }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(ellipse 55% 140% at 50% 50%, rgba(190,156,100,0.12) 0%, transparent 75%)',
                    }}
                />
                <motion.div
                    className="absolute inset-x-0 top-1/2 mx-auto h-px w-full max-w-sm origin-center -translate-y-1/2 bg-gradient-to-r from-transparent via-brand-primary/55 to-transparent"
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: EASE }}
                />
            </div>

            {/* ── Execution Projects ────────────────────────────────────────────── */}
            <section id="execution-projects" ref={executionSectionRef} className="px-4 pb-24 md:px-10">
                <div className="mx-auto mb-10 flex max-w-[1600px] flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="w-full max-w-md">
                        <SectionLabel>{t('homeServices.execution.title')}</SectionLabel>
                    </div>

                    {/* Sub-category drill-down — preserved functionality, minimal styling */}
                    <div className="flex items-center gap-6 sm:shrink-0">
                        <a
                            href={localizedHref(lang, '/works/execution/residential')}
                            className="text-sm font-light tracking-[0.15em] text-brand-primary/80 uppercase transition-colors duration-200 hover:text-brand-primary"
                        >
                            {translateCategory(t, 'residential')}
                        </a>
                        <span className="h-3.5 w-px bg-brand-primary/25" />
                        <a
                            href={localizedHref(lang, '/works/execution/commercial')}
                            className="text-sm font-light tracking-[0.15em] text-brand-primary/80 uppercase transition-colors duration-200 hover:text-brand-primary"
                        >
                            {translateCategory(t, 'commercial')}
                        </a>
                    </div>
                </div>

                {executionProjects.length > 0 ? (
                    <PortfolioGrid projects={executionProjects} lang={lang} t={t} showCategory />
                ) : (
                    <EmptyState title={t('worksPage.noProjectsTitle')} body={t('worksPage.noProjectsBody')} />
                )}
            </section>

            {/* ── Design Projects ───────────────────────────────────────────────── */}
            <section id="design-projects" ref={designSectionRef} className="px-4 pb-28 md:px-10">
                <div className="mx-auto mb-10 max-w-[1600px]">
                    <SectionLabel>{t('worksPage.designHeading')}</SectionLabel>
                </div>

                {designProjects.length > 0 ? (
                    <PortfolioGrid projects={designProjects} lang={lang} t={t} showCategory={false} />
                ) : (
                    <EmptyState title={t('worksPage.noProjectsTitle')} body={t('worksPage.noProjectsBody')} />
                )}
            </section>

            <Footer />
        </main>
    );
}
