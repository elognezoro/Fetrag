import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Building2, CalendarDays, Download, ExternalLink, FileType2, Globe2, HardDrive, Lock, LogIn, Tag, User } from 'lucide-react'
import type { PublicResource } from '@fetrag/cms'
import { resolvePublicUrl } from '@fetrag/config'
import { accessLevelLabels, resourceKindLabels } from '@fetrag/contracts'
import { formatDate, formatMoney } from '@fetrag/domain'
import { Alert, AlertDescription, AlertTitle, Badge, Breadcrumbs, Button, Container, GradientDivider, Reveal, Ribbon, RingBackdrop, Section, SectionHeading, Stagger, StaggerItem, cn, toneClasses } from '@fetrag/ui'
import { JsonLd } from '@/components/public/json-ld'
import { AccessBadge, ResourceCard, formatFileSize, resourceKindIcon, resourceTone } from '@/components/public/resource-card'
import { ResourcePurchaseForm } from '@/components/public/resource-purchase-form'
import { ShareButtons } from '@/components/public/share-buttons'
import { loadResource } from '@/server/public/loaders'
import { getRelatedResources } from '@/server/public/resources'
import { safeQuery } from '@/server/public/safe'
import { single, type SearchParamsRecord } from '@/server/public/search-params'
import { getViewer } from '@/server/public/viewer'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<SearchParamsRecord>
}

const accessNotices: Record<string, { variant: 'warning' | 'danger' | 'info'; title: string; description: string }> = {
  paiement: { variant: 'warning', title: 'Document premium', description: 'Ce document est réservé aux acheteurs. Réglez-le en ligne pour le télécharger immédiatement.' },
  refuse: { variant: 'danger', title: 'Accès réservé', description: "Ce document est réservé aux membres de l'organisation à laquelle il est rattaché." },
  fichier: { variant: 'info', title: 'Fichier indisponible', description: "Aucun fichier n'est encore associé à ce document. Il sera mis en ligne prochainement." },
  limite: { variant: 'warning', title: 'Trop de téléchargements', description: 'Vous avez atteint la limite de téléchargements autorisée. Réessayez dans quelques minutes.' },
  erreur: { variant: 'danger', title: 'Téléchargement impossible', description: "Une erreur est survenue lors de la préparation du fichier. Réessayez dans quelques instants." },
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const viewer = await getViewer()
  const resource = await safeQuery('resources.getPublished(metadata)', () => loadResource(slug, viewer), null)
  if (!resource) return { title: 'Ressource introuvable', robots: { index: false, follow: false } }
  const description = resource.summary ?? `${resourceKindLabels[resource.kind]} publié par la Fédération des Travailleurs du Gabon.`
  return {
    title: resource.title,
    description,
    keywords: resource.keywords.length > 0 ? resource.keywords : undefined,
    alternates: { canonical: `/ressources/${resource.slug}` },
    openGraph: { type: 'website', url: `/ressources/${resource.slug}`, title: resource.title, description },
    robots: resource.accessLevel === 'PUBLIC' ? undefined : { index: false, follow: true },
  }
}

function resourceJsonLd(resource: PublicResource, url: string): Record<string, unknown> {
  const base = resolvePublicUrl('web')
  return {
    '@context': 'https://schema.org',
    '@type': resource.kind === 'VIDEO' ? 'VideoObject' : resource.kind === 'AUDIO' ? 'AudioObject' : 'DigitalDocument',
    name: resource.title,
    description: resource.summary ?? undefined,
    url,
    datePublished: resource.publishedOn?.toISOString(),
    inLanguage: resource.language,
    isAccessibleForFree: resource.accessLevel === 'PUBLIC',
    keywords: resource.keywords.length > 0 ? resource.keywords.join(', ') : undefined,
    encodingFormat: resource.mimeType ?? undefined,
    author: resource.authorName ? { '@type': 'Person', name: resource.authorName } : undefined,
    publisher: { '@type': 'Organization', '@id': `${base}/#organization`, name: 'Fédération des Travailleurs du Gabon', url: base },
  }
}

/** Fiche d'une ressource : type, niveau d'accès (cadenas), métadonnées, téléchargement ou achat, documents liés. */
export default async function ResourcePage({ params, searchParams }: PageProps) {
  const [{ slug }, query, viewer] = await Promise.all([params, searchParams, getViewer()])
  const resource = await loadResource(slug, viewer)
  if (!resource) notFound()

  const related = await getRelatedResources(resource, viewer)
  const canonical = `${resolvePublicUrl('web')}/ressources/${resource.slug}`
  const notice = accessNotices[single(query.acces) ?? '']
  const Icon = resourceKindIcon(resource.kind)
  const tone = resourceTone(resource.kind)
  const classes = toneClasses[tone]
  const size = formatFileSize(resource.fileSize)
  const downloadHref = `/ressources/${resource.slug}/telecharger`
  const loginHref = `/connexion?callbackUrl=${encodeURIComponent(`/ressources/${resource.slug}`)}`
  const priceLabel = resource.offer ? formatMoney(resource.offer.amount, resource.offer.currency) : null

  return (
    <>
      <JsonLd data={resourceJsonLd(resource, canonical)} />
      <article>
        <header className="relative overflow-hidden border-b border-neutral-200 bg-white">
          <RingBackdrop position="top-right" rings={4} opacity={0.06} />
          <Container size="wide" className="relative py-10 sm:py-14">
            <Breadcrumbs items={[{ label: 'Ressources', href: '/ressources' }, { label: resource.title }]} homeHref="/" className="mb-6" />
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <Reveal className="flex max-w-3xl flex-col gap-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Ribbon tone={tone}>{resourceKindLabels[resource.kind]}</Ribbon>
                  <AccessBadge level={resource.accessLevel} accessible={resource.accessible} />
                  {resource.category ? <Badge variant="outline">{resource.category.name}</Badge> : null}
                </div>
                <h1 className="font-display text-3xl font-semibold leading-[1.08] tracking-tight text-navy text-balance sm:text-4xl lg:text-5xl">{resource.title}</h1>
                {resource.summary ? <p className="text-lg leading-relaxed text-neutral-600 sm:text-xl">{resource.summary}</p> : null}
                <GradientDivider width="lg" />
              </Reveal>
              <Reveal delay={0.1} y={24} className="mx-auto lg:mx-0">
                <span className={cn('relative flex size-32 items-center justify-center rounded-full border-[3px] bg-white shadow-lift', classes.border)}>
                  <span className={cn('absolute inset-2 rounded-full border border-dashed', classes.border)} aria-hidden="true" />
                  <span className={cn('inline-flex size-20 items-center justify-center rounded-full', classes.soft, classes.softText)}>
                    <Icon className="size-10" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  {!resource.accessible ? (
                    <span aria-hidden="true" className="absolute -bottom-1 -right-1 flex size-10 items-center justify-center rounded-full border-4 border-white bg-gold-500 text-navy shadow-soft">
                      <Lock className="size-4" strokeWidth={2} />
                    </span>
                  ) : null}
                </span>
              </Reveal>
            </div>
          </Container>
        </header>

        <Section variant="white" padding="md" containerSize="wide">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
            <div className="min-w-0">
              {notice ? (
                <Alert variant={notice.variant} className="mb-8">
                  <AlertTitle>{notice.title}</AlertTitle>
                  <AlertDescription>{notice.description}</AlertDescription>
                </Alert>
              ) : null}

              <Reveal>
                <h2 className="font-display text-2xl font-semibold text-navy">À propos de ce document</h2>
                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                  <MetaItem icon={FileType2} label="Type" value={resourceKindLabels[resource.kind]} />
                  <MetaItem icon={Lock} label="Niveau d'accès" value={accessLevelLabels[resource.accessLevel]} />
                  {resource.authorName ? <MetaItem icon={User} label="Auteur" value={resource.authorName} /> : null}
                  {resource.source ? <MetaItem icon={Globe2} label="Source" value={resource.source} /> : null}
                  {resource.publishedOn ? <MetaItem icon={CalendarDays} label="Date de publication" value={formatDate(resource.publishedOn)} /> : null}
                  {resource.organization ? <MetaItem icon={Building2} label="Organisation" value={resource.organization.acronym ?? resource.organization.name} /> : null}
                  {size ? <MetaItem icon={HardDrive} label="Taille du fichier" value={size} /> : null}
                  {resource.fileName ? <MetaItem icon={FileType2} label="Fichier" value={resource.fileName} /> : null}
                  <MetaItem icon={Globe2} label="Langue" value={resource.language === 'en' ? 'Anglais' : 'Français'} />
                  {resource.downloadCount > 0 ? <MetaItem icon={Download} label="Téléchargements" value={new Intl.NumberFormat('fr-FR').format(resource.downloadCount)} /> : null}
                </dl>
              </Reveal>

              {resource.keywords.length > 0 ? (
                <nav aria-label="Mots clés" className="mt-8 flex flex-wrap items-center gap-2">
                  <Tag className="size-4 text-neutral-500" aria-hidden="true" />
                  {resource.keywords.map((keyword) => (
                    <Link
                      key={keyword}
                      href={`/ressources?q=${encodeURIComponent(keyword)}`}
                      className="inline-flex min-h-9 items-center rounded-full border border-neutral-200 bg-white px-3 text-sm font-semibold text-navy transition hover:border-blue-300 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40"
                    >
                      #{keyword}
                    </Link>
                  ))}
                </nav>
              ) : null}

              <div className="mt-10 flex flex-col gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <ShareButtons url={canonical} title={resource.title} />
                <Button asChild variant="ghost" size="md">
                  <Link href="/ressources">
                    <ArrowLeft aria-hidden="true" />
                    Toute la bibliothèque
                  </Link>
                </Button>
              </div>
            </div>

            <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
              <div className={cn('rounded-2xl border border-neutral-200 bg-white p-6 shadow-lift', classes.topRule)}>
                <p className="eyebrow text-[11px] text-neutral-500">Téléchargement</p>
                {resource.accessible && resource.hasFile ? (
                  <>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                      {resource.isExternal ? 'Ce document est hébergé sur un site externe.' : `Fichier ${resource.mimeType ? resource.mimeType.split('/').pop()?.toUpperCase() : ''}${size ? ` · ${size}` : ''}`.trim()}
                    </p>
                    <Button asChild variant={tone === 'navy' ? 'primary' : tone === 'gold' ? 'gold' : tone === 'green' ? 'accent' : 'primary'} size="lg" className="mt-4 w-full">
                      <a href={downloadHref} rel={resource.isExternal ? 'noopener noreferrer' : undefined}>
                        {resource.isExternal ? <ExternalLink aria-hidden="true" /> : <Download aria-hidden="true" />}
                        {resource.isExternal ? 'Consulter le document' : 'Télécharger'}
                      </a>
                    </Button>
                  </>
                ) : !resource.hasFile ? (
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">Le fichier de ce document sera mis en ligne prochainement.</p>
                ) : resource.accessLevel === 'PREMIUM' ? (
                  <>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                      Document premium{priceLabel ? ` : ${priceLabel}` : ''}. Le paiement en ligne (Mobile Money ou carte) débloque immédiatement le téléchargement.
                    </p>
                    {viewer ? (
                      priceLabel ? (
                        <div className="mt-4">
                          <ResourcePurchaseForm resourceId={resource.id} slug={resource.slug} priceLabel={priceLabel} />
                        </div>
                      ) : (
                        <p className="mt-4 text-sm font-semibold text-neutral-500">L&apos;achat de ce document n&apos;est pas encore ouvert.</p>
                      )
                    ) : (
                      <Button asChild variant="primary" size="lg" className="mt-4 w-full">
                        <Link href={loginHref}>
                          <LogIn aria-hidden="true" />
                          Se connecter pour acheter
                        </Link>
                      </Button>
                    )}
                  </>
                ) : resource.accessLevel === 'MEMBER' ? (
                  <>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-600">Ce document est réservé aux membres : connectez-vous à votre compte FETRAG pour le télécharger.</p>
                    <div className="mt-4 flex flex-col gap-2">
                      <Button asChild variant="primary" size="lg">
                        <Link href={loginHref}>
                          <LogIn aria-hidden="true" />
                          Se connecter
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="md">
                        <Link href="/inscription">Créer un compte</Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                      Ce document est réservé aux membres de {resource.organization ? `l'organisation ${resource.organization.acronym ?? resource.organization.name}` : 'son organisation'}.
                    </p>
                    {!viewer ? (
                      <Button asChild variant="primary" size="lg" className="mt-4 w-full">
                        <Link href={loginHref}>
                          <LogIn aria-hidden="true" />
                          Se connecter
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild variant="outline" size="md" className="mt-4 w-full">
                        <Link href="/contact">Demander l&apos;accès</Link>
                      </Button>
                    )}
                  </>
                )}
              </div>
              <div className="rounded-2xl border border-gold-200 bg-gold-50 p-5">
                <p className="eyebrow text-[11px] text-gold-800">Usage des documents</p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                  Les documents de la Fédération peuvent être diffusés à des fins syndicales et pédagogiques, en citant leur source. Les textes officiels restent soumis à leur régime propre.
                </p>
              </div>
            </aside>
          </div>
        </Section>
      </article>

      {related.length > 0 ? (
        <Section variant="muted" padding="md" bordered aria-labelledby="related-resources-title">
          <Reveal>
            <SectionHeading
              eyebrow="Dans la même rubrique"
              tone="blue"
              size="md"
              title={
                <span id="related-resources-title">
                  Autres <span className="italic text-blue-600">documents</span>
                </span>
              }
              className="mb-8"
            />
          </Reveal>
          <Stagger as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <StaggerItem key={item.id} as="li" className="h-full">
                <ResourceCard resource={item} />
              </StaggerItem>
            ))}
          </Stagger>
        </Section>
      ) : null}
    </>
  )
}

function MetaItem({ icon: Icon, label, value }: { icon: typeof Lock; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-blue-600" strokeWidth={1.75} aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-xs font-semibold text-neutral-500">{label}</dt>
        <dd className="break-words text-sm font-semibold text-navy">{value}</dd>
      </div>
    </div>
  )
}
