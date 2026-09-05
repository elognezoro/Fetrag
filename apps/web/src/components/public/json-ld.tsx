/** Injecte un objet JSON-LD (schema.org) dans la page. Les données proviennent du CMS (`seo.jsonLd`), jamais du client. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
