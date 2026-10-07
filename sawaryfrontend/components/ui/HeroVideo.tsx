'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

// Click-to-play YouTube tile. Shows the video's thumbnail until clicked, then swaps in
// the player — so the ~1MB YouTube embed never loads unless the visitor asks for it.
// Fills its (relative, explicitly sized) parent.
export default function HeroVideo({ videoId, title }: { videoId: string; title: string }) {
    const [playing, setPlaying] = useState(false);

    if (playing) {
        return (
            <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full rounded-[13px] border-0"
            />
        );
    }

    return (
        <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={title}
            className="group absolute inset-0 overflow-hidden rounded-[13px]"
        >
            <Image
                src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                alt=""
                fill
                sizes="(max-width: 767px) 100vw, (max-width: 1023px) 45vw, 25vw"
                className="object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors duration-300 group-hover:bg-black/30">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F4EFE3]/90 text-[#343229] shadow-lg transition-transform duration-300 group-hover:scale-110">
                    <Play size={20} fill="currentColor" className="translate-x-[1px]" />
                </span>
            </span>
        </button>
    );
}
