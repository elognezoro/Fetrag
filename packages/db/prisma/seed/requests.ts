import { SessionMode, TrainingRequestStatus } from '../../generated/client'
import { prisma } from '../../src/client'
import type { SeededCatalog } from './catalog'
import { at, daysFromNow, get, inBatches, json, log, stableId } from './helpers'
import type { SeededOrganizations } from './organizations'
import type { SeededPilot } from './pilot-course'
import type { SeededUsers } from './users'

/**
 * Workflow institutionnel (chapitre 14) : une demande de formation dans chaque statut majeur,
 * avec modules choisis, participants nommés et historique des décisions.
 */

export interface SeededRequests {
  references: Record<TrainingRequestStatus, string>
}

interface ParticipantSeed {
  fullName: string
  email: string | null
  phone: string | null
  jobTitle: string | null
  userId?: string
  enrolled?: boolean
}

interface DecisionSeed {
  from: TrainingRequestStatus | null
  to: TrainingRequestStatus
  actor: 'requester' | 'coordination'
  comment: string
  payload?: unknown
  daysAgo: number
}

interface RequestSeed {
  reference: string
  status: TrainingRequestStatus
  courseCodes: string[]
  preferredStart: Date | null
  preferredMode: SessionMode
  motivation: string
  commitmentsAccepted: boolean
  coordinatorNote: string | null
  proposedStart: Date | null
  proposedMode: SessionMode | null
  submittedAt: Date | null
  decidedAt: Date | null
  createdAt: Date
  participants: ParticipantSeed[]
  decisions: DecisionSeed[]
  attachment?: { fileName: string; label: string }
  linkToPilotCohort?: boolean
}

const genericParticipants: ParticipantSeed[] = [
  { fullName: 'Fabrice NGOUA', email: 'f.ngoua@synatep-demo.ga', phone: '+241 07 50 00 01', jobTitle: 'Délégué du personnel' },
  { fullName: 'Irène MBOUMBA', email: 'i.mboumba@synatep-demo.ga', phone: '+241 07 50 00 02', jobTitle: 'Secrétaire de section' },
  { fullName: 'Landry ESSONO', email: 'l.essono@synatep-demo.ga', phone: '+241 07 50 00 03', jobTitle: 'Trésorier de section' },
  { fullName: 'Nathalie BIYOGHE', email: 'n.biyoghe@synatep-demo.ga', phone: '+241 07 50 00 04', jobTitle: 'Membre du bureau' },
  { fullName: 'Dieudonné MAGANGA', email: null, phone: '+241 07 50 00 05', jobTitle: 'Chef d’équipe' },
]

function buildRequests(users: SeededUsers): RequestSeed[] {
  const learnersAsParticipants: ParticipantSeed[] = users.learners.map((l, i) => ({
    fullName: l.name,
    email: l.email,
    phone: `+241 07 30 00 ${String(i + 1).padStart(2, '0')}`,
    jobTitle: 'Cadre désigné par le SYNATEP',
    userId: l.id,
    enrolled: true,
  }))
  return [
    {
      reference: 'DF-2026-SYNA01',
      status: TrainingRequestStatus.DRAFT,
      courseCodes: ['M04', 'M09'],
      preferredStart: daysFromNow(60),
      preferredMode: SessionMode.HYBRID,
      motivation: 'Renforcer l’organisation des nouvelles sections de Port-Gentil et former leurs porte-parole.',
      commitmentsAccepted: false,
      coordinatorNote: null,
      proposedStart: null,
      proposedMode: null,
      submittedAt: null,
      decidedAt: null,
      createdAt: daysFromNow(-1, 16),
      participants: genericParticipants.slice(0, 3),
      decisions: [],
    },
    {
      reference: 'DF-2026-SYNA02',
      status: TrainingRequestStatus.SUBMITTED,
      courseCodes: ['M02', 'M06'],
      preferredStart: daysFromNow(35),
      preferredMode: SessionMode.IN_PERSON,
      motivation: 'Plusieurs adhérents font face à des procédures disciplinaires et à des contrats précaires ; nos délégués doivent maîtriser le droit du travail et la défense des intérêts.',
      commitmentsAccepted: true,
      coordinatorNote: null,
      proposedStart: null,
      proposedMode: null,
      submittedAt: daysFromNow(-2, 10),
      decidedAt: null,
      createdAt: daysFromNow(-3, 9),
      participants: genericParticipants.slice(0, 5),
      decisions: [
        { from: null, to: TrainingRequestStatus.DRAFT, actor: 'requester', comment: 'Création de la demande.', daysAgo: 3 },
        { from: TrainingRequestStatus.DRAFT, to: TrainingRequestStatus.SUBMITTED, actor: 'requester', comment: 'Demande soumise à la coordination avec engagements acceptés.', daysAgo: 2 },
      ],
      attachment: { fileName: 'liste-participants-synatep.pdf', label: 'Liste des participants signée' },
    },
    {
      reference: 'DF-2026-SYNA03',
      status: TrainingRequestStatus.INFO_REQUESTED,
      courseCodes: ['M07'],
      preferredStart: daysFromNow(40),
      preferredMode: SessionMode.HYBRID,
      motivation: 'Une entreprise du secteur annonce une restructuration ; nos représentants doivent être préparés à la négociation de sauvegarde de l’emploi.',
      commitmentsAccepted: true,
      coordinatorNote: 'Merci de préciser l’entreprise concernée, le calendrier de la restructuration et de joindre le mandat des représentants du personnel.',
      proposedStart: null,
      proposedMode: null,
      submittedAt: daysFromNow(-6, 11),
      decidedAt: daysFromNow(-4, 15),
      createdAt: daysFromNow(-7, 10),
      participants: genericParticipants.slice(1, 4),
      decisions: [
        { from: null, to: TrainingRequestStatus.DRAFT, actor: 'requester', comment: 'Création de la demande.', daysAgo: 7 },
        { from: TrainingRequestStatus.DRAFT, to: TrainingRequestStatus.SUBMITTED, actor: 'requester', comment: 'Demande soumise.', daysAgo: 6 },
        { from: TrainingRequestStatus.SUBMITTED, to: TrainingRequestStatus.INFO_REQUESTED, actor: 'coordination', comment: 'Complément demandé : entreprise concernée, calendrier et mandat des représentants.', daysAgo: 4 },
      ],
    },
    {
      reference: 'DF-2026-SYNA04',
      status: TrainingRequestStatus.ACCEPTED,
      courseCodes: ['M03', 'M05'],
      preferredStart: daysFromNow(30),
      preferredMode: SessionMode.HYBRID,
      motivation: 'Préparer la délégation du SYNATEP aux négociations de branche du second semestre et prévenir les tensions dans les unités de production.',
      commitmentsAccepted: true,
      coordinatorNote: 'Demande acceptée. Cohorte à planifier dès confirmation des disponibilités de la formatrice.',
      proposedStart: daysFromNow(32),
      proposedMode: SessionMode.HYBRID,
      submittedAt: daysFromNow(-12, 9),
      decidedAt: daysFromNow(-8, 14),
      createdAt: daysFromNow(-13, 9),
      participants: genericParticipants.slice(0, 5),
      decisions: [
        { from: null, to: TrainingRequestStatus.DRAFT, actor: 'requester', comment: 'Création de la demande.', daysAgo: 13 },
        { from: TrainingRequestStatus.DRAFT, to: TrainingRequestStatus.SUBMITTED, actor: 'requester', comment: 'Demande soumise.', daysAgo: 12 },
        { from: TrainingRequestStatus.SUBMITTED, to: TrainingRequestStatus.ACCEPTED, actor: 'coordination', comment: 'Demande acceptée ; date proposée confirmée avec le responsable.', payload: { proposedStartDays: 32, proposedMode: 'HYBRID' }, daysAgo: 8 },
      ],
    },
    {
      reference: 'DF-2026-SYNA05',
      status: TrainingRequestStatus.SCHEDULED,
      courseCodes: ['M01'],
      preferredStart: daysFromNow(-10),
      preferredMode: SessionMode.HYBRID,
      motivation: 'Former les dix cadres nouvellement élus du SYNATEP aux fondamentaux du syndicalisme avant les négociations de branche.',
      commitmentsAccepted: true,
      coordinatorNote: 'Cohorte pilote constituée ; participants inscrits et convoqués.',
      proposedStart: daysFromNow(-10),
      proposedMode: SessionMode.HYBRID,
      submittedAt: daysFromNow(-25, 10),
      decidedAt: daysFromNow(-14, 11),
      createdAt: daysFromNow(-26, 10),
      participants: learnersAsParticipants,
      decisions: [
        { from: null, to: TrainingRequestStatus.DRAFT, actor: 'requester', comment: 'Création de la demande.', daysAgo: 26 },
        { from: TrainingRequestStatus.DRAFT, to: TrainingRequestStatus.SUBMITTED, actor: 'requester', comment: 'Demande soumise avec la liste des dix participants.', daysAgo: 25 },
        { from: TrainingRequestStatus.SUBMITTED, to: TrainingRequestStatus.ACCEPTED, actor: 'coordination', comment: 'Demande acceptée en l’état.', daysAgo: 20 },
        { from: TrainingRequestStatus.ACCEPTED, to: TrainingRequestStatus.SCHEDULED, actor: 'coordination', comment: 'Cohorte pilote créée, participants inscrits et convocations envoyées.', payload: { cohortCode: 'COH-M01-2026-SYN1' }, daysAgo: 14 },
      ],
      attachment: { fileName: 'mandat-synatep-formation-2026.pdf', label: 'Mandat du bureau exécutif' },
      linkToPilotCohort: true,
    },
    {
      reference: 'DF-2026-SYNA06',
      status: TrainingRequestStatus.COMPLETED,
      courseCodes: ['M10'],
      preferredStart: daysFromNow(-90),
      preferredMode: SessionMode.IN_PERSON,
      motivation: 'Former les membres du CHSCT des sites de production à la prévention des risques professionnels.',
      commitmentsAccepted: true,
      coordinatorNote: 'Session terminée ; rapport d’organisation transmis.',
      proposedStart: daysFromNow(-90),
      proposedMode: SessionMode.IN_PERSON,
      submittedAt: daysFromNow(-120, 10),
      decidedAt: daysFromNow(-100, 10),
      createdAt: daysFromNow(-121, 10),
      participants: genericParticipants.slice(0, 4).map((p) => ({ ...p, enrolled: true })),
      decisions: [
        { from: null, to: TrainingRequestStatus.DRAFT, actor: 'requester', comment: 'Création de la demande.', daysAgo: 121 },
        { from: TrainingRequestStatus.DRAFT, to: TrainingRequestStatus.SUBMITTED, actor: 'requester', comment: 'Demande soumise.', daysAgo: 120 },
        { from: TrainingRequestStatus.SUBMITTED, to: TrainingRequestStatus.ACCEPTED, actor: 'coordination', comment: 'Demande acceptée.', daysAgo: 110 },
        { from: TrainingRequestStatus.ACCEPTED, to: TrainingRequestStatus.SCHEDULED, actor: 'coordination', comment: 'Session planifiée en présentiel.', daysAgo: 100 },
        { from: TrainingRequestStatus.SCHEDULED, to: TrainingRequestStatus.IN_PROGRESS, actor: 'coordination', comment: 'Formation démarrée.', daysAgo: 90 },
        { from: TrainingRequestStatus.IN_PROGRESS, to: TrainingRequestStatus.COMPLETED, actor: 'coordination', comment: 'Session clôturée ; 4 attestations émises et rapport transmis à l’organisation.', daysAgo: 75 },
      ],
    },
    {
      reference: 'DF-2026-SYNA07',
      status: TrainingRequestStatus.REJECTED,
      courseCodes: ['M08'],
      preferredStart: daysFromNow(5),
      preferredMode: SessionMode.VIRTUAL,
      motivation: 'Formation urgente du bureau au leadership avant le congrès.',
      commitmentsAccepted: true,
      coordinatorNote: 'Délai insuffisant pour constituer une cohorte et absence de formateur disponible sur la période ; nouvelle demande possible pour le trimestre suivant.',
      proposedStart: null,
      proposedMode: null,
      submittedAt: daysFromNow(-5, 17),
      decidedAt: daysFromNow(-3, 10),
      createdAt: daysFromNow(-5, 16),
      participants: genericParticipants.slice(2, 5),
      decisions: [
        { from: null, to: TrainingRequestStatus.DRAFT, actor: 'requester', comment: 'Création de la demande.', daysAgo: 5 },
        { from: TrainingRequestStatus.DRAFT, to: TrainingRequestStatus.SUBMITTED, actor: 'requester', comment: 'Demande soumise en urgence.', daysAgo: 5 },
        { from: TrainingRequestStatus.SUBMITTED, to: TrainingRequestStatus.REJECTED, actor: 'coordination', comment: 'Refus motivé : délai insuffisant et indisponibilité des formateurs sur la période demandée.', daysAgo: 3 },
      ],
    },
  ]
}

/** Charge les demandes de formation de démonstration et rattache la demande planifiée à la cohorte pilote. */
export async function seedTrainingRequests(users: SeededUsers, orgs: SeededOrganizations, catalog: SeededCatalog, pilot: SeededPilot): Promise<SeededRequests> {
  log.step('Demandes de formation institutionnelles (workflow chapitre 14)')
  const references: Partial<Record<TrainingRequestStatus, string>> = {}

  for (const r of buildRequests(users)) {
    const data = {
      organizationId: orgs.synatep.id,
      requesterId: users.responsable.id,
      contactName: users.responsable.name,
      contactRole: 'Secrétaire général',
      contactEmail: users.responsable.email,
      contactPhone: '+241 06 20 00 01',
      status: r.status,
      preferredStart: r.preferredStart,
      preferredMode: r.preferredMode,
      participantLimit: 10,
      motivation: r.motivation,
      commitmentsAccepted: r.commitmentsAccepted,
      commitmentsAcceptedAt: r.commitmentsAccepted ? r.createdAt : null,
      coordinatorNote: r.coordinatorNote,
      proposedStart: r.proposedStart,
      proposedMode: r.proposedMode,
      submittedAt: r.submittedAt,
      decidedAt: r.decidedAt,
      createdAt: r.createdAt,
    }
    const request = await prisma.trainingRequest.upsert({
      where: { reference: r.reference },
      create: { id: stableId('training-request', r.reference), reference: r.reference, ...data },
      update: data,
      select: { id: true },
    })

    await inBatches(r.courseCodes, async (code, index) => {
      const course = get(catalog.courses, code, 'cours')
      await prisma.trainingRequestModule.upsert({
        where: { requestId_courseId: { requestId: request.id, courseId: course.id } },
        create: { requestId: request.id, courseId: course.id, position: index + 1 },
        update: { position: index + 1 },
      })
    })

    await inBatches(r.participants, async (p, index) => {
      const id = stableId('training-request-participant', r.reference, index)
      const participantData = {
        fullName: p.fullName,
        email: p.email,
        phone: p.phone,
        jobTitle: p.jobTitle,
        userId: p.userId ?? null,
        enrolled: p.enrolled ?? false,
      }
      await prisma.trainingRequestParticipant.upsert({
        where: { id },
        create: { id, requestId: request.id, ...participantData },
        update: participantData,
      })
    })

    await inBatches(r.decisions, async (d, index) => {
      const id = stableId('decision', r.reference, index)
      const decisionData = {
        actorId: d.actor === 'requester' ? users.responsable.id : users.coordination.id,
        fromStatus: d.from,
        toStatus: d.to,
        comment: d.comment,
        payload: d.payload ? json(d.payload) : undefined,
        createdAt: daysFromNow(-d.daysAgo, 10 + index),
      }
      await prisma.decisionHistory.upsert({ where: { id }, create: { id, requestId: request.id, ...decisionData }, update: decisionData })
    })

    if (r.attachment) {
      const id = stableId('attachment', r.reference, r.attachment.fileName)
      const attachmentData = {
        fileName: r.attachment.fileName,
        fileUrl: `/uploads/demandes/${r.reference}/${r.attachment.fileName}`,
        mimeType: 'application/pdf',
        size: 184_320,
        label: r.attachment.label,
      }
      await prisma.attachment.upsert({ where: { id }, create: { id, requestId: request.id, ...attachmentData }, update: attachmentData })
    }

    if (r.linkToPilotCohort) {
      await prisma.cohort.update({ where: { id: pilot.cohortId }, data: { trainingRequestId: request.id } })
    }

    references[r.status] = r.reference
    log.info(`${r.reference} - ${r.status} (${r.courseCodes.join(', ')}, ${r.participants.length} participants)`)
  }

  const expected: TrainingRequestStatus[] = [
    TrainingRequestStatus.DRAFT,
    TrainingRequestStatus.SUBMITTED,
    TrainingRequestStatus.INFO_REQUESTED,
    TrainingRequestStatus.ACCEPTED,
    TrainingRequestStatus.SCHEDULED,
    TrainingRequestStatus.COMPLETED,
    TrainingRequestStatus.REJECTED,
  ]
  const missing = expected.filter((s) => !references[s])
  if (missing.length > 0) throw new Error(`Seed : demandes manquantes pour les statuts ${missing.join(', ')}`)
  log.done(`${expected.length} demandes, dont ${at(Object.values(references), 0)} et suivantes`)

  return { references: references as Record<TrainingRequestStatus, string> }
}
