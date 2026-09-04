import * as React from 'react'
import { AlertCircle } from 'lucide-react'

import { cn } from '../lib/cn'
import { Label } from './label'

export interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Message d'erreur (chaîne ou liste). Rien n'est rendu si vide. */
  children?: React.ReactNode
}

/** Message d'erreur d'un champ, annoncé par les lecteurs d'écran. */
export function FormMessage({ className, children, ...props }: FormMessageProps) {
  if (children === null || children === undefined || children === false || children === '') return null
  return (
    <p
      role="alert"
      className={cn('flex items-start gap-1.5 text-sm font-medium text-danger', className)}
      {...props}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}

/** Texte d'aide sous un champ. */
export function FormDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-neutral-500', className)} {...props} />
}

export interface FormFieldProps {
  label: React.ReactNode
  /** Identifiant du contrôle : sert aussi de base aux ids d'aide et d'erreur. */
  htmlFor: string
  error?: string | string[] | null
  hint?: React.ReactNode
  required?: boolean
  /** Disposition « contrôle puis libellé » pour cases à cocher et interrupteurs. */
  inline?: boolean
  className?: string
  children: React.ReactNode
}

type DescribableProps = {
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling'
  'aria-required'?: boolean | 'true' | 'false'
}

/**
 * Enveloppe un contrôle avec son libellé, son aide et son erreur.
 * Si l'enfant est un élément unique, `id`, `aria-describedby`, `aria-invalid`
 * et `aria-required` lui sont injectés automatiquement.
 */
export function FormField({ label, htmlFor, error, hint, required, inline = false, className, children }: FormFieldProps) {
  const hintId = `${htmlFor}-hint`
  const errorId = `${htmlFor}-error`
  const errorMessage = Array.isArray(error) ? error.filter(Boolean).join(' ') : error
  const hasError = Boolean(errorMessage)

  const describedBy = [hint ? hintId : null, hasError ? errorId : null].filter(Boolean).join(' ') || undefined

  let control: React.ReactNode = children
  if (React.isValidElement<DescribableProps>(children) && React.Children.count(children) === 1) {
    const existing = children.props['aria-describedby']
    control = React.cloneElement(children, {
      id: children.props.id ?? htmlFor,
      'aria-describedby': [existing, describedBy].filter(Boolean).join(' ') || undefined,
      'aria-invalid': hasError ? true : children.props['aria-invalid'],
      'aria-required': required ? true : children.props['aria-required'],
    })
  }

  if (inline) {
    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        <div className="flex items-start gap-3">
          <div className="flex h-6 items-center">{control}</div>
          <Label htmlFor={htmlFor} required={required} className="leading-6">
            {label}
          </Label>
        </div>
        {hint ? (
          <FormDescription id={hintId} className="pl-8">
            {hint}
          </FormDescription>
        ) : null}
        <FormMessage id={errorId} className="pl-8">
          {errorMessage}
        </FormMessage>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {control}
      {hint ? <FormDescription id={hintId}>{hint}</FormDescription> : null}
      <FormMessage id={errorId}>{errorMessage}</FormMessage>
    </div>
  )
}
