'use client'

import { useFormStatus } from 'react-dom'
import { Button, type ButtonProps } from '@fetrag/ui'

interface SubmitButtonProps extends Omit<ButtonProps, 'type' | 'loading'> {
  /** Texte annoncé pendant l'envoi. */
  pendingLabel?: string
}

/** Bouton de soumission relié à l'état du formulaire parent (`useFormStatus`). */
export function SubmitButton({ children, pendingLabel = 'Enregistrement en cours', ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" loading={pending} loadingLabel={pendingLabel} {...props}>
      {children}
    </Button>
  )
}
