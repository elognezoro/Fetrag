import type { QuestionTypeName } from '@fetrag/contracts'
import { cdata, child, children, elementText, escapeXml, parseXml, textEl, type XmlNode } from './xml'
import type { ImportResult, InteropOption, InteropQuestion, InteropWarning } from './types'

/**
 * Conversion entre la banque de questions FETRAG et le format « Moodle XML »,
 * le format d'échange de questions de Moodle (import et export de fichiers).
 *
 * Correspondance des types :
 *   SINGLE_CHOICE / MULTIPLE_CHOICE -> multichoice (single true/false)
 *   TRUE_FALSE                      -> truefalse
 *   SHORT_ANSWER                    -> shortanswer
 *   MATCHING                        -> matching
 *   ESSAY                           -> essay
 *   FILL_BLANK                      -> cloze (réponses intégrées)
 *   ORDERING                        -> ordering (extension qtype_ordering de Moodle)
 */

/** Retire les balises HTML et normalise les espaces. */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Fractions positives acceptées par Moodle pour un partage équitable entre N bonnes réponses. */
const EQUAL_FRACTIONS: Record<number, string> = {
  1: '100',
  2: '50',
  3: '33.33333',
  4: '25',
  5: '20',
  6: '16.66667',
  7: '14.28571',
  8: '12.5',
  9: '11.11111',
  10: '10',
}

function correctFraction(nCorrect: number): string {
  return EQUAL_FRACTIONS[nCorrect] ?? String(Math.round((100 / Math.max(1, nCorrect)) * 100000) / 100000)
}

// ==========================================================================
// EXPORT : questions -> Moodle XML
// ==========================================================================

function nameEl(prompt: string): string {
  const name = stripHtml(prompt).slice(0, 120) || 'Question'
  return `<name>${textEl(name)}</name>`
}

function questionTextEl(prompt: string): string {
  return `<questiontext format="html"><text>${cdata(prompt)}</text></questiontext>`
}

function generalFeedbackEl(explanation?: string | null): string {
  return `<generalfeedback format="html"><text>${explanation ? cdata(explanation) : ''}</text></generalfeedback>`
}

function answerEl(fraction: string, text: string, feedback?: string | null): string {
  const fb = feedback ? `<feedback format="html"><text>${cdata(feedback)}</text></feedback>` : ''
  return `<answer fraction="${fraction}" format="html">${textEl(text)}${fb}</answer>`
}

/** Échappe les caractères spéciaux d'une réponse intégrée cloze. */
function clozeEscape(value: string): string {
  return value.replace(/([\\{}#~=/])/g, '\\$1')
}

/** Construit le texte cloze à partir du texte à trous et des réponses acceptées par trou. */
function buildClozeText(text: string, answers: string[][]): string {
  let blankIndex = 0
  const withField = (): string => {
    const accepted = answers[blankIndex] ?? []
    blankIndex += 1
    const body = accepted.map((a) => `=${clozeEscape(a)}`).join('')
    return `{1:SHORTANSWER:${body}}`
  }
  // Marqueurs acceptés : `{{1}}` (numérotés) ou `___` (au moins trois soulignés).
  const hasBraces = /\{\{\s*\d+\s*\}\}/.test(text)
  if (hasBraces) return escapeXml(text.replace(/\{\{\s*\d+\s*\}\}/g, () => withField()))
  return escapeXml(text.replace(/_{3,}/g, () => withField()))
}

function toMoodleQuestion(q: InteropQuestion): string {
  const options = q.options ?? []
  const config = (q.config ?? {}) as Record<string, unknown>
  const grade = `<defaultgrade>${q.points ?? 1}</defaultgrade>`
  const feedback = generalFeedbackEl(q.explanation)
  const head = (type: string) => `<question type="${type}">\n${nameEl(q.prompt)}\n${questionTextEl(q.prompt)}\n${feedback}\n${grade}`

  switch (q.type) {
    case 'SINGLE_CHOICE':
    case 'MULTIPLE_CHOICE': {
      const single = q.type === 'SINGLE_CHOICE'
      const nCorrect = options.filter((o) => o.isCorrect).length || 1
      const frac = correctFraction(nCorrect)
      const answers = options
        .map((o) => answerEl(o.isCorrect ? frac : '0', o.label, o.feedback))
        .join('\n')
      const shuffle = config.shuffle === false ? 'false' : 'true'
      return `${head('multichoice')}\n<single>${single ? 'true' : 'false'}</single>\n<shuffleanswers>${shuffle}</shuffleanswers>\n<answernumbering>abc</answernumbering>\n${answers}\n</question>`
    }
    case 'TRUE_FALSE': {
      const answer = typeof config.answer === 'boolean' ? config.answer : options.find((o) => o.isCorrect)?.label?.toLowerCase().startsWith('v') ?? true
      const trueAns = answerEl(answer ? '100' : '0', 'true')
      const falseAns = answerEl(answer ? '0' : '100', 'false')
      return `${head('truefalse')}\n${trueAns}\n${falseAns}\n</question>`
    }
    case 'SHORT_ANSWER': {
      const accepted = Array.isArray(config.accepted) ? (config.accepted as string[]) : options.map((o) => o.label)
      const usecase = config.caseSensitive === true ? '1' : '0'
      const answers = accepted.map((a) => answerEl('100', a)).join('\n')
      return `${head('shortanswer')}\n<usecase>${usecase}</usecase>\n${answers}\n</question>`
    }
    case 'MATCHING': {
      const pairs = options
        .map((o) => `<subquestion format="html"><text>${cdata(o.label)}</text><answer>${textEl(o.matchValue ?? '')}</answer></subquestion>`)
        .join('\n')
      const distractors = Array.isArray(config.distractors) ? (config.distractors as string[]) : []
      const extra = distractors.map((d) => `<subquestion format="html"><text></text><answer>${textEl(d)}</answer></subquestion>`).join('\n')
      const shuffle = config.shuffle === false ? 'false' : 'true'
      return `${head('matching')}\n<shuffleanswers>${shuffle}</shuffleanswers>\n${pairs}\n${extra}\n</question>`
    }
    case 'ORDERING': {
      const ordered = [...options].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      const answers = ordered.map((o) => answerEl('0', o.label)).join('\n')
      return `${head('ordering')}\n<selecttype>ALL</selecttype>\n<selectcount>0</selectcount>\n<layouttype>VERTICAL</layouttype>\n<gradingtype>RELATIVE_NEXT_EXCLUDE_LAST</gradingtype>\n${answers}\n</question>`
    }
    case 'FILL_BLANK': {
      const text = typeof config.text === 'string' ? config.text : q.prompt
      const answers = Array.isArray(config.answers) ? (config.answers as string[][]) : []
      const cloze = buildClozeText(text, answers)
      // En cloze, le texte de la question PORTE les réponses ; on remplace donc questiontext.
      return `<question type="cloze">\n${nameEl(q.prompt)}\n<questiontext format="html"><text>${cdata(cloze)}</text></questiontext>\n${feedback}\n</question>`
    }
    case 'ESSAY':
    default:
      return `${head('essay')}\n<responseformat>editor</responseformat>\n<responserequired>1</responserequired>\n<responsefieldlines>10</responsefieldlines>\n<attachments>0</attachments>\n</question>`
  }
}

function categoryQuestion(path: string): string {
  return `<question type="category">\n<category><text>$course$/top/${escapeXml(path)}</text></category>\n</question>`
}

/** Sérialise des questions en un document Moodle XML (regroupées par catégorie). */
export function toMoodleXml(questions: InteropQuestion[]): string {
  const parts: string[] = ['<?xml version="1.0" encoding="UTF-8"?>', '<quiz>']
  let currentCategory: string | null = null
  for (const q of questions) {
    const cat = q.category?.trim() || null
    if (cat && cat !== currentCategory) {
      parts.push(categoryQuestion(cat))
      currentCategory = cat
    }
    parts.push(toMoodleQuestion(q))
  }
  parts.push('</quiz>')
  return parts.join('\n')
}

// ==========================================================================
// IMPORT : Moodle XML -> questions
// ==========================================================================

function optionFrom(node: XmlNode): { label: string; fraction: number; feedback: string | null } {
  const fraction = Number.parseFloat(node.attrs.fraction ?? '0') || 0
  const fb = elementText(child(node, 'feedback'))
  return { label: stripHtml(elementText(node)), fraction, feedback: fb ? stripHtml(fb) : null }
}

/** Analyse le texte cloze en texte à trous + réponses acceptées par trou. */
function parseCloze(raw: string): { text: string; answers: string[][] } {
  const answers: string[][] = []
  let n = 0
  const text = raw.replace(/\{[^}]*\}/g, (field) => {
    // {grade:TYPE:=a#fb~b} -> on récupère les réponses préfixées par `=`
    const accepted: string[] = []
    const body = field.slice(1, -1)
    const parts = body.split(':')
    const answersPart = parts.slice(2).join(':')
    for (const chunk of answersPart.split('~')) {
      const trimmed = chunk.trim()
      if (trimmed.startsWith('=') || trimmed.startsWith('%100%')) {
        const val = trimmed.replace(/^=/, '').replace(/^%100%/, '').split('#')[0] ?? ''
        const clean = val.replace(/\\([\\{}#~=/])/g, '$1').trim()
        if (clean) accepted.push(clean)
      }
    }
    n += 1
    answers.push(accepted.length ? accepted : [''])
    return `{{${n}}}`
  })
  return { text: stripHtml(text), answers }
}

function questionFromNode(node: XmlNode, index: number, warnings: InteropWarning[], category: string | null): InteropQuestion | null {
  const moodleType = node.attrs.type
  const prompt = stripHtml(elementText(child(node, 'questiontext'))) || stripHtml(elementText(child(node, 'name')))
  const explanationRaw = stripHtml(elementText(child(node, 'generalfeedback')))
  const explanation = explanationRaw || undefined
  const points = Math.max(1, Math.round(Number.parseFloat(elementText(child(node, 'defaultgrade')) || '1') || 1))
  const base = { prompt, explanation, category: category ?? undefined, points, tags: [] as string[] }

  const answerNodes = children(node, 'answer')

  switch (moodleType) {
    case 'multichoice': {
      const single = elementText(child(node, 'single')).toLowerCase() !== 'false'
      const options: InteropOption[] = answerNodes.map((a) => {
        const o = optionFrom(a)
        return { label: o.label, isCorrect: o.fraction > 0, feedback: o.feedback }
      })
      return { type: single ? 'SINGLE_CHOICE' : 'MULTIPLE_CHOICE', ...base, options, config: {} }
    }
    case 'truefalse': {
      const trueNode = answerNodes.find((a) => elementText(a).toLowerCase().startsWith('t') || elementText(a).toLowerCase().startsWith('v'))
      const answer = trueNode ? (optionFrom(trueNode).fraction > 0) : true
      return { type: 'TRUE_FALSE', ...base, options: [], config: { answer } }
    }
    case 'shortanswer': {
      const accepted = answerNodes.filter((a) => optionFrom(a).fraction > 0).map((a) => optionFrom(a).label).filter(Boolean)
      const caseSensitive = elementText(child(node, 'usecase')) === '1'
      if (accepted.length === 0) {
        warnings.push({ index, message: 'Question à réponse courte sans réponse correcte : ignorée' })
        return null
      }
      return { type: 'SHORT_ANSWER', ...base, options: [], config: { accepted, caseSensitive } }
    }
    case 'matching': {
      const subs = children(node, 'subquestion')
      const options: InteropOption[] = []
      const distractors: string[] = []
      for (const sub of subs) {
        const label = stripHtml(elementText(sub))
        const matchValue = stripHtml(elementText(child(sub, 'answer')))
        if (label) options.push({ label, isCorrect: true, matchValue })
        else if (matchValue) distractors.push(matchValue)
      }
      if (options.length < 2) {
        warnings.push({ index, message: 'Question d’appariement incomplète : ignorée' })
        return null
      }
      return { type: 'MATCHING', ...base, options, config: { distractors } }
    }
    case 'ordering': {
      const options: InteropOption[] = answerNodes.map((a, i) => ({ label: stripHtml(elementText(a)), isCorrect: true, position: i }))
      if (options.length < 2) {
        warnings.push({ index, message: 'Question de classement incomplète : ignorée' })
        return null
      }
      return { type: 'ORDERING', ...base, options, config: {} }
    }
    case 'cloze': {
      const raw = elementText(child(node, 'questiontext'))
      const { text, answers } = parseCloze(raw)
      if (answers.length === 0) {
        warnings.push({ index, message: 'Question à trous sans réponse intégrée : ignorée' })
        return null
      }
      return { type: 'FILL_BLANK', prompt: text || prompt, explanation, category: category ?? undefined, points, tags: [], options: [], config: { text: text.replace(/\{\{(\d+)\}\}/g, '{{$1}}'), answers } }
    }
    case 'essay':
      return { type: 'ESSAY', ...base, options: [], config: {} }
    case 'description':
      // Les descriptions Moodle ne sont pas des questions : ignorées silencieusement.
      return null
    default:
      warnings.push({ index, message: `Type Moodle « ${moodleType ?? 'inconnu'} » non pris en charge : ignoré` })
      return null
  }
}

/** Analyse un document Moodle XML en questions FETRAG (avec avertissements pour les cas ignorés). */
export function parseMoodleXml(xml: string): ImportResult {
  const warnings: InteropWarning[] = []
  let root: XmlNode
  try {
    root = parseXml(xml)
  } catch (error) {
    return { questions: [], warnings: [{ index: null, message: `Fichier XML illisible : ${error instanceof Error ? error.message : 'erreur inconnue'}` }] }
  }
  const quiz = child(root, 'quiz')
  if (!quiz) return { questions: [], warnings: [{ index: null, message: 'Document Moodle invalide : élément <quiz> absent' }] }

  const questions: InteropQuestion[] = []
  let category: string | null = null
  let index = 0
  for (const node of children(quiz, 'question')) {
    if (node.attrs.type === 'category') {
      const raw = elementText(child(node, 'category'))
      const cleaned = raw.replace(/^\$course\$\/top\/?/, '').replace(/^top\/?/, '').trim()
      category = cleaned || null
      continue
    }
    const q = questionFromNode(node, index, warnings, category)
    index += 1
    if (q) questions.push(q)
  }
  if (questions.length === 0 && warnings.length === 0) warnings.push({ index: null, message: 'Aucune question trouvée dans le fichier' })
  return { questions, warnings }
}

/** Types FETRAG exportables en Moodle XML (tous). */
export const MOODLE_SUPPORTED: QuestionTypeName[] = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'MATCHING', 'ORDERING', 'FILL_BLANK', 'ESSAY']
