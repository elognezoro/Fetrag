import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button, GradientDivider, Reveal, Section, SectionHeading, TriptychStrip } from '@fetrag/ui'
import { MISSION_TEXT, PILLAR_DESCRIPTIONS } from '@/server/public/institution'

/** Section Mission : texte officiel de la mission et triptyque fondateur en trois cartes. */
export function MissionSection() {
  return (
    <Section variant="white" padding="lg" rings={{ position: 'left', opacity: 0.05, rings: 3 }} aria-labelledby="mission-title">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <Reveal>
          <SectionHeading
            eyebrow="Notre mission"
            tone="green"
            title={
              <span id="mission-title">
                Un environnement de travail <span className="italic text-green-700">équitable</span> et respectueux pour tous
              </span>
            }
          />
          <GradientDivider className="mt-6" width="lg" />
          <p className="mt-6 font-display text-2xl leading-snug text-navy sm:text-[1.7rem]">{MISSION_TEXT}</p>
          <p className="mt-5 text-base leading-relaxed text-neutral-600">
            Fédération intersectorielle, la FETRAG représente ses organisations affiliées auprès des pouvoirs publics, des employeurs et des
            instances de dialogue social. Elle forme ses responsables, appuie juridiquement les sections syndicales et privilégie la négociation
            collective comme mode de règlement des différends.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="outline" size="md">
              <Link href="/la-fetrag">
                Notre histoire et nos valeurs
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="md">
              <Link href="/organisations">Organisations affiliées</Link>
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="eyebrow mb-4 text-[11px] text-neutral-500">Triptyque fondateur</p>
          <TriptychStrip
            variant="cards"
            className="sm:grid-cols-1 lg:grid-cols-1"
            items={{
              protection: { description: PILLAR_DESCRIPTIONS.protection },
              prevention: { description: PILLAR_DESCRIPTIONS.prevention },
              defense: { description: PILLAR_DESCRIPTIONS.defense },
            }}
          />
        </Reveal>
      </div>
    </Section>
  )
}
