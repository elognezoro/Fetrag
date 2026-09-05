import Link from 'next/link'
import type { ReactNode } from 'react'
import { Building2, CalendarDays, Download, FileText, MessageSquareText, Pencil, Users } from 'lucide-react'
import { sessionModeLabels, trainingRequestStatusLabels, type TrainingRequestStatusName } from '@fetrag/contracts'
import { formatDate, formatDateTime } from '@fetrag/domain'
import type { trainingRequests } from '@fetrag/lms-core'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@fetrag/ui'
import { attachmentHref } from '@/server/staff/queries'
import { DetailItem, DetailList, StaffSection } from './staff-page'
import { StatusTimeline } from './status-timeline'
import { fmtFileSize, personName } from './format'

export type TrainingRequestDetail = Awaited<ReturnType<typeof trainingRequests.get>>

export interface RequestDetailProps {
  request: TrainingRequestDetail
  /** Liens contextuels de l'espace courant. */
  cohortHref?: (cohortId: string) => string
  /** Zone d'actions (modifier, annuler, décider). */
  actions?: ReactNode
  /** Contenu inséré après la frise (panneau de décision, réponse au complément). */
  children?: ReactNode
}

/** Fiche complète d'une demande de formation : frise, coordonnées, modules, participants, pièces, historique. */
export async function RequestDetail({ request, cohortHref, actions, children }: RequestDetailProps) {
  const attachments = await Promise.all(request.attachments.map(async (a) => ({ ...a, href: await attachmentHref(a.fileUrl) })))
  const history = request.decisions.map((d) => ({ toStatus: d.toStatus as TrainingRequestStatusName, createdAt: d.createdAt }))

  return (
    <div className="flex flex-col gap-2">
      <Card pillar="protection" className="mb-8">
        <CardContent className="p-5 sm:p-6">
          <StatusTimeline status={request.status} history={history} />
        </CardContent>
      </Card>

      {children}

      <StaffSection number="01" title="Organisation et personne ressource" tone="blue" actions={actions}>
        <Card>
          <CardContent className="p-5 sm:p-6">
            <DetailList columns={3}>
              <DetailItem label="Organisation">
                <span className="inline-flex items-center gap-2">
                  <Building2 className="size-4 text-blue-600" aria-hidden="true" />
                  {request.organization.acronym ? `${request.organization.acronym} - ` : ''}
                  {request.organization.name}
                </span>
              </DetailItem>
              <DetailItem label="Personne ressource">
                {request.contactName}
                {request.contactRole ? <span className="block text-xs text-neutral-500">{request.contactRole}</span> : null}
              </DetailItem>
              <DetailItem label="Contact">
                <a href={`mailto:${request.contactEmail}`} className="text-blue-700 hover:underline">
                  {request.contactEmail}
                </a>
                {request.contactPhone ? <span className="block text-xs text-neutral-500">{request.contactPhone}</span> : null}
              </DetailItem>
              <DetailItem label="Déposée par">{personName(request.requester)}</DetailItem>
              <DetailItem label="Soumise le">{request.submittedAt ? formatDateTime(request.submittedAt) : 'Brouillon non transmis'}</DetailItem>
              <DetailItem label="Dernière mise à jour">{formatDateTime(request.updatedAt)}</DetailItem>
            </DetailList>
          </CardContent>
        </Card>
      </StaffSection>

      <StaffSection number="02" title={`Modules demandés (${request.modules.length})`} tone="green">
        <ul className="grid gap-3 sm:grid-cols-2">
          {request.modules.map((m, index) => (
            <li key={m.id} className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft">
              <span aria-hidden="true" className="font-display text-3xl font-semibold leading-none text-green-700">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-navy">{m.course.title}</p>
                <p className="text-xs text-neutral-500">
                  {m.course.code} · {m.course.durationHours} h {m.course.status !== 'PUBLISHED' ? <Badge variant="warning" size="sm" className="ml-1">Non publié</Badge> : null}
                  {!m.course.currentVersionId ? <Badge variant="danger" size="sm" className="ml-1">Sans version publiée</Badge> : null}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </StaffSection>

      <StaffSection number="03" title={`Participants (${request.participants.length} / ${request.participantLimit})`} tone="gold">
        {request.participants.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Fonction</TableHead>
                <TableHead>Compte</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {request.participants.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-ink">{p.fullName}</TableCell>
                  <TableCell>{p.email ?? <span className="text-gold-800">Sans email</span>}</TableCell>
                  <TableCell>{p.phone ?? '-'}</TableCell>
                  <TableCell>{p.jobTitle ?? '-'}</TableCell>
                  <TableCell>{p.enrolled ? <Badge variant="success" size="sm">Inscrit</Badge> : p.userId ? <Badge variant="blue" size="sm">Compte existant</Badge> : <Badge variant="neutral" size="sm">À créer</Badge>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-neutral-500">Aucun participant désigné.</p>
        )}
      </StaffSection>

      <StaffSection number="04" title="Préférences et réponse de la coordination" tone="blue">
        <Card>
          <CardContent className="p-5 sm:p-6">
            <DetailList columns={3}>
              <DetailItem label="Démarrage souhaité">{request.preferredStart ? formatDate(request.preferredStart) : 'À convenir'}</DetailItem>
              <DetailItem label="Modalité souhaitée">{sessionModeLabels[request.preferredMode]}</DetailItem>
              <DetailItem label="Engagements">{request.commitmentsAccepted ? `Acceptés${request.commitmentsAcceptedAt ? ` le ${formatDate(request.commitmentsAcceptedAt)}` : ''}` : 'Non acceptés'}</DetailItem>
              {request.proposedStart || request.proposedMode ? (
                <>
                  <DetailItem label="Date proposée par la coordination">{request.proposedStart ? formatDate(request.proposedStart) : '-'}</DetailItem>
                  <DetailItem label="Modalité proposée">{request.proposedMode ? sessionModeLabels[request.proposedMode] : '-'}</DetailItem>
                </>
              ) : null}
              {request.decidedAt ? <DetailItem label="Décision du">{formatDateTime(request.decidedAt)}</DetailItem> : null}
            </DetailList>
            {request.motivation ? (
              <div className="mt-5 border-t border-neutral-100 pt-4">
                <p className="eyebrow mb-1 text-[11px] text-neutral-500">Motivation de l'organisation</p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">{request.motivation}</p>
              </div>
            ) : null}
            {request.coordinatorNote ? (
              <div className="mt-5 rounded-xl border border-gold-500/50 bg-gold-50 p-4">
                <p className="eyebrow mb-1 flex items-center gap-2 text-[11px] text-gold-800">
                  <MessageSquareText className="size-4" aria-hidden="true" />
                  Note de la coordination
                </p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-800">{request.coordinatorNote}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </StaffSection>

      {request.cohort ? (
        <StaffSection number="05" title="Cohorte planifiée" tone="green">
          <Card pillar="prevention">
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>{request.cohort.name}</CardTitle>
                <p className="mt-1 text-sm text-neutral-600">
                  Code {request.cohort.code} · <StatusBadge status={request.cohort.status} size="sm" />
                </p>
              </div>
              {cohortHref ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={cohortHref(request.cohort.id)}>Voir la cohorte</Link>
                </Button>
              ) : null}
            </CardHeader>
            <CardContent>
              <DetailList columns={4}>
                <DetailItem label="Début">{request.cohort.startsAt ? formatDate(request.cohort.startsAt) : 'À planifier'}</DetailItem>
                <DetailItem label="Fin">{request.cohort.endsAt ? formatDate(request.cohort.endsAt) : '-'}</DetailItem>
                <DetailItem label="Membres">
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-4 text-green-700" aria-hidden="true" />
                    {request.cohort._count.members}
                  </span>
                </DetailItem>
                <DetailItem label="Sessions">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-4 text-green-700" aria-hidden="true" />
                    {request.cohort._count.sessions}
                  </span>
                </DetailItem>
              </DetailList>
            </CardContent>
          </Card>
        </StaffSection>
      ) : null}

      <StaffSection number={request.cohort ? '06' : '05'} title={`Pièces jointes (${attachments.length})`} tone="gold">
        {attachments.length ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {attachments.map((file) => (
              <li key={file.id} className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3 text-sm shadow-soft">
                <span className="flex min-w-0 items-center gap-2">
                  <FileText className="size-4 shrink-0 text-blue-600" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink">{file.label || file.fileName}</span>
                    <span className="text-xs text-neutral-500">
                      {fmtFileSize(file.size)} · {formatDate(file.createdAt)}
                    </span>
                  </span>
                </span>
                <Button asChild variant="ghost" size="sm">
                  <a href={file.href} target="_blank" rel="noopener noreferrer">
                    <Download aria-hidden="true" />
                    Ouvrir
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500">Aucune pièce jointe.</p>
        )}
      </StaffSection>

      <StaffSection number={request.cohort ? '07' : '06'} title="Historique des décisions" tone="navy">
        <ol className="relative flex flex-col gap-4 border-l-2 border-neutral-200 pl-6">
          {request.decisions.map((d) => (
            <li key={d.id} className="relative">
              <span aria-hidden="true" className="absolute -left-[31px] top-1 size-3 rounded-full border-2 border-white bg-blue-500 shadow-soft" />
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={d.toStatus} labels={trainingRequestStatusLabels} size="sm" />
                <span className="text-xs text-neutral-500">
                  {formatDateTime(d.createdAt)} · {d.actor?.name ?? 'Système'}
                </span>
              </div>
              {d.comment ? <p className="mt-1 text-sm text-neutral-700">{d.comment}</p> : null}
            </li>
          ))}
          {request.decisions.length === 0 ? <li className="text-sm text-neutral-500">Aucun événement enregistré.</li> : null}
        </ol>
      </StaffSection>
    </div>
  )
}

/** Bouton « compléter / modifier » vers l'assistant (brouillon ou complément demandé). */
export function EditRequestLink({ requestId }: { requestId: string }) {
  return (
    <Button asChild variant="primary" size="sm">
      <Link href={`/demande-formation?reprendre=${requestId}`}>
        <Pencil aria-hidden="true" />
        Compléter la demande
      </Link>
    </Button>
  )
}
