import { Mail } from 'lucide-react'
import { GradientDivider, Reveal, Ribbon, Section } from '@fetrag/ui'
import { NewsletterForm } from './newsletter-form'

/** Section lettre d'information : ruban, titre serif et formulaire d'inscription (double opt-in). */
export function NewsletterSection() {
  return (
    <Section variant="soft" padding="md" bordered aria-labelledby="newsletter-title" rings={{ position: 'bottom-right', opacity: 0.06, rings: 3 }}>
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
        <Reveal>
          <Ribbon tone="blue">Lettre d&apos;information</Ribbon>
          <h2 id="newsletter-title" className="mt-4 font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">
            Restez <span className="italic text-blue-600">informé</span> de l&apos;action de la Fédération
          </h2>
          <GradientDivider className="mt-5" width="md" />
          <p className="mt-5 max-w-lg text-base leading-relaxed text-neutral-600">
            Communiqués, sessions de formation, événements et nouveaux services : une lettre mensuelle, sans publicité, que vous pouvez quitter à tout moment.
          </p>
          <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-neutral-500">
            <Mail className="size-4 text-blue-600" aria-hidden="true" />
            Confirmation par email (double opt-in)
          </p>
        </Reveal>
        <Reveal delay={0.1} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-soft sm:p-8">
          <NewsletterForm />
        </Reveal>
      </div>
    </Section>
  )
}
