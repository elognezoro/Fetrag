import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, GraduationCap } from 'lucide-react'
import { Button, EmptyState, PageHeader, Stagger, StaggerItem } from '@fetrag/ui'
import { EnrollmentCard } from '@/components/learner/enrollment-card'
import { StatusFilterTabs } from '@/components/learner/status-filter-tabs'
import { guards } from '@/lib/auth'
import { enrollmentFilterLabels, enrollmentFilters, listMyEnrollments, parseEnrollmentFilter, type EnrollmentFilter } from '@/server/learner/enrollment-queries'

export const metadata: Metadata = {
  title: 'Mes formations',
  description: 'Vos inscriptions aux modules du programme 2026 : parcours en cours, formations terminées et demandes en attente.',
  robots: { index: false, follow: false },
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

const emptyCopy: Record<EnrollmentFilter, { title: string; description: string }> = {
  all: { title: 'Aucune inscription pour le moment', description: 'Les modules gratuits du programme s’ouvrent immédiatement après inscription ; les autres après validation ou paiement.' },
  active: { title: 'Aucun parcours en cours', description: 'Reprenez une formation terminée ou inscrivez-vous à un nouveau module.' },
  completed: { title: 'Aucune formation terminée', description: 'Chaque module validé apparaîtra ici avec son attestation ou son certificat.' },
  pending: { title: 'Aucune demande en attente', description: 'Les inscriptions soumises à validation de la coordination sont listées ici jusqu’à leur acceptation.' },
  other: { title: 'Aucune inscription clôturée', description: 'Les inscriptions suspendues, annulées ou expirées sont conservées ici pour mémoire.' },
}

/** Inscriptions de l'apprenant : filtres par état (liens), cartes avec arc de progression et actions. */
export default async function MyCoursesPage({ searchParams }: PageProps) {
  const principal = await guards.requireUser('/mes-formations')
  const sp = await searchParams
  const filter = parseEnrollmentFilter(first(sp.statut))
  const view = await listMyEnrollments(principal, filter)

  const tabs = enrollmentFilters.map((value) => ({
    value,
    label: enrollmentFilterLabels[value],
    href: value === 'all' ? '/mes-formations' : `/mes-formations?statut=${value}`,
    count: view.counts[value],
  }))

  return (
    <>
      <PageHeader
        eyebrow="Mes formations"
        tone="blue"
        title={
          <>
            Votre <span className="italic text-blue-600">parcours</span> de formation
          </>
        }
        description="Retrouvez vos inscriptions aux modules du programme 2026, reprenez vos parcours en cours et consultez les attestations obtenues."
        breadcrumbs={[{ label: 'Tableau de bord', href: '/dashboard' }, { label: 'Mes formations' }]}
        homeHref="/"
        actions={
          <Button asChild variant="outline" size="md">
            <Link href="/catalogue">
              <BookOpen aria-hidden="true" />
              Explorer le catalogue
            </Link>
          </Button>
        }
      />

      <div className="container-fetrag flex flex-col gap-8 py-10 sm:py-12">
        <StatusFilterTabs tabs={tabs} active={filter} label="Filtrer les inscriptions par état" />

        {view.items.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title={emptyCopy[filter].title}
            description={emptyCopy[filter].description}
            action={
              <Button asChild variant="primary">
                <Link href={filter === 'all' ? '/catalogue' : '/mes-formations'}>{filter === 'all' ? 'Choisir une formation' : 'Voir toutes mes inscriptions'}</Link>
              </Button>
            }
          />
        ) : (
          <Stagger as="ul" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label={`Inscriptions : ${enrollmentFilterLabels[filter].toLowerCase()}`}>
            {view.items.map((item) => (
              <StaggerItem key={item.enrollment.id} as="li" className="h-full">
                <EnrollmentCard enrollment={item.enrollment} nextHref={item.nextHref} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </>
  )
}
