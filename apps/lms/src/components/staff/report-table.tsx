import type { ReactNode } from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { Button, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, cn } from '@fetrag/ui'

export interface ReportColumn {
  key: string
  label: ReactNode
  align?: 'left' | 'right' | 'center'
  className?: string
}

export interface ReportTableProps {
  columns: ReportColumn[]
  rows: Array<Record<string, ReactNode>>
  caption?: string
  emptyLabel?: string
  /** Ligne de totaux affichée en pied. */
  footer?: Record<string, ReactNode>
  rowKey?: (row: Record<string, ReactNode>, index: number) => string
  className?: string
}

/** Tableau de rapport : colonnes alignées, en-têtes en capitales espacées, ligne de totaux facultative. */
export function ReportTable({ columns, rows, caption, emptyLabel = 'Aucune donnée pour cette période.', footer, rowKey, className }: ReportTableProps) {
  const alignClass = (align?: 'left' | 'right' | 'center') => (align === 'right' ? 'text-right tabular-nums' : align === 'center' ? 'text-center' : '')
  return (
    <Table wrapperClassName={className}>
      {caption ? <TableCaption>{caption}</TableCaption> : null}
      <TableHeader>
        <TableRow>
          {columns.map((c) => (
            <TableHead key={c.key} className={cn(alignClass(c.align), c.className)}>
              {c.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="py-8 text-center text-sm text-neutral-500">
              {emptyLabel}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row, index) => (
            <TableRow key={rowKey ? rowKey(row, index) : index}>
              {columns.map((c) => (
                <TableCell key={c.key} className={cn(alignClass(c.align), c.className)}>
                  {row[c.key] ?? '-'}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
        {footer ? (
          <TableRow className="bg-neutral-50 font-semibold text-navy">
            {columns.map((c) => (
              <TableCell key={c.key} className={cn(alignClass(c.align), c.className)}>
                {footer[c.key] ?? ''}
              </TableCell>
            ))}
          </TableRow>
        ) : null}
      </TableBody>
    </Table>
  )
}

/** Boutons d'export CSV / PDF (routes de téléchargement). */
export function ExportLinks({ csvHref, pdfHref, size = 'sm' }: { csvHref?: string; pdfHref?: string; size?: 'sm' | 'md' }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {csvHref ? (
        <Button asChild variant="outline" size={size}>
          <a href={csvHref}>
            <FileSpreadsheet aria-hidden="true" />
            CSV
          </a>
        </Button>
      ) : null}
      {pdfHref ? (
        <Button asChild variant="outline" size={size}>
          <a href={pdfHref}>
            <FileText aria-hidden="true" />
            PDF
          </a>
        </Button>
      ) : null}
      {!csvHref && !pdfHref ? (
        <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
          <Download className="size-3.5" aria-hidden="true" />
          Aucun export
        </span>
      ) : null}
    </div>
  )
}

/** Petite barre horizontale de proportion pour les rapports (progression, taux). */
export function MiniBar({ value, tone = 'green', label }: { value: number; tone?: 'blue' | 'green' | 'gold'; label?: string }) {
  const bounded = Math.max(0, Math.min(100, Math.round(value)))
  const color = tone === 'blue' ? 'bg-blue-500' : tone === 'gold' ? 'bg-gold-500' : 'bg-green-500'
  return (
    <span className="inline-flex min-w-[7rem] items-center gap-2" role="img" aria-label={label ? `${label} : ${bounded} %` : `${bounded} %`}>
      <span className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200">
        <span className={cn('block h-full rounded-full', color)} style={{ width: `${bounded}%` }} />
      </span>
      <span className="text-xs font-semibold tabular-nums text-navy">{bounded} %</span>
    </span>
  )
}
