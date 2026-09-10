import { Award, BookOpenCheck, UserRoundCheck, type LucideIcon } from 'lucide-react'
import { SectionHeading, Stagger, StaggerItem, cn, padNumber, toneAt, toneClasses } from '@fetrag/ui'

interface Step {
  title: string
  text: string
  icon: LucideIcon
}

const steps: Step[] = [
  {
    title: 'Créez votre compte et choisissez un module',
    text: 'Un seul compte FETRAG pour le site et la plateforme de formation. Les modules gratuits s’ouvrent immédiatement ; les organisations affiliées déposent une demande de formation pour leurs délégués.',
    icon: UserRoundCheck,
  },
  {
    title: 'Suivez le parcours à votre rythme',
    text: 'Lectures, vidéos et capsules audio avec transcription bas débit, quiz corrigés automatiquement, devoirs pratiques, forums et séances en direct avec les formateurs.',
    icon: BookOpenCheck,
  },
  {
    title: 'Validez et obtenez votre attestation',
    text: 'Chaque module validé donne lieu à une attestation ou à un certificat numéroté, signé par le Secrétaire Général et vérifiable en ligne par QR code.',
    icon: Award,
  },
]

/** Les trois étapes du parcours apprenant (numérotation serif, alternance des trois couleurs). */
export function HowItWorks() {
  return (
    <section className="container-fetrag py-16 sm:py-20">
      <SectionHeading
        eyebrow="Comment ça marche"
        tone="gold"
        title={
          <>
            Trois étapes vers votre <span className="italic text-gold-700">certificat</span>
          </>
        }
        description="Un parcours structuré, pensé pour les responsables syndicaux en activité : accessible sur mobile, en faible connexion, et rythmé par des séances en présentiel au siège de la Fédération."
      />
      <Stagger className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
        {steps.map((step, index) => {
          const tone = toneAt(index)
          const classes = toneClasses[tone]
          const Icon = step.icon
          return (
            <StaggerItem key={step.title} as="article" className={cn('relative flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft', classes.topRule)}>
              <div className="flex items-start justify-between gap-4">
                <span aria-hidden="true" className={cn('font-display text-5xl font-semibold leading-none tracking-tight opacity-80', classes.text)}>
                  {padNumber(index + 1)}
                </span>
                <span className={cn('inline-flex size-12 shrink-0 items-center justify-center rounded-full', classes.soft, classes.softText)}>
                  <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
                </span>
              </div>
              <h3 className="text-xl">{step.title}</h3>
              <p className="text-sm leading-relaxed text-neutral-600">{step.text}</p>
            </StaggerItem>
          )
        })}
      </Stagger>
    </section>
  )
}
