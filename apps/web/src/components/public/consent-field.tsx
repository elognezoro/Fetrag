'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { Checkbox, FormField } from '@fetrag/ui'

interface ConsentFieldProps {
  id?: string
  name?: string
  error?: string
  label?: ReactNode
  defaultChecked?: boolean
  className?: string
}

/** Case de consentement au traitement des données (obligatoire), reliée à la politique de confidentialité. */
export function ConsentField({ id = 'consent', name = 'consent', error, label, defaultChecked = false, className }: ConsentFieldProps) {
  return (
    <FormField
      label={
        label ?? (
          <span className="font-normal leading-6 text-neutral-700">
            J&apos;accepte que mes informations soient traitées par la FETRAG pour répondre à ma demande, conformément à sa{' '}
            <Link href="/confidentialite" className="font-semibold text-blue-700 underline underline-offset-2">
              politique de confidentialité
            </Link>
            .
          </span>
        )
      }
      htmlFor={id}
      error={error}
      inline
      required
      className={className}
    >
      <Checkbox id={id} name={name} value="on" defaultChecked={defaultChecked} invalid={Boolean(error)} />
    </FormField>
  )
}
