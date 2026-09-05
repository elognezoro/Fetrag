import Link from 'next/link'
import { ArrowRight, Download, ExternalLink, FileText, Lock, type LucideIcon, Mic, Presentation, ScrollText, Video, ClipboardList, BookOpen, BarChart3 } from 'lucide-react'
import type { PublicResource } from '@fetrag/cms'
import { accessLevelLabels, resourceKindLabels } from '@fetrag/contracts'
import { formatDate } from '@fetrag/domain'
import { Badge, cn, toneClasses, type Tone } from '@fetrag/ui'

const kindIcons: Record<PublicResource['kind'], LucideIcon> = {
  DOCUMENT: FileText,
  GUIDE: BookOpen,
  REPORT: BarChart3,
  LEGAL_TEXT: ScrollText,
  FORM: ClipboardList,
  VIDEO: Video,
  AUDIO: Mic,
  PRESENTATION: Presentation,
}

const kindTones: Record<PublicResource['kind'], Tone> = {
  DOCUMENT: 'blue',
  GUIDE: 'green',
  REPORT: 'gold',
  LEGAL_TEXT: 'blue',
  FORM: 'navy',
  VIDEO: 'green',
  AUDIO: 'gold',
  PRESENTATION: 'blue',
}

export function resourceKindIcon(kind: PublicResource['kind']): LucideIcon {
  return kindIcons[kind]
}

export function resourceTone(kind: PublicResource['kind']): Tone {
  return kindTones[kind]
}

/** Taille de fichier lisible (Ko / Mo). */
export function formatFileSize(bytes: number | null | undefined): string | null {
  if (!bytes || bytes <= 0) return null
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`
}

/** Badge du niveau d'accès (cadenas si restreint). */
export function AccessBadge({ level, accessible }: { level: PublicResource['accessLevel']; accessible: boolean }) {
  if (level === 'PUBLIC') return <Badge variant="green">Accès libre</Badge>
  return (
    <Badge variant={accessible ? 'blue' : 'warning'}>
      <Lock aria-hidden="true" />
      {accessLevelLabels[level]}
    </Badge>
  )
}

interface ResourceCardProps {
  resource: PublicResource
  className?: string
}

/** Carte de ressource documentaire : type, accès (cadenas), résumé, source, date et bouton de téléchargement. */
export function ResourceCard({ resource, className }: ResourceCardProps) {
  const Icon = kindIcons[resource.kind]
  const tone = kindTones[resource.kind]
  const classes = toneClasses[tone]
  const href = `/ressources/${resource.slug}`
  const size = formatFileSize(resource.fileSize)

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft transition-[transform,box-shadow] duration-180 ease-out-expo hover:-translate-y-0.5 hover:shadow-lift focus-within:shadow-lift sm:p-6',
        classes.topRule,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn('inline-flex size-12 items-center justify-center rounded-full', classes.soft, classes.softText)}>
          <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          <Badge variant="neutral">{resourceKindLabels[resource.kind]}</Badge>
          <AccessBadge level={resource.accessLevel} accessible={resource.accessible} />
        </div>
      </div>
      <h3 className="font-display text-lg font-semibold leading-tight tracking-tight text-navy sm:text-xl">
        <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
          {resource.title}
        </Link>
      </h3>
      {resource.summary ? <p className="line-clamp-3 text-sm leading-relaxed text-neutral-600">{resource.summary}</p> : null}
      <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
        {resource.source ? (
          <div className="inline-flex gap-1">
            <dt className="font-semibold">Source :</dt>
            <dd>{resource.source}</dd>
          </div>
        ) : null}
        {resource.publishedOn ? (
          <div className="inline-flex gap-1">
            <dt className="font-semibold">Publié le :</dt>
            <dd>{formatDate(resource.publishedOn)}</dd>
          </div>
        ) : null}
        {size ? (
          <div className="inline-flex gap-1">
            <dt className="font-semibold">Taille :</dt>
            <dd>{size}</dd>
          </div>
        ) : null}
      </dl>
      <div className="relative z-10 mt-auto flex items-center justify-between gap-3 pt-2">
        {resource.hasFile && resource.accessible ? (
          <a
            href={`${href}/telecharger`}
            className={cn('inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-px hover:shadow-lift focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40', classes.bg, tone === 'green' || tone === 'gold' ? 'text-navy' : 'text-white')}
          >
            {resource.isExternal ? <ExternalLink className="size-4" aria-hidden="true" /> : <Download className="size-4" aria-hidden="true" />}
            {resource.isExternal ? 'Consulter' : 'Télécharger'}
          </a>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
            <Lock className="size-3.5" aria-hidden="true" />
            {resource.hasFile ? 'Accès réservé' : 'Fichier à venir'}
          </span>
        )}
        <span className={cn('inline-flex items-center gap-1 text-xs font-semibold', classes.text)}>
          Détails
          <ArrowRight className="size-3.5 transition-transform duration-180 group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </article>
  )
}
