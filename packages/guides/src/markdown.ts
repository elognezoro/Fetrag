import { guideStats, type Guide, type GuideBlock, type GuideStep } from '@fetrag/contracts'

/**
 * Sérialisation Markdown d'un guide (documentation hors ligne dans `docs/guides`, impression).
 * La mise en forme en ligne (`**gras**`, `` `pastille` ``, `[lien](url)`) est déjà du Markdown.
 */

function step(item: GuideStep, index: number): string {
  const lines = [`${index + 1}. ${item.text}`]
  if (item.ui) lines.push(`   - Élément : \`${item.ui}\`${item.where ? ` (${item.where})` : ''}`)
  else if (item.where) lines.push(`   - Où : ${item.where}`)
  if (item.result) lines.push(`   - Résultat attendu : ${item.result}`)
  if (item.note) lines.push(`   - Remarque : ${item.note}`)
  return lines.join('\n')
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

function block(item: GuideBlock, level: number): string {
  const h = '#'.repeat(Math.min(level, 6))
  switch (item.type) {
    case 'paragraph':
      return item.text
    case 'steps':
      return [item.title ? `${h} ${item.title}` : null, item.intro ?? null, item.items.map(step).join('\n')].filter(Boolean).join('\n\n')
    case 'list':
      return [item.title ? `${h} ${item.title}` : null, item.items.map((entry) => `- ${item.style === 'check' ? '[x] ' : ''}${entry}`).join('\n')]
        .filter(Boolean)
        .join('\n\n')
    case 'callout': {
      const labels = { info: 'À savoir', tip: 'Conseil', warning: 'Attention', danger: 'Important', success: 'Bon à savoir' } as const
      return `> **${item.title ?? labels[item.tone]}** : ${item.text}`
    }
    case 'table': {
      const head = `| ${item.columns.map(escapeCell).join(' | ')} |`
      const sep = `| ${item.columns.map(() => '---').join(' | ')} |`
      const rows = item.rows.map((row) => `| ${row.map(escapeCell).join(' | ')} |`)
      return [item.caption ? `*${item.caption}*` : null, [head, sep, ...rows].join('\n')].filter(Boolean).join('\n\n')
    }
    case 'definitions':
      return [item.title ? `${h} ${item.title}` : null, item.items.map((entry) => `- **${entry.term}** : ${entry.definition}`).join('\n')].filter(Boolean).join('\n\n')
    case 'faq':
      return [item.title ? `${h} ${item.title}` : null, item.items.map((entry) => `**${entry.question}**\n\n${entry.answer}`).join('\n\n')].filter(Boolean).join('\n\n')
    case 'path':
      return `${item.label ? `${item.label} : ` : ''}${item.items.join(' › ')}${item.href ? ` (\`${item.href}\`)` : ''}`
    case 'screen':
      return [`${h} Écran : ${item.title}`, item.description ?? null, item.areas.map((area) => `- **${area.name}** : ${area.purpose}`).join('\n')].filter(Boolean).join('\n\n')
    case 'links':
      return [
        item.title ? `${h} ${item.title}` : null,
        item.items.map((link) => `- [${link.label}](${link.href})${link.description ? ` : ${link.description}` : ''}`).join('\n'),
      ]
        .filter(Boolean)
        .join('\n\n')
    case 'troubleshooting':
      return [
        item.title ? `${h} ${item.title}` : null,
        item.items.map((entry) => `- **${entry.problem}**${entry.cause ? ` (cause probable : ${entry.cause})` : ''} : ${entry.solution}`).join('\n'),
      ]
        .filter(Boolean)
        .join('\n\n')
    case 'statuses': {
      const head = '| Statut | Signification | Ce que vous pouvez faire |\n| --- | --- | --- |'
      return [item.title ? `${h} ${item.title}` : null, [head, ...item.items.map((entry) => `| ${escapeCell(entry.label)} | ${escapeCell(entry.meaning)} | ${escapeCell(entry.next ?? '')} |`)].join('\n')]
        .filter(Boolean)
        .join('\n\n')
    }
  }
}

/** URL publiques par défaut (domaines définitifs) pour les marqueurs `{{web}}` et `{{lms}}`. */
export const defaultGuideBaseUrls = { web: 'https://fetrag.ga', lms: 'https://formation.fetrag.ga' } as const

/** Remplace les marqueurs `{{web}}` et `{{lms}}` par les URL publiques des deux applications. */
export function resolveGuideUrls(text: string, baseUrls: { web: string; lms: string }): string {
  return text.replace(/\{\{web\}\}/g, baseUrls.web).replace(/\{\{lms\}\}/g, baseUrls.lms)
}

/** Convertit un guide complet en document Markdown (titre de niveau 1, sections de niveau 2). */
export function guideToMarkdown(guide: Guide, options: { baseUrl?: string; baseUrls?: { web: string; lms: string } } = {}): string {
  const stats = guideStats(guide)
  const out: string[] = []
  out.push(`# ${guide.title}`)
  out.push(`*${guide.subtitle}*`)
  out.push(`Plateforme : ${guide.platform === 'web' ? 'site institutionnel fetrag.ga' : 'plateforme de formation formation.fetrag.ga'} · Rôle : ${guide.role} · Version ${guide.version} du ${guide.updatedAt} · Lecture : ${guide.readingMinutes} min · ${stats.sections} sections, ${stats.steps} étapes.`)
  if (options.baseUrl) out.push(`Version en ligne : ${options.baseUrl}`)
  out.push(`**À qui s'adresse ce guide ?** ${guide.audience}`)
  out.push(guide.summary)
  if (guide.prerequisites?.length) out.push(['## Avant de commencer', guide.prerequisites.map((p) => `- ${p}`).join('\n')].join('\n\n'))
  if (guide.quickStart?.length) out.push(['## Prise en main en cinq minutes', guide.quickStart.map(step).join('\n')].join('\n\n'))
  out.push('## Sommaire')
  out.push(guide.sections.map((section, i) => `${i + 1}. [${section.title}](#${section.id})`).join('\n'))
  for (const [i, section] of guide.sections.entries()) {
    out.push(`## ${i + 1}. ${section.title} <a id="${section.id}"></a>`)
    if (section.summary) out.push(`*${section.summary}*`)
    for (const b of section.blocks) out.push(block(b, 3))
    for (const sub of section.subsections ?? []) {
      out.push(`### ${sub.title} <a id="${sub.id}"></a>`)
      for (const b of sub.blocks) out.push(block(b, 4))
    }
  }
  if (guide.related?.length) {
    out.push('## Guides liés')
    out.push(guide.related.map((link) => `- [${link.label}](${link.href})${link.description ? ` : ${link.description}` : ''}`).join('\n'))
  }
  return resolveGuideUrls(`${out.join('\n\n')}\n`, options.baseUrls ?? defaultGuideBaseUrls)
}
