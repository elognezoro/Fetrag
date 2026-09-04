import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, KeyRound, ShieldCheck, Smartphone } from 'lucide-react'
import { Button } from '@fetrag/ui'
import { AuthCard } from '@/components/auth/auth-card'
import { safeCallbackUrl } from '@/lib/actions/auth-types'
import { webHref } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Vérification en deux étapes',
}

interface MfaPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** Explique l'activation de la vérification en deux étapes (gérée sur fetrag.ga : Espace > Sécurité). */
export default async function MfaPage({ searchParams }: MfaPageProps) {
  const params = await searchParams
  const raw = Array.isArray(params.callbackUrl) ? params.callbackUrl[0] : params.callbackUrl
  const callbackUrl = safeCallbackUrl(raw, '/dashboard')

  return (
    <AuthCard
      eyebrow="Sécurité"
      title={
        <>
          Vérification en <span className="italic text-green-700">deux étapes</span>
        </>
      }
      description="Les rôles privilégiés (administration, coordination, finance, communication) doivent protéger leur compte par un second facteur."
    >
      <ol className="space-y-4">
        <li className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
            <Smartphone className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-navy">1. Installez une application d&apos;authentification</p>
            <p className="text-sm text-neutral-600">Par exemple Google Authenticator, Microsoft Authenticator ou FreeOTP, sur votre téléphone.</p>
          </div>
        </li>
        <li className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">
            <KeyRound className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-navy">2. Activez la vérification dans votre espace sur fetrag.ga</p>
            <p className="text-sm text-neutral-600">
              Rendez-vous dans <span className="font-semibold">Espace &gt; Sécurité</span>, scannez le QR code puis saisissez le code affiché. Conservez vos codes de secours en lieu sûr.
            </p>
          </div>
        </li>
        <li className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-700">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-navy">3. Connectez-vous avec votre code</p>
            <p className="text-sm text-neutral-600">À chaque connexion, un champ « Code de vérification » vous sera demandé après le mot de passe.</p>
          </div>
        </li>
      </ol>

      <div className="mt-8 flex flex-col gap-2">
        <Button asChild variant="primary" size="lg">
          <a href={webHref('/espace/securite')}>
            Activer la vérification sur fetrag.ga
            <ArrowUpRight aria-hidden="true" />
          </a>
        </Button>
        <Button asChild variant="ghost" size="md">
          <Link href={callbackUrl}>Continuer sans activer pour le moment</Link>
        </Button>
      </div>
    </AuthCard>
  )
}
