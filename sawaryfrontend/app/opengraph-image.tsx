import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'سواري للتصميم والتنفيذ — Sawary Design & Execution'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const [bgImage, fontData] = await Promise.all([
    readFile(join(process.cwd(), 'public/images/hero/finalFrame.jpg')),
    readFile(join(process.cwd(), 'public/fonts/29LTZawi-Bold.otf')),
  ])
  const bgSrc = `data:image/jpeg;base64,${bgImage.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (next/og) requires <img>, not next/image */}
        <img
          src={bgSrc}
          alt=""
          width={1200}
          height={630}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(52, 50, 41, 0.50)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'Zawi',
              fontWeight: 700,
              fontSize: 150,
              color: 'rgb(245,235,221)',
              letterSpacing: 6,
              textShadow: '0 4px 40px rgba(0,0,0,0.45)',
            }}
          >
            سواري
          </div>
          <div
            style={{
              marginTop: 20,
              fontFamily: 'Zawi',
              fontWeight: 400,
              fontSize: 34,
              color: 'rgb(190, 156, 100)',
              letterSpacing: 16,
              textTransform: 'uppercase',
            }}
          >
            Sawary Design & Execution
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Zawi', data: fontData, style: 'normal', weight: 700 }],
    },
  )
}
