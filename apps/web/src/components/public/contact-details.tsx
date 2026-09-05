import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { cn } from '@fetrag/ui'
import { siteConfig } from '@/lib/site'

interface ContactDetailsProps {
  className?: string
  /** Couleurs pour fond sombre. */
  inverted?: boolean
}

/** Coordonnées officielles de la Fédération (adresse, email, téléphones, horaires). */
export function ContactDetails({ className, inverted = false }: ContactDetailsProps) {
  const itemClass = cn('flex items-start gap-3 text-sm leading-relaxed', inverted ? 'text-white/85' : 'text-neutral-700')
  const iconClass = cn('mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full', inverted ? 'bg-white/10 text-green-300' : 'bg-blue-50 text-blue-700')
  const titleClass = cn('block font-semibold', inverted ? 'text-white' : 'text-navy')
  return (
    <address className={cn('flex flex-col gap-4 not-italic', className)}>
      <p className={itemClass}>
        <span className={iconClass}>
          <MapPin className="size-4" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span>
          <span className={titleClass}>Siège</span>
          {siteConfig.contact.address}
        </span>
      </p>
      <p className={itemClass}>
        <span className={iconClass}>
          <Mail className="size-4" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span>
          <span className={titleClass}>Email</span>
          <a href={`mailto:${siteConfig.contact.email}`} className="break-all underline-offset-2 hover:underline">
            {siteConfig.contact.email}
          </a>
        </span>
      </p>
      <p className={itemClass}>
        <span className={iconClass}>
          <Phone className="size-4" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span>
          <span className={titleClass}>Téléphone</span>
          {siteConfig.contact.phones.map((phone, index) => (
            <span key={phone}>
              {index > 0 ? ' · ' : ''}
              <a href={`tel:${phone.replace(/\s+/g, '')}`} className="underline-offset-2 hover:underline">
                {phone}
              </a>
            </span>
          ))}
        </span>
      </p>
      <p className={itemClass}>
        <span className={iconClass}>
          <Clock className="size-4" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span>
          <span className={titleClass}>Permanence</span>
          Du lundi au vendredi, de 8 h à 16 h (heure de Libreville). Réponse aux messages sous cinq jours ouvrés.
        </span>
      </p>
    </address>
  )
}
