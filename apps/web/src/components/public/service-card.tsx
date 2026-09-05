import Link from 'next/link'
import { ArrowRight, Clock, Lock } from 'lucide-react'
import type { ServiceCard as ServiceCardData } from '@fetrag/cms'
import { formatMoney } from '@fetrag/domain'
import { Badge, cn, toneAt, toneClasses } from '@fetrag/ui'
import { ServiceIcon } from './service-icon'

interface ServiceCardProps {
  service: ServiceCardData
  index?: number
  className?: string
}

/** Carte de service : icône dans une pastille, tarif ou gratuité, délai indicatif, compte requis. */
export function ServiceCard({ service, index = 0, className }: ServiceCardProps) {
  const tone = toneAt(index)
  const classes = toneClasses[tone]
  const href = `/services/${service.slug}`
  const price = service.isPaid && service.priceAmount ? formatMoney(service.priceAmount, service.currency) : null

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft transition-[transform,box-shadow] duration-180 ease-out-expo hover:-translate-y-0.5 hover:shadow-lift focus-within:shadow-lift',
        classes.topRule,
        classes.glow,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn('inline-flex size-12 items-center justify-center rounded-full', classes.soft, classes.softText)}>
          <ServiceIcon name={service.icon} className="size-6" />
        </span>
        {price ? <Badge variant="gold">{price}</Badge> : <Badge variant="green">Gratuit</Badge>}
      </div>
      <h3 className="font-display text-xl font-semibold leading-tight tracking-tight text-navy">
        <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
          {service.name}
        </Link>
      </h3>
      {service.summary ? <p className="line-clamp-3 text-sm leading-relaxed text-neutral-600">{service.summary}</p> : null}
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-xs font-semibold text-neutral-500">
        {service.slaDays ? (
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden="true" />
            Réponse sous {service.slaDays} jours
          </span>
        ) : null}
        {service.requiresAccount ? (
          <span className="inline-flex items-center gap-1">
            <Lock className="size-3.5" aria-hidden="true" />
            Compte requis
          </span>
        ) : null}
        <span className={cn('ml-auto inline-flex items-center gap-1', classes.text)}>
          Faire une demande
          <ArrowRight className="size-3.5 transition-transform duration-180 group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </article>
  )
}
