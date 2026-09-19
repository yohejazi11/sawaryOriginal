import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default async function Icon() {
  const logoData = await readFile(
    join(process.cwd(), 'public/logo/logo.png'),
  )

  return new Response(logoData, {
    headers: { 'Content-Type': contentType },
  })
}
