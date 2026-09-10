import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Award, Bell, BookOpen, CalendarClock, ClipboardCheck, Clock, Play } from 'lucide-react'
import { Button, EmptyState, Stagger, StaggerItem } from '@fetrag/ui'
import { DashboardHero } from '@/components/learner/dashboard-hero'
import { CertificateMiniList, ContinueCard, DashboardSection, DeadlineList, PendingEnrollments, ResultList } from '@/components/learner/dashboard-sections'
import { NotificationList } from '@/components/learner/notification-list'
import { guards } from '@/lib/auth'
import { getDashboard } from '@/server/learner/dashboard-queries'

export const metadata: Metadata = {
  title: 'Tableau de bord',
  description: 'Votre progression, vos prochaines activités, vos échéances, vos résultats et vos certificats sur la plateforme de formation de la FETRAG.',
  robots: { index: false, follow: false },
}

/** Tableau de bord apprenant orienté action : reprendre, échéances, résultats, certificats, notifications. */
export default async function DashboardPage() {
  const principal = await guards.requireUser('/dashboard')
  const { dashboard, notifications, greetingName } = await getDashboard(principal)

  const firstResume = dashboard.continueLearning[0] ?? null
  const resume = firstResume?.next ? { href: firstResume.next.href, title: firstResume.next.title, courseTitle: firstResume.enrollment.course.title } : null
  const notificationItems = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    href: n.href,
    read: n.readAt !== null,
    createdAt: n.createdAt.toISOString(),
  }))
  const hasPending = dashboard.stats.pending > 0

  return (
    <>
      <DashboardHero greetingName={greetingName} stats={dashboard.stats} resume={resume} />

      <div className="container-fetrag flex flex-col gap-12 py-10 sm:py-14">
        <DashboardSection
          id="reprendre-title"
          number="01"
          title="Reprendre"
          icon={Play}
          tone="blue"
          description="Vos parcours en cours et la prochaine activité de chacun."
          action={
            <Button asChild variant="link">
              <Link href="/mes-formations">
                Toutes mes formations
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          }
        >
          {dashboard.continueLearning.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={dashboard.stats.active > 0 ? 'Vos parcours actifs sont à jour' : 'Aucun parcours en cours'}
              description={dashboard.stats.active > 0 ? 'Toutes les activités disponibles ont été réalisées. De nouvelles activités peuvent s’ouvrir selon le calendrier de votre cohorte.' : 'Choisissez un module du programme 2026 pour commencer votre formation de leader syndical.'}
              action={
                <Button asChild variant="primary">
                  <Link href="/catalogue">
                    <BookOpen aria-hidden="true" />
                    Explorer le catalogue
                  </Link>
                </Button>
              }
            />
          ) : (
            <Stagger as="ul" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Parcours à reprendre">
              {dashboard.continueLearning.map((item) => (
                <StaggerItem key={item.enrollment.id} as="li" className="h-full">
                  <ContinueCard item={item} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
          {hasPending ? (
            <div className="mt-2">
              <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-navy">
                <Clock className="size-4 text-gold-700" aria-hidden="true" />
                Demandes d&apos;inscription en attente de validation
              </p>
              <PendingEnrollments enrollments={dashboard.enrollments} />
            </div>
          ) : null}
        </DashboardSection>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-10">
          <DashboardSection
            id="echeances-title"
            number="02"
            title="Échéances"
            icon={CalendarClock}
            tone="green"
            description="Devoirs à rendre et séances des 30 prochains jours."
            action={
              <Button asChild variant="link">
                <Link href="/calendrier">
                  Calendrier
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            }
          >
            <DeadlineList deadlines={dashboard.deadlines} />
          </DashboardSection>

          <DashboardSection
            id="resultats-title"
            number="03"
            title="Résultats récents"
            icon={ClipboardCheck}
            tone="gold"
            description="Scores d’évaluation et notes de devoirs."
            action={
              <Button asChild variant="link">
                <Link href="/devoirs">
                  Mes devoirs
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            }
          >
            <ResultList results={dashboard.recentResults} />
          </DashboardSection>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-10">
          <DashboardSection
            id="certificats-title"
            number="04"
            title="Certificats"
            icon={Award}
            tone="gold"
            description="Attestations et certificats numérotés, vérifiables publiquement."
            action={
              <Button asChild variant="link">
                <Link href="/certificats">
                  Tous mes certificats
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            }
          >
            <CertificateMiniList certificates={dashboard.certificates} />
          </DashboardSection>

          <DashboardSection
            id="notifications-title"
            number="05"
            title="Notifications"
            icon={Bell}
            tone="blue"
            description={dashboard.stats.unreadNotifications > 0 ? `${dashboard.stats.unreadNotifications} non lue${dashboard.stats.unreadNotifications > 1 ? 's' : ''}` : 'Convocations, résultats et messages de la coordination.'}
          >
            <NotificationList notifications={notificationItems} unreadCount={dashboard.stats.unreadNotifications} />
          </DashboardSection>
        </div>
      </div>
    </>
  )
}
