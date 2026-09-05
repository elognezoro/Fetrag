import { Building2, Mail } from 'lucide-react'
import { Button, Card, CardContent, Emblem, Ribbon } from '@fetrag/ui'
import { siteConfig, webHref } from '@/lib/site'

/** Page explicative pour un utilisateur qui n'est responsable d'aucune organisation affiliée. */
export function NoOrganization({ context = 'demande' }: { context?: 'demande' | 'organisation' }) {
  return (
    <div className="mx-auto max-w-3xl py-6">
      <Card pillar="protection" className="overflow-hidden">
        <CardContent className="flex flex-col items-center gap-5 p-8 text-center sm:p-12">
          <span className="flex size-20 items-center justify-center rounded-full bg-white shadow-soft ring-8 ring-blue-50">
            <Emblem size={52} decorative />
          </span>
          <Ribbon tone="blue">Espace organisation</Ribbon>
          <h1 className="font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">
            Vous devez être <span className="italic text-blue-600">responsable d&apos;une organisation</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-neutral-600">
            {context === 'demande'
              ? "Les demandes de formation institutionnelles sont déposées par les responsables désignés des organisations affiliées à la FETRAG (syndicats, sections, fédérations). Votre compte n'est rattaché à aucune organisation en tant que gestionnaire."
              : "Le tableau de bord d'organisation est réservé aux responsables désignés des organisations affiliées. Votre compte n'est rattaché à aucune organisation en tant que gestionnaire."}
          </p>
          <ul className="grid w-full max-w-lg gap-3 text-left text-sm text-neutral-700">
            <li className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <span className="font-display text-xl font-semibold text-blue-600">01</span>
              <span>Votre organisation est déjà affiliée : demandez à son responsable ou à la coordination FETRAG de vous désigner comme gestionnaire.</span>
            </li>
            <li className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <span className="font-display text-xl font-semibold text-green-700">02</span>
              <span>Votre organisation n&apos;est pas encore affiliée : contactez la Fédération pour engager la procédure d&apos;adhésion.</span>
            </li>
            <li className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <span className="font-display text-xl font-semibold text-gold-700">03</span>
              <span>Vous souhaitez vous former à titre individuel : le catalogue des dix modules du programme 2026 est ouvert aux inscriptions.</span>
            </li>
          </ul>
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild variant="primary">
              <a href={webHref('/contact')}>
                <Mail aria-hidden="true" />
                Contacter la FETRAG
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/catalogue">
                <Building2 aria-hidden="true" />
                Voir le catalogue
              </a>
            </Button>
          </div>
          <p className="text-xs text-neutral-500">
            {siteConfig.contact.email} · {siteConfig.contact.phones.join(' / ')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
