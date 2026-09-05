'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useId, useState } from 'react'
import { Copy, KeyRound, ShieldOff } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle, Badge, Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, FormField, Input, NativeSelect, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, toast } from '@fetrag/ui'
import { FormStatus } from '@/components/account/form-status'
import { SubmitButton } from '@/components/account/submit-button'
import { idleState, type ActionState } from '@/server/account/types'
import { createApiKeyAction, revokeApiKeyAction, type ApiKeyField } from '@/server/admin/settings-actions'
import { ConfirmDialog } from './confirm-dialog'

export interface ApiKeyView {
  id: string
  label: string
  prefix: string
  scope: 'read' | 'write'
  createdAt: string
  createdBy: string | null
  revokedAt: string | null
}

function formatDate(value: string): string {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Libreville' }).format(d)
}

function CreateKeyDialog() {
  const id = useId()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [state, action] = useActionState<ActionState<ApiKeyField>, FormData>(createApiKeyAction, idleState)
  const secret = state.status === 'success' && state.data && typeof state.data.secret === 'string' ? state.data.secret : null

  useEffect(() => {
    if (state.status === 'success') router.refresh()
  }, [state, router])

  function copy() {
    if (!secret) return
    navigator.clipboard
      ?.writeText(secret)
      .then(() => toast.success('Clé copiée'))
      .catch(() => toast.error('Copie impossible'))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="primary" size="sm" leftIcon={<KeyRound aria-hidden="true" />}>
          Générer une clé
        </Button>
      </DialogTrigger>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Nouvelle clé API</DialogTitle>
          <DialogDescription>La clé est affichée une seule fois ; seule son empreinte SHA-256 est conservée. Transmettez-la par un canal sûr.</DialogDescription>
        </DialogHeader>
        {secret ? (
          <div className="flex flex-col gap-4">
            <Alert variant="success">
              <AlertTitle>Clé générée</AlertTitle>
              <AlertDescription>Copiez-la maintenant : elle ne sera plus jamais affichée.</AlertDescription>
            </Alert>
            <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <code className="min-w-0 flex-1 break-all font-mono text-xs text-navy">{secret}</code>
              <Button type="button" variant="secondary" size="sm" onClick={copy} leftIcon={<Copy aria-hidden="true" />}>
                Copier
              </Button>
            </div>
            <div className="flex justify-end">
              <Button type="button" variant="primary" onClick={() => setOpen(false)}>
                J’ai copié la clé
              </Button>
            </div>
          </div>
        ) : (
          <form action={action} className="flex flex-col gap-4" noValidate>
            <FormStatus state={state} withToast={false} />
            <FormField label="Libellé" htmlFor={`${id}-label`} required error={state.fieldErrors?.label} hint="Ex. « Intégration paie SYNATEP », « Tableau de bord externe ».">
              <Input id={`${id}-label`} name="label" maxLength={80} required />
            </FormField>
            <FormField label="Portée" htmlFor={`${id}-scope`} error={state.fieldErrors?.scope}>
              <NativeSelect id={`${id}-scope`} name="scope" defaultValue="read" options={[{ value: 'read', label: 'Lecture seule' }, { value: 'write', label: 'Lecture et écriture' }]} />
            </FormField>
            <div className="flex justify-end">
              <SubmitButton variant="primary" pendingLabel="Génération">
                Générer
              </SubmitButton>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

/** Gestion des clés API (SystemSetting `api.keys`) : génération, liste, révocation. */
export function ApiKeysPanel({ keys }: { keys: ApiKeyView[] }) {
  const active = keys.filter((k) => !k.revokedAt)
  const revoked = keys.filter((k) => k.revokedAt)
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-600">
          {active.length} clé{active.length > 1 ? 's' : ''} active{active.length > 1 ? 's' : ''} · {revoked.length} révoquée{revoked.length > 1 ? 's' : ''}
        </p>
        <CreateKeyDialog />
      </div>
      {keys.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-600">Aucune clé API. Les intégrations externes s’authentifient par l’en-tête X-API-Key.</p>
      ) : (
        <Table bare>
          <TableHeader>
            <TableRow>
              <TableHead>Libellé</TableHead>
              <TableHead>Préfixe</TableHead>
              <TableHead>Portée</TableHead>
              <TableHead>Créée</TableHead>
              <TableHead>État</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map((key) => (
              <TableRow key={key.id} className={key.revokedAt ? 'opacity-60' : undefined}>
                <TableCell className="font-semibold text-navy">{key.label}</TableCell>
                <TableCell className="font-mono text-xs">{key.prefix}…</TableCell>
                <TableCell>
                  <Badge variant={key.scope === 'write' ? 'gold' : 'blue'} size="sm">
                    {key.scope === 'write' ? 'Lecture / écriture' : 'Lecture'}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-neutral-600">
                  {formatDate(key.createdAt)}
                  {key.createdBy ? <span className="block">{key.createdBy}</span> : null}
                </TableCell>
                <TableCell>
                  {key.revokedAt ? (
                    <Badge variant="danger" size="sm">
                      Révoquée le {formatDate(key.revokedAt)}
                    </Badge>
                  ) : (
                    <Badge variant="success" size="sm">
                      Active
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {!key.revokedAt ? (
                    <ConfirmDialog
                      trigger={
                        <Button type="button" variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" leftIcon={<ShieldOff aria-hidden="true" />}>
                          Révoquer
                        </Button>
                      }
                      title={`Révoquer « ${key.label} » ?`}
                      description="Les intégrations utilisant cette clé seront immédiatement refusées."
                      confirmLabel="Révoquer"
                      destructive
                      onConfirm={() => revokeApiKeyAction(key.id)}
                    />
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
