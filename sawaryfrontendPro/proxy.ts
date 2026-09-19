import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // English, and explicit Arabic (/ar), already have real segments — pass through
  // untouched. /ar is a supported alias of the canonical unprefixed Arabic surface
  // (renders identical content via the same [lang]='ar' route) but is never the
  // canonical/hreflang target — see lib/i18n.ts.
  if (
    pathname === '/en' || pathname.startsWith('/en/') ||
    pathname === '/ar' || pathname.startsWith('/ar/')
  ) {
    return NextResponse.next()
  }

  // Everything else (the canonical, unprefixed Arabic surface) is internally
  // rewritten to /ar/... — the browser URL bar and any indexed URL are untouched.
  const rewritten = request.nextUrl.clone()
  rewritten.pathname = pathname === '/' ? '/ar' : `/ar${pathname}`
  return NextResponse.rewrite(rewritten)
}

export const config = {
  matcher: [
    /*
     * Run on every path except:
     * - /admin (unlocalized admin app)
     * - /api (no API routes today, future-proofing)
     * - /_next/static, /_next/image (Next internals)
     * - favicon.ico, robots.txt, sitemap.xml, manifest.webmanifest (named metadata files)
     * - icon, apple-icon, opengraph-image (extensionless metadata ROUTES — must be
     *   excluded by name or they'd be rewritten to /ar/icon etc. and break)
     * - any path containing a dot (static files with extensions)
     */
    '/((?!admin|api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|icon|apple-icon|opengraph-image|.*\\..*).*)',
  ],
}
