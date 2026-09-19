import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default async function AppleIcon() {
  const fontData = await readFile(
    join(process.cwd(), 'public/fonts/29LTZawi-Bold.otf'),
  )

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgb(52, 50, 41)',
          color: 'rgb(190, 156, 100)',
          fontFamily: 'Zawi',
          fontSize: 130,
          fontWeight: 700,
        }}
      >
        س
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Zawi', data: fontData, style: 'normal', weight: 700 }],
    },
  )
}
