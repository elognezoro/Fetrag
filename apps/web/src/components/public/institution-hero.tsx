import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Building2, Star, UserPlus } from 'lucide-react'
import { ArcRing, Breadcrumbs, Button, LOGO_SRC, MottoStrip, Reveal, Ribbon, RingBackdrop } from '@fetrag/ui'
import { MISSION_TEXT } from '@/server/public/institution'
import { siteConfig } from '@/lib/site'

/**
 * Hero de la page « La FETRAG » : fil d'Ariane, ruban, titre serif avec mot clé en italique,
 * texte officiel de la mission, devise et logo officiel en pastille blanche dans le grand arc vert.
 */
export function InstitutionHero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-neutral-200 bg-white" aria-labelledby="institution-title">
      <RingBackdrop position="right" rings={5} opacity={0.07} sizeClassName="size-[36rem] sm:size-[52rem]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-gradient-to-b from-blue-50/70 to-transparent" />
      <div className="container-fetrag relative grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="max-w-2xl">
          <Breadcrumbs items={[{ label: 'La FETRAG' }]} homeHref="/" className="mb-6" />
          <Reveal>
            <Ribbon tone="blue" size="lg" tilt>
              {siteConfig.fullName}
            </Ribbon>
          </Reveal>
          <Reveal delay={0.08} as="h1" className="mt-7 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-navy text-balance sm:text-5xl lg:text-6xl">
            <span id="institution-title">
              Une fédération <span className="italic text-green-700">intersectorielle</span> au service des travailleurs gabonais
            </span>
          </Reveal>
          <Reveal delay={0.16} as="p" className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600 sm:text-xl">
            {MISSION_TEXT}
          </Reveal>
          <Reveal delay={0.24} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild variant="primary" size="lg">
              <Link href="/adhesion">
                <UserPlus aria-hidden="true" />
                Rejoindre la Fédération
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/organisations">
                <Building2 aria-hidden="true" />
                Organisations affiliées
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </Reveal>
          <Reveal delay={0.32} className="mt-10 flex flex-col gap-2">
            <p className="eyebrow text-[11px] text-neutral-500">Notre devise</p>
            <MottoStrip variant="ribbon" size="md" tilt />
          </Reveal>
        </div>

        <Reveal delay={0.2} y={24} className="relative mx-auto flex w-full max-w-sm items-center justify-center lg:max-w-none">
          <div className="relative flex items-center justify-center">
            <div className="sm:hidden">
              <ArcRing size={260} stroke={14} tone="green" progress={100} duration={2}>
                <LogoBadge size={156} />
              </ArcRing>
            </div>
            <div className="hidden sm:block">
              <ArcRing size={400} stroke={20} tone="green" progress={100} duration={2}>
                <LogoBadge size={240} />
              </ArcRing>
            </div>
            <span aria-hidden="true" className="absolute inset-[6%] -z-10 rounded-full border-[3px] border-blue-500/15" />
            <span aria-hidden="true" className="absolute inset-[-6%] -z-10 rounded-full border border-dashed border-gold-500/40" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/** Pastille blanche ronde portant le logo officiel, surmontée de l'étoile or. */
function LogoBadge({ size }: { size: number }) {
  return (
    <div className="relative flex items-center justify-center rounded-full bg-white shadow-lift ring-[10px] ring-blue-500/10" style={{ width: size, height: size }}>
      <Image
        src={LOGO_SRC}
        alt="Logo officiel de la Fédération des Travailleurs du Gabon"
        width={Math.round(size * 0.82)}
        height={Math.round(size * 0.82)}
        priority
        sizes={`${size}px`}
        className="rounded-full object-contain"
      />
      <span aria-hidden="true" className="absolute -top-3 left-1/2 flex size-10 -translate-x-1/2 items-center justify-center rounded-full bg-white shadow-soft">
        <Star className="size-6 fill-gold-500 text-gold-500" strokeWidth={1.5} />
      </span>
    </div>
  )
}
