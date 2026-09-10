'use client'

import { useRouter } from 'next/navigation'
import { useId, useMemo, useState, useTransition } from 'react'
import { CheckCheck, Save, UserCheck, UserMinus, UserX } from 'lucide-react'
import { attendanceStatuses, attendanceStatusLabels, sessionModeLabels } from '@fetrag/contracts'
import { Avatar, AvatarFallback, Badge, Button, Input, NativeSelect, cn, initials, toast } from '@fetrag/ui'
import { recordAttendance } from '@/server/staff/trainer-actions'
import type { AttendanceSheet as SheetData } from '@/server/staff/trainer-queries'
import { fmtDateTime, fmtTime, personName } from './format'

type Status = (typeof attendanceStatuses)[number]

const statusStyles: Record<Status, string> = {
  PRESENT: 'data-[active=true]:bg-green-500 data-[active=true]:text-navy data-[active=true]:border-green-500',
  LATE: 'data-[active=true]:bg-gold-500 data-[active=true]:text-navy data-[active=true]:border-gold-500',
  ABSENT: 'data-[active=true]:bg-danger data-[active=true]:text-white data-[active=true]:border-danger',
  EXCUSED: 'data-[active=true]:bg-blue-500 data-[active=true]:text-white data-[active=true]:border-blue-500',
}

export interface AttendanceSheetProps {
  sheet: SheetData
  sessions: Array<{ id: string; title: string; startsAt: Date | string }>
  /** Base de l'URL pour changer de session (`?session=`). */
  baseHref: string
}

/**
 * Feuille d'émargement : sélection de la session, saisie du statut de chaque participant
 * (boutons segmentés), actions de masse et enregistrement en une fois.
 */
export function AttendanceSheet({ sheet, sessions, baseHref }: AttendanceSheetProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const id = useId()
  const [entries, setEntries] = useState<Record<string, { status: Status | null; note: string }>>(() =>
    Object.fromEntries(sheet.rows.map((r) => [r.user.id, { status: r.status, note: r.note ?? '' }])),
  )

  const counts = useMemo(() => {
    const c = { PRESENT: 0, LATE: 0, ABSENT: 0, EXCUSED: 0, pending: 0 }
    for (const value of Object.values(entries)) {
      if (value.status) c[value.status]++
      else c.pending++
    }
    return c
  }, [entries])

  function setAll(status: Status) {
    setEntries((prev) => Object.fromEntries(Object.entries(prev).map(([userId, v]) => [userId, { ...v, status }])))
  }

  function setOne(userId: string, patch: Partial<{ status: Status | null; note: string }>) {
    setEntries((prev) => ({ ...prev, [userId]: { status: prev[userId]?.status ?? null, note: prev[userId]?.note ?? '', ...patch } }))
  }

  function save() {
    const list = Object.entries(entries)
      .filter(([, v]) => v.status !== null)
      .map(([userId, v]) => ({ userId, status: v.status as Status, note: v.note.trim() || undefined }))
    if (!list.length) {
      toast.error('Renseignez au moins un statut avant d’enregistrer.')
      return
    }
    startTransition(async () => {
      const state = await recordAttendance({ sessionId: sheet.session.id, entries: list })
      if (state.status === 'success') {
        toast.success(state.message ?? 'Présences enregistrées')
        router.refresh()
      } else if (state.status === 'error') toast.error(state.message)
    })
  }

  const isPast = new Date(sheet.session.endsAt).getTime() < Date.now()

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:max-w-md">
          <label htmlFor={`${id}-session`} className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Session
          </label>
          <NativeSelect
            id={`${id}-session`}
            value={sheet.session.id}
            onChange={(event) => router.push(`${baseHref}?onglet=presence&session=${event.target.value}`)}
            options={sessions.map((s) => ({ value: s.id, label: `${fmtDateTime(s.startsAt)} · ${s.title}` }))}
          />
        </div>
        <div className="text-sm text-neutral-600">
          <p className="font-semibold text-navy">{sheet.session.title}</p>
          <p>
            {fmtDateTime(sheet.session.startsAt)} - {fmtTime(sheet.session.endsAt)} · {sessionModeLabels[sheet.session.mode]}
            {sheet.session.location ? ` · ${sheet.session.location}` : ''}
          </p>
          {sheet.linkedActivity ? <p className="text-xs text-green-800">Liée à l’activité « {sheet.linkedActivity.title} » : la présence valide l’achèvement.</p> : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="success">{counts.PRESENT} présents</Badge>
        <Badge variant="warning">{counts.LATE} en retard</Badge>
        <Badge variant="danger">{counts.ABSENT} absents</Badge>
        <Badge variant="blue">{counts.EXCUSED} excusés</Badge>
        {counts.pending ? <Badge variant="neutral">{counts.pending} non renseignés</Badge> : null}
        {!isPast ? <Badge variant="outline">Session à venir</Badge> : null}
      </div>

      {sheet.canRecord ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Actions de masse">
          <Button type="button" variant="outline" size="sm" onClick={() => setAll('PRESENT')} leftIcon={<CheckCheck aria-hidden="true" />}>
            Tous présents
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setAll('ABSENT')} leftIcon={<UserX aria-hidden="true" />}>
            Tous absents
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setAll('EXCUSED')} leftIcon={<UserMinus aria-hidden="true" />}>
            Tous excusés
          </Button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-soft">
        <table className="w-full text-sm">
          <caption className="sr-only">Feuille de présence de la session {sheet.session.title}</caption>
          <thead className="bg-neutral-50">
            <tr>
              <th scope="col" className="eyebrow px-4 py-3 text-left text-[11px] text-neutral-600">Participant</th>
              <th scope="col" className="eyebrow px-4 py-3 text-left text-[11px] text-neutral-600">Statut</th>
              <th scope="col" className="eyebrow px-4 py-3 text-left text-[11px] text-neutral-600">Note</th>
              <th scope="col" className="eyebrow px-4 py-3 text-left text-[11px] text-neutral-600">Enregistré par</th>
            </tr>
          </thead>
          <tbody>
            {sheet.rows.map((row) => {
              const entry = entries[row.user.id] ?? { status: null, note: '' }
              const name = personName(row.user)
              return (
                <tr key={row.user.id} className="border-t border-neutral-100 align-middle">
                  <td className="min-w-[12rem] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        <AvatarFallback>{initials(name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-navy">{name}</p>
                        <p className="truncate text-xs text-neutral-500">{row.user.jobTitle ?? row.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="min-w-[16rem] px-4 py-3">
                    <div role="radiogroup" aria-label={`Statut de ${name}`} className="inline-flex flex-wrap gap-1">
                      {attendanceStatuses.map((status) => (
                        <button
                          key={status}
                          type="button"
                          role="radio"
                          aria-checked={entry.status === status}
                          data-active={entry.status === status}
                          disabled={!sheet.canRecord}
                          onClick={() => setOne(row.user.id, { status })}
                          className={cn(
                            'min-h-11 rounded-full border border-neutral-300 bg-white px-3 text-xs font-semibold text-neutral-700 transition-colors hover:border-blue-300 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-9',
                            statusStyles[status],
                          )}
                        >
                          {attendanceStatusLabels[status]}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      aria-label={`Note pour ${name}`}
                      value={entry.note}
                      maxLength={300}
                      disabled={!sheet.canRecord}
                      placeholder="Retard justifié, départ anticipé..."
                      onChange={(event) => setOne(row.user.id, { note: event.target.value })}
                      className="min-w-[12rem]"
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">{row.recordedBy?.name ?? (row.status ? 'Auto-émargement' : '-')}</td>
                </tr>
              )
            })}
            {sheet.rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-neutral-500">
                  Aucun participant inscrit dans cette cohorte.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {sheet.canRecord && sheet.rows.length ? (
        <div className="flex flex-col sm:flex-row sm:justify-end">
          <Button type="button" variant="primary" onClick={save} loading={pending} leftIcon={<Save aria-hidden="true" />} className="w-full sm:w-auto">
            Enregistrer la feuille
          </Button>
        </div>
      ) : (
        <p className="inline-flex items-center gap-2 text-sm text-neutral-500">
          <UserCheck className="size-4" aria-hidden="true" />
          Lecture seule : seul le formateur de la cohorte ou la coordination peut émarger.
        </p>
      )}
    </div>
  )
}
