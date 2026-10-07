'use client';

import { useState, type SyntheticEvent } from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';

interface GalleryImageProps {
    src: string;
    alt: string;
    sizes: string;
    className?: string;
    /** "contain" keeps the whole photo visible (justified gallery tiles). */
    fit?: 'cover' | 'contain';
    /** "dark" = sits on the dark background, so the placeholder flips to cream. */
    tone?: 'light' | 'dark';
    onLoad?: (e: SyntheticEvent<HTMLImageElement>) => void;
}

// Fills its (relative, explicitly sized) parent: a pulsing placeholder shows until the
// image has loaded, then the image fades in over it. On error the image is dropped and
// a static neutral placeholder stays instead of the browser's broken-image icon.
export default function GalleryImage({
    src,
    alt,
    sizes,
    className = '',
    fit = 'cover',
    tone = 'light',
    onLoad,
}: GalleryImageProps) {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

    return (
        <>
            {status !== 'loaded' && (
                <div
                    aria-hidden
                    className={`absolute inset-0 rounded-[25px] flex items-center justify-center ${
                        tone === 'dark' ? 'bg-[#F4EFE3]/10' : 'bg-[#343229]/10'
                    } ${status === 'loading' ? 'animate-pulse' : ''}`}
                >
                    {status === 'error' && (
                        <ImageOff
                            size={28}
                            strokeWidth={1.3}
                            className={tone === 'dark' ? 'text-[#F4EFE3]/40' : 'text-[#343229]/40'}
                        />
                    )}
                </div>
            )}

            {status !== 'error' && (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes={sizes}
                    loading="lazy"
                    onLoad={e => {
                        setStatus('loaded');
                        onLoad?.(e);
                    }}
                    onError={() => setStatus('error')}
                    // One transition rule for both the 300ms fade-in and the card's 500ms hover
                    // zoom — separate transition-* utilities would override each other.
                    className={`${fit === 'contain' ? 'object-contain' : 'object-cover'} [transition:opacity_300ms_ease,transform_500ms_ease] ${
                        status === 'loaded' ? 'opacity-100' : 'opacity-0'
                    } ${className}`}
                />
            )}
        </>
    );
}
