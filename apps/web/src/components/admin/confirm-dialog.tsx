'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, toast } from '@fetrag/ui'
import type { ActionState } from '@/server/account/types'

export interface ConfirmDialogProps {
  /** Élément déclencheur (bouton). */
  trigger: ReactNode
  title: ReactNode
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  /** Action serveur exécutée à la confirmation ; le résultat est affiché en toast. */
  onConfirm: () => Promise<ActionState>
  /** Redirection après succès (sinon rafraîchissement de la route). */
  redirectTo?: string
  onSuccess?: (state: ActionState) => void
}

/** Dialogue de confirmation accessible (Radix) relié à une Server Action. */
export function ConfirmDialog({ trigger, title, description, confirmLabel = 'Confirmer', cancelLabel = 'Annuler', destructive = false, onConfirm, redirectTo, onSuccess }: ConfirmDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function confirm() {
    startTransition(async () => {
      const result = await onConfirm()
      if (result.status === 'error') {
        toast.error(result.message ?? 'L’opération a échoué')
        return
      }
      toast.success(result.message ?? 'Opération effectuée')
      setOpen(false)
      onSuccess?.(result)
      if (redirectTo) router.push(redirectTo)
      else router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {destructive ? <AlertTriangle className="size-5 text-gold-700" aria-hidden="true" /> : null}
            {title}
          </DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={destructive ? 'danger' : 'primary'} onClick={confirm} loading={pending} loadingLabel="Traitement en cours">
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
