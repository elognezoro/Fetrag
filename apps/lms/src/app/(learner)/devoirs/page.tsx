import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import { Button, PageHeader } from '@fetrag/ui'
import { AssignmentList, assignmentFilterLabels, assignmentFilters, matchesAssignmentFilter, parseAssignmentFilter } from '@/components/learner/assignment-list'
import { StatusFilterTabs } from '@/components/learner/status-filter-tabs'
import { guards } from '@/lib/auth'
import { listMyAssignments } from '@/server/learner/assignment-queries'

export const metadata: Metadata = {
  title: 'Mes devoirs',
  description: 'Travaux pratiques de vos formations : consignes, dates limites, remises et notes.',
  robots: { index: false, follow: false },
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

/** Liste des devoirs de l'apprenant : filtres par état, échéances, notes. */
export default async function AssignmentsPage({ searchParams }: PageProps) {
  const principal = await guards.requireUser('/devoirs')
  const sp = await searchParams
  const filter = parseAssignmentFilter(first(sp.statut))
  const rows = await listMyAssignments(principal)
  const filtered = rows.filter((row) => matchesAssignmentFilter(filter, row.state))
  const overdue = rows.filter((row) => row.overdue).length

  const tabs = assignmentFilters.map((value) => ({
    value,
    label: assignmentFilterLabels[value],
    href: value === 'all' ? '/devoirs' : `/devoirs?statut=${value}`,
    count: rows.filter((row) => matchesAssignmentFilter(value, row.state)).length,
  }))

  return (
    <>
      <PageHeader
        eyebrow="Devoirs"
        tone="gold"
        title={
          <>
            Vos <span className="italic text-gold-600">travaux pratiques</span>
          </>
        }
        description={
          overdue > 0
            ? `${overdue} devoir${overdue > 1 ? 's' : ''} en retard : remettez-le${overdue > 1 ? 's' : ''} dès que possible, votre formateur en sera informé.`
            : 'Études de cas, plans d’action et notes de synthèse relus par vos formateurs. Enregistrez un brouillon puis remettez votre travail avant la date limite.'
        }
        breadcrumbs={[{ label: 'Tableau de bord', href: '/dashboard' }, { label: 'Devoirs' }]}
        homeHref="/"
        actions={
          <Button asChild variant="outline" size="md">
            <Link href="/calendrier">
              <CalendarDays aria-hidden="true" />
              Voir le calendrier
            </Link>
          </Button>
        }
      />

      <div className="container-fetrag flex flex-col gap-8 py-10 sm:py-12">
        <StatusFilterTabs tabs={tabs} active={filter} label="Filtrer les devoirs par état" />
        <AssignmentList rows={filtered} filter={filter} />
      </div>
    </>
  )
}
