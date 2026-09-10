import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, LayoutDashboard, LogIn, UserPlus } from 'lucide-react'
import { Button, GradientDivider, MottoStrip, Reveal, RingBackdrop, SectionHeading, TriptychStrip } from '@fetrag/ui'
import { CourseGrid } from '@/components/learner/course-grid'
import { HomeHero } from '@/components/learner/home/home-hero'
import { HowItWorks } from '@/components/learner/home/how-it-works'
import { MasterclassList } from '@/components/learner/home/masterclass-list'
import { SgQuote } from '@/components/learner/home/sg-quote'
import { guards } from '@/lib/auth'
import { siteConfig, webHref } from '@/lib/site'
import { getHomeData } from '@/server/learner/queries'

export const metadata: Metadata = {
  title: `${siteConfig.name} - Former les leaders syndicaux de demain`,
  description:
    'Programme de formation des leaders syndicaux 2026 de la FETRAG : dix modules, trois piliers, des attestations et certificats vérifiables. Plateforme officielle formation.fetrag.ga.',
  alternates: { canonical: '/' },
}

/** Présentation du programme 2026 et de son triptyque fondateur. */
function ProgrammeSection() {
  return (
    <section className="relative isolate overflow-hidden bg-white py-16 sm:py-20">
      <RingBackdrop position="top-left" opacity={0.05} rings={3} />
      <div className="container-fetrag">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <Reveal>
            <SectionHeading
              eyebrow="Programme 2026"
              tone="blue"
              title={
                <>
                  Dix modules, <span className="italic text-blue-600">trois piliers</span>, une même ambition
                </>
              }
              description="Le Programme de formation des Leaders Syndicaux - Session 2026 outille les délégués, responsables de sections et cadres des organisations affiliées pour défendre les travailleurs gabonais avec compétence, méthode et intégrité."
            />
            <div className="mt-6 space-y-4 text-base leading-relaxed text-neutral-700">
              <p>
                Chaque module articule connaissances juridiques, pratiques de terrain et études de cas gabonaises. Les parcours se suivent à distance, en présentiel au
                siège de la Fédération ou en format hybride, selon la demande des organisations.
              </p>
              <p>
                Les évaluations sont corrigées automatiquement, les devoirs pratiques sont relus par les formateurs, et chaque module validé donne lieu à une attestation ou à
                un certificat numéroté, vérifiable publiquement.
              </p>
            </div>
            <GradientDivider className="mt-8" width="lg" />
            <MottoStrip className="mt-6" size="sm" />
          </Reveal>
          <Reveal delay={0.12}>
            <p className="eyebrow mb-4 text-[11px] text-neutral-500">Triptyque fondateur</p>
            <TriptychStrip
              className="sm:grid-cols-1"
              items={{
                protection: { description: "Comprendre les enjeux économiques de l'entreprise et négocier la sauvegarde de l'emploi." },
                prevention: { description: 'Diagnostiquer les tensions, prévenir les conflits du travail et encadrer les mouvements collectifs.' },
                defense: { description: 'Protéger la rémunération, la sécurité et la dignité des travailleurs contre toute discrimination.' },
              }}
            />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/** Les dix modules du programme (cartes numérotées 01 à 10). */
function ModulesSection({ courses }: { courses: Awaited<ReturnType<typeof getHomeData>>['courses'] }) {
  return (
    <section className="border-t border-neutral-200 py-16 sm:py-20" aria-labelledby="modules-title">
      <div className="container-fetrag">
        <SectionHeading
          eyebrow="Les 10 modules"
          tone="green"
          title={
            <span id="modules-title">
              Le parcours <span className="italic text-green-700">01 à 10</span>
            </span>
          }
          description="Du cadre juridique du syndicalisme gabonais à la santé et sécurité au travail : un cheminement progressif, numéroté, que chaque apprenant suit à son rythme."
          actions={
            <Button asChild variant="link">
              <Link href="/catalogue">
                Filtrer le catalogue
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          }
        />
        <div className="mt-10">
          <CourseGrid courses={courses} label="Modules du programme 2026" emptyTitle="Le catalogue est en cours de publication" emptyDescription="Les dix modules du programme 2026 seront ouverts prochainement." />
        </div>
      </div>
    </section>
  )
}

/** Appel à l'action final (connexion / inscription ou tableau de bord). */
function CtaSection({ authenticated }: { authenticated: boolean }) {
  return (
    <section className="bg-navy-gradient relative isolate overflow-hidden py-16 text-white sm:py-20">
      <RingBackdrop scheme="light" opacity={0.1} position="left" rings={4} />
      <div className="container-fetrag relative flex flex-col items-center text-center">
        <Reveal className="flex flex-col items-center">
          <p className="eyebrow text-[11px] text-green-300">Slogan du programme</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
            Ensemble, construisons l&apos;avenir du <span className="italic text-gold-400">mouvement syndical</span>
          </h2>
          <p className="mt-5 max-w-2xl text-lg text-white/80">
            Un seul compte FETRAG donne accès au site institutionnel et à la plateforme de formation. Les modules gratuits s&apos;ouvrent immédiatement.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {authenticated ? (
              <>
                <Button asChild variant="accent" size="lg" className="w-full sm:w-auto">
                  <Link href="/dashboard">
                    <LayoutDashboard aria-hidden="true" />
                    Mon tableau de bord
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full border-white/60 text-white hover:bg-white/10 sm:w-auto">
                  <Link href="/catalogue">
                    <BookOpen aria-hidden="true" />
                    Parcourir le catalogue
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="accent" size="lg" className="w-full sm:w-auto">
                  <Link href="/connexion">
                    <LogIn aria-hidden="true" />
                    Se connecter
                  </Link>
                </Button>
                <Button asChild variant="gold" size="lg" className="w-full sm:w-auto">
                  <a href={webHref('/inscription')}>
                    <UserPlus aria-hidden="true" />
                    Créer un compte
                  </a>
                </Button>
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/** Accueil de formation.fetrag.ga : hero, programme, modules, parcours, Master Class, mot du SG, appel à l'action. */
export default async function HomePage() {
  const [principal, data] = await Promise.all([guards.getPrincipal(), getHomeData()])
  const authenticated = Boolean(principal)
  return (
    <>
      <HomeHero stats={data.stats} authenticated={authenticated} />
      <ProgrammeSection />
      <ModulesSection courses={data.courses} />
      <HowItWorks />
      <MasterclassList events={data.masterclasses} />
      <SgQuote />
      <CtaSection authenticated={authenticated} />
    </>
  )
}
