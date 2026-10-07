'use client';

import Link from 'next/link';
import { motion, MotionConfig, type Variants } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const EASE = [0.22, 1, 0.36, 1] as const;

// Scroll-in choreography (plays once when ~30% of the card is visible):
// image curtain-reveals bottom→top while zooming out, the back border slides out from
// behind it, the outlined number rises, and the text lines stagger in.
const card: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
};

const textLine: Variants = {
    hidden: { opacity: 0, y: 32 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

const imageReveal: Variants = {
    hidden: { clipPath: 'inset(100% 0% 0% 0% round 25px)' },
    show: { clipPath: 'inset(0% 0% 0% 0% round 25px)', transition: { duration: 1.1, ease: EASE } },
};

const imageZoom: Variants = {
    hidden: { scale: 1.2 },
    show: { scale: 1, transition: { duration: 1.6, ease: EASE } },
};

const numberIn: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE, delay: 0.5 } },
};

export default function ServiceCard({ id, number, title, subtitle, href, image, cardDirection, highlights = [] }: { id?: string; number: string; title: string; subtitle: string; href?: string; image: string; cardDirection: 'ltr' | 'rtl'; /** Sub-service names shown as pills under the description. */ highlights?: string[] }) {
    const { t } = useLanguage();

    // The back border sits offset up and to one side of the image; it starts tucked
    // exactly behind the image and slides out to that offset.
    const borderIn: Variants = {
        hidden: { opacity: 0, x: cardDirection === 'ltr' ? -64 : 64, y: 64 },
        show: { opacity: 1, x: 0, y: 0, transition: { duration: 1, ease: EASE, delay: 0.35 } },
    };

    return (
        // reducedMotion="user": visitors who prefer reduced motion get fades only, no movement.
        <MotionConfig reducedMotion="user">
            <motion.div
                id={id}
                className={`scroll-mt-32 w-full flex ${cardDirection === 'ltr' ? 'flex-row' : 'flex-row-reverse'} max-md:flex-col max-md:items-stretch max-md:gap-20 items-center text-[#343229]`}
                variants={card}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
            >
                <motion.div
                    className={`w-1/2 h-fit flex flex-col gap-[60px] justify-center ${cardDirection === 'ltr' ? ' pl-[96px]' : ' pr-[96px]'} max-lg:gap-8 max-lg:pl-8 max-lg:pr-8 max-md:w-full max-md:gap-6 max-md:pl-0 max-md:pr-0 max-md:text-start text-right`}
                    variants={card}
                >
                    <motion.p variants={textLine} className="mt-1 font-bold text-[48px] max-lg:text-[38px] max-sm:text-[30px] max-lg:leading-tight text-right max-md:text-start">{title}</motion.p>
                    <motion.p variants={textLine} className="mt-1 text-[24px] max-lg:text-[20px] max-sm:text-[17px]">{subtitle}</motion.p>
                    {highlights.length > 0 && (
                        <motion.div variants={textLine} className="flex flex-col gap-3">
                            <span className="text-[16px] opacity-60">{t('homeServices.includes')}</span>
                            <div className="flex flex-wrap gap-2">
                                {highlights.map(name => (
                                    <span key={name} className="rounded-[15px] border border-[#343229]/40 px-5 py-1.5 text-[16px]">
                                        {name}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    )}
                    {href && (
                        <motion.div variants={textLine}>
                            <Link
                                href={href}
                                className="w-fit flex items-center gap-2 rounded-[15px] border border-[#343229] px-[64px] max-sm:px-10 py-2 text-[24px] max-sm:text-[18px] font-medium transition-all duration-300 hover:border-[#343229] hover:bg-[#343229] hover:text-white"
                            >
                                {t('homeServices.learnMore')}
                            </Link>
                        </motion.div>
                    )}
                </motion.div>

                <div className="group w-[50%] h-[450px] max-lg:h-[380px] max-md:w-full max-md:h-[320px] max-sm:h-[260px] relative flex flex-col justify-end p-6 text-white">
                    <motion.span
                        variants={numberIn}
                        className={`absolute top-[-70px] max-md:top-[-58px] ${cardDirection === 'ltr' ? 'left-[25px]' : ' right-[25px]'} text-[64px] max-md:text-[48px] font-semibold`}
                        style={{
                            color: 'transparent',
                            WebkitTextStroke: '1.5px #343229',
                        }}
                    >
                        {number}
                    </motion.span>
                    {/* back border */}
                    <motion.div
                        variants={borderIn}
                        className={`w-[85%] h-[100%] absolute ${cardDirection === 'ltr' ? 'right-[-64px] max-md:right-[-12px]' : 'left-[-64px] max-md:left-[-12px]'} top-[-64px] max-md:top-[-20px] border border-[#343229] rounded-[25px]`}
                    />
                    <motion.div variants={imageReveal} className="absolute inset-0 overflow-hidden rounded-[25px]">
                        <motion.div variants={imageZoom} className="h-full w-full">
                            <img src={image}
                                alt={title}
                                className="w-full h-full object-cover rounded-[25px] transition-transform duration-700 ease-out group-hover:scale-105" />
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </MotionConfig>
    );
}
