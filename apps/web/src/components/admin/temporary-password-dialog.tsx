'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Copy, KeySquare } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle, Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, toast } from '@fetrag/ui'
import { forceTemporaryPasswordAction } from '@/server/admin/users-account-actions'

export interface TemporaryPasswordDialogProps {
  userId: string
  userEmail: string
}

/** Définit un mot de passe temporaire (super administrateur) et l'affiche une seule fois. */
export function TemporaryPasswordDialog({ userId, userEmail }: TemporaryPasswordDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [password, setPassword] = useState<string | null>(null)

  function run() {
    startTransition(async () => {
      const result = await forceTemporaryPasswordAction(userId)
      if (result.status === 'error') {
        toast.error(result.message ?? 'L’opération a échoué')
        return
      }
      const secret = result.data && typeof result.data.temporaryPassword === 'string' ? result.data.temporaryPassword : null
      setPassword(secret)
      toast.success(result.message ?? 'Mot de passe temporaire défini')
      router.refresh()
    })
  }

  function copy() {
    if (!password) return
    navigator.clipboard
      ?.writeText(password)
      .then(() => toast.success('Mot de passe copié'))
      .catch(() => toast.error('Copie impossible'))
  }

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setPassword(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" leftIcon={<KeySquare aria-hidden="true" />}>
          Mot de passe temporaire
        </Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Définir un mot de passe temporaire</DialogTitle>
          <DialogDescription>
            {userEmail} · un nouveau mot de passe aléatoire remplace l’actuel et toutes les sessions sont fermées. L’utilisateur est informé par email, sans le mot de passe.
          </DialogDescription>
        </DialogHeader>
        {password ? (
          <div className="flex flex-col gap-4">
            <Alert variant="success">
              <AlertTitle>Mot de passe temporaire défini</AlertTitle>
              <AlertDescription>Copiez-le maintenant : il ne sera plus jamais affiché.</AlertDescription>
            </Alert>
            <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <code className="min-w-0 flex-1 break-all font-mono text-sm text-navy">{password}</code>
              <Button type="button" variant="secondary" size="sm" onClick={copy} leftIcon={<Copy aria-hidden="true" />}>
                Copier
              </Button>
            </div>
            <DialogFooter>
              <Button type="button" variant="primary" onClick={() => onOpenChange(false)}>
                J’ai transmis le mot de passe
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
              Annuler
            </Button>
            <Button type="button" variant="danger" onClick={run} loading={pending} loadingLabel="Génération en cours">
              Générer et remplacer
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
