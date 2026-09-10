import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, ClipboardCheck, FileSignature, Globe2, GraduationCap, Handshake, Landmark, MessageSquare, Newspaper, ShieldCheck } from 'lucide-react'
import { Button, PageHeader, Reveal, Section, SectionHeading, Stagger, StaggerItem, cn, padNumber, toneAt, toneClasses } from '@fetrag/ui'
import { InquiryForm } from '@/components/public/inquiry-form'
import { StepsList } from '@/components/public/steps-list'
import { siteConfig } from '@/lib/site'
import { getViewer } from '@/server/public/viewer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Partenariat',
  description: `Devenir partenaire de la ${siteConfig.fullName} : partenariat institutionnel, formation et expertise, soutien financier, média. Types de coopération, engagements et formulaire de proposition.`,
  alternates: { canonical: '/partenariat' },
}

const partnershipTypes = [
  { icon: Landmark, title: 'Partenariat institutionnel', description: "Administrations, institutions de dialogue social, organismes de protection sociale : coopérer sur les politiques du travail et de l'emploi." },
  { icon: GraduationCap, title: 'Formation et expertise', description: "Universités, cabinets, centres de formation : co-construire des modules, intervenir dans le Programme des Leaders Syndicaux, produire des ressources." },
  { icon: Handshake, title: 'Soutien financier ou mécénat', description: "Financer des sessions de formation, des équipements pédagogiques ou des actions de solidarité, avec un reporting transparent." },
  { icon: Newspaper, title: 'Média et communication', description: "Relayer les campagnes de la Fédération, couvrir ses événements, donner la parole aux travailleurs." },
  { icon: Globe2, title: 'Coopération internationale', description: "Fédérations et réseaux syndicaux étrangers, organisations internationales du travail : échanges d'expériences et programmes conjoints." },
]

const commitments = [
  'Indépendance de la Fédération : un partenariat ne conditionne jamais ses positions ni ses revendications.',
  "Transparence : les partenariats sont présentés aux instances et rendus publics sur cette page et dans le rapport annuel.",
  'Utilité pour les travailleurs : chaque coopération vise un bénéfice concret pour les adhérents et leurs organisations.',
  'Respect des valeurs de la devise : Travail, Efficacité, Solidarité.',
]

const steps = [
  { title: 'Proposer un partenariat', description: 'Décrivez votre organisation, le type de coopération envisagé et vos attentes dans le formulaire ci-dessous.', icon: FileSignature },
  { title: 'Échange avec le Secrétariat général', description: 'Un rendez-vous est proposé sous dix jours ouvrés pour préciser les objectifs, le périmètre et le calendrier.', icon: MessageSquare },
  { title: 'Validation par les instances', description: 'Le projet est présenté au Bureau exécutif, qui se prononce et fixe les modalités de suivi.', icon: ClipboardCheck },
  { title: 'Convention et mise en œuvre', description: 'Une convention formalise les engagements réciproques ; un bilan est établi chaque année.', icon: Handshake },
]

/** Page partenariat : types de coopération, engagements de la Fédération, étapes et formulaire de proposition. */
export default async function PartnershipPage() {
  const viewer = await getViewer()
  return (
    <>
      <PageHeader
        eyebrow="Partenariat"
        tone="green"
        size="lg"
        title={
          <>
            Construire des <span className="italic text-green-700">coopérations</span> utiles aux travailleurs
          </>
        }
        description="Institutions, organismes de formation, entreprises responsables, médias et réseaux internationaux : la Fédération noue des partenariats fondés sur l'indépendance, la transparence et l'intérêt des travailleurs gabonais."
        breadcrumbs={[{ label: 'Partenariat' }]}
        homeHref="/"
        actions={
          <>
            <Button asChild variant="accent" size="lg">
              <a href="#formulaire">Proposer un partenariat</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/organisations">
                <Building2 aria-hidden="true" />
                Nos partenaires actuels
              </Link>
            </Button>
          </>
        }
      />

      <Section variant="white" padding="lg" rings={{ position: 'left', opacity: 0.05, rings: 3 }} aria-labelledby="types-title">
        <Reveal>
          <SectionHeading
            eyebrow="Types de partenariat"
            tone="blue"
            title={
              <span id="types-title">
                Cinq façons de <span className="italic text-blue-600">coopérer</span>
              </span>
            }
            description="Chaque partenariat est formalisé par une convention qui précise les objectifs, les contributions de chacun et les modalités d'évaluation."
            className="mb-10"
          />
        </Reveal>
        <Stagger as="ul" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {partnershipTypes.map((type, index) => {
            const tone = toneAt(index)
            const classes = toneClasses[tone]
            const Icon = type.icon
            return (
              <StaggerItem key={type.title} as="li" className="h-full">
                <article className={cn('flex h-full flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft', classes.topRule)}>
                  <div className="flex items-center justify-between">
                    <span className={cn('inline-flex size-11 items-center justify-center rounded-full', classes.soft, classes.softText)}>
                      <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span aria-hidden="true" className={cn('font-display text-3xl font-semibold leading-none', classes.text)}>
                      {padNumber(index + 1)}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-semibold leading-tight text-navy">{type.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-600">{type.description}</p>
                </article>
              </StaggerItem>
            )
          })}
        </Stagger>
      </Section>

      <Section variant="dark" padding="lg" aria-labelledby="commitments-title" rings={{ scheme: 'light', opacity: 0.12, position: 'top-right', rings: 5 }}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <SectionHeading
              eyebrow="Nos engagements"
              tone="gold"
              inverted
              title={
                <span id="commitments-title">
                  Un partenariat qui respecte <span className="italic text-gold-400">l&apos;indépendance</span> syndicale
                </span>
              }
              description="La Fédération reste seule maîtresse de ses positions. Ses partenaires partagent une exigence : servir les travailleurs gabonais."
            />
          </Reveal>
          <Stagger as="ul" className="flex flex-col gap-3">
            {commitments.map((commitment, index) => (
              <StaggerItem key={commitment} as="li" className="flex items-start gap-4 rounded-2xl border border-white/15 bg-white/5 p-5">
                <span aria-hidden="true" className="font-display text-2xl font-semibold leading-none text-gold-400">
                  {padNumber(index + 1)}
                </span>
                <p className="text-sm leading-relaxed text-white/85 sm:text-base">{commitment}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      <Section variant="white" padding="lg" bordered aria-labelledby="steps-title">
        <Reveal>
          <SectionHeading
            eyebrow="Les étapes"
            tone="green"
            title={
              <span id="steps-title">
                De la proposition à la <span className="italic text-green-700">convention</span>
              </span>
            }
            className="mb-10"
          />
        </Reveal>
        <StepsList steps={steps} />
      </Section>

      <Section variant="soft" padding="lg" bordered id="formulaire" className="scroll-mt-24" rings={{ position: 'bottom-right', opacity: 0.06, rings: 4 }} aria-labelledby="form-title">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <Reveal>
            <SectionHeading
              eyebrow="Formulaire"
              tone="blue"
              title={
                <span id="form-title">
                  Proposer un <span className="italic text-blue-600">partenariat</span>
                </span>
              }
              description="Votre proposition est transmise au Secrétariat général de la Fédération. Vous recevez un accusé de réception avec une référence de suivi et une réponse sous dix jours ouvrés."
            />
            <p className="mt-8 flex items-start gap-2 text-sm text-neutral-700">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-green-700" aria-hidden="true" />
              Les informations transmises restent confidentielles jusqu&apos;à la signature d&apos;une éventuelle convention.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-soft sm:p-8">
            <InquiryForm variant="partnership" defaults={{ fullName: viewer?.name, email: viewer?.email }} />
          </Reveal>
        </div>
      </Section>
    </>
  )
}
