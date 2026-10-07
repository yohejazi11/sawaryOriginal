// Extracts the 11-char video ID from any common YouTube link shape:
// youtu.be/ID, youtube.com/watch?v=ID, /embed/ID, /shorts/ID, /live/ID.
// Returns null for anything that isn't a recognisable YouTube video link.
export function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null
  let u: URL
  try {
    u = new URL(url.trim())
  } catch {
    return null
  }

  const host = u.hostname.replace(/^(www\.|m\.)/, '')
  let id: string | null = null
  if (host === 'youtu.be') {
    id = u.pathname.split('/')[1] ?? null
  } else if (host === 'youtube.com') {
    id = u.searchParams.get('v') ?? u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/)?.[1] ?? null
  }

  return id && /^[\w-]{11}$/.test(id) ? id : null
}
