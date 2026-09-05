#!/usr/bin/env node
/**
 * Vérifie qu'aucun emoji n'est présent dans le code et la documentation
 * (règle « Interface » de CLAUDE.md et section 6 du design system : icônes lucide-react uniquement).
 *
 * Usage :
 *   node scripts/check-no-emoji.mjs                 # scanne apps/ et packages/ (.ts, .tsx, .md)
 *   node scripts/check-no-emoji.mjs docs            # scanne aussi docs/
 *   node scripts/check-no-emoji.mjs --ext .ts,.tsx,.md,.css
 *
 * Code de sortie : 0 si aucun emoji, 1 si au moins un emoji est trouvé, 2 en cas d'erreur d'usage.
 * Aucune dépendance : Node 20+ (propriétés Unicode des expressions régulières).
 */

import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')

const DEFAULT_ROOTS = ['apps', 'packages']
const DEFAULT_EXTENSIONS = ['.ts', '.tsx', '.md']
const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  '.next',
  '.turbo',
  'dist',
  'build',
  'coverage',
  'generated',
  'playwright-report',
  'test-results',
  '.storage',
  '.git',
])

/**
 * Symboles « pictographiques » tolérés : ils appartiennent au bloc Extended_Pictographic
 * mais sont des signes typographiques usuels (copyright, marques, flèches, puces), pas des emoji
 * au sens du design system. Points de code écrits en échappement pour rester lisibles.
 */
const ALLOWED_SYMBOLS = new Set([
  '©', // copyright
  '®', // marque déposée
  '™', // trade mark
  '‼', // double point d'exclamation
  '⁉', // exclamation-interrogation
  'ℹ', // information
  '↔', // flèche gauche-droite
  '↕', // flèche haut-bas
  '↖', // flèche nord-ouest
  '↗', // flèche nord-est
  '↘', // flèche sud-est
  '↙', // flèche sud-ouest
  '↩', // flèche retour gauche
  '↪', // flèche retour droite
  '▪', // petit carré noir (puce)
  '▫', // petit carré blanc (puce)
  '▶', // triangle droit (lecture)
  '◀', // triangle gauche
  '◻', // carré moyen blanc
  '◼', // carré moyen noir
  '◽', // petit carré moyen blanc
  '◾', // petit carré moyen noir
])

/**
 * Détection : pictogrammes étendus (Extended_Pictographic), indicateurs régionaux (drapeaux),
 * modificateurs de teint, sélecteur de variante emoji (U+FE0F) et « keycap » (U+20E3).
 */
const EMOJI_PATTERN = /\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}]|[\u{1F3FB}-\u{1F3FF}]|\uFE0F|\u20E3/gu

function parseArgs(argv) {
  const roots = []
  let extensions = DEFAULT_EXTENSIONS
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--ext') {
      const value = argv[i + 1]
      if (!value) {
        console.error('Option --ext : liste d’extensions attendue (ex. .ts,.tsx,.md).')
        process.exit(2)
      }
      extensions = value
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean)
        .map((e) => (e.startsWith('.') ? e : `.${e}`))
      i += 1
    } else if (arg === '--help' || arg === '-h') {
      console.info('Usage : node scripts/check-no-emoji.mjs [dossiers...] [--ext .ts,.tsx,.md]')
      process.exit(0)
    } else if (arg.startsWith('--')) {
      console.error(`Option inconnue : ${arg}`)
      process.exit(2)
    } else {
      roots.push(arg)
    }
  }
  return { roots: roots.length > 0 ? [...new Set([...DEFAULT_ROOTS, ...roots])] : DEFAULT_ROOTS, extensions }
}

async function* walk(directory, extensions) {
  let entries
  try {
    entries = await readdir(directory, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) continue
      yield* walk(path.join(directory, entry.name), extensions)
    } else if (entry.isFile() && extensions.includes(path.extname(entry.name))) {
      yield path.join(directory, entry.name)
    }
  }
}

function findEmoji(content) {
  const findings = []
  const lines = content.split(/\r?\n/)
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex]
    EMOJI_PATTERN.lastIndex = 0
    let match
    while ((match = EMOJI_PATTERN.exec(line)) !== null) {
      const symbol = match[0]
      if (ALLOWED_SYMBOLS.has(symbol)) continue
      const codePoint = symbol.codePointAt(0) ?? 0
      findings.push({
        line: lineIndex + 1,
        column: match.index + 1,
        symbol,
        codePoint: `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`,
      })
    }
  }
  return findings
}

async function main() {
  const { roots, extensions } = parseArgs(process.argv.slice(2))
  let scannedFiles = 0
  const problems = []

  for (const root of roots) {
    const absolute = path.resolve(repoRoot, root)
    try {
      const info = await stat(absolute)
      if (!info.isDirectory()) continue
    } catch {
      console.warn(`Dossier ignoré (introuvable) : ${root}`)
      continue
    }
    for await (const file of walk(absolute, extensions)) {
      scannedFiles += 1
      const content = await readFile(file, 'utf8')
      const findings = findEmoji(content)
      for (const finding of findings) {
        problems.push({ file: path.relative(repoRoot, file), ...finding })
      }
    }
  }

  if (problems.length === 0) {
    console.info(`Aucun emoji détecté (${scannedFiles} fichiers analysés : ${roots.join(', ')} ; extensions ${extensions.join(', ')}).`)
    process.exit(0)
  }

  console.error(`${problems.length} emoji détecté(s) dans ${new Set(problems.map((p) => p.file)).size} fichier(s) :`)
  for (const problem of problems) {
    console.error(`  ${problem.file}:${problem.line}:${problem.column}  ${problem.codePoint}  ${JSON.stringify(problem.symbol)}`)
  }
  console.error('\nRemplacer par une icône lucide-react ou un texte (CLAUDE.md, section « Interface »).')
  process.exit(1)
}

main().catch((error) => {
  console.error('Échec de la vérification :', error instanceof Error ? error.message : error)
  process.exit(2)
})
