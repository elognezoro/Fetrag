import type { QuestionTypeName } from '@fetrag/contracts'
import { GIFT_SUPPORTED, parseGift, toGift } from './gift'
import { MOODLE_SUPPORTED, parseMoodleXml, toMoodleXml } from './moodle'
import type { ExportResult, ImportResult, InteropFormat, InteropQuestion } from './types'

export {
  interopFormatExtensions,
  interopFormatLabels,
  type ExportResult,
  type ImportResult,
  type InteropFormat,
  type InteropOption,
  type InteropQuestion,
} from './types'
export { parseMoodleXml, toMoodleXml, MOODLE_SUPPORTED } from './moodle'
export { parseGift, toGift, GIFT_SUPPORTED } from './gift'

export const interopFormats: InteropFormat[] = ['moodle-xml', 'gift']

/** Types exportables selon le format. */
export function supportedTypes(format: InteropFormat): QuestionTypeName[] {
  return format === 'moodle-xml' ? MOODLE_SUPPORTED : GIFT_SUPPORTED
}

/** Devine le format à partir du nom de fichier puis du contenu. */
export function detectFormat(fileName: string | undefined, content: string): InteropFormat {
  const lower = (fileName ?? '').toLowerCase()
  if (lower.endsWith('.xml')) return 'moodle-xml'
  if (lower.endsWith('.gift') || lower.endsWith('.txt')) return 'gift'
  return /<\s*quiz[\s>]/i.test(content) || /<\?xml/i.test(content) ? 'moodle-xml' : 'gift'
}

/** Analyse un fichier de questions dans le format donné (ou détecté). */
export function parseQuestionFile(content: string, format?: InteropFormat, fileName?: string): ImportResult & { format: InteropFormat } {
  const resolved = format ?? detectFormat(fileName, content)
  const result = resolved === 'moodle-xml' ? parseMoodleXml(content) : parseGift(content)
  return { ...result, format: resolved }
}

/**
 * Une question à choix sans aucune bonne réponse (question d'enquête / satisfaction) n'est pas
 * une question notée valide : elle n'est pas exportable vers un test Moodle.
 */
function isGradable(q: InteropQuestion): boolean {
  if ((q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') && !(q.options ?? []).some((o) => o.isCorrect)) return false
  return true
}

/** Sérialise des questions dans le format donné, en écartant celles qui ne sont pas exportables. */
export function serializeQuestions(questions: InteropQuestion[], format: InteropFormat): ExportResult {
  const skipped: ExportResult['skipped'] = []
  const usable: InteropQuestion[] = []
  for (const q of questions) {
    if (!isGradable(q)) {
      skipped.push({ type: q.type, prompt: q.prompt.replace(/<[^>]+>/g, '').slice(0, 80), reason: 'Question sans bonne réponse (probable question d’enquête) : non exportable en test' })
      continue
    }
    usable.push(q)
  }
  if (format === 'gift') {
    const result = toGift(usable)
    return { content: result.content, skipped: [...skipped, ...result.skipped] }
  }
  return { content: toMoodleXml(usable), skipped }
}

/** Forme minimale d'une question de la banque pour l'export. */
export interface ExportableQuestion {
  type: QuestionTypeName
  prompt: string
  explanation?: string | null
  category?: string | null
  points?: number | null
  tags?: string[]
  config?: unknown
  options?: Array<{ label: string; isCorrect: boolean; feedback?: string | null; position?: number | null; matchValue?: string | null }>
}

/** Convertit une question de la banque en forme d'échange (pour l'export). */
export function toInteropQuestion(question: ExportableQuestion): InteropQuestion {
  return {
    type: question.type,
    prompt: question.prompt,
    explanation: question.explanation ?? undefined,
    category: question.category ?? undefined,
    points: question.points ?? 1,
    tags: question.tags ?? [],
    config: (question.config as Record<string, unknown> | null) ?? {},
    options: (question.options ?? []).map((o) => ({
      label: o.label,
      isCorrect: o.isCorrect,
      feedback: o.feedback ?? null,
      position: o.position ?? undefined,
      matchValue: o.matchValue ?? undefined,
    })),
  }
}
