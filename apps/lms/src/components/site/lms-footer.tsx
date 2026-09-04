import Link from 'next/link'
import { ArrowUpRight, Mail } from 'lucide-react'
import { Emblem, MottoStrip } from '@fetrag/ui'
import { footerNavigation, siteConfig, webHref } from '@/lib/site'

/** Pied de page compact de la plateforme de formation. */
export function LmsFooter() {
  return (
    <footer className="mt-12 border-t border-neutral-200 bg-white">
      <div className="container-fetrag flex flex-col gap-6 py-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Emblem size={40} decorative />
          <div className="leading-tight">
            <p className="font-display text-base font-semibold text-navy">{siteConfig.name}</p>
            <p className="text-xs text-neutral-500">{siteConfig.fullName}</p>
          </div>
        </div>

        <nav aria-label="Liens du pied de page">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {footerNavigation.map((item) => (
              <li key={item.href}>
                {item.external ? (
                  <a href={item.href} className="inline-flex items-center gap-1 text-neutral-600 transition hover:text-blue-700 hover:underline">
                    {item.label}
                    <ArrowUpRight className="size-3.5 opacity-60" aria-hidden="true" />
                  </a>
                ) : (
                  <Link href={item.href} className="text-neutral-600 transition hover:text-blue-700 hover:underline">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
            <li>
              <a href={`mailto:${siteConfig.contact.email}`} className="inline-flex items-center gap-1 text-neutral-600 transition hover:text-blue-700 hover:underline">
                <Mail className="size-3.5" aria-hidden="true" />
                Aide
              </a>
            </li>
          </ul>
        </nav>

        <MottoStrip variant="inline" size="sm" />
      </div>
      <div className="border-t border-neutral-100">
        <div className="container-fetrag flex flex-col gap-1 py-4 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {siteConfig.copyrightYear} {siteConfig.brand} &middot; {siteConfig.fullName}. Tous droits réservés.
          </p>
          <a href={webHref('/')} className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline">
            {siteConfig.domains.web}
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  )
}
