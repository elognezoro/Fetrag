import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Award, GraduationCap, Star, Users } from 'lucide-react'
import { ArcRing, Button, LOGO_SRC, Reveal, Ribbon, RingBackdrop, TriptychStrip } from '@fetrag/ui'
import { MISSION_TEXT } from '@/server/public/institution'
import { lmsHref, siteConfig } from '@/lib/site'
import { StatsBand, type StatsBandProps } from './stats-band'

interface HeroHomeProps {
  stats: StatsBandProps['stats']
}

/** Pastille blanche ronde portant le logo officiel, au centre du grand arc vert. */
function LogoBadge({ size }: { size: number }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-full bg-white shadow-lift ring-[10px] ring-blue-500/10"
      style={{ width: size, height: size }}
    >
      <Image src={LOGO_SRC} alt="Logo officiel de la FETRAG" width={Math.round(size * 0.82)} height={Math.round(size * 0.82)} priority sizes={`${size}px`} className="rounded-full object-contain" />
      <span
        aria-hidden="true"
        className="absolute -top-3 left-1/2 flex size-10 -translate-x-1/2 items-center justify-center rounded-full bg-white shadow-soft"
      >
        <Star className="size-6 fill-gold-500 text-gold-500" strokeWidth={1.5} />
      </span>
    </div>
  )
}

/** Vignette flottante (chiffre ou mention) autour de l'arc. */
function FloatingChip({ icon: Icon, label, value, className }: { icon: typeof Award; label: string; value: string; className?: string }) {
  return (
    <div className={`absolute hidden items-center gap-3 rounded-2xl border border-neutral-200 bg-white/95 px-4 py-3 shadow-lift backdrop-blur sm:flex ${className ?? ''}`}>
      <span className="inline-flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
        <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-display text-lg font-semibold text-navy">{value}</span>
        <span className="text-xs font-semibold text-neutral-500">{label}</span>
      </span>
    </div>
  )
}

/**
 * Hero de l'accueil : fond clair à anneaux, grand arc vert animé autour du logo en badge blanc,
 * ruban eyebrow, titre serif avec mot clé en italique vert, double appel à l'action et bande de chiffres clés.
 */
export function HeroHome({ stats }: HeroHomeProps) {
  return (
    <section className="relative isolate overflow-hidden bg-white" aria-labelledby="hero-title">
      <RingBackdrop position="right" rings={5} opacity={0.07} sizeClassName="size-[40rem] sm:size-[56rem] lg:size-[64rem]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-blue-50/70 to-transparent" />

      <div className="container-fetrag relative grid grid-cols-1 min-h-[calc(100dvh-var(--header-height))] items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <div className="max-w-2xl">
          <Reveal>
            <Ribbon tone="blue" size="lg" tilt>
              {siteConfig.fullName}
            </Ribbon>
          </Reveal>
          <Reveal delay={0.08} as="h1" className="mt-7 font-display text-4xl font-semibold leading-[1.04] tracking-tight text-navy text-balance sm:text-5xl lg:text-6xl xl:text-7xl">
            <span id="hero-title">
              Défendre les travailleurs, <span className="italic text-green-700">bâtir</span> un dialogue social constructif.
            </span>
          </Reveal>
          <Reveal delay={0.16} as="p" className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600 sm:text-xl">
            {MISSION_TEXT}
          </Reveal>
          <Reveal delay={0.24} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild variant="primary" size="xl">
              <Link href="/la-fetrag">
                Découvrir la FETRAG
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="accent" size="xl">
              <a href={lmsHref('/')}>
                <GraduationCap aria-hidden="true" />
                Accéder à la formation
              </a>
            </Button>
          </Reveal>
          <Reveal delay={0.32} className="mt-10">
            <p className="eyebrow mb-3 text-[11px] text-neutral-500">Triptyque fondateur</p>
            <TriptychStrip variant="inline" />
          </Reveal>
        </div>

        <Reveal delay={0.2} y={24} className="relative mx-auto flex w-full max-w-md items-center justify-center lg:max-w-none">
          <div className="relative flex items-center justify-center">
            <div className="sm:hidden">
              <ArcRing size={280} stroke={16} tone="green" progress={100} duration={2.2}>
                <LogoBadge size={168} />
              </ArcRing>
            </div>
            <div className="hidden sm:block">
              <ArcRing size={460} stroke={22} tone="green" progress={100} duration={2.2}>
                <LogoBadge size={272} />
              </ArcRing>
            </div>
            <span aria-hidden="true" className="absolute inset-[6%] -z-10 rounded-full border-[3px] border-blue-500/15" />
            <span aria-hidden="true" className="absolute inset-[-6%] -z-10 rounded-full border border-dashed border-blue-500/20" />
            <FloatingChip icon={Award} value={String(stats.modules).padStart(2, '0')} label="modules de formation" className="left-0 top-6 animate-float" />
            <FloatingChip icon={Users} value={siteConfig.mottoText} label="Notre devise" className="-bottom-2 right-0 [animation-delay:1.2s] animate-float" />
          </div>
        </Reveal>
      </div>

      <StatsBand stats={stats} />
    </section>
  )
}
