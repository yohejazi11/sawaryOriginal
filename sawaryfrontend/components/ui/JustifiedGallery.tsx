'use client'

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export interface JustifiedGalleryCaption {
  title: string
  subtitle?: string
}

export interface JustifiedGalleryImage {
  src: string
  alt: string
  width: number | null
  height: number | null
  /** Present → tile becomes a link to a project instead of a lightbox trigger. */
  href?: string
  /** Present → a plain title/subtitle caption is rendered below the tile (never on top of the photo). */
  caption?: JustifiedGalleryCaption
}

interface JustifiedGalleryProps {
  images: JustifiedGalleryImage[]
  onImageClick?: (index: number) => void
  className?: string
}

// Images with no stored dimensions (not yet backfilled, or unreadable at upload time)
// still need *some* box to lay out in — a neutral ratio degrades gracefully for that
// one tile without fabricating a real measurement.
const FALLBACK_RATIO = 4 / 3

// container width → { how tall a "full" row aims to be, gap between tiles }.
// Gap is 0 — the gallery reads as one continuous, edge-to-edge photo strip.
const BREAKPOINTS = [
  { minWidth: 1024, targetRowHeight: 420, gap: 0 },
  { minWidth: 640, targetRowHeight: 320, gap: 0 },
  { minWidth: 0, targetRowHeight: 240, gap: 0 },
] as const

// Below this the justified algorithm has too little width to do anything useful with
// more than one tile per row — fall back to a simple natural-height single column.
const SINGLE_COLUMN_BREAKPOINT = 480

// There is no real container width to measure during SSR (no DOM) or on the very
// first client render (before the ResizeObserver has fired). Rather than render
// nothing until JS measures the page — which would mean crawlers and no-JS clients
// never see the tiles' <a href> links or <img> tags at all — lay out an initial,
// best-guess desktop-width pass so real, crawlable markup exists from first paint.
// The ResizeObserver corrects it to the true pixel width immediately after mount.
const INITIAL_WIDTH_GUESS = 1200

const MIN_ROW_HEIGHT_RATIO = 0.55
const MAX_ROW_HEIGHT_RATIO = 1.6

interface LaidOutImage extends JustifiedGalleryImage {
  index: number
  displayWidth: number
}

interface LaidOutRow {
  height: number
  /**
   * The row's actual rendered width — sum of every image's displayWidth plus gaps.
   * For a "full" row this equals containerWidth, but the trailing row (or any row
   * whose natural fit comes in under target height, e.g. a single portrait image at
   * the end of the gallery) is deliberately NOT stretched to fill the container — see
   * the isLastRow comment in layoutRows. The row's own wrapper element must be sized
   * to exactly this width; otherwise a plain block-level div stretches to 100% of the
   * container by default, and the leftover space (container width minus the row's
   * actual content width) renders as bare background next to/around the image instead
   * of the image and its neighbor touching directly.
   */
  width: number
  images: LaidOutImage[]
}

function ratioOf(img: JustifiedGalleryImage): number {
  return img.width && img.height ? img.width / img.height : FALLBACK_RATIO
}

function layoutRows(
  images: JustifiedGalleryImage[],
  containerWidth: number,
  targetRowHeight: number,
  gap: number,
): LaidOutRow[] {
  const rows: LaidOutRow[] = []
  const minHeight = targetRowHeight * MIN_ROW_HEIGHT_RATIO
  const maxHeight = targetRowHeight * MAX_ROW_HEIGHT_RATIO

  let current: { img: JustifiedGalleryImage; index: number; ratio: number }[] = []
  let ratioSum = 0

  const flush = (isLastRow: boolean) => {
    if (current.length === 0) return

    const gapsWidth = gap * (current.length - 1)
    const availableWidth = containerWidth - gapsWidth
    let rowHeight = availableWidth / ratioSum

    // A short trailing row should stay at its natural height rather than stretch
    // to fill the last line — "may remain shorter rather than stretching unnaturally."
    if (isLastRow && rowHeight > targetRowHeight) rowHeight = targetRowHeight

    rowHeight = Math.min(Math.max(rowHeight, minHeight), maxHeight)

    let displayWidths = current.map(({ ratio }) => rowHeight * ratio)
    let totalWidth = displayWidths.reduce((a, b) => a + b, 0) + gapsWidth

    // Clamping (or a single extreme-ratio image) can make a row wider than the
    // container. Rescale uniformly rather than let it overflow horizontally —
    // every image in the row keeps its exact ratio, so nothing distorts.
    if (totalWidth > containerWidth) {
      const scale = (containerWidth - gapsWidth) / (totalWidth - gapsWidth)
      rowHeight *= scale
      displayWidths = displayWidths.map(w => w * scale)
      totalWidth = containerWidth
    }

    rows.push({
      height: rowHeight,
      width: totalWidth,
      images: current.map(({ img, index }, i) => ({
        ...img,
        index,
        displayWidth: displayWidths[i],
      })),
    })

    current = []
    ratioSum = 0
  }

  images.forEach((img, index) => {
    const ratio = ratioOf(img)
    current.push({ img, index, ratio })
    ratioSum += ratio

    const gapsWidth = gap * (current.length - 1)
    const widthAtTarget = targetRowHeight * ratioSum + gapsWidth
    if (widthAtTarget >= containerWidth) flush(false)
  })
  flush(true)

  return rows
}

// A tile is either a lightbox trigger (project detail page — no caption) or a link
// to a project (Works listing — caption rendered below, never over, the photo).
// Pass a fixed pixel `height` for justified rows, or omit it (single-column fallback)
// to size the box from the image's own aspect ratio instead.
// First couple of tiles sit above the fold and are typically the page's LCP element —
// load those eagerly rather than lazily so Next.js doesn't delay the largest paint.
const EAGER_LOAD_COUNT = 2

function Tile({
  img,
  index,
  width,
  height,
  onImageClick,
  sizes,
  onNaturalSize,
}: {
  img: JustifiedGalleryImage
  index: number
  width: number | string
  height?: number
  onImageClick?: (index: number) => void
  sizes: string
  /** Reports the real decoded size once the photo loads — only wired when img.width/height are still missing. */
  onNaturalSize?: (src: string, width: number, height: number) => void
}) {
  const eager = index < EAGER_LOAD_COUNT
  const needsMeasurement = !(img.width && img.height)
  const photo = (
    <div
      className="relative overflow-hidden"
      style={height != null ? { width, height } : { width, aspectRatio: ratioOf(img) }}
    >
      <Image
        src={img.src}
        alt={img.alt}
        fill
        className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
        sizes={sizes}
        priority={eager}
        loading={eager ? undefined : 'lazy'}
        onLoad={needsMeasurement ? (e) => {
          const el = e.currentTarget
          if (el.naturalWidth && el.naturalHeight) onNaturalSize?.(img.src, el.naturalWidth, el.naturalHeight)
        } : undefined}
      />
    </div>
  )

  if (img.href) {
    return (
      <Link href={img.href} className="group shrink-0" style={{ width }}>
        {photo}
        {img.caption && (
          <div className="pt-3">
            <p className="truncate text-base font-medium text-brand-cream transition-colors duration-200 group-hover:text-brand-primary">
              {img.caption.title}
            </p>
            {img.caption.subtitle && (
              <p className="mt-1 truncate text-sm font-light text-brand-cream/45">
                {img.caption.subtitle}
              </p>
            )}
          </div>
        )}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onImageClick?.(index)}
      className="group relative shrink-0 overflow-hidden"
      style={{ width, cursor: onImageClick ? 'pointer' : 'default' }}
    >
      {photo}
    </button>
  )
}

export default function JustifiedGallery({ images, onImageClick, className }: JustifiedGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(INITIAL_WIDTH_GUESS)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width
      if (width) setContainerWidth(width)
    })
    observer.observe(el)
    setContainerWidth(el.clientWidth)

    return () => observer.disconnect()
  }, [])

  // Fallback measurement — the API/CMS is *supposed* to store each image's real
  // width/height (see lib/projects.ts), but photos uploaded before that field
  // existed have neither, and FALLBACK_RATIO is only a reasonable stand-in for a
  // single stray tile. When it's applied to an entire gallery at once (a whole
  // project whose images were never backfilled) every box gets the same wrong
  // ratio regardless of whether the photo is portrait or landscape, which is
  // exactly what produces visible letterboxing under object-contain. Rather than
  // keep guessing, read the real decoded size off the <Image> itself once it loads
  // (Tile wires this to onLoad only when width/height are missing) and use that for
  // layout instead — no extra network request, we're just reading the image that
  // was going to be fetched and displayed anyway.
  const [measured, setMeasured] = useState<Record<string, { width: number; height: number }>>({})
  const handleNaturalSize = useCallback((src: string, width: number, height: number) => {
    setMeasured(prev => (prev[src] ? prev : { ...prev, [src]: { width, height } }))
  }, [])

  const effectiveImages = useMemo(
    () => images.map(img => {
      if (img.width && img.height) return img
      const m = measured[img.src]
      return m ? { ...img, width: m.width, height: m.height } : img
    }),
    [images, measured],
  )

  if (effectiveImages.length === 0) return null

  if (containerWidth < SINGLE_COLUMN_BREAKPOINT) {
    const stackGap = effectiveImages.some(img => img.caption) ? 'gap-8' : 'gap-0'
    return (
      <div ref={containerRef} className={`flex flex-col ${stackGap} ${className ?? ''}`}>
        {effectiveImages.map((img, i) => (
          <Tile
            key={`${img.src}-${i}`}
            img={img}
            index={i}
            width="100%"
            onImageClick={onImageClick}
            sizes="100vw"
            onNaturalSize={handleNaturalSize}
          />
        ))}
      </div>
    )
  }

  const breakpoint = BREAKPOINTS.find(bp => containerWidth >= bp.minWidth) ?? BREAKPOINTS[BREAKPOINTS.length - 1]
  const rows = layoutRows(effectiveImages, containerWidth, breakpoint.targetRowHeight, breakpoint.gap)
  const hasCaptions = effectiveImages.some(img => img.caption)

  return (
    <div ref={containerRef} className={className}>
      <div className="flex flex-col" style={{ gap: hasCaptions ? breakpoint.gap * 2.5 : breakpoint.gap }}>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex" style={{ gap: breakpoint.gap, width: row.width }}>
            {row.images.map(img => (
              <Tile
                key={`${img.src}-${img.index}`}
                img={img}
                index={img.index}
                width={img.displayWidth}
                height={row.height}
                onImageClick={onImageClick}
                sizes={`${Math.ceil(img.displayWidth)}px`}
                onNaturalSize={handleNaturalSize}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
