import type { QuestionTypeName } from '@fetrag/contracts'
import type { ExportResult, ImportResult, InteropOption, InteropQuestion, InteropWarning } from './types'

/**
 * Conversion entre la banque de questions FETRAG et le format « GIFT » de Moodle
 * (format texte d'import/export de questions).
 *
 * GIFT ne dispose pas de type « classement » natif : les questions ORDERING sont ignorées
 * à l'export (elles restent exportables en Moodle XML).
 */

const SPECIAL = /[~=#{}:\\]/g

/** Échappe les caractères spéciaux GIFT. */
function giftEscape(value: string): string {
  return value.replace(SPECIAL, (c) => `\\${c}`)
}

/** Retire l'échappement GIFT. */
function giftUnescape(value: string): string {
  return value.replace(/\\([~=#{}:\\])/g, '$1')
}

// ==========================================================================
// EXPORT : questions -> GIFT
// ==========================================================================

function feedbackSuffix(feedback?: string | null): string {
  return feedback ? `#${giftEscape(feedback)}` : ''
}

function generalFeedback(explanation?: string | null): string {
  return explanation ? `\n#### ${giftEscape(explanation)}` : ''
}

function toGiftQuestion(q: InteropQuestion): string | null {
  const options = q.options ?? []
  const config = (q.config ?? {}) as Record<string, unknown>
  const title = `::${giftEscape(stripPlain(q.prompt).slice(0, 100) || 'Question')}::`
  const promptText = giftEscape(q.prompt)

  switch (q.type) {
    case 'SINGLE_CHOICE': {
      const lines = options.map((o) => `\t${o.isCorrect ? '=' : '~'}${giftEscape(o.label)}${feedbackSuffix(o.feedback)}`)
      return `${title} ${promptText} {\n${lines.join('\n')}${generalFeedback(q.explanation)}\n}`
    }
    case 'MULTIPLE_CHOICE': {
      const nCorrect = options.filter((o) => o.isCorrect).length || 1
      const pct = Math.round((100 / nCorrect) * 100000) / 100000
      const lines = options.map((o) => `\t~%${o.isCorrect ? pct : -100}%${giftEscape(o.label)}${feedbackSuffix(o.feedback)}`)
      return `${title} ${promptText} {\n${lines.join('\n')}${generalFeedback(q.explanation)}\n}`
    }
    case 'TRUE_FALSE': {
      const answer = typeof config.answer === 'boolean' ? config.answer : true
      return `${title} ${promptText} {${answer ? 'TRUE' : 'FALSE'}${generalFeedback(q.explanation)}\n}`
    }
    case 'SHORT_ANSWER': {
      const accepted = Array.isArray(config.accepted) ? (config.accepted as string[]) : options.map((o) => o.label)
      const lines = accepted.map((a) => `\t=${giftEscape(a)}`)
      return `${title} ${promptText} {\n${lines.join('\n')}${generalFeedback(q.explanation)}\n}`
    }
    case 'MATCHING': {
      const lines = options.map((o) => `\t=${giftEscape(o.label)} -> ${giftEscape(o.matchValue ?? '')}`)
      return `${title} ${promptText} {\n${lines.join('\n')}${generalFeedback(q.explanation)}\n}`
    }
    case 'ESSAY':
      return `${title} ${promptText} {${generalFeedback(q.explanation)}\n}`
    case 'FILL_BLANK': {
      const text = typeof config.text === 'string' ? config.text : q.prompt
      const answers = Array.isArray(config.answers) ? (config.answers as string[][]) : []
      let n = 0
      const field = () => {
        const accepted = answers[n] ?? []
        n += 1
        return `{${accepted.map((a) => `=${giftEscape(a)}`).join(' ')}}`
      }
      const hasBraces = /\{\{\s*\d+\s*\}\}/.test(text)
      const body = hasBraces ? text.replace(/\{\{\s*\d+\s*\}\}/g, () => field()) : text.replace(/_{3,}/g, () => field())
      // Le texte hors trous est échappé morceau par morceau (les accolades des trous restent).
      return `${title} ${body}`
    }
    case 'ORDERING':
    default:
      return null
  }
}

/** Sérialise des questions en un fichier GIFT (ORDERING ignoré, listé dans `skipped`). */
export function toGift(questions: InteropQuestion[]): ExportResult {
  const parts: string[] = ['// Questions exportées depuis FETRAG (format GIFT)', '']
  const skipped: ExportResult['skipped'] = []
  let currentCategory: string | null = null
  for (const q of questions) {
    if (q.type === 'ORDERING') {
      skipped.push({ type: q.type, prompt: stripPlain(q.prompt).slice(0, 80), reason: 'GIFT ne gère pas les questions de classement' })
      continue
    }
    const cat = q.category?.trim() || null
    if (cat && cat !== currentCategory) {
      parts.push(`$CATEGORY: ${cat}`, '')
      currentCategory = cat
    }
    const block = toGiftQuestion(q)
    if (block) parts.push(block, '')
  }
  return { content: parts.join('\n').trim() + '\n', skipped }
}

function stripPlain(value: string): string {
  return value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

// ==========================================================================
// IMPORT : GIFT -> questions
// ==========================================================================

/** Découpe le fichier en blocs (séparés par des lignes vides), commentaires retirés. */
function splitBlocks(text: string): string[] {
  const withoutComments = text
    .split(/\r?\n/)
    .filter((line) => !line.trimStart().startsWith('//'))
    .join('\n')
  return withoutComments
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
}

/** Sépare titre optionnel `::titre::`, texte, bloc de réponses `{...}` et texte après le bloc. */
function dissect(block: string): { title: string | null; before: string; answerBlock: string | null; after: string } {
  let rest = block
  let title: string | null = null
  const titleMatch = rest.match(/^::((?:\\.|[^:]|:(?!:))*)::\s*/)
  if (titleMatch) {
    title = giftUnescape(titleMatch[1] ?? '')
    rest = rest.slice(titleMatch[0].length)
  }
  // Recherche du premier `{` non échappé.
  let open = -1
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '{' && rest[i - 1] !== '\\') {
      open = i
      break
    }
  }
  if (open === -1) return { title, before: rest, answerBlock: null, after: '' }
  let close = -1
  for (let i = open + 1; i < rest.length; i++) {
    if (rest[i] === '}' && rest[i - 1] !== '\\') {
      close = i
      break
    }
  }
  if (close === -1) return { title, before: rest, answerBlock: null, after: '' }
  return { title, before: rest.slice(0, open), answerBlock: rest.slice(open + 1, close), after: rest.slice(close + 1) }
}

/** Sépare les entrées de réponse d'un bloc GIFT (aux `=` et `~` non échappés). */
function splitAnswers(answerBlock: string): string[] {
  const entries: string[] = []
  let buf = ''
  for (let i = 0; i < answerBlock.length; i++) {
    const c = answerBlock[i]
    if ((c === '=' || c === '~') && answerBlock[i - 1] !== '\\') {
      if (buf.trim()) entries.push(buf.trim())
      buf = c
    } else {
      buf += c
    }
  }
  if (buf.trim()) entries.push(buf.trim())
  return entries.filter((e) => e === '=' || e === '~' || e.length > 1)
}

interface ParsedAnswer {
  correct: boolean
  percent: number | null
  text: string
  feedback: string | null
  match: string | null
}

function parseAnswer(entry: string): ParsedAnswer {
  const sign = entry[0] === '='
  let body = entry.slice(1)
  let percent: number | null = null
  const pctMatch = body.match(/^%(-?\d+(?:\.\d+)?)%/)
  if (pctMatch) {
    percent = Number.parseFloat(pctMatch[1] ?? '0')
    body = body.slice(pctMatch[0].length)
  }
  // Retour spécifique après `#` non échappé.
  let feedback: string | null = null
  let hashIdx = -1
  for (let i = 0; i < body.length; i++) {
    if (body[i] === '#' && body[i - 1] !== '\\') {
      hashIdx = i
      break
    }
  }
  if (hashIdx !== -1) {
    feedback = giftUnescape(body.slice(hashIdx + 1).trim()) || null
    body = body.slice(0, hashIdx)
  }
  // Appariement `label -> valeur`.
  let match: string | null = null
  const arrowIdx = body.indexOf('->')
  if (arrowIdx !== -1) {
    match = giftUnescape(body.slice(arrowIdx + 2).trim())
    body = body.slice(0, arrowIdx)
  }
  const isCorrect = sign || (percent !== null && percent > 0)
  return { correct: isCorrect, percent, text: giftUnescape(body.trim()), feedback, match }
}

function questionFromBlock(block: string, index: number, warnings: InteropWarning[], category: string | null): InteropQuestion | null {
  const { title, before, answerBlock, after } = dissect(block)
  const promptRaw = giftUnescape(before.trim())
  const base = { category: category ?? undefined, points: 1, tags: [] as string[], explanation: undefined as string | undefined }

  if (answerBlock === null) {
    warnings.push({ index, message: 'Bloc sans réponses `{...}` : ignoré' })
    return null
  }

  // Retour général `#### ...` en fin de bloc.
  let generalFb: string | undefined
  let effectiveBlock = answerBlock
  const gfMatch = answerBlock.match(/####\s*([\s\S]*)$/)
  if (gfMatch) {
    generalFb = giftUnescape((gfMatch[1] ?? '').trim()) || undefined
    effectiveBlock = answerBlock.slice(0, gfMatch.index).trim()
  }
  base.explanation = generalFb

  const trimmed = effectiveBlock.trim()

  // Texte à trous : le bloc est au milieu du texte (texte après `}`).
  if (after.trim().length > 0) {
    const accepted = splitAnswers(effectiveBlock).map(parseAnswer).filter((a) => a.correct).map((a) => a.text).filter(Boolean)
    const text = `${promptRaw} {{1}} ${giftUnescape(after.trim())}`.trim()
    if (accepted.length === 0) {
      warnings.push({ index, message: 'Trou sans réponse : ignoré' })
      return null
    }
    return { type: 'FILL_BLANK', prompt: text, ...base, options: [], config: { text, answers: [accepted] } }
  }

  // Essai (bloc vide).
  if (trimmed.length === 0) {
    return { type: 'ESSAY', prompt: promptRaw || title || 'Question', ...base, options: [], config: {} }
  }

  // Vrai / faux.
  const upper = trimmed.toUpperCase()
  if (upper === 'TRUE' || upper === 'T' || upper === 'FALSE' || upper === 'F') {
    return { type: 'TRUE_FALSE', prompt: promptRaw || title || 'Question', ...base, options: [], config: { answer: upper.startsWith('T') } }
  }

  const answers = splitAnswers(effectiveBlock).map(parseAnswer)
  const prompt = promptRaw || title || 'Question'

  // Appariement.
  if (answers.some((a) => a.match !== null)) {
    const options: InteropOption[] = answers.filter((a) => a.match).map((a) => ({ label: a.text, isCorrect: true, matchValue: a.match }))
    if (options.length < 2) {
      warnings.push({ index, message: 'Appariement incomplet : ignoré' })
      return null
    }
    return { type: 'MATCHING', prompt, ...base, options, config: { distractors: [] } }
  }

  // Réponse courte : uniquement des `=` (aucun `~`).
  const hasWrong = answers.some((a) => !a.correct || a.percent !== null)
  const allEquals = answers.every((a) => a.percent === null && a.correct)
  if (allEquals && !hasWrong) {
    return { type: 'SHORT_ANSWER', prompt, ...base, options: [], config: { accepted: answers.map((a) => a.text).filter(Boolean), caseSensitive: false } }
  }

  // Choix multiple ou unique.
  const options: InteropOption[] = answers.map((a) => ({ label: a.text, isCorrect: a.correct, feedback: a.feedback }))
  const nCorrect = options.filter((o) => o.isCorrect).length
  const usesPercent = answers.some((a) => a.percent !== null)
  const type: QuestionTypeName = usesPercent && nCorrect > 1 ? 'MULTIPLE_CHOICE' : 'SINGLE_CHOICE'
  if (options.length < 2) {
    warnings.push({ index, message: 'Question à choix incomplète : ignorée' })
    return null
  }
  if (type === 'SINGLE_CHOICE' && nCorrect !== 1) {
    // Plusieurs bonnes réponses sans pourcentage : on bascule en choix multiples.
    return { type: 'MULTIPLE_CHOICE', prompt, ...base, options, config: {} }
  }
  return { type, prompt, ...base, options, config: {} }
}

/** Analyse un fichier GIFT en questions FETRAG. */
export function parseGift(text: string): ImportResult {
  const warnings: InteropWarning[] = []
  const questions: InteropQuestion[] = []
  let category: string | null = null
  let index = 0
  for (const block of splitBlocks(text)) {
    const catMatch = block.match(/^\$CATEGORY:\s*(.+)$/m)
    if (catMatch && block.replace(/^\$CATEGORY:.*$/m, '').trim().length === 0) {
      category = (catMatch[1] ?? '').trim().replace(/^\$course\$\/top\/?/, '').replace(/^top\/?/, '') || null
      continue
    }
    const q = questionFromBlock(block, index, warnings, category)
    index += 1
    if (q) questions.push(q)
  }
  if (questions.length === 0 && warnings.length === 0) warnings.push({ index: null, message: 'Aucune question trouvée dans le fichier' })
  return { questions, warnings }
}

/** Types FETRAG exportables en GIFT (tous sauf ORDERING). */
export const GIFT_SUPPORTED: QuestionTypeName[] = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'MATCHING', 'FILL_BLANK', 'ESSAY']
