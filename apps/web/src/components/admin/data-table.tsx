import type { ReactNode } from 'react'
import { Inbox, type LucideIcon } from 'lucide-react'
import { EmptyState, Pagination, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, cn } from '@fetrag/ui'

export interface DataColumn<T> {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
  headerClassName?: string
  align?: 'left' | 'right' | 'center'
  /** Masque la colonne sous ce point de rupture (`sm`, `md`, `lg`). */
  hideBelow?: 'sm' | 'md' | 'lg'
}

export interface DataTableProps<T> {
  columns: Array<DataColumn<T>>
  rows: T[]
  rowKey: (row: T) => string
  caption?: string
  empty?: { icon?: LucideIcon; title: ReactNode; description?: ReactNode; action?: ReactNode }
  /** Pagination optionnelle (rendue sous le tableau). */
  pagination?: { page: number; totalPages: number; hrefFor: (page: number) => string; total?: number; pageSize?: number }
  /** Ligne mise en évidence (ex. non lue). */
  rowClassName?: (row: T) => string | undefined
  dense?: boolean
  className?: string
}

const hideClasses = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell' }
const alignClasses = { left: 'text-left', right: 'text-right', center: 'text-center' }

/**
 * Tableau générique du back-office (composant serveur) : colonnes déclaratives, état vide FETRAG,
 * pagination et compteur. Défilement horizontal intégré par `Table` ; colonnes secondaires masquées sur mobile.
 */
export function DataTable<T>({ columns, rows, rowKey, caption, empty, pagination, rowClassName, dense = false, className }: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className={cn('rounded-2xl border border-dashed border-neutral-300 bg-white/70', className)}>
        <EmptyState icon={empty?.icon ?? Inbox} title={empty?.title ?? 'Aucun élément'} description={empty?.description} action={empty?.action} />
      </div>
    )
  }
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-soft">
        <Table bare>
          {caption ? <TableCaption className="sr-only">{caption}</TableCaption> : null}
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={cn(column.hideBelow ? hideClasses[column.hideBelow] : undefined, alignClasses[column.align ?? 'left'], column.headerClassName)}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={rowKey(row)} className={rowClassName?.(row)}>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(dense ? 'py-2' : undefined, column.hideBelow ? hideClasses[column.hideBelow] : undefined, alignClasses[column.align ?? 'left'], column.className)}
                  >
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {pagination ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {pagination.total !== undefined ? (
            <p className="text-xs text-neutral-500">
              {pagination.total} résultat{pagination.total > 1 ? 's' : ''}
              {pagination.pageSize && pagination.total > pagination.pageSize ? ` · ${pagination.pageSize} par page` : ''}
            </p>
          ) : (
            <span />
          )}
          <Pagination page={pagination.page} totalPages={pagination.totalPages} hrefFor={pagination.hrefFor} />
        </div>
      ) : null}
    </div>
  )
}
