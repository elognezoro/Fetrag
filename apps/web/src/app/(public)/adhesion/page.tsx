import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, ClipboardCheck, FileSignature, GraduationCap, HeartHandshake, MessageSquare, Scale, ShieldCheck, Users } from 'lucide-react'
import { Button, PageHeader, Reveal, Section, SectionHeading, Stagger, StaggerItem, TriptychStrip, cn, padNumber, toneAt, toneClasses } from '@fetrag/ui'
import { InquiryForm } from '@/components/public/inquiry-form'
import { StepsList } from '@/components/public/steps-list'
import { siteConfig } from '@/lib/site'
import { MISSION_TEXT, PILLAR_DESCRIPTIONS } from '@/server/public/institution'
import { getViewer } from '@/server/public/viewer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Adhésion et affiliation",
  description: `Rejoindre la ${siteConfig.fullName} : affiliation d'une organisation syndicale, création d'une section, orientation d'un travailleur. Arguments, étapes et formulaire de demande.`,
  alternates: { canonical: '/adhesion' },
}

const benefits = [
  { icon: Scale, title: 'Appui juridique', description: "Conseil en droit du travail, accompagnement des procédures disciplinaires et des contentieux individuels ou collectifs." },
  { icon: GraduationCap, title: 'Formation des responsables', description: 'Accès au Programme de formation des Leaders Syndicaux : dix modules, des formateurs expérimentés, des certificats vérifiables.' },
  { icon: MessageSquare, title: 'Représentation et dialogue social', description: "Une voix collective auprès des pouvoirs publics, des employeurs et des instances de négociation." },
  { icon: HeartHandshake, title: 'Solidarité intersectorielle', description: "Le soutien d'organisations de tous les secteurs en cas de conflit social, de restructuration ou de plan social." },
  { icon: ShieldCheck, title: 'Prévention des conflits', description: 'Médiation, diagnostic des tensions et méthodes de négociation pour régler les différends avant la rupture.' },
  { icon: Users, title: 'Services aux adhérents', description: "Accompagnement à la création d'une section, formation sur mesure, ressources documentaires réservées." },
]

const steps = [
  { title: 'Déposer une demande', description: "Le formulaire ci-dessous ou un courrier au siège : précisez votre organisation, votre secteur et votre démarche.", icon: FileSignature },
  { title: 'Entretien avec le Secrétariat général', description: 'Un responsable vous contacte sous cinq jours ouvrés pour présenter la Fédération et étudier votre situation.', icon: MessageSquare },
  { title: 'Examen par les instances', description: "Les statuts de l'organisation et sa demande sont présentés au Bureau exécutif, qui se prononce sur l'affiliation.", icon: ClipboardCheck },
  { title: 'Bienvenue à la FETRAG', description: "Courrier officiel d'affiliation, accès à la plateforme de formation, aux services et aux ressources réservées.", icon: Building2 },
]

const profiles = [
  { title: 'Une organisation syndicale', description: "Syndicat de branche, syndicat d'entreprise ou union sectorielle : l'affiliation vous donne voix au Congrès et accès à l'ensemble des services." },
  { title: "Des travailleurs sans section", description: "Vous souhaitez créer une section syndicale dans votre entreprise : la Fédération vous accompagne dans les démarches et la constitution du bureau." },
  { title: 'Un travailleur à titre individuel', description: "Nous vous orientons vers l'organisation affiliée de votre secteur et répondons à vos questions sur vos droits." },
]

/** Page d'adhésion : arguments, profils, étapes et formulaire de demande d'adhésion ou d'intérêt. */
export default async function MembershipPage() {
  const viewer = await getViewer()
  return (
    <>
      <PageHeader
        eyebrow="Rejoindre la Fédération"
        tone="gold"
        size="lg"
        title={
          <>
            Ensemble, plus <span className="italic text-gold-700">forts</span>
          </>
        }
        description={`${MISSION_TEXT} Organisation syndicale, section en création ou travailleur isolé : la Fédération vous accueille et vous accompagne.`}
        breadcrumbs={[{ label: 'Adhésion' }]}
        homeHref="/"
        actions={
          <>
            <Button asChild variant="gold" size="lg">
              <a href="#formulaire">Déposer ma demande</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/organisations">
                <Building2 aria-hidden="true" />
                Organisations affiliées
              </Link>
            </Button>
          </>
        }
      >
        <TriptychStrip variant="bar" />
      </PageHeader>

      <Section variant="white" padding="lg" rings={{ position: 'left', opacity: 0.05, rings: 3 }} aria-labelledby="benefits-title">
        <Reveal>
          <SectionHeading
            eyebrow="Pourquoi adhérer"
            tone="blue"
            title={
              <span id="benefits-title">
                Ce que l&apos;affiliation <span className="italic text-blue-600">apporte</span> à votre organisation
              </span>
            }
            description="La FETRAG est une fédération de propositions et de résultats : ses organisations affiliées bénéficient d'un appui concret, du conseil juridique à la formation de leurs responsables."
            className="mb-10"
          />
        </Reveal>
        <Stagger as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => {
            const tone = toneAt(index)
            const classes = toneClasses[tone]
            const Icon = benefit.icon
            return (
              <StaggerItem key={benefit.title} as="li" className="h-full">
                <article className={cn('flex h-full flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft', classes.topRule)}>
                  <div className="flex items-center justify-between">
                    <span className={cn('inline-flex size-11 items-center justify-center rounded-full', classes.soft, classes.softText)}>
                      <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span aria-hidden="true" className={cn('font-display text-3xl font-semibold leading-none', classes.text)}>
                      {padNumber(index + 1)}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-semibold leading-tight text-navy">{benefit.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-600">{benefit.description}</p>
                </article>
              </StaggerItem>
            )
          })}
        </Stagger>
      </Section>

      <Section variant="muted" padding="md" bordered aria-labelledby="profiles-title">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Reveal>
            <SectionHeading
              eyebrow="Qui peut adhérer"
              tone="green"
              title={
                <span id="profiles-title">
                  Trois <span className="italic text-green-700">situations</span>, un même accueil
                </span>
              }
              description="Le formulaire vous demande de préciser votre démarche : la Fédération adapte sa réponse à votre situation."
            />
            <div className="mt-8">
              <TriptychStrip
                variant="cards"
                className="sm:grid-cols-1 lg:grid-cols-1"
                items={{
                  protection: { description: PILLAR_DESCRIPTIONS.protection },
                  prevention: { description: PILLAR_DESCRIPTIONS.prevention },
                  defense: { description: PILLAR_DESCRIPTIONS.defense },
                }}
              />
            </div>
          </Reveal>
          <Stagger as="ol" className="flex flex-col gap-4">
            {profiles.map((profile, index) => {
              const tone = toneAt(index)
              const classes = toneClasses[tone]
              return (
                <StaggerItem key={profile.title} as="li">
                  <article className={cn('flex gap-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft', classes.topRule)}>
                    <span aria-hidden="true" className={cn('font-display text-4xl font-semibold leading-none', classes.text)}>
                      {padNumber(index + 1)}
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-semibold leading-tight text-navy">{profile.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-neutral-600">{profile.description}</p>
                    </div>
                  </article>
                </StaggerItem>
              )
            })}
          </Stagger>
        </div>
      </Section>

      <Section variant="white" padding="lg" bordered aria-labelledby="steps-title">
        <Reveal>
          <SectionHeading
            eyebrow="Les étapes"
            tone="gold"
            title={
              <span id="steps-title">
                De la demande à <span className="italic text-gold-700">l&apos;affiliation</span>
              </span>
            }
            description="Une procédure transparente, conduite par le Secrétariat général et validée par les instances élues de la Fédération."
            className="mb-10"
          />
        </Reveal>
        <StepsList steps={steps} />
      </Section>

      <Section variant="soft" padding="lg" bordered id="formulaire" className="scroll-mt-24" rings={{ position: 'bottom-right', opacity: 0.06, rings: 4 }} aria-labelledby="form-title">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <Reveal>
            <SectionHeading
              eyebrow="Formulaire"
              tone="blue"
              title={
                <span id="form-title">
                  Demande <span className="italic text-blue-600">d&apos;adhésion</span> ou d&apos;information
                </span>
              }
              description="Vos informations sont transmises au Secrétariat général de la Fédération, qui vous répond sous cinq jours ouvrés. Vous recevez immédiatement un accusé de réception avec une référence de suivi."
            />
            <ul className="mt-8 flex flex-col gap-3 text-sm text-neutral-700">
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-green-700" aria-hidden="true" />
                Données traitées conformément à notre politique de confidentialité, jamais transmises à des tiers.
              </li>
              <li className="flex items-start gap-2">
                <MessageSquare className="mt-0.5 size-4 shrink-0 text-green-700" aria-hidden="true" />
                Vous préférez nous appeler ? La permanence répond aux numéros indiqués en bas de page.
              </li>
            </ul>
          </Reveal>
          <Reveal delay={0.1} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-soft sm:p-8">
            <InquiryForm variant="membership" defaults={{ fullName: viewer?.name, email: viewer?.email }} />
          </Reveal>
        </div>
      </Section>
    </>
  )
}
