import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, CreditCard, FileText, Lock, LogIn, UserPlus } from 'lucide-react'
import { seo, type PublicService } from '@fetrag/cms'
import { resolvePublicUrl } from '@fetrag/config'
import { formatMoney } from '@fetrag/domain'
import { Alert, AlertDescription, AlertTitle, Badge, Breadcrumbs, Button, Container, GradientDivider, Prose, Reveal, Ribbon, RingBackdrop, Section, SectionHeading, Stagger, StaggerItem, cn, toneClasses } from '@fetrag/ui'
import { JsonLd } from '@/components/public/json-ld'
import { ServiceCard } from '@/components/public/service-card'
import { ServiceIcon } from '@/components/public/service-icon'
import { ServiceRequestForm } from '@/components/public/service-request-form'
import { ShareButtons } from '@/components/public/share-buttons'
import { loadService } from '@/server/public/loaders'
import { toMetadata } from '@/server/public/metadata'
import { safeQuery } from '@/server/public/safe'
import { getOtherServices } from '@/server/public/services'
import { getViewer } from '@/server/public/viewer'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

/** Entité SEO du service (le CMS attend `title`). */
function seoEntity(service: PublicService) {
  return {
    slug: service.slug,
    title: service.name,
    summary: service.summary,
    description: service.description,
    status: service.status,
    updatedAt: service.updatedAt,
    createdAt: service.createdAt,
    seo: service.seo,
    isFree: !service.isPaid,
    priceAmount: service.priceAmount,
    currency: service.currency,
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const service = await safeQuery('services.getPublished(metadata)', () => loadService(slug), null)
  if (!service) return { title: 'Service introuvable', robots: { index: false, follow: false } }
  return toMetadata(seo.buildMetadata('service', seoEntity(service)))
}

/** Fiche d'un service : présentation, conditions, tarif, délai et formulaire de demande (paiement si payant). */
export default async function ServicePage({ params }: PageProps) {
  const [{ slug }, viewer] = await Promise.all([params, getViewer()])
  const service = await loadService(slug)
  if (!service) notFound()

  const others = await getOtherServices(service.id)
  const canonical = `${resolvePublicUrl('web')}/services/${service.slug}`
  const priceLabel = service.isPaid && service.priceAmount ? formatMoney(service.priceAmount, service.currency) : null
  const classes = toneClasses['green']
  const loginHref = `/connexion?callbackUrl=${encodeURIComponent(`/services/${service.slug}`)}`
  const requiresLogin = (service.requiresAccount || service.isPaid) && !viewer

  return (
    <>
      <JsonLd data={seo.jsonLd('service', seoEntity(service))} />
      <article>
        <header className="relative overflow-hidden border-b border-neutral-200 bg-white">
          <RingBackdrop position="top-right" rings={4} opacity={0.06} />
          <Container size="wide" className="relative py-10 sm:py-14">
            <Breadcrumbs items={[{ label: 'Services', href: '/services' }, { label: service.name }]} homeHref="/" className="mb-6" />
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <Reveal className="flex max-w-3xl flex-col gap-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Ribbon tone="green">Service</Ribbon>
                  {service.category ? <Badge variant="outline">{service.category.name}</Badge> : null}
                  {priceLabel ? <Badge variant="gold">{priceLabel}</Badge> : <Badge variant="green">Gratuit</Badge>}
                </div>
                <h1 className="font-display text-3xl font-semibold leading-[1.08] tracking-tight text-navy text-balance sm:text-4xl lg:text-5xl">{service.name}</h1>
                {service.summary ? <p className="text-lg leading-relaxed text-neutral-600 sm:text-xl">{service.summary}</p> : null}
                <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-500">
                  {service.slaDays ? (
                    <div className="inline-flex items-center gap-1.5">
                      <Clock className="size-4 text-green-700" aria-hidden="true" />
                      <dt className="sr-only">Délai indicatif</dt>
                      <dd>Réponse sous {service.slaDays} jour{service.slaDays > 1 ? 's' : ''} ouvré{service.slaDays > 1 ? 's' : ''}</dd>
                    </div>
                  ) : null}
                  {service.requiresAccount ? (
                    <div className="inline-flex items-center gap-1.5">
                      <Lock className="size-4 text-green-700" aria-hidden="true" />
                      <dt className="sr-only">Accès</dt>
                      <dd>Compte FETRAG requis</dd>
                    </div>
                  ) : null}
                  {service.isPaid ? (
                    <div className="inline-flex items-center gap-1.5">
                      <CreditCard className="size-4 text-green-700" aria-hidden="true" />
                      <dt className="sr-only">Paiement</dt>
                      <dd>Paiement en ligne sécurisé</dd>
                    </div>
                  ) : null}
                </dl>
                <GradientDivider width="lg" />
                <div>
                  <Button asChild variant="accent" size="lg">
                    <a href="#demande">Déposer une demande</a>
                  </Button>
                </div>
              </Reveal>
              <Reveal delay={0.1} y={24} className="mx-auto lg:mx-0">
                <span className={cn('relative flex size-32 items-center justify-center rounded-full border-[3px] bg-white shadow-lift', classes.border)}>
                  <span className={cn('absolute inset-2 rounded-full border border-dashed border-gold-500')} aria-hidden="true" />
                  <span className={cn('inline-flex size-20 items-center justify-center rounded-full', classes.soft, classes.softText)}>
                    <ServiceIcon name={service.icon} className="size-10" />
                  </span>
                </span>
              </Reveal>
            </div>
          </Container>
        </header>

        <Section variant="white" padding="md" containerSize="wide">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
            <div className="min-w-0 space-y-12">
              {service.description.trim() ? (
                <Reveal as="section" aria-labelledby="service-description-title">
                  <SectionHeading eyebrow="Présentation" tone="green" size="md" title={<span id="service-description-title">En quoi consiste ce service</span>} className="mb-6" />
                  <Prose html={service.description} />
                </Reveal>
              ) : null}

              <Reveal as="section" id="demande" aria-labelledby="request-title" className="scroll-mt-24">
                <SectionHeading
                  eyebrow="Votre demande"
                  tone="blue"
                  size="md"
                  title={
                    <span id="request-title">
                      Déposer une <span className="italic text-blue-600">demande</span>
                    </span>
                  }
                  description={
                    service.isPaid
                      ? `Ce service est facturé ${priceLabel ?? 'selon le tarif en vigueur'}. Après validation du formulaire, vous réglez en ligne ; la demande est instruite dès confirmation du paiement.`
                      : 'Ce service est gratuit pour les travailleurs et les organisations. Vous recevez une référence de suivi et un accusé de réception par email.'
                  }
                  className="mb-6"
                />
                {requiresLogin ? (
                  <div className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-6">
                    <Alert variant="info" icon={Lock}>
                      <AlertTitle>Compte FETRAG requis</AlertTitle>
                      <AlertDescription>
                        {service.isPaid
                          ? 'Le paiement en ligne et le suivi de votre demande nécessitent un compte. La connexion vous ramènera sur cette page.'
                          : 'Ce service est réservé aux titulaires d’un compte FETRAG afin de garantir le suivi de votre dossier. La connexion vous ramènera sur cette page.'}
                      </AlertDescription>
                    </Alert>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button asChild variant="primary" size="lg">
                        <Link href={loginHref}>
                          <LogIn aria-hidden="true" />
                          Se connecter
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg">
                        <Link href="/inscription">
                          <UserPlus aria-hidden="true" />
                          Créer un compte
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft sm:p-8">
                    <ServiceRequestForm
                      serviceId={service.id}
                      slug={service.slug}
                      serviceName={service.name}
                      fields={service.formSchema}
                      isPaid={service.isPaid}
                      priceLabel={priceLabel}
                      viewer={viewer ? { name: viewer.name ?? null, email: viewer.email } : null}
                    />
                  </div>
                )}
              </Reveal>

              <div className="flex flex-col gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <ShareButtons url={canonical} title={service.name} />
                <Button asChild variant="ghost" size="md">
                  <Link href="/services">
                    <ArrowLeft aria-hidden="true" />
                    Tous les services
                  </Link>
                </Button>
              </div>
            </div>

            <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-lift pillar-top-green">
                <p className="eyebrow text-[11px] text-neutral-500">En bref</p>
                <dl className="mt-4 flex flex-col gap-3 text-sm">
                  <div className="flex items-start gap-3">
                    <CreditCard className="mt-0.5 size-4 shrink-0 text-green-700" aria-hidden="true" />
                    <div>
                      <dt className="text-xs font-semibold text-neutral-500">Tarif</dt>
                      <dd className="font-semibold text-navy">{priceLabel ?? 'Gratuit'}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 size-4 shrink-0 text-green-700" aria-hidden="true" />
                    <div>
                      <dt className="text-xs font-semibold text-neutral-500">Délai indicatif</dt>
                      <dd className="font-semibold text-navy">{service.slaDays ? `${service.slaDays} jour${service.slaDays > 1 ? 's' : ''} ouvré${service.slaDays > 1 ? 's' : ''}` : 'Selon la demande'}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lock className="mt-0.5 size-4 shrink-0 text-green-700" aria-hidden="true" />
                    <div>
                      <dt className="text-xs font-semibold text-neutral-500">Accès</dt>
                      <dd className="font-semibold text-navy">{service.requiresAccount ? 'Compte FETRAG requis' : 'Ouvert à tous'}</dd>
                    </div>
                  </div>
                  {service._count.requests > 0 ? (
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 size-4 shrink-0 text-green-700" aria-hidden="true" />
                      <div>
                        <dt className="text-xs font-semibold text-neutral-500">Demandes traitées</dt>
                        <dd className="font-semibold text-navy">{new Intl.NumberFormat('fr-FR').format(service._count.requests)}</dd>
                      </div>
                    </div>
                  ) : null}
                </dl>
              </div>
              {service.conditions ? (
                <div className="rounded-2xl border border-gold-200 bg-gold-50 p-5">
                  <p className="eyebrow text-[11px] text-gold-800">Conditions</p>
                  <Prose html={service.conditions} className="mt-2 text-sm" />
                </div>
              ) : null}
              {viewer ? (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                  <p className="eyebrow text-[11px] text-neutral-500">Vos demandes</p>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-700">Retrouvez l&apos;avancement de toutes vos demandes dans votre espace personnel.</p>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href="/espace/demandes">Mes demandes</Link>
                  </Button>
                </div>
              ) : null}
            </aside>
          </div>
        </Section>
      </article>

      {others.length > 0 ? (
        <Section variant="muted" padding="md" bordered aria-labelledby="other-services-title">
          <Reveal>
            <SectionHeading
              eyebrow="Autres services"
              tone="green"
              size="md"
              title={
                <span id="other-services-title">
                  La Fédération vous accompagne <span className="italic text-green-700">aussi</span>
                </span>
              }
              className="mb-8"
            />
          </Reveal>
          <Stagger as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((item, position) => (
              <StaggerItem key={item.id} as="li" className="h-full">
                <ServiceCard service={item} index={position + 1} />
              </StaggerItem>
            ))}
          </Stagger>
        </Section>
      ) : null}
    </>
  )
}
