'use client'

import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'
import { GraduationCap, Star, UserMinus, UserPlus } from 'lucide-react'
import { Avatar, AvatarFallback, Badge, Button, Checkbox, FormField, NativeSelect, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, initials, toast } from '@fetrag/ui'
import { setCourseTrainers } from '@/server/staff/admin-course-actions'
import { ActionButton } from './action-button'

export interface CourseTrainerRow {
  userId: string
  label: string
  email: string
  isLead: boolean
}

export interface CourseTrainersPanelProps {
  courseId: string
  trainers: CourseTrainerRow[]
  candidates: Array<{ id: string; label: string; email: string }>
  canManage: boolean
}

/**
 * Formateurs d'un cours (CourseTrainer) : ajout depuis les comptes formateurs, retrait, désignation du référent.
 * Chaque mutation envoie la liste complète à `setCourseTrainers` (réservé à la publication de cours).
 */
export function CourseTrainersPanel({ courseId, trainers, candidates, canManage }: CourseTrainersPanelProps) {
  const router = useRouter()
  const id = useId()
  const [selected, setSelected] = useState('')
  const [asLead, setAsLead] = useState(trainers.length === 0)
  const [pending, startTransition] = useTransition()
  const available = candidates.filter((c) => !trainers.some((t) => t.userId === c.id))

  function submit(next: Array<{ userId: string; isLead: boolean }>) {
    startTransition(async () => {
      const state = await setCourseTrainers({ courseId, trainers: next })
      if (state.status === 'success') {
        if (state.message) toast.success(state.message)
        setSelected('')
        router.refresh()
      } else if (state.status === 'error') toast.error(state.message)
    })
  }

  function add() {
    if (!selected) return
    const next = trainers.map((t) => ({ userId: t.userId, isLead: asLead ? false : t.isLead }))
    next.push({ userId: selected, isLead: asLead })
    submit(next)
  }

  return (
    <div className="flex flex-col gap-6">
      {trainers.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Formateur</TableHead>
              <TableHead>Rôle</TableHead>
              {canManage ? (
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainers.map((t) => (
              <TableRow key={t.userId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarFallback>{initials(t.label)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-navy">{t.label}</p>
                      <p className="truncate text-xs text-neutral-500">{t.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {t.isLead ? (
                    <Badge variant="gold" size="sm">
                      <Star className="size-3" aria-hidden="true" />
                      Référent
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">Formateur</Badge>
                  )}
                </TableCell>
                {canManage ? (
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      {!t.isLead ? (
                        <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={() => submit(trainers.map((x) => ({ userId: x.userId, isLead: x.userId === t.userId })))}>
                          <Star aria-hidden="true" />
                          Désigner référent
                        </Button>
                      ) : null}
                      <ActionButton
                        variant="ghost"
                        size="sm"
                        action={() => setCourseTrainers({ courseId, trainers: trainers.filter((x) => x.userId !== t.userId).map((x) => ({ userId: x.userId, isLead: x.isLead })) })}
                        confirm={{ title: `Retirer ${t.label}`, description: 'Le formateur perd l’accès aux cohortes de ce cours qui ne lui sont pas attribuées nominativement.', confirmLabel: 'Retirer', destructive: true }}
                        aria-label={`Retirer le formateur ${t.label}`}
                      >
                        <UserMinus aria-hidden="true" />
                        Retirer
                      </ActionButton>
                    </div>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-sm text-neutral-600">
          <GraduationCap className="mx-auto mb-2 size-8 text-green-700" aria-hidden="true" />
          Aucun formateur rattaché : les formateurs du cours enseignent toutes ses cohortes, corrigent et alimentent la banque de questions.
        </div>
      )}

      {canManage ? (
        <form
          className="flex flex-col gap-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4"
          onSubmit={(event) => {
            event.preventDefault()
            add()
          }}
        >
          <h3 className="flex items-center gap-2 font-display text-base font-semibold text-navy">
            <UserPlus className="size-5 text-blue-600" aria-hidden="true" />
            Ajouter un formateur
          </h3>
          {available.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
              <FormField label="Compte formateur" htmlFor={`${id}-trainer`} required hint="Comptes disposant du rôle Formateur ou Coordinateur.">
                <NativeSelect value={selected} onChange={(event) => setSelected(event.target.value)} options={[{ value: '', label: 'Choisir...' }, ...available.map((c) => ({ value: c.id, label: `${c.label} (${c.email})` }))]} required />
              </FormField>
              <FormField inline label="Référent du cours" htmlFor={`${id}-lead`}>
                <Checkbox checked={asLead} onCheckedChange={(checked) => setAsLead(checked === true)} />
              </FormField>
              <Button type="submit" variant="primary" size="md" loading={pending} disabled={!selected}>
                <UserPlus aria-hidden="true" />
                Ajouter
              </Button>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Tous les comptes formateurs sont déjà rattachés. Attribuez le rôle Formateur à un autre compte depuis Utilisateurs et rôles.</p>
          )}
        </form>
      ) : null}
    </div>
  )
}
