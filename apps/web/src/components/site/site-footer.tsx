import Link from 'next/link'
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react'
import { Emblem, MottoStrip } from '@fetrag/ui'
import { footerNavigation, legalNavigation, lmsHref, siteConfig, type NavItem } from '@/lib/site'

function FooterLink({ item }: { item: NavItem }) {
  const className = 'inline-flex items-center gap-1 text-sm text-white/75 transition hover:text-white hover:underline'
  if (item.external) {
    return (
      <a href={item.href} className={className}>
        {item.label}
        <ArrowUpRight className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
      </a>
    )
  }
  return (
    <Link href={item.href} className={className}>
      {item.label}
    </Link>
  )
}

function FooterColumn({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div>
      <h2 className="eyebrow mb-4 text-gold-400">{title}</h2>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.href}>
            <FooterLink item={item} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Pied de page institutionnel : fond marine, emblème, colonnes, devise et mentions. */
export function SiteFooter() {
  return (
    <footer className="relative mt-16 overflow-hidden bg-navy-gradient text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full border-[28px] border-green-500/15"
      />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full border-[18px] border-blue-400/15" />

      <MottoStrip />

      <div className="container-fetrag relative grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <Emblem size={56} variant="white" decorative />
            <div>
              <p className="font-display text-2xl font-semibold leading-tight">{siteConfig.name}</p>
              <p className="text-sm text-white/70">{siteConfig.fullName}</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/75">
            Protection de l&apos;outil de production, prévention des conflits sociaux, défense des intérêts matériels et moraux des
            travailleurs.
          </p>
          <p className="mt-4 text-sm text-white/60">
            Secrétaire Général : <span className="font-semibold text-white/85">{siteConfig.secretaryGeneral}</span>
          </p>
        </div>

        <FooterColumn title={footerNavigation.institution.title} items={footerNavigation.institution.items} />
        <FooterColumn title={footerNavigation.formation.title} items={footerNavigation.formation.items} />
        <FooterColumn title={footerNavigation.services.title} items={footerNavigation.services.items} />

        <div>
          <h2 className="eyebrow mb-4 text-gold-400">Contact</h2>
          <address className="space-y-3 text-sm not-italic text-white/80">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green-400" aria-hidden="true" />
              <span>{siteConfig.contact.address}</span>
            </p>
            <p className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-green-400" aria-hidden="true" />
              <a href={`mailto:${siteConfig.contact.email}`} className="break-all hover:underline">
                {siteConfig.contact.email}
              </a>
            </p>
            {siteConfig.contact.phones.map((phone) => (
              <p key={phone} className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-green-400" aria-hidden="true" />
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:underline">
                  {phone}
                </a>
              </p>
            ))}
          </address>
          <a
            href={lmsHref('/')}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:border-green-400 hover:text-white"
          >
            {siteConfig.domains.lms}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-fetrag flex flex-col gap-3 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {siteConfig.copyrightYear} {siteConfig.name} &middot; {siteConfig.fullName}. Tous droits réservés.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {legalNavigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-white hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
