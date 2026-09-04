import * as React from 'react'

import { cn } from '../lib/cn'
import { fieldClassName } from './input'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
  /** Redimensionnement vertical autorisé (par défaut). */
  resizable?: boolean
}

/** Zone de texte multi-lignes cohérente avec `Input`. */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, resizable = true, rows = 4, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || props['aria-invalid'] ? true : undefined}
      className={cn(
        fieldClassName,
        'min-h-[6.5rem] px-3.5 py-3 leading-relaxed',
        resizable ? 'resize-y' : 'resize-none',
        className,
      )}
      {...props}
    />
  )
})
