'use client'

import { useRouter } from 'next/navigation'
import { useId, useState, useTransition, type ReactNode } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Textarea,
  toast,
  type ButtonProps,
} from '@fetrag/ui'
import type { ActionState } from '@/server/staff/action-state'

export interface ActionButtonProps extends Omit<ButtonProps, 'onClick' | 'type' | 'loading'> {
  /** Action serveur exécutée au clic (ou après confirmation). Reçoit le motif saisi le cas échéant. */
  action: (reason?: string) => Promise<ActionState>
  /** Demande une confirmation avant d'exécuter l'action. */
  confirm?: {
    title: string
    description?: ReactNode
    confirmLabel?: string
    /** Champ « motif » obligatoire (révocation, refus, annulation). */
    reasonLabel?: string
    reasonPlaceholder?: string
    destructive?: boolean
  }
  onDone?: (state: ActionState) => void
  children: ReactNode
}

/**
 * Bouton déclenchant une Server Action « directe » (sans formulaire) avec confirmation
 * facultative dans une boîte de dialogue, toast de résultat et rafraîchissement des données.
 */
export function ActionButton({ action, confirm, onDone, children, variant = 'outline', size = 'sm', disabled, ...props }: ActionButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [pending, startTransition] = useTransition()
  const reasonId = useId()

  function run(value?: string) {
    startTransition(async () => {
      const state = await action(value)
      if (state.status === 'success') {
        if (state.message) toast.success(state.message)
        setOpen(false)
        setReason('')
        if (state.redirectTo) router.push(state.redirectTo)
        else router.refresh()
      } else if (state.status === 'error') {
        toast.error(state.message)
        setError(state.message)
      }
      onDone?.(state)
    })
  }

  function handleClick() {
    if (confirm) {
      setError(undefined)
      setOpen(true)
      return
    }
    run()
  }

  function handleConfirm() {
    if (confirm?.reasonLabel && reason.trim().length < 3) {
      setError('Indiquez un motif (3 caractères au moins).')
      return
    }
    run(confirm?.reasonLabel ? reason.trim() : undefined)
  }

  return (
    <>
      <Button type="button" variant={variant} size={size} loading={pending && !confirm} disabled={disabled || pending} onClick={handleClick} {...props}>
        {children}
      </Button>
      {confirm ? (
        <Dialog open={open} onOpenChange={(next) => (!pending ? setOpen(next) : undefined)}>
          <DialogContent size="sm">
            <DialogHeader>
              <DialogTitle>{confirm.title}</DialogTitle>
              {confirm.description ? <DialogDescription>{confirm.description}</DialogDescription> : null}
            </DialogHeader>
            {confirm.reasonLabel ? (
              <FormField label={confirm.reasonLabel} htmlFor={reasonId} required error={error}>
                <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder={confirm.reasonPlaceholder} rows={3} maxLength={1000} />
              </FormField>
            ) : error ? (
              <p role="alert" className="text-sm font-medium text-danger">
                {error}
              </p>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
                Annuler
              </Button>
              <Button type="button" variant={confirm.destructive ? 'danger' : 'primary'} loading={pending} onClick={handleConfirm}>
                {confirm.confirmLabel ?? 'Confirmer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  )
}
