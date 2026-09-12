import { type GuideBlock, type GuideSection } from '@fetrag/contracts'

/** Normalise un texte pour la recherche : minuscules, sans accents, espaces réduits. */
export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[*`[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function blockText(block: GuideBlock): string[] {
  switch (block.type) {
    case 'paragraph':
      return [block.text]
    case 'steps':
      return [block.title, block.intro, ...block.items.flatMap((s) => [s.text, s.ui, s.where, s.result, s.note])].filter((v): v is string => Boolean(v))
    case 'list':
      return [block.title, ...block.items].filter((v): v is string => Boolean(v))
    case 'callout':
      return [block.title, block.text].filter((v): v is string => Boolean(v))
    case 'table':
      return [block.caption, ...block.columns, ...block.rows.flat()].filter((v): v is string => Boolean(v))
    case 'definitions':
      return [block.title, ...block.items.flatMap((d) => [d.term, d.definition])].filter((v): v is string => Boolean(v))
    case 'faq':
      return [block.title, ...block.items.flatMap((q) => [q.question, q.answer])].filter((v): v is string => Boolean(v))
    case 'path':
      return [block.label, ...block.items].filter((v): v is string => Boolean(v))
    case 'screen':
      return [block.title, block.description, ...block.areas.flatMap((a) => [a.name, a.purpose])].filter((v): v is string => Boolean(v))
    case 'links':
      return [block.title, ...block.items.flatMap((l) => [l.label, l.description])].filter((v): v is string => Boolean(v))
    case 'troubleshooting':
      return [block.title, ...block.items.flatMap((t) => [t.problem, t.cause, t.solution])].filter((v): v is string => Boolean(v))
    case 'statuses':
      return [block.title, ...block.items.flatMap((s) => [s.label, s.meaning, s.next])].filter((v): v is string => Boolean(v))
  }
}

/** Texte intégral d'une section (titre, résumé, blocs, sous-sections), normalisé pour la recherche. */
export function sectionSearchText(section: GuideSection): string {
  const parts: string[] = [section.title, section.summary ?? '']
  for (const block of section.blocks) parts.push(...blockText(block))
  for (const sub of section.subsections ?? []) {
    parts.push(sub.title)
    for (const block of sub.blocks) parts.push(...blockText(block))
  }
  return normalizeSearchText(parts.join(' '))
}

/** Numéro d'ordre sur deux chiffres (« 01 », « 12 »). */
export function guideOrdinal(index: number): string {
  return String(index + 1).padStart(2, '0')
}

const frenchMonths = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'] as const

/** Formate une date `AAAA-MM-JJ` en français (« 12 septembre 2026 »), sans dépendance externe. */
export function formatGuideDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return iso
  const [, year, month, day] = match
  const monthIndex = Number(month) - 1
  const monthLabel = frenchMonths[monthIndex]
  if (!monthLabel || !day || !year) return iso
  const dayNumber = Number(day)
  return `${dayNumber === 1 ? '1er' : String(dayNumber)} ${monthLabel} ${year}`
}
