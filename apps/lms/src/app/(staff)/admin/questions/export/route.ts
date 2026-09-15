import { questionTypes, type QuestionTypeName } from '@fetrag/contracts'
import { interop, questionBank } from '@fetrag/lms-core'
import { guards } from '@/lib/auth'

/**
 * Téléchargement de la banque de questions au format Moodle XML ou GIFT.
 * Réservé aux profils autorisés à gérer la banque de questions ; respecte les filtres passés en requête.
 */
export const dynamic = 'force-dynamic'

export async function GET(request: Request): Promise<Response> {
  let principal
  try {
    principal = await guards.api.requireCan('question_bank.write')
  } catch {
    return new Response('Accès refusé.', { status: 403 })
  }

  const url = new URL(request.url)
  const format: interop.InteropFormat = url.searchParams.get('format') === 'gift' ? 'gift' : 'moodle-xml'
  const typeParam = url.searchParams.get('type')
  const type = (questionTypes as readonly string[]).includes(typeParam ?? '') ? (typeParam as QuestionTypeName) : undefined

  const questions = await questionBank.exportAll(principal, {
    q: url.searchParams.get('q') || undefined,
    type,
    category: url.searchParams.get('categorie') || undefined,
    tag: url.searchParams.get('etiquette') || undefined,
    includeInactive: url.searchParams.get('inactives') === '1',
  })

  const interopQuestions = questions.map((q) =>
    interop.toInteropQuestion({
      type: q.type,
      prompt: q.prompt,
      explanation: q.explanation,
      category: q.category,
      points: q.points,
      tags: q.tags,
      config: q.config,
      options: q.options,
    }),
  )

  const { content } = interop.serializeQuestions(interopQuestions, format)
  const extension = interop.interopFormatExtensions[format]
  const stamp = new Date().toISOString().slice(0, 10)
  const contentType = format === 'gift' ? 'text/plain; charset=utf-8' : 'application/xml; charset=utf-8'
  return new Response(content, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="questions-fetrag-${stamp}.${extension}"`,
      'Cache-Control': 'no-store',
    },
  })
}
