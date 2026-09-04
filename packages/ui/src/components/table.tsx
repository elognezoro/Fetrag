import * as React from 'react'

import { cn } from '../lib/cn'

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Classe du conteneur à défilement horizontal. */
  wrapperClassName?: string
  /** Supprime la bordure et l'ombre du conteneur (table imbriquée dans une carte). */
  bare?: boolean
}

/** Tableau de données. Défile horizontalement dans son conteneur sur petit écran. */
export const Table = React.forwardRef<HTMLTableElement, TableProps>(function Table(
  { className, wrapperClassName, bare = false, ...props },
  ref,
) {
  return (
    <div
      className={cn(
        'relative w-full overflow-x-auto',
        !bare && 'rounded-xl border border-neutral-200 bg-white shadow-soft',
        wrapperClassName,
      )}
    >
      <table ref={ref} className={cn('w-full caption-bottom text-sm text-ink', className)} {...props} />
    </div>
  )
})

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  function TableHeader({ className, ...props }, ref) {
    return <thead ref={ref} className={cn('bg-neutral-50 [&_tr]:border-b [&_tr]:border-neutral-200', className)} {...props} />
  },
)

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  function TableBody({ className, ...props }, ref) {
    return <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  },
)

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  function TableRow({ className, ...props }, ref) {
    return (
      <tr
        ref={ref}
        className={cn(
          'border-b border-neutral-100 transition-colors hover:bg-blue-50/40 data-[state=selected]:bg-blue-50',
          className,
        )}
        {...props}
      />
    )
  },
)

export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  function TableHead({ className, ...props }, ref) {
    return (
      <th
        ref={ref}
        scope="col"
        className={cn(
          'eyebrow h-11 whitespace-nowrap px-4 text-left align-middle text-[11px] text-neutral-600 [&:has([role=checkbox])]:pr-0',
          className,
        )}
        {...props}
      />
    )
  },
)

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  function TableCell({ className, ...props }, ref) {
    return <td ref={ref} className={cn('px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0', className)} {...props} />
  },
)

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  function TableCaption({ className, ...props }, ref) {
    return <caption ref={ref} className={cn('px-4 py-3 text-left text-sm text-neutral-500', className)} {...props} />
  },
)
