'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useId, useState, useTransition } from 'react'
import { Search, UserMinus, UserPlus } from 'lucide-react'
import { Button, Checkbox, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, toast } from '@fetrag/ui'
import { addCohortMembers, removeCohortMember } from '@/server/staff/coordination-actions'
import { searchUsersAction, type UserHit } from '@/server/staff/lookup-actions'
import { ActionButton } from './action-button'

export interface MemberPickerProps {
  cohortId: string
  organizationId: string | null
  organizationName?: string | null
}

/** Ajout de membres à une cohorte : recherche parmi les utilisateurs (ou les membres de l'organisation), sélection multiple. */
export function MemberPicker({ cohortId, organizationId, organizationName }: MemberPickerProps) {
  const router = useRouter()
  const id = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [scopeOrg, setScopeOrg] = useState(Boolean(organizationId))
  const [results, setResults] = useState<UserHit[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [searching, startSearch] = useTransition()
  const [adding, startAdd] = useTransition()

  useEffect(() => {
    if (!open) return
    const handle = window.setTimeout(() => {
      startSearch(async () => {
        const result = await searchUsersAction({ q: query, organizationId: scopeOrg ? organizationId : null, excludeCohortId: cohortId })
        if (result.ok) setResults(result.items)
        else toast.error(result.message)
      })
    }, 250)
    return () => window.clearTimeout(handle)
  }, [open, query, scopeOrg, organizationId, cohortId])

  function toggle(userId: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  function submit() {
    if (!selected.size) return
    startAdd(async () => {
      const state = await addCohortMembers({ cohortId, userIds: [...selected] })
      if (state.status === 'success') {
        toast.success(state.message ?? 'Membres ajoutés')
        setSelected(new Set())
        setOpen(false)
        router.refresh()
      } else if (state.status === 'error') toast.error(state.message)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" variant="primary" size="sm" onClick={() => setOpen(true)} leftIcon={<UserPlus aria-hidden="true" />}>
        Ajouter des membres
      </Button>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Ajouter des membres à la cohorte</DialogTitle>
          <DialogDescription>Chaque membre ajouté est inscrit sur la version suivie par la cohorte et reçoit une notification.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label htmlFor={`${id}-q`} className="sr-only">
              Rechercher un utilisateur
            </label>
            <Input id={`${id}-q`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nom ou email" leadingIcon={Search} autoFocus />
            {organizationId ? (
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <Checkbox checked={scopeOrg} onCheckedChange={(checked) => setScopeOrg(checked === true)} />
                Membres de {organizationName ?? "l'organisation"} uniquement
              </label>
            ) : null}
          </div>
          <div className="max-h-72 overflow-y-auto rounded-xl border border-neutral-200" aria-busy={searching}>
            {results.length ? (
              <ul className="divide-y divide-neutral-100">
                {results.map((user) => (
                  <li key={user.id}>
                    <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-neutral-50">
                      <Checkbox checked={selected.has(user.id)} onCheckedChange={() => toggle(user.id)} />
                      <span className="min-w-0">
                        <span className="block font-semibold text-navy">{user.label}</span>
                        <span className="block truncate text-xs text-neutral-500">
                          {user.email}
                          {user.jobTitle ? ` · ${user.jobTitle}` : ''}
                          {user.employer ? ` · ${user.employer}` : ''}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-6 text-center text-sm text-neutral-500">{searching ? 'Recherche...' : 'Aucun utilisateur trouvé. Les comptes se créent sur fetrag.ga ou lors de la planification d’une demande.'}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <span className="mr-auto text-sm text-neutral-600">{selected.size} sélectionné(s)</span>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button type="button" variant="primary" onClick={submit} loading={adding} disabled={!selected.size}>
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Retrait d'un membre (inscription annulée). */
export function RemoveMemberButton({ cohortId, userId, name }: { cohortId: string; userId: string; name: string }) {
  return (
    <ActionButton
      variant="ghost"
      size="sm"
      action={() => removeCohortMember({ cohortId, userId })}
      confirm={{ title: `Retirer ${name}`, description: 'Son inscription à cette cohorte sera annulée ; sa progression est conservée.', confirmLabel: 'Retirer', destructive: true }}
      aria-label={`Retirer ${name} de la cohorte`}
    >
      <UserMinus aria-hidden="true" />
      Retirer
    </ActionButton>
  )
}
