import * as React from 'react'
import { type LucideIcon } from 'lucide-react'

import { cn } from '../lib/cn'

/** Classes partagées par tous les champs de saisie (input, textarea, select natif). */
export const fieldClassName = cn(
  'w-full rounded-xl border border-neutral-300 bg-white text-base text-ink shadow-none',
  'placeholder:text-neutral-400 transition-[border-color,box-shadow] duration-180',
  'focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/30',
  'aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/25',
  'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500',
  'read-only:bg-neutral-50',
)

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Marque le champ comme invalide (`aria-invalid`). */
  invalid?: boolean
  /** Icône lucide affichée à gauche (recherche, email...). */
  leadingIcon?: LucideIcon
  /** Élément affiché à droite (bouton, unité). */
  trailing?: React.ReactNode
}

/** Champ de saisie texte. Hauteur 44px, coins arrondis, focus bleu. */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = 'text', invalid, leadingIcon: LeadingIcon, trailing, ...props },
  ref,
) {
  const input = (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || props['aria-invalid'] ? true : undefined}
      className={cn(
        fieldClassName,
        'h-11 px-3.5',
        'file:mr-3 file:rounded-full file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-blue-700',
        LeadingIcon && 'pl-10',
        trailing && 'pr-12',
        className,
      )}
      {...props}
    />
  )

  if (!LeadingIcon && !trailing) return input

  return (
    <div className="relative w-full">
      {LeadingIcon ? (
        <LeadingIcon
          aria-hidden="true"
          strokeWidth={1.75}
          className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-neutral-400"
        />
      ) : null}
      {input}
      {trailing ? <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">{trailing}</div> : null}
    </div>
  )
})
