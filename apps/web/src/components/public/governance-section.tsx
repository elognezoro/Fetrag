import Link from 'next/link'
import { ArrowRight, Landmark, Users, Vote } from 'lucide-react'
import { Button, GradientDivider, Prose, Reveal, Ribbon, Section, cn, toneClasses } from '@fetrag/ui'
import { GOVERNANCE_HTML, SG_NAME, SG_TITLE } from '@/server/public/institution'
import { SgPortrait } from './sg-message'

const bodies = [
  { icon: Vote, title: 'Le Congrès', description: 'Instance souveraine réunissant les organisations affiliées : il élit le Bureau exécutif et fixe les orientations.' },
  { icon: Users, title: 'Le Bureau exécutif', description: 'Élu par le Congrès, il conduit la politique de la Fédération entre deux Assemblées générales.' },
  { icon: Landmark, title: 'Le Secrétariat général', description: 'Direction quotidienne, représentation institutionnelle et coordination des sections syndicales.' },
] as const

/** Gouvernance de la Fédération : instances et portrait du Secrétaire Général dans son cadre à anneau. */
export function GovernanceSection() {
  return (
    <Section variant="white" padding="md" bordered rings={{ position: 'bottom-left', opacity: 0.05, rings: 3 }} aria-labelledby="governance-title">
      <div className="grid items-start gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
        <Reveal>
          <Ribbon tone="navy">Gouvernance</Ribbon>
          <h2 id="governance-title" className="mt-5 font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">
            Des instances <span className="italic text-blue-600">élues</span>, des comptes contrôlés
          </h2>
          <GradientDivider className="mt-6" width="md" />
          <Prose html={GOVERNANCE_HTML} className="mt-6 text-base" />
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {bodies.map((body, index) => {
              const tone = (['blue', 'green', 'gold'] as const)[index] ?? 'blue'
              const classes = toneClasses[tone]
              const Icon = body.icon
              return (
                <li key={body.title} className={cn('flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft', classes.topRule)}>
                  <span className={cn('inline-flex size-10 items-center justify-center rounded-full', classes.soft, classes.softText)}>
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-lg font-semibold leading-tight text-navy">{body.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-600">{body.description}</p>
                </li>
              )
            })}
          </ol>
          <div className="mt-8">
            <Button asChild variant="outline" size="md">
              <Link href="/#sg-title">
                Lire le mot du Secrétaire Général
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.12} y={24}>
          <SgPortrait />
          <p className="mx-auto mt-4 max-w-xs text-center text-sm leading-relaxed text-neutral-600">
            {SG_NAME}, {SG_TITLE}, assure la conduite quotidienne de la Fédération et sa représentation auprès des institutions.
          </p>
        </Reveal>
      </div>
    </Section>
  )
}
