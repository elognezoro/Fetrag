import * as React from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '../lib/cn'
import { fieldClassName } from './input'

export interface NativeSelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
  /** Options rendues automatiquement ; sinon passer des `<option>` en enfants. */
  options?: NativeSelectOption[]
  /** Première option désactivée servant de texte indicatif. */
  placeholder?: string
}

/**
 * Sélecteur natif (formulaires serveur, mobile). Fonctionne sans JavaScript,
 * contrairement au `Select` Radix.
 */
export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect(
  { className, invalid, options, placeholder, children, defaultValue, value, ...props },
  ref,
) {
  const hasPlaceholder = placeholder !== undefined
  const isUncontrolled = value === undefined
  return (
    <div className={cn('relative w-full', className)}>
      <select
        ref={ref}
        aria-invalid={invalid || props['aria-invalid'] ? true : undefined}
        className={cn(fieldClassName, 'h-11 appearance-none pl-3.5 pr-10')}
        value={value}
        defaultValue={isUncontrolled && hasPlaceholder && defaultValue === undefined ? '' : defaultValue}
        {...props}
      >
        {hasPlaceholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options
          ? options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))
          : children}
      </select>
      <ChevronDown
        aria-hidden="true"
        strokeWidth={1.75}
        className="pointer-events-none absolute right-3.5 top-1/2 size-[18px] -translate-y-1/2 text-neutral-500"
      />
    </div>
  )
})
