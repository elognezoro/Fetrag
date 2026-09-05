import Link from 'next/link'
import { ArrowRight, GraduationCap } from 'lucide-react'
import { Button, Reveal, Section, SectionHeading } from '@fetrag/ui'
import { lmsHref } from '@/lib/site'
import { PROGRAMME_SLOGAN, type ProgrammeModule } from '@/server/public/programme'
import { ModuleGrid } from './module-grid'

interface ProgrammeSectionProps {
  modules: ProgrammeModule[]
  fromCatalog: boolean
}

/** Section « Programme de formation » : les dix modules numérotés en grille, slogan et accès au LMS. */
export function ProgrammeSection({ modules, fromCatalog }: ProgrammeSectionProps) {
  return (
    <Section variant="muted" padding="lg" bordered aria-labelledby="programme-title">
      <Reveal>
        <SectionHeading
          eyebrow="Programme de formation 2026"
          tone="blue"
          title={
            <span id="programme-title">
              Dix modules pour former les <span className="italic text-blue-600">leaders syndicaux</span>
            </span>
          }
          description={`${PROGRAMME_SLOGAN}. Le Programme de formation des Leaders Syndicaux couvre le droit du travail, la négociation, la gestion syndicale, le leadership et la santé-sécurité au travail.`}
          actions={
            <Button asChild variant="outline" size="md">
              <Link href="/formations">
                Tout le catalogue
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          }
          className="mb-10"
        />
      </Reveal>
      <ModuleGrid modules={modules} />
      <Reveal delay={0.1} className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-blue-100 bg-white p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-neutral-600">
          {fromCatalog
            ? 'Les inscriptions se font sur la plateforme de formation : suivi de progression, évaluations, attestations et certificats vérifiables.'
            : "Le catalogue en ligne est en cours de publication : retrouvez dès maintenant le programme officiel et inscrivez-vous sur la plateforme de formation."}
        </p>
        <Button asChild variant="accent" size="lg" className="shrink-0">
          <a href={lmsHref('/catalogue')}>
            <GraduationCap aria-hidden="true" />
            S&apos;inscrire sur formation.fetrag.ga
          </a>
        </Button>
      </Reveal>
    </Section>
  )
}
