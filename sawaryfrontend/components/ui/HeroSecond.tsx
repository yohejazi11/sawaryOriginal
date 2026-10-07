'use client';

import Image from 'next/image';
import { motion, MotionConfig, type Variants } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { localizedHref } from '@/lib/i18n';
interface HeroSecondProps {
    image?: string;
    shapeImage?: string;
}

// Stepped shape (876×644) used as the image mask, and the text artwork that sits in
// the shape's cut-out bottom-right corner.
const SHAPE_MASK = '/images/svgshape/Maskgroup.svg';
const SHAPE_TEXT = '/images/svgshape/Maskgrouptwo.svg';

const EASE = [0.22, 1, 0.36, 1] as const;

// Scroll-in choreography (plays once). The in-view check runs on the unclipped row;
// everything inside follows via variants, so clipped elements never block the trigger.
const row: Variants = { hidden: {}, show: {} };
const column: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.18, delayChildren: 0.25 } } };
const shapeReveal: Variants = {
    hidden: { clipPath: 'inset(0% 0% 100% 0%)' },
    show: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 1.3, ease: EASE } },
};
const zoomOut: Variants = {
    hidden: { scale: 1.2 },
    show: { scale: 1, transition: { duration: 1.8, ease: EASE } },
};
const textArt: Variants = {
    hidden: { opacity: 0, x: 60 },
    show: { opacity: 1, x: 0, transition: { duration: 1, ease: EASE, delay: 0.8 } },
};
const cardRise: Variants = {
    hidden: { opacity: 0, y: 48 },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE, staggerChildren: 0.1, delayChildren: 0.3 } },
};
const cardCurtain: Variants = {
    hidden: { clipPath: 'inset(100% 0% 0% 0% round 25px)' },
    show: { clipPath: 'inset(0% 0% 0% 0% round 25px)', transition: { duration: 1.1, ease: EASE, staggerChildren: 0.1, delayChildren: 0.5 } },
};
const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export default function HeroSecond({
    image = '/images/hero/heroImage.webp',
    shapeImage = '/images/svgshape/imagethree.jpg',
}: HeroSecondProps) {
    const { t, lang } = useLanguage();
    const { whatsAppNumber } = useSiteSettings();

    return (
        <section
            className="relative w-[calc(100%-64px)] max-sm:w-[calc(100%-32px)] overflow-hidden select-none mx-[32px] max-sm:mx-4 rounded-[25px]"
            style={{ height: 'fit-content', marginTop: '6.5rem', marginBottom: '12px' }}
        // style={{ height: 'calc(100vh - 6.5rem)', marginTop: '6.5rem', marginBottom: '12px' }}

        >
            <MotionConfig reducedMotion="user">
            <motion.div
                className="w-full flex gap-[32px] max-md:flex-col max-md:gap-4"
                variants={row}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
            >
                {/* self-start: don't stretch to the right column's height — the box must keep
                    the shape's 876/644 ratio so its bottom is the image's bottom. */}
                <div className="relative w-[65%] max-md:w-full aspect-[876/644] self-start">
                    {/* الصورة مقصوصة على شكل المسار */}
                    <motion.div
                        variants={shapeReveal}
                        className="group absolute inset-0 overflow-hidden"
                        style={{
                            WebkitMaskImage: `url(${SHAPE_MASK})`,
                            maskImage: `url(${SHAPE_MASK})`,
                            WebkitMaskSize: '100% 100%',
                            maskSize: '100% 100%',
                            WebkitMaskRepeat: 'no-repeat',
                            maskRepeat: 'no-repeat',
                        }}
                    >
                        <motion.div variants={zoomOut} className="absolute inset-0">
                            <Image
                                src={shapeImage}
                                alt=""
                                fill
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                sizes="(max-width: 767px) 100vw, 65vw"
                            />
                        </motion.div>
                    </motion.div>

                    {/* النص في الزاوية السفلية اليمنى — يملأ الفراغ المدرّج في الشكل
                        (389×241 من أصل 876×644) */}
                    <motion.div
                        variants={textArt}
                        className="absolute right-0 bottom-0 pointer-events-none"
                        // Both dimensions are a percentage of the shape box, so the text
                        // scales in exact proportion with the image and mask at any width.
                        style={{ width: `${(389 / 876) * 100}%`, height: `${(241 / 644) * 100}%` }}
                    >
                        <Image src={SHAPE_TEXT} alt="" width={389} height={241} className="h-full w-full" />
                    </motion.div>
                </div>
                {/* <div className="relative w-[65%] aspect-[1199/723]">
                    <div
                        className="absolute inset-0"
                        style={{
                            WebkitMaskImage: 'url(/images/svgshape/Maskgroup.svg)',
                            maskImage: 'url(/images/svgshape/Maskgroup.svg)',
                            WebkitMaskSize: '100% 100%',
                            maskSize: '100% 100%',
                            WebkitMaskRepeat: 'no-repeat',
                            maskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            maskPosition: 'center',
                        }}
                    >
                        <img src={image} alt="" className="w-full h-full object-cover" />
                    </div>
                </div> */}

                <motion.div variants={column} className="w-[35%] max-md:w-full flex flex-col justify-between gap-3">
                    <motion.div variants={cardRise} className="w-[100%] h-fit flex flex-col gap-3 bg-[#F4EFE3] rounded-[25px] p-2">
                        <motion.button variants={item} className="w-fit  border border-[#343229] rounded-[25px] text-[#343229] px-8 py-2 text-[15px]">
                            التصميم
                        </motion.button>

                        <motion.p variants={item} className="w-[50%] max-lg:w-full text-[#343229] text-[20px] max-sm:text-[17px]">نصمّم لك مساحة تحكي قصة ذوقك في كل تفصيلة</motion.p>

                        <motion.p variants={item} className="w-[50%] max-lg:w-full text-[#343229] text-[40px] max-lg:text-[30px] max-sm:text-[26px] font-bold">نرسم ملامح الأناقة</motion.p>
                    </motion.div>

                    <motion.div variants={cardCurtain} className="group relative w-[100%] h-[350px] max-md:h-[260px] rounded-[25px] overflow-hidden">
                        {/* الصورة الخلفية */}
                        <motion.div variants={zoomOut} className="absolute inset-0">
                            <Image
                                src={image}
                                alt=""
                                fill
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                sizes="(max-width: 767px) 100vw, 35vw"
                            />
                        </motion.div>
                        <div className="absolute inset-0 bg-black/20"></div>
                        {/* الكلام فوق الصورة */}
                        <div className="relative z-10 flex flex-col gap-4 p-3 h-full justify-start text-white">
                            <motion.button variants={item} className="w-fit  border border-[#F4EFE3] rounded-[25px] text-[#F4EFE3] px-8 py-2 text-[15px]">
                                تنفيذنا
                            </motion.button>
                            <motion.p variants={item} className="w-[50%] max-lg:w-[80%] max-sm:w-full text-[#F4EFE3] text-[20px] max-sm:text-[17px]">ننفّذ رؤيتك بأدق التفاصيل وأجود الخامات لتعيش المساحة كما تخيّلتها تماماً</motion.p>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
            </MotionConfig>
        </section>
    );
}