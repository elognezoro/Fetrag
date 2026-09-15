import type { Metadata } from 'next'
import Link from 'next/link'
import { Download, HelpCircle, Plus } from 'lucide-react'
import { questionTypeLabels, questionTypes } from '@fetrag/contracts'
import { formatDate } from '@fetrag/domain'
import { Badge, Button, Card, EmptyState, Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@fetrag/ui'
import { FilterBar } from '@/components/staff/filter-bar'
import { buildHref, readPage } from '@/components/staff/href'
import { QuestionImportForm, QuestionInteropImportForm, QuestionRowActions } from '@/components/staff/question-editor'
import { StaffPageHeader } from '@/components/staff/staff-page'
import { guards } from '@/lib/auth'
import { listQuestionsAdmin } from '@/server/staff/admin-queries'

export const metadata: Metadata = { title: 'Banque de questions' }
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ q?: string; type?: string; categorie?: string; etiquette?: string; inactives?: string; page?: string }>
}

/** Banque de questions : liste paginée, filtres type / catégorie / étiquette / actives, import CSV, duplication. */
export default async function AdminQuestionsPage({ searchParams }: PageProps) {
  const principal = await guards.requireCan('question_bank.write', {}, '/admin/questions')
  const params = await searchParams
  const type = (questionTypes as readonly string[]).includes(params.type ?? '') ? (params.type as (typeof questionTypes)[number]) : undefined
  const page = readPage(params.page)
  const { list, categories, tags } = await listQuestionsAdmin(principal, { q: params.q || undefined, type, category: params.categorie || undefined, tag: params.etiquette || undefined, includeInactive: params.inactives === '1', page })
  const hrefFor = (p: number) => buildHref('/admin/questions', { q: params.q, type: params.type, categorie: params.categorie, etiquette: params.etiquette, inactives: params.inactives, page: p > 1 ? p : undefined })
  const exportHref = (format: 'moodle-xml' | 'gift') =>
    buildHref('/admin/questions/export', { format, q: params.q, type: params.type, categorie: params.categorie, etiquette: params.etiquette, inactives: params.inactives })

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Banque de questions' }]}
        eyebrow="Banque de questions"
        title={
          <>
            {list.total} question{list.total > 1 ? 's' : ''} <span className="italic text-gold-700">réutilisables dans les quiz</span>
          </>
        }
        description="Chaque question est versionnée (LMS-18) : modifier une question déjà répondue crée une nouvelle version et désactive l'ancienne. Les quiz sans tentative suivent automatiquement la nouvelle version."
        tone="gold"
        actions={
          <>
            <Button asChild variant="primary" size="sm">
              <Link href="/admin/questions/nouvelle">
                <Plus aria-hidden="true" />
                Nouvelle question
              </Link>
            </Button>
            <QuestionInteropImportForm />
            <QuestionImportForm />
            <Button asChild variant="outline" size="sm">
              <a href={exportHref('moodle-xml')}>
                <Download aria-hidden="true" />
                Exporter Moodle XML
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={exportHref('gift')}>
                <Download aria-hidden="true" />
                Exporter GIFT
              </a>
            </Button>
          </>
        }
      />

      <FilterBar
        action="/admin/questions"
        className="mb-6"
        fields={[
          { name: 'q', label: 'Recherche', placeholder: 'Énoncé ou étiquette', value: params.q },
          { name: 'type', label: 'Type', type: 'select', value: params.type, options: questionTypes.map((t) => ({ value: t, label: questionTypeLabels[t] })) },
          { name: 'categorie', label: 'Catégorie', type: 'select', value: params.categorie, placeholder: 'Toutes', options: categories.map((c) => ({ value: c, label: c })) },
          { name: 'etiquette', label: 'Étiquette', type: 'select', value: params.etiquette, placeholder: 'Toutes', options: tags.map((t) => ({ value: t, label: t })) },
          { name: 'inactives', label: 'Périmètre', type: 'select', value: params.inactives, placeholder: 'Actives uniquement', options: [{ value: '1', label: 'Inclure les inactives' }] },
        ]}
      />

      {list.items.length ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Utilisation</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.items.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="min-w-[15rem]">
                    <Link href={`/admin/questions/${q.id}`} className="line-clamp-2 max-w-md font-semibold text-navy hover:underline">
                      {q.prompt}
                    </Link>
                    <span className="mt-1 flex flex-wrap gap-1">
                      {!q.isActive ? <Badge variant="danger" size="sm">Inactive</Badge> : null}
                      {q.tags.slice(0, 4).map((t) => (
                        <Badge key={t} variant="outline" size="sm">
                          {t}
                        </Badge>
                      ))}
                    </span>
                  </TableCell>
                  <TableCell>
                    {questionTypeLabels[q.type]}
                    {q.options.length ? <span className="block text-xs text-neutral-500">{q.options.length} option(s)</span> : null}
                  </TableCell>
                  <TableCell className="min-w-[10rem] text-neutral-700">{q.category ?? '-'}</TableCell>
                  <TableCell>
                    {q.points} pt
                    <span className="block text-xs text-neutral-500">difficulté {q.difficulty}/5</span>
                  </TableCell>
                  <TableCell>
                    {q._count.quizzes} quiz
                    <span className="block text-xs text-neutral-500">{q._count.answers} réponse(s)</span>
                  </TableCell>
                  <TableCell className="text-neutral-600">
                    v{q.version}
                    <span className="block text-xs text-neutral-500">{formatDate(q.updatedAt)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <QuestionRowActions questionId={q.id} prompt={q.prompt} usage={q._count.quizzes} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={list.page} totalPages={list.totalPages} hrefFor={hrefFor} className="mt-6" />
        </>
      ) : (
        <Card>
          <EmptyState
            icon={HelpCircle}
            title="Aucune question"
            description={params.q || params.type || params.categorie || params.etiquette ? 'Aucune question ne correspond aux filtres.' : 'Créez des questions ou importez-les depuis un fichier CSV pour composer les quiz.'}
            action={
              <Button asChild variant="primary">
                <Link href="/admin/questions/nouvelle">Créer une question</Link>
              </Button>
            }
          />
        </Card>
      )}
    </>
  )
}
