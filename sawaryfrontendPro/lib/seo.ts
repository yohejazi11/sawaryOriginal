export const SITE_URL = 'https://www.sawarydecor.com'
export const SITE_NAME = 'سواري للتصميم والتنفيذ'

/**
 * Safely serializes a JSON-LD payload for `<script type="application/ld+json"
 * dangerouslySetInnerHTML>`. Several of these payloads embed admin-entered text
 * (project name/description via getProjectDescription, etc.) — plain JSON.stringify()
 * does NOT escape "<", so a value containing the literal string "</script>" would
 * close the script tag early and inject arbitrary HTML into the public page. Escaping
 * every "<" to its unicode form neutralizes that while staying valid JSON (and thus
 * valid JSON-LD) — the standard mitigation for JSON-in-<script> injection.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

type FaqEntry = { question: string; answer: string }

export function faqJsonLd(entries: FaqEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }
}

type BreadcrumbItem = {
  name: string
  path: string
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(({ name, path }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: `${SITE_URL}${path}`,
    })),
  }
}

type ServiceInfo = {
  name: string
  serviceType: string
  description: string
  path: string
}

export function serviceJsonLd({ name, serviceType, description, path }: ServiceInfo) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    serviceType,
    description,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: {
      '@type': 'Country',
      name: 'SA',
    },
    url: `${SITE_URL}${path}`,
  }
}
