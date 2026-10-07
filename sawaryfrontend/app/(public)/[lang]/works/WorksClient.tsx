'use client';

import { useMemo, useState } from 'react';
import { ImageOff } from 'lucide-react';
import Footer from '@/components/sections/Footer';
import PortfolioCard from '@/components/ui/PortfolioCard';
import Reveal from '@/components/ui/Reveal';
import { type ApiProjectList, type ApiTag } from '@/lib/projects';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizedHref, type Locale } from '@/lib/i18n';

function EmptyState({ title, body }: { title: string; body: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[25px] border border-dashed border-[#343229]/40 py-20 text-center text-[#343229]">
            <ImageOff size={28} strokeWidth={1.3} />
            <p className="text-lg font-semibold">{title}</p>
            <p className="max-w-sm text-sm font-light opacity-60">{body}</p>
        </div>
    );
}

function PortfolioGrid({ projects, lang }: { projects: ApiProjectList[]; lang: Locale }) {
    return (
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {projects
                .filter((p) => p.coverImageUrl)
                .map((p, i) => (
                    <PortfolioCard
                        key={p.id}
                        href={localizedHref(lang, `/works/project/${p.id}`)}
                        image={p.coverImageUrl}
                        name={p.name}
                        featured={p.isFeatured}
                        // Stagger across each row of three, like the home gallery's columns.
                        delay={(i % 3) * 0.15}
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
        <main className="flex min-h-screen flex-col bg-[#F4EFE3]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <section className="flex w-full flex-col px-[32px] pb-[96px] pt-36">
                {/* ── Header ──────────────────────────────────────────────────────── */}
                <div className="flex w-full items-center justify-between gap-[32px] max-sm:flex-col max-sm:items-start">
                    <Reveal className="text-[#343229]">
                        <h1 className="text-[clamp(2.5rem,6vw,4rem)] leading-tight">{t('nav.works')}</h1>
                    </Reveal>

                    {/* Tag filter — multi-select pills, OR semantics */}
                    {tags.length > 0 && (
                        <Reveal delay={0.15} className="flex flex-wrap items-center gap-2">
                            {tags.map(tag => {
                                const active = activeTagIds.includes(tag.id);
                                return (
                                    <button
                                        key={tag.id}
                                        onClick={() => toggleTag(tag.id)}
                                        aria-pressed={active}
                                        className={`rounded-[15px] border border-[#343229] px-6 py-2 text-[16px] transition-all duration-300 ${
                                            active
                                                ? 'bg-[#343229] text-[#F4EFE3]'
                                                : 'text-[#343229] hover:bg-[#343229] hover:text-[#F4EFE3]'
                                        }`}
                                    >
                                        {lang === 'ar' ? tag.nameAr : tag.nameEn}
                                    </button>
                                );
                            })}
                        </Reveal>
                    )}
                </div>

                {/* ── All Projects ────────────────────────────────────────────────── */}
                <div className="mt-[64px]">
                    {filteredProjects.length > 0 ? (
                        <PortfolioGrid projects={filteredProjects} lang={lang} />
                    ) : (
                        <EmptyState title={t('worksPage.noProjectsTitle')} body={t('worksPage.noProjectsBody')} />
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
