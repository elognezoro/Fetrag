import Link from 'next/link'
import { ArrowRight, LogIn, UserPlus } from 'lucide-react'
import { ArcRing, Button, Emblem, Reveal, RingBackdrop, Ribbon, StatTile } from '@fetrag/ui'
import { webHref } from '@/lib/site'
import type { HomeStats } from '@/server/learner/queries'

interface HomeHeroProps {
  stats: HomeStats
  authenticated: boolean
}

/** Hero sombre de l'accueil formation : arc vert lumineux, emblème, titre serif, indicateurs. */
export function HomeHero({ stats, authenticated }: HomeHeroProps) {
  return (
    <section className="bg-navy-gradient relative isolate overflow-hidden text-white">
      <RingBackdrop scheme="light" opacity={0.12} position="right" rings={5} sizeClassName="size-[42rem] sm:size-[56rem]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/2 -z-10 size-[28rem] -translate-y-1/2 rounded-full bg-green-500/25 blur-3xl"
      />
      <div className="container-fetrag relative grid grid-cols-1 gap-10 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-28">
        <Reveal>
          <Ribbon tone="green" tilt>
            Programme 2026
          </Ribbon>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
            Former les <span className="italic text-green-400">leaders syndicaux</span> de demain
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
            Dix modules pour connaître ses droits, négocier avec méthode et défendre les travailleurs gabonais avec compétence. À distance ou en présentiel, à votre rythme, avec des
            attestations et certificats vérifiables.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="accent" size="lg">
              <Link href="/catalogue">
                Découvrir les 10 modules
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            {authenticated ? (
              <Button asChild variant="outline" size="lg" className="border-white/60 text-white hover:bg-white/10">
                <Link href="/dashboard">Mon tableau de bord</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" size="lg" className="border-white/60 text-white hover:bg-white/10">
                  <Link href="/connexion">
                    <LogIn aria-hidden="true" />
                    Connexion
                  </Link>
                </Button>
                <Button asChild variant="link" size="lg" className="text-white hover:text-green-300">
                  <a href={webHref('/inscription')}>
                    <UserPlus aria-hidden="true" />
                    Créer un compte
                  </a>
                </Button>
              </>
            )}
          </div>
          <p className="eyebrow mt-8 text-[11px] text-white/60">Travail · Efficacité · Solidarité</p>
        </Reveal>

        <Reveal delay={0.15} className="flex flex-col items-center gap-8">
          <ArcRing size={260} stroke={14} progress={100} tone="green" track={false} className="drop-shadow-[0_0_28px_rgba(156,193,2,0.45)]">
            <span className="flex size-40 items-center justify-center rounded-full bg-white shadow-lift">
              <Emblem size={120} decorative />
            </span>
          </ArcRing>
          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
            <StatTile inverted tone="blue" value={stats.courses} label="modules" description="Programme 2026" />
            <StatTile inverted tone="green" value={stats.hours} suffix=" h" label="de formation" description="tous modules" />
            <StatTile inverted tone="gold" value={stats.learners} label="apprenants" description="inscrits" />
            <StatTile inverted tone="blue" value={stats.certificates} label="certificats" description="vérifiables" />
          </div>
        </Reveal>
      </div>
      <div aria-hidden="true" className="tricolor-band h-1.5 w-full" />
    </section>
  )
}
