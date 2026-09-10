import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { HelpCircle } from 'lucide-react'
import { questionTypeLabels } from '@fetrag/contracts'
import { formatDateTime, isDomainError } from '@fetrag/domain'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@fetrag/ui'
import { QuestionEditor, QuestionRowActions, type QuestionValue } from '@/components/staff/question-editor'
import { QuestionPreview } from '@/components/staff/question-preview'
import { DetailItem, DetailList, StaffPageHeader, StaffSection } from '@/components/staff/staff-page'
import { guards } from '@/lib/auth'
import { getQuestionAdmin } from '@/server/staff/admin-queries'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

async function load(id: string) {
  const principal = await guards.requireCan('question_bank.write', {}, `/admin/questions/${id}`)
  try {
    return await getQuestionAdmin(principal, id)
  } catch (error) {
    if (isDomainError(error) && (error.code === 'NOT_FOUND' || error.code === 'FORBIDDEN')) notFound()
    throw error
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const { question } = await load(id)
  return { title: `Question · ${question.prompt.slice(0, 60)}` }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

/** Fiche d'une question : aperçu en lecture seule, métadonnées, quiz qui l'utilisent, édition versionnée. */
export default async function AdminQuestionPage({ params }: PageProps) {
  const { id } = await params
  const { question, categories } = await load(id)
  const config = asRecord(question.config)
  const value: QuestionValue = {
    id: question.id,
    type: question.type,
    prompt: question.prompt,
    explanation: question.explanation,
    category: question.category,
    difficulty: question.difficulty,
    points: question.points,
    tags: question.tags,
    isActive: question.isActive,
    config,
    options: question.options.map((o) => ({ id: o.id, label: o.label, isCorrect: o.isCorrect, feedback: o.feedback, matchValue: o.matchValue })),
  }

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Banque de questions', href: '/admin/questions' }, { label: questionTypeLabels[question.type] }]}
        eyebrow={`Question · ${questionTypeLabels[question.type]}`}
        title={question.prompt.length > 120 ? `${question.prompt.slice(0, 117)}...` : question.prompt}
        tone="gold"
        meta={
          <>
            {question.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Inactive</Badge>}
            <span>Version {question.version}</span>
            <span>{question.points} point(s)</span>
            <span>Difficulté {question.difficulty}/5</span>
            {question.category ? <span>{question.category}</span> : null}
          </>
        }
        actions={
          <>
            <QuestionEditor question={value} categories={categories} />
            <QuestionRowActions questionId={question.id} prompt={question.prompt} usage={question._count.quizzes} openCopy redirectAfterRemove="/admin/questions" />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StaffSection number="01" title="Aperçu" tone="gold" className="mb-0" description="Rendu de la question telle qu'elle est corrigée : bonnes réponses, appariements, réponses acceptées, grille.">
            <Card>
              <CardContent className="p-5">
                <QuestionPreview type={question.type} prompt={question.prompt} explanation={question.explanation} config={config} options={question.options} />
              </CardContent>
            </Card>
          </StaffSection>
        </div>
        <div className="flex flex-col gap-6">
          <Card pillar="defense">
            <CardHeader>
              <CardTitle as="h3">Métadonnées</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailList columns={2}>
                <DetailItem label="Auteur">{question.author?.name}</DetailItem>
                <DetailItem label="Créée le">{formatDateTime(question.createdAt)}</DetailItem>
                <DetailItem label="Modifiée le">{formatDateTime(question.updatedAt)}</DetailItem>
                <DetailItem label="Réponses enregistrées">{question._count.answers}</DetailItem>
              </DetailList>
              {question.tags.length ? (
                <p className="mt-4 flex flex-wrap gap-1">
                  {question.tags.map((t) => (
                    <Badge key={t} variant="outline" size="sm">
                      {t}
                    </Badge>
                  ))}
                </p>
              ) : null}
              {question._count.answers > 0 ? <p className="mt-4 text-xs text-gold-800">Cette question a déjà été répondue : toute modification crée une nouvelle version et désactive celle-ci (LMS-18).</p> : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle as="h3">Quiz utilisant cette question</CardTitle>
            </CardHeader>
            <CardContent>
              {question.quizzes.length ? (
                <ul className="flex flex-col gap-2 text-sm">
                  {question.quizzes.map((link) => (
                    <li key={link.id} className="flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2">
                      <HelpCircle className="size-4 text-blue-600" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate font-medium text-navy">{link.quiz.activity.title}</span>
                      <span className="text-xs text-neutral-500">{link.points ?? question.points} pt</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-500">
                  Aucun quiz : ajoutez-la depuis le builder d’un{' '}
                  <Link href="/admin/cours" className="font-semibold text-blue-700 hover:underline">
                    cours
                  </Link>
                  .
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
