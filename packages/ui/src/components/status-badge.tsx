import * as React from 'react'

import { cn } from '../lib/cn'
import { statusLabel } from '../i18n/fr'
import { Badge, type BadgeProps } from './badge'

type StatusTone = NonNullable<BadgeProps['variant']>

/** Regroupement sémantique des statuts (tous domaines confondus). */
const successStatuses = [
  'PUBLISHED',
  'ACTIVE',
  'COMPLETED',
  'SUCCEEDED',
  'ISSUED',
  'ACCEPTED',
  'PAID',
  'RESOLVED',
  'PRESENT',
  'GRADED',
  'ATTENDED',
  'APPROVED',
  'PROCESSED',
  'SENT',
  'READ',
  'ANSWERED',
  'OPEN',
  'VALID',
  'ENABLED',
] as const

const infoStatuses = [
  'SUBMITTED',
  'IN_PROGRESS',
  'IN_REVIEW',
  'REVIEW',
  'SCHEDULED',
  'PLANNED',
  'RUNNING',
  'REGISTERED',
  'INITIATED',
  'NEW',
  'ASSIGNED',
  'QUEUED',
  'RESCHEDULED',
  'PROCESSING',
] as const

const warningStatuses = [
  'PENDING',
  'INFO_REQUESTED',
  'WAITLISTED',
  'LATE',
  'SUSPENDED',
  'PARTIALLY_REFUNDED',
  'REQUESTED',
  'EXCUSED',
  'EXPIRING',
] as const

const dangerStatuses = [
  'FAILED',
  'REJECTED',
  'REVOKED',
  'CANCELLED',
  'EXPIRED',
  'ABSENT',
  'DEAD',
  'BOUNCED',
  'SPAM',
  'INACTIVE',
  'DISABLED',
  'INVALID',
] as const

const neutralStatuses = ['DRAFT', 'ARCHIVED', 'CLOSED', 'RETURNED', 'REFUNDED', 'UNKNOWN'] as const

const toneByStatus: Record<string, StatusTone> = {
  ...Object.fromEntries(successStatuses.map((s) => [s, 'success'])),
  ...Object.fromEntries(infoStatuses.map((s) => [s, 'blue'])),
  ...Object.fromEntries(warningStatuses.map((s) => [s, 'warning'])),
  ...Object.fromEntries(dangerStatuses.map((s) => [s, 'danger'])),
  ...Object.fromEntries(neutralStatuses.map((s) => [s, 'neutral'])),
}

/** Tonalité de badge associée à un statut (repli `neutral`). */
export function statusTone(status: string): StatusTone {
  return toneByStatus[status.toUpperCase()] ?? 'neutral'
}

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  /** Statut brut (enum Prisma / contracts), ex. `PUBLISHED`. */
  status: string
  /** Libellés spécifiques au contexte (prioritaires sur le dictionnaire). */
  labels?: Record<string, string>
  /** Force la tonalité au lieu du mappage automatique. */
  variant?: BadgeProps['variant']
}

/**
 * Badge de statut : couleur déduite automatiquement et libellé FR
 * issu de `@fetrag/contracts` (via le dictionnaire `fr.status`).
 */
export function StatusBadge({ status, labels, variant, className, ...props }: StatusBadgeProps) {
  const key = status.toUpperCase()
  return (
    <Badge variant={variant ?? statusTone(key)} dot className={cn('uppercase tracking-wide', className)} {...props}>
      {statusLabel(key, labels)}
    </Badge>
  )
}
