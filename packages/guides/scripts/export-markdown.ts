/**
 * Exporte les guides d'utilisation en Markdown dans `docs/guides` (documentation hors ligne,
 * livrable de réversibilité). À relancer après toute modification du contenu :
 *
 *   pnpm --filter @fetrag/guides export:docs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { guides } from '../src/catalog'
import { guidePath } from '../src/access'
import { guideToMarkdown } from '../src/markdown'
import { validateGuides } from '../src/validate'

const here = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(here, '../../../docs/guides')
const baseUrls = { web: 'https://fetrag.ga', lms: 'https://formation.fetrag.ga' } as const

const issues = validateGuides(guides)
if (issues.length > 0) {
  for (const issue of issues) console.error(`[${issue.guideId}] ${issue.path} : ${issue.message}`)
  process.exit(1)
}

fs.mkdirSync(outDir, { recursive: true })
for (const entry of fs.readdirSync(outDir)) {
  if (entry.endsWith('.md') && entry !== 'README.md') fs.unlinkSync(path.join(outDir, entry))
}

const index: string[] = [
  '# Guides d’utilisation par rôle',
  '',
  'Fichiers générés depuis `packages/guides` (`pnpm --filter @fetrag/guides export:docs`) : ne pas modifier à la main.',
  'Chaque guide est aussi consultable dans l’application par les personnes qui ont le rôle correspondant.',
  '',
  '| Guide | Plateforme | Rôle | Page dans l’application |',
  '| --- | --- | --- | --- |',
]
for (const guide of guides) {
  const file = `${guide.id}.md`
  const url = `${baseUrls[guide.platform]}${guidePath(guide)}`
  fs.writeFileSync(path.join(outDir, file), guideToMarkdown(guide, { baseUrl: url, baseUrls }), 'utf8')
  index.push(`| [${guide.title}](${file}) | ${guide.platform === 'web' ? 'fetrag.ga' : 'formation.fetrag.ga'} | ${guide.role} | ${url} |`)
  console.info(`écrit ${file}`)
}
fs.writeFileSync(path.join(outDir, 'README.md'), `${index.join('\n')}\n`, 'utf8')
console.info(`${guides.length} guides exportés dans ${outDir}`)
