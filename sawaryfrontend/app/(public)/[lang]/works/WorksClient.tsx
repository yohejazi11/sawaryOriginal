'use client';

import { useMemo, useState } from 'react';
import { ImageOff } from 'lucide-react';
import Footer from '@/components/sections/Footer';
import PortfolioCard from '@/components/ui/PortfolioCard';
import { type ApiProjectList, type ApiTag } from '@/lib/projects';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizedHref, type Locale } from '@/lib/i18n';
import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

// Same dot-grid texture used in Footer.tsx — kept local since every section file in this
// codebase defines its own design tokens rather than importing a shared one.
const DOT_PATTERN =
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='1' fill='rgba(190%2C156%2C100%2C0.09)'/%3E%3C/svg%3E")`;

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

function subtitleFor(p: ApiProjectList, lang: Locale): string | undefined {
    const tagName = p.tags[0] ? (lang === 'ar' ? p.tags[0].nameAr : p.tags[0].nameEn) : null;
    const parts = [tagName, p.location || null].filter(Boolean);
    return parts.length ? parts.join(' — ') : undefined;
}

function PortfolioGrid({ projects, lang }: { projects: ApiProjectList[]; lang: Locale }) {
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
                        subtitle={subtitleFor(p, lang)}
                        priority={i < 4}
                    />
                ))}
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function WorksClient({
    initialProjects,
    initialTags,
}: {
    initialProjects: ApiProjectList[]
    initialTags: ApiTag[]
}) {
    const { t, lang } = useLanguage();

    // Multi-select tag filter, OR semantics — a project shows if it carries ANY of the
    // selected tags. Empty selection = show everything.
    const [activeTagIds, setActiveTagIds] = useState<number[]>([]);

    function toggleTag(id: number) {
        setActiveTagIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    }

    const tags = [...initialTags].sort((a, b) => a.orderIndex - b.orderIndex);

    const filteredProjects = useMemo(() => {
        if (activeTagIds.length === 0) return initialProjects;
        return initialProjects.filter(p => p.tags.some(tag => activeTagIds.includes(tag.id)));
    }, [initialProjects, activeTagIds]);

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

                {/* Tag filter bar — multi-select pills, OR semantics */}
                {tags.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
                        className="flex flex-wrap items-center justify-center gap-2"
                    >
                        {tags.map(tag => {
                            const active = activeTagIds.includes(tag.id);
                            return (
                                <button
                                    key={tag.id}
                                    onClick={() => toggleTag(tag.id)}
                                    aria-pressed={active}
                                    className="rounded-full border px-5 py-2 text-sm font-light tracking-[0.1em] uppercase transition-all duration-300"
                                    style={{
                                        borderColor: active ? 'rgb(190,156,100)' : 'rgba(190,156,100,0.3)',
                                        background: active ? 'rgb(190,156,100)' : 'transparent',
                                        color: active ? '#fff' : 'rgba(244,239,227,0.7)',
                                    }}
                                >
                                    {lang === 'ar' ? tag.nameAr : tag.nameEn}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
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

            {/* ── All Projects ──────────────────────────────────────────────────── */}
            <section className="px-4 pb-28 md:px-10">
                {filteredProjects.length > 0 ? (
                    <PortfolioGrid projects={filteredProjects} lang={lang} />
                ) : (
                    <EmptyState title={t('worksPage.noProjectsTitle')} body={t('worksPage.noProjectsBody')} />
                )}
            </section>

            <Footer />
        </main>
    );
}
