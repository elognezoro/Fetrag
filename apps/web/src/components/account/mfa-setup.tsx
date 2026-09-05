'use client'

import { useActionState, useState, useTransition } from 'react'
import { Copy, KeyRound, ShieldCheck, ShieldOff } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle, Button, FormField, Input, toast } from '@fetrag/ui'
import { idleState, type ActionState } from '@/server/account/types'
import { confirmMfaAction, disableMfaAction, startMfaSetupAction, type MfaField } from '@/server/account/security'
import { FormStatus } from './form-status'
import { SubmitButton } from './submit-button'

interface MfaSetupProps {
  enabled: boolean
  backupCodesLeft: number
}

/** Codes de secours affichés une seule fois après activation, avec copie dans le presse-papiers. */
function BackupCodes({ codes }: { codes: string[] }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(codes.join('\n'))
      toast.success('Codes copiés dans le presse-papiers')
    } catch {
      toast.error('Copie impossible : notez les codes manuellement')
    }
  }
  return (
    <Alert variant="warning" icon={KeyRound}>
      <AlertTitle>Codes de secours - affichés une seule fois</AlertTitle>
      <AlertDescription>
        <p>Conservez ces codes en lieu sûr : chacun permet de vous connecter une fois si vous perdez l’accès à votre application d’authentification.</p>
        <ul className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm sm:grid-cols-4">
          {codes.map((code) => (
            <li key={code} className="rounded-lg border border-gold-200 bg-white px-2 py-1.5 text-center text-navy">
              {code}
            </li>
          ))}
        </ul>
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={copy} leftIcon={<Copy aria-hidden="true" />}>
          Copier les codes
        </Button>
      </AlertDescription>
    </Alert>
  )
}

/** Activation / désactivation de la vérification en deux étapes (TOTP). */
export function MfaSetup({ enabled, backupCodesLeft }: MfaSetupProps) {
  const [setup, setSetup] = useState<{ secret: string; qrDataUrl: string } | null>(null)
  const [starting, startTransition] = useTransition()
  const [confirmState, confirmAction] = useActionState<ActionState<MfaField>, FormData>(confirmMfaAction, idleState)
  const [disableState, disableAction] = useActionState<ActionState<MfaField>, FormData>(disableMfaAction, idleState)

  const backupCodes = confirmState.status === 'success' && Array.isArray(confirmState.data?.backupCodes) ? (confirmState.data?.backupCodes as string[]) : null

  function begin() {
    startTransition(async () => {
      const result = await startMfaSetupAction()
      if (result.status === 'success' && result.data) {
        setSetup({ secret: String(result.data.secret), qrDataUrl: String(result.data.qrDataUrl) })
      } else {
        toast.error(result.message ?? 'Impossible de démarrer l’activation')
      }
    })
  }

  if (backupCodes) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="success" icon={ShieldCheck}>
          <AlertTitle>Vérification en deux étapes activée</AlertTitle>
          <AlertDescription>Un code de votre application d’authentification vous sera demandé à chaque connexion.</AlertDescription>
        </Alert>
        <BackupCodes codes={backupCodes} />
      </div>
    )
  }

  if (enabled) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="success" icon={ShieldCheck}>
          <AlertTitle>Vérification en deux étapes active</AlertTitle>
          <AlertDescription>
            Il vous reste {backupCodesLeft} code{backupCodesLeft > 1 ? 's' : ''} de secours. Pour en générer de nouveaux, désactivez puis réactivez la vérification.
          </AlertDescription>
        </Alert>
        <form action={disableAction} className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4" noValidate>
          <FormStatus state={disableState} />
          <FormField label="Code de vérification ou code de secours" htmlFor="disable-code" required error={disableState.fieldErrors?.code} hint="Nécessaire pour confirmer la désactivation.">
            <Input id="disable-code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={12} required />
          </FormField>
          <div className="flex justify-end">
            <SubmitButton variant="danger" size="sm" pendingLabel="Désactivation en cours" leftIcon={<ShieldOff aria-hidden="true" />}>
              Désactiver la vérification
            </SubmitButton>
          </div>
        </form>
      </div>
    )
  }

  if (!setup) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed text-neutral-600">
          La vérification en deux étapes ajoute un code temporaire généré par une application d’authentification (Google Authenticator, Microsoft Authenticator, Aegis, FreeOTP) à votre mot de passe. Elle est obligatoire pour les rôles administratifs.
        </p>
        <div>
          <Button type="button" variant="primary" onClick={begin} loading={starting} loadingLabel="Préparation" leftIcon={<ShieldCheck aria-hidden="true" />}>
            Activer la vérification en deux étapes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form action={confirmAction} className="flex flex-col gap-5" noValidate>
      <FormStatus state={confirmState} />
      <input type="hidden" name="secret" value={setup.secret} />
      <ol className="grid gap-5 md:grid-cols-[auto_1fr] md:items-start">
        <li className="flex flex-col items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="eyebrow text-[10px] text-blue-700">Étape 1</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={setup.qrDataUrl} alt="QR code à scanner avec votre application d’authentification" width={220} height={220} className="rounded-xl" />
          <p className="max-w-[14rem] text-center text-xs text-neutral-500">Scannez ce code ou saisissez la clé manuellement :</p>
          <code className="select-all break-all rounded-lg bg-neutral-100 px-2 py-1 text-center text-xs text-navy">{setup.secret}</code>
        </li>
        <li className="flex flex-col gap-4">
          <p className="eyebrow text-[10px] text-blue-700">Étape 2</p>
          <FormField label="Code à 6 chiffres affiché par l’application" htmlFor="confirm-code" required error={confirmState.fieldErrors?.code}>
            <Input id="confirm-code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]*" maxLength={8} required className="font-mono text-lg tracking-[0.3em]" />
          </FormField>
          <div className="flex flex-wrap gap-2">
            <SubmitButton variant="primary" pendingLabel="Vérification en cours">
              Confirmer et activer
            </SubmitButton>
            <Button type="button" variant="ghost" onClick={() => setSetup(null)}>
              Annuler
            </Button>
          </div>
        </li>
      </ol>
    </form>
  )
}
