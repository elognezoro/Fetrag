import Link from 'next/link'
import { ArrowRight, Award, BookOpen, Clock, GraduationCap, Play } from 'lucide-react'
import { ArcRing, Button, Reveal, RingBackdrop, StatTile } from '@fetrag/ui'
import type { LearnerDashboard } from '@/server/learner/dashboard-queries'

interface DashboardHeroProps {
  greetingName: string
  stats: LearnerDashboard['stats']
  /** Prochaine activité à reprendre (première inscription active). */
  resume: { href: string; title: string; courseTitle: string } | null
}

/** « Bonjour » avant 18 h (heure de Libreville), « Bonsoir » ensuite. */
function salutation(now: Date = new Date()): string {
  const hour = Number(new Intl.DateTimeFormat('fr-GA', { hour: 'numeric', hour12: false, timeZone: 'Africa/Libreville' }).format(now))
  return hour >= 18 || hour < 4 ? 'Bonsoir' : 'Bonjour'
}

/** Temps d'apprentissage cumulé, lisible (« 3 h 20 », « 45 min »). */
function formatLearningTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.round((seconds % 3600) / 60)
  if (hours === 0) return `${minutes} min`
  return minutes > 0 ? `${hours} h ${String(minutes).padStart(2, '0')}` : `${hours} h`
}

/**
 * Bandeau sombre du tableau de bord : salutation, arc de progression globale (moyenne des
 * parcours actifs), indicateurs clés et bouton « Reprendre » vers la prochaine activité.
 */
export function DashboardHero({ greetingName, stats, resume }: DashboardHeroProps) {
  const progress = stats.averageProgress
  return (
    <section className="bg-navy-gradient relative isolate overflow-hidden text-white" aria-labelledby="dashboard-title">
      <RingBackdrop scheme="light" opacity={0.08} position="top-right" rings={4} arc />
      <div className="container-fetrag relative grid gap-8 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <Reveal>
          <p className="eyebrow text-[11px] text-green-300">Tableau de bord</p>
          <h1 id="dashboard-title" className="mt-3 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
            {salutation()}, <span className="italic text-gold-400">{greetingName}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
            {stats.active > 0
              ? `Vous suivez ${stats.active} ${stats.active > 1 ? 'formations' : 'formation'} du programme 2026. Reprenez là où vous vous étiez arrêté et gardez le cap vers votre certificat.`
              : stats.completed > 0
                ? 'Vous avez terminé vos parcours en cours. Poursuivez votre montée en compétences avec un nouveau module du programme.'
                : 'Bienvenue sur la plateforme de formation de la FETRAG. Choisissez un premier module pour démarrer votre parcours de leader syndical.'}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {resume ? (
              <Button asChild variant="accent" size="lg">
                <Link href={resume.href}>
                  <Play aria-hidden="true" />
                  Reprendre : {resume.title}
                </Link>
              </Button>
            ) : (
              <Button asChild variant="accent" size="lg">
                <Link href="/catalogue">
                  <BookOpen aria-hidden="true" />
                  Choisir une formation
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" size="lg" className="border-white/60 text-white hover:bg-white/10">
              <Link href="/mes-formations">
                Mes formations
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          {resume ? <p className="mt-3 text-sm text-white/60">Dans « {resume.courseTitle} »</p> : null}

          <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4" role="list" aria-label="Indicateurs d'apprentissage">
            <StatTile role="listitem" inverted animate value={stats.active} label="En cours" icon={BookOpen} tone="blue" className="p-4" />
            <StatTile role="listitem" inverted animate value={stats.completed} label="Terminées" icon={GraduationCap} tone="green" className="p-4" />
            <StatTile role="listitem" inverted animate value={stats.certificates} label="Certificats" icon={Award} tone="gold" className="p-4" />
            <StatTile role="listitem" inverted value={formatLearningTime(stats.totalTimeSeconds)} label="Temps d'étude" icon={Clock} tone="blue" className="p-4" />
          </div>
        </Reveal>

        <Reveal delay={0.15} className="flex justify-center lg:justify-end">
          <ArcRing size={200} stroke={14} progress={progress} tone={progress >= 100 ? 'blue' : progress >= 50 ? 'green' : 'gold'} animate track={false} className="drop-shadow-[0_0_28px_rgba(156,193,2,0.35)]">
            <span className="flex flex-col items-center">
              <span className="font-display text-6xl font-semibold leading-none text-white">
                {progress}
                <span className="text-2xl text-white/70">%</span>
              </span>
              <span className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Progression moyenne</span>
            </span>
          </ArcRing>
        </Reveal>
      </div>
    </section>
  )
}
