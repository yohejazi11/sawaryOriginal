import type { ReactNode } from "react";
import Link from "next/link";
import { MdArrowOutward } from "react-icons/md";
import { getProjects, type ApiProjectList } from "@/lib/projects";
import { localizedHref, type Locale } from "@/lib/i18n";
import FeaturedBadge from "@/components/ui/FeaturedBadge";
import GalleryImage from "@/components/ui/GalleryImage";
import Reveal from "@/components/ui/Reveal";

// Card heights per column, top to bottom — keeps the staggered masonry look.
const COLUMN_HEIGHTS = [
    ["h-[430px]", "h-[430px]"],
    ["h-[530px]", "h-[330px]"],
    ["h-[430px]", "h-[430px]"],
];

// Cards uncover column by column (following the reading direction), top card before bottom.
function GalleryCard({ project, height, lang, index }: { project: ApiProjectList; height: string; lang: Locale; index: number }) {
    const delay = Math.floor(index / 2) * 0.15 + (index % 2) * 0.2;

    return (
        <Reveal variant="curtain" delay={delay} duration={1.1} className="w-full">
            <Link
                href={localizedHref(lang, `/works/project/${project.id}`)}
                className={`group relative block w-full ${height} rounded-[25px] border border-[#343229] overflow-hidden`}
            >
                <GalleryImage
                    src={project.coverImageUrl}
                    alt={project.name}
                    sizes="(max-width: 639px) 100vw, 33vw"
                    className="rounded-[25px] group-hover:scale-105"
                />
                {project.isFeatured && <FeaturedBadge />}
                <Reveal variant="pop" delay={delay + 0.6} duration={0.5} className="absolute bottom-[18px] left-[18px] z-50">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F4EFE3] text-[#343229] text-[24px] opacity-75 shadow-lg transition-transform duration-200 group-hover:scale-110">
                        <MdArrowOutward />
                    </span>
                </Reveal>
            </Link>
        </Reveal>
    );
}

// Section chrome (heading, intro, both "more" links) shared by the real section and its
// loading skeleton, so the skeleton occupies exactly the same space.
function GalleryShell({ lang, children }: { lang: Locale; children: ReactNode }) {
    const worksHref = localizedHref(lang, "/works");

    return (
        <section className="w-full h-fit bg-[#F4EFE3] flex flex-col py-[64px] px-[32px] max-sm:px-4 ">
            <div className="w-full flex justify-between items-center gap-[32px] max-sm:flex-col max-sm:items-start max-sm:gap-6">
                <Reveal className="w-[40%] max-sm:w-full text-[#343229]">
                    <p className="text-[64px] max-lg:text-[48px] max-md:text-[40px] max-sm:text-[34px] max-lg:leading-tight">استعرض ابداعاتنا وأعمالنا</p>
                </Reveal>

                <div className="w-[60%] max-sm:w-full flex flex-col items-end max-sm:items-start gap-6 max-sm:flex-col-reverse">
                    <Reveal delay={0.15}>
                        <Link href={worksHref} className="block w-fit px-[46px] py-2 rounded-[15px] bg-[#343229] text-[#F4EFE3]">
                            المزيد
                        </Link>
                    </Reveal>
                    <Reveal delay={0.25} className="w-[75%] max-sm:w-full">
                        <p className="text-[16px] text-[#343229] text-[20px] max-sm:text-[17px] text-left max-sm:text-start">
                            تصفّح مجموعة من المشاريع التي حوّلنا فيها الأفكار إلى مساحات نابضة بالحياة، كل تصميم يحكي قصة ذوق وكل تنفيذ يعكس شغفنا بالتفاصيل
                        </p>
                    </Reveal>
                </div>
            </div>

            {children}

            <Reveal className="w-full flex justify-center items-center mt-[64px] max-sm:mt-10">
                <Link href={worksHref} className="w-fit px-[46px] py-2 rounded-[15px] border border-[#343229] text-[#343229]">
                    المزيد
                </Link>
            </Reveal>
        </section >
    );
}

function GalleryGrid({ renderCell }: { renderCell: (height: string, index: number) => ReactNode }) {
    return (
        <div className="w-full flex justify-between items-start gap-2 max-sm:flex-col mt-[64px] max-sm:mt-10">
            {COLUMN_HEIGHTS.map((heights, col) => (
                <div key={col} className="w-[calc(100%/3)] max-sm:w-full h-fit relative flex flex-col justify-end gap-2 text-white">
                    {heights.map((height, row) => renderCell(height, col * 2 + row))}
                </div>
            ))}
        </div>
    );
}

// Suspense fallback — same shell and card heights as the loaded gallery.
export function GallerySectionSkeleton({ lang = "ar" }: { lang?: Locale }) {
    return (
        <GalleryShell lang={lang}>
            <GalleryGrid
                renderCell={(height, i) => (
                    <div key={i} aria-hidden className={`w-full ${height} rounded-[25px] bg-[#343229]/10 animate-pulse`} />
                )}
            />
        </GalleryShell>
    );
}

export default async function GallerySection({ lang = "ar" }: { lang?: Locale }) {
    const projects = (await getProjects()).filter((p) => p.coverImageUrl).slice(0, 6);

    return (
        <GalleryShell lang={lang}>
            {/* Gallery grid — first 6 projects, 2 per column */}
            {projects.length > 0 && (
                <GalleryGrid
                    renderCell={(height, i) => {
                        const project = projects[i];
                        return project ? (
                            <GalleryCard key={project.id} project={project} height={height} lang={lang} index={i} />
                        ) : null;
                    }}
                />
            )}
        </GalleryShell>
    );
}
