'use client'

import { useId, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Loader2 } from 'lucide-react'
import { NativeSelect, toast } from '@fetrag/ui'
import { selectOrganization } from '@/server/staff/org-actions'

export interface OrgSwitcherOption {
  id: string
  name: string
  acronym: string | null
}

/** Sélecteur d'organisation active (affiché uniquement si le responsable en pilote plusieurs). */
export function OrgSwitcher({ organizations, currentId }: { organizations: OrgSwitcherOption[]; currentId: string | null }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const id = useId()
  if (organizations.length <= 1) return null
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="sr-only">
        Organisation active
      </label>
      <Building2 className="size-5 text-blue-600" strokeWidth={1.75} aria-hidden="true" />
      <NativeSelect
        id={id}
        className="w-64"
        value={currentId ?? ''}
        disabled={pending}
        onChange={(event) => {
          const organizationId = event.target.value
          startTransition(async () => {
            const state = await selectOrganization({ organizationId })
            if (state.status === 'error') toast.error(state.message)
            else router.refresh()
          })
        }}
        options={organizations.map((o) => ({ value: o.id, label: o.acronym ? `${o.acronym} - ${o.name}` : o.name }))}
      />
      {pending ? <Loader2 className="size-4 animate-spin text-neutral-500" aria-hidden="true" /> : null}
    </div>
  )
}
