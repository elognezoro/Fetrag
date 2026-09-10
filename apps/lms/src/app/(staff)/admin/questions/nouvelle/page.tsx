import type { Metadata } from 'next'
import { HelpCircle } from 'lucide-react'
import { questionTypeLabels, questionTypes } from '@fetrag/contracts'
import { Card, CardContent } from '@fetrag/ui'
import { QuestionEditor, QuestionImportForm } from '@/components/staff/question-editor'
import { StaffPageHeader } from '@/components/staff/staff-page'
import { guards } from '@/lib/auth'
import { questionCategoriesForSelect } from '@/server/staff/admin-queries'

export const metadata: Metadata = { title: 'Nouvelle question' }
export const dynamic = 'force-dynamic'

const typeHints: Record<(typeof questionTypes)[number], string> = {
  SINGLE_CHOICE: 'une seule bonne réponse',
  MULTIPLE_CHOICE: 'plusieurs bonnes réponses, crédit partiel possible',
  TRUE_FALSE: 'affirmation vraie ou fausse',
  FILL_BLANK: 'texte à trous avec réponses acceptées',
  MATCHING: 'paires à apparier',
  ORDERING: 'éléments à classer',
  SHORT_ANSWER: 'réponse courte comparée aux réponses acceptées',
  ESSAY: 'composition corrigée manuellement selon une grille',
}

/** Création d'une question : l'éditeur s'ouvre immédiatement ; l'import CSV reste accessible. */
export default async function NewQuestionPage() {
  const principal = await guards.requireCan('question_bank.write', {}, '/admin/questions/nouvelle')
  const categories = await questionCategoriesForSelect(principal)
  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Banque de questions', href: '/admin/questions' }, { label: 'Nouvelle question' }]}
        eyebrow="Banque de questions"
        title={
          <>
            Ajouter une <span className="italic text-gold-700">question</span>
          </>
        }
        description="Choisissez le type, rédigez l'énoncé et ses options, indiquez les points, la difficulté, la catégorie et les étiquettes. La question est aussitôt disponible pour les quiz."
        tone="gold"
        actions={
          <>
            <QuestionEditor categories={categories} defaultOpen successHref="/admin/questions/{id}" />
            <QuestionImportForm />
          </>
        }
      />
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
          <HelpCircle className="size-6 shrink-0 text-gold-700" aria-hidden="true" />
          <div className="text-sm text-neutral-700">
            <p className="font-display text-base font-semibold text-navy">Types de questions disponibles</p>
            <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
              {questionTypes.map((t) => (
                <li key={t}>
                  <span className="font-semibold text-navy">{questionTypeLabels[t]}</span> : {typeHints[t]}.
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-neutral-500">Si la boîte de dialogue s’est fermée, utilisez le bouton « Nouvelle question » ci-dessus.</p>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
