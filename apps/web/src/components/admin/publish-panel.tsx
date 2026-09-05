import Link from 'next/link'
import type { ReactNode } from 'react'
import { ExternalLink, History } from 'lucide-react'
import { formatDateTime } from '@fetrag/domain'
import { Button, Card, CardContent, CardHeader, CardTitle, StatusBadge } from '@fetrag/ui'
import { StatusActions, type StatusActionsProps } from './status-actions'

export interface PublishPanelProps {
  entity: StatusActionsProps['entity']
  id: string
  title: string
  status: string
  slug?: string | null
  publicPath?: string | null
  publishedAt?: Date | string | null
  scheduledAt?: Date | string | null
  updatedAt?: Date | string | null
  createdAt?: Date | string | null
  author?: string | null
  version?: number | null
  canWrite: boolean
  canPublish: boolean
  supportsScheduling?: boolean
  listHref: string
  /** Contenu additionnel (compteurs, liens). */
  children?: ReactNode
}

/** Panneau latéral d'un éditeur : statut, workflow, prévisualisation, métadonnées. Composant serveur. */
export function PublishPanel({
  entity,
  id,
  title,
  status,
  slug,
  publicPath,
  publishedAt,
  scheduledAt,
  updatedAt,
  createdAt,
  author,
  version,
  canWrite,
  canPublish,
  supportsScheduling,
  listHref,
  children,
}: PublishPanelProps) {
  const previewHref = publicPath ? `${publicPath}?preview=1` : undefined
  return (
    <Card pillar="defense">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle as="h2">Publication</CardTitle>
        <StatusBadge status={status} />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusActions
            entity={entity}
            id={id}
            title={title}
            status={status}
            previewHref={previewHref}
            canWrite={canWrite}
            canPublish={canPublish}
            supportsScheduling={supportsScheduling}
            afterDeleteHref={listHref}
            compact={false}
          />
          {publicPath && status === 'PUBLISHED' ? (
            <Button asChild variant="ghost" size="sm">
              <a href={publicPath} target="_blank" rel="noopener noreferrer">
                Voir en ligne
                <ExternalLink aria-hidden="true" />
              </a>
            </Button>
          ) : previewHref ? (
            <Button asChild variant="ghost" size="sm">
              <a href={previewHref} target="_blank" rel="noopener noreferrer">
                Prévisualiser
                <ExternalLink aria-hidden="true" />
              </a>
            </Button>
          ) : null}
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs text-neutral-600">
          {slug ? (
            <>
              <dt className="font-semibold text-navy">Adresse</dt>
              <dd className="truncate font-mono">{publicPath ?? slug}</dd>
            </>
          ) : null}
          {publishedAt ? (
            <>
              <dt className="font-semibold text-navy">Publié le</dt>
              <dd>{formatDateTime(publishedAt)}</dd>
            </>
          ) : null}
          {scheduledAt ? (
            <>
              <dt className="font-semibold text-navy">Planifié le</dt>
              <dd>{formatDateTime(scheduledAt)}</dd>
            </>
          ) : null}
          {updatedAt ? (
            <>
              <dt className="font-semibold text-navy">Modifié le</dt>
              <dd>{formatDateTime(updatedAt)}</dd>
            </>
          ) : null}
          {createdAt ? (
            <>
              <dt className="font-semibold text-navy">Créé le</dt>
              <dd>{formatDateTime(createdAt)}</dd>
            </>
          ) : null}
          {author ? (
            <>
              <dt className="font-semibold text-navy">Auteur</dt>
              <dd className="truncate">{author}</dd>
            </>
          ) : null}
          {version ? (
            <>
              <dt className="font-semibold text-navy">Version</dt>
              <dd className="inline-flex items-center gap-1">
                <History className="size-3.5" aria-hidden="true" />
                {version}
              </dd>
            </>
          ) : null}
        </dl>
        {children}
        <Button asChild variant="link" size="sm" className="self-start px-0">
          <Link href={listHref}>Retour à la liste</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
