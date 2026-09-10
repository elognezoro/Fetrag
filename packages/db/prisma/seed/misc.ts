import { JobStatus, NotificationChannel, NotificationStatus } from '../../generated/client'
import { prisma } from '../../src/client'
import type { SeededCommerce } from './commerce'
import { at, daysFromNow, inBatches, json, log, stableId } from './helpers'
import type { SeededPilot } from './pilot-course'
import type { SeededRequests } from './requests'
import type { SeededUsers } from './users'

/**
 * Opérations et communication : notifications internes, modèles d'emails,
 * paramètres système, journal d'audit et file de jobs.
 */

// -----------------------------------------------------------------------------
// Modèles d'emails
// -----------------------------------------------------------------------------

/** Enveloppe HTML sobre aux couleurs FETRAG (tables + CSS inline, sans emoji). */
function emailLayout(title: string, body: string): string {
  return [
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FC;font-family:Arial,Helvetica,sans-serif;color:#0B1B3F;">',
    '<tr><td align="center" style="padding:24px;">',
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:16px;border-top:4px solid #0259C7;">',
    `<tr><td style="padding:24px 32px 8px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#0259C7;">FETRAG - Travail, Efficacité, Solidarité</td></tr>`,
    `<tr><td style="padding:0 32px 16px;font-size:22px;font-weight:bold;color:#042768;">${title}</td></tr>`,
    `<tr><td style="padding:0 32px 24px;font-size:15px;line-height:1.6;">${body}</td></tr>`,
    '<tr><td style="padding:16px 32px 24px;font-size:12px;color:#5B6478;border-top:1px solid #E5E8F0;">Fédération des Travailleurs du Gabon - Libreville. Ce message est envoyé automatiquement, merci de ne pas y répondre.</td></tr>',
    '</table></td></tr></table>',
  ].join('')
}

const emailTemplates = [
  {
    key: 'welcome',
    subject: 'Bienvenue sur la plateforme FETRAG, {{name}}',
    variables: ['name', 'loginUrl'],
    text: 'Bonjour {{name}}, votre compte FETRAG est créé. Connectez-vous : {{loginUrl}}',
    body: '<p>Bonjour {{name}},</p><p>Votre compte a été créé sur la plateforme de la Fédération des Travailleurs du Gabon. Vous pouvez dès maintenant accéder à votre espace personnel, consulter le catalogue de formations et suivre vos demandes.</p><p><a href="{{loginUrl}}" style="display:inline-block;padding:12px 24px;background:#0259C7;color:#FFFFFF;border-radius:999px;text-decoration:none;">Accéder à mon espace</a></p>',
  },
  {
    key: 'training-request-submitted',
    subject: 'Demande de formation {{reference}} bien reçue',
    variables: ['name', 'reference', 'organization', 'modules', 'requestUrl'],
    text: 'Bonjour {{name}}, la demande {{reference}} de {{organization}} ({{modules}}) a été transmise à la coordination formation. Suivi : {{requestUrl}}',
    body: '<p>Bonjour {{name}},</p><p>La demande de formation <strong>{{reference}}</strong> déposée pour {{organization}} a bien été transmise à la coordination formation de la FETRAG.</p><p>Modules demandés : {{modules}}.</p><p>Vous serez informé de chaque décision par email et dans votre espace. <a href="{{requestUrl}}">Suivre la demande</a>.</p>',
  },
  {
    key: 'training-request-decided',
    subject: 'Demande de formation {{reference}} : {{decisionLabel}}',
    variables: ['name', 'reference', 'decisionLabel', 'comment', 'requestUrl'],
    text: 'Bonjour {{name}}, la demande {{reference}} a reçu la décision suivante : {{decisionLabel}}. {{comment}} Détails : {{requestUrl}}',
    body: '<p>Bonjour {{name}},</p><p>La coordination formation a pris la décision suivante concernant la demande <strong>{{reference}}</strong> : <strong>{{decisionLabel}}</strong>.</p><p>{{comment}}</p><p><a href="{{requestUrl}}">Consulter la demande</a>.</p>',
  },
  {
    key: 'session-invite',
    subject: 'Convocation : {{sessionTitle}} le {{date}}',
    variables: ['name', 'sessionTitle', 'courseTitle', 'date', 'location', 'meetingUrl'],
    text: 'Bonjour {{name}}, vous êtes convoqué à la séance « {{sessionTitle}} » ({{courseTitle}}) le {{date}}. Lieu : {{location}}. Lien : {{meetingUrl}}',
    body: '<p>Bonjour {{name}},</p><p>Vous êtes convoqué à la séance <strong>{{sessionTitle}}</strong> du module {{courseTitle}}.</p><p>Date : {{date}}<br>Lieu : {{location}}<br>Lien de connexion : {{meetingUrl}}</p><p>Votre présence sera enregistrée par émargement.</p>',
  },
  {
    key: 'certificate-issued',
    subject: 'Votre certificat {{number}} est disponible',
    variables: ['name', 'courseTitle', 'number', 'verifyUrl', 'certificateUrl'],
    text: 'Félicitations {{name}}, votre certificat {{number}} pour « {{courseTitle}} » est disponible : {{certificateUrl}}. Vérification : {{verifyUrl}}',
    body: '<p>Félicitations {{name}},</p><p>Vous avez validé la formation <strong>{{courseTitle}}</strong>. Votre certificat n° <strong>{{number}}</strong> est disponible dans votre espace.</p><p><a href="{{certificateUrl}}">Télécharger le certificat</a> - <a href="{{verifyUrl}}">Page de vérification publique</a></p>',
  },
  {
    key: 'payment-succeeded',
    subject: 'Paiement confirmé - commande {{reference}}',
    variables: ['name', 'reference', 'amount', 'receiptNumber', 'orderUrl'],
    text: 'Bonjour {{name}}, votre paiement de {{amount}} pour la commande {{reference}} est confirmé. Reçu n° {{receiptNumber}} : {{orderUrl}}',
    body: '<p>Bonjour {{name}},</p><p>Nous confirmons la réception de votre paiement de <strong>{{amount}}</strong> pour la commande <strong>{{reference}}</strong>.</p><p>Votre reçu n° {{receiptNumber}} est disponible dans votre espace : <a href="{{orderUrl}}">voir la commande</a>.</p>',
  },
  {
    key: 'form-ack',
    subject: 'Nous avons bien reçu votre message ({{reference}})',
    variables: ['name', 'reference', 'kindLabel'],
    text: 'Bonjour {{name}}, votre message {{reference}} ({{kindLabel}}) a bien été reçu. Nous vous répondrons dans les meilleurs délais.',
    body: '<p>Bonjour {{name}},</p><p>Votre message <strong>{{reference}}</strong> ({{kindLabel}}) a bien été reçu par la Fédération des Travailleurs du Gabon. Nous vous répondrons dans les meilleurs délais.</p>',
  },
]

async function seedEmailTemplates(): Promise<number> {
  for (const t of emailTemplates) {
    const data = {
      subject: t.subject,
      html: emailLayout(t.subject.replace(/\{\{[^}]+\}\}/g, '').replace(/\s+/g, ' ').trim() || 'FETRAG', t.body),
      text: t.text,
      variables: t.variables,
      version: 1,
    }
    await prisma.emailTemplate.upsert({
      where: { key: t.key },
      create: { id: stableId('email-template', t.key), key: t.key, ...data },
      update: data,
    })
  }
  return emailTemplates.length
}

// -----------------------------------------------------------------------------
// Notifications internes
// -----------------------------------------------------------------------------

async function seedNotifications(users: SeededUsers, pilot: SeededPilot, requests: SeededRequests): Promise<number> {
  const learner1 = at(users.learners, 0, 'apprenant')
  const learner2 = at(users.learners, 1, 'apprenant')
  const notifications = [
    {
      key: 'cert-1',
      userId: learner1.id,
      category: 'certificate',
      title: 'Votre certificat est disponible',
      body: `Félicitations, vous avez validé le module « ${pilot.course.title} ». Certificat n° ${at(pilot.certificateNumbers, 0)}.`,
      href: '/certificats',
      status: NotificationStatus.READ,
      readAt: daysFromNow(-1, 14),
      createdAt: daysFromNow(-1, 12),
    },
    {
      key: 'cert-2',
      userId: learner2.id,
      category: 'certificate',
      title: 'Votre certificat est disponible',
      body: `Félicitations, vous avez validé le module « ${pilot.course.title} ». Certificat n° ${at(pilot.certificateNumbers, 1)}.`,
      href: '/certificats',
      status: NotificationStatus.SENT,
      readAt: null,
      createdAt: daysFromNow(-1, 12),
    },
    {
      key: 'request-accepted',
      userId: users.responsable.id,
      category: 'training',
      title: 'Demande de formation acceptée',
      body: `La demande ${requests.references.ACCEPTED} (modules 03 et 05) a été acceptée par la coordination. Une date vous a été proposée.`,
      href: `/organisation/demandes`,
      status: NotificationStatus.SENT,
      readAt: null,
      createdAt: daysFromNow(-8, 14),
    },
    {
      key: 'submission-new',
      userId: users.formateur.id,
      category: 'assignment',
      title: 'Nouveau devoir à corriger',
      body: `${learner2.name} a déposé son devoir « Appliquer le triptyque à un cas concret » (cohorte ${pilot.cohortCode}).`,
      href: `/formateur/cohortes/${pilot.cohortId}`,
      status: NotificationStatus.SENT,
      readAt: null,
      createdAt: daysFromNow(-2, 20),
    },
    {
      key: 'request-submitted',
      userId: users.coordination.id,
      category: 'training',
      title: 'Nouvelle demande de formation',
      body: `Le SYNATEP a soumis la demande ${requests.references.SUBMITTED} (modules 02 et 06, 5 participants).`,
      href: '/coordination',
      status: NotificationStatus.SENT,
      readAt: null,
      createdAt: daysFromNow(-2, 10),
    },
  ]
  await inBatches(notifications, async (n) => {
    const id = stableId('notification', n.key)
    const data = {
      userId: n.userId,
      channel: NotificationChannel.IN_APP,
      category: n.category,
      title: n.title,
      body: n.body,
      href: n.href,
      status: n.status,
      readAt: n.readAt,
      sentAt: n.createdAt,
      createdAt: n.createdAt,
    }
    await prisma.notification.upsert({ where: { id }, create: { id, ...data }, update: data })
  })
  return notifications.length
}

// -----------------------------------------------------------------------------
// Paramètres système
// -----------------------------------------------------------------------------

async function seedSettings(): Promise<number> {
  const settings = [
    { key: 'site.motto', value: ['Travail', 'Efficacité', 'Solidarité'], description: 'Devise affichée dans le ruban tricolore.' },
    { key: 'training.participantLimit', value: 10, description: 'Nombre maximal de participants par demande de formation institutionnelle (chapitre 14).' },
    { key: 'certificates.sequence', value: 2, description: 'Dernier numéro séquentiel de certificat émis (FETRAG-AAAA-NNNNNN).' },
    { key: 'api.keys', value: [], description: 'Clés API (hash, libellé, portée) pour les intégrations X-API-Key.' },
  ]
  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      create: { key: s.key, value: json(s.value), description: s.description },
      update: { value: json(s.value), description: s.description },
    })
  }
  return settings.length
}

// -----------------------------------------------------------------------------
// Journal d'audit et jobs
// -----------------------------------------------------------------------------

async function seedAuditLogs(users: SeededUsers, pilot: SeededPilot, commerce: SeededCommerce): Promise<number> {
  const entries = [
    {
      key: 'role-coordinator',
      actor: users.admin,
      action: 'role.granted',
      entityType: 'RoleAssignment',
      entityId: users.coordination.id,
      after: { role: 'COORDINATOR', scopeType: 'GLOBAL', userEmail: users.coordination.email },
      createdAt: daysFromNow(-30, 9),
    },
    {
      key: 'course-published-m01',
      actor: users.coordination,
      action: 'course.published',
      entityType: 'Course',
      entityId: pilot.course.id,
      after: { code: pilot.course.code, version: 1, status: 'PUBLISHED' },
      createdAt: daysFromNow(-28, 10),
    },
    {
      key: 'training-request-decided',
      actor: users.coordination,
      action: 'training_request.decided',
      entityType: 'TrainingRequest',
      entityId: null,
      after: { reference: 'DF-2026-SYNA05', toStatus: 'SCHEDULED', cohortCode: pilot.cohortCode },
      createdAt: daysFromNow(-14, 11),
    },
    {
      key: 'payment-succeeded',
      actor: at(users.learners, 2, 'apprenant'),
      action: 'payment.succeeded',
      entityType: 'Order',
      entityId: null,
      after: { reference: at(commerce.orderReferences, 0), provider: 'sandbox', amount: 9000, currency: 'XAF' },
      createdAt: daysFromNow(-4, 11),
    },
    {
      key: 'certificate-issued-1',
      actor: users.coordination,
      action: 'certificate.issued',
      entityType: 'Certificate',
      entityId: null,
      after: { number: at(pilot.certificateNumbers, 0), courseCode: pilot.course.code, holder: at(users.learners, 0, 'apprenant').email },
      createdAt: daysFromNow(-1, 12),
    },
    {
      key: 'certificate-issued-2',
      actor: users.coordination,
      action: 'certificate.issued',
      entityType: 'Certificate',
      entityId: null,
      after: { number: at(pilot.certificateNumbers, 1), courseCode: pilot.course.code, holder: at(users.learners, 1, 'apprenant').email },
      createdAt: daysFromNow(-1, 12, 5),
    },
  ]
  await inBatches(entries, async (e) => {
    const id = stableId('audit', e.key)
    const data = {
      actorId: e.actor.id,
      actorEmail: e.actor.email,
      action: e.action,
      entityType: e.entityType,
      entityId: e.entityId,
      after: json(e.after),
      correlationId: `seed-${e.key}`,
      createdAt: e.createdAt,
    }
    await prisma.auditLog.upsert({ where: { id }, create: { id, ...data }, update: data })
  })
  return entries.length
}

async function seedJobs(pilot: SeededPilot): Promise<number> {
  const number = at(pilot.certificateNumbers, 0)
  const idempotencyKey = `certificate.render:${number}`
  const data = {
    type: 'certificate.render',
    payload: json({ certificateNumber: number, courseCode: pilot.course.code }),
    status: JobStatus.SUCCEEDED,
    priority: 3,
    attempts: 1,
    maxAttempts: 5,
    runAt: daysFromNow(-1, 12),
    lockedAt: null,
    lockedBy: null,
    lastError: null,
    result: json({ rendered: true, note: 'PDF à régénérer par le worker (seed de démonstration).' }),
    completedAt: daysFromNow(-1, 12, 2),
    createdAt: daysFromNow(-1, 12),
  }
  await prisma.backgroundJob.upsert({
    where: { idempotencyKey },
    create: { id: stableId('job', idempotencyKey), idempotencyKey, ...data },
    update: data,
  })
  return 1
}

/** Charge notifications, modèles d'emails, paramètres, audit et jobs. */
export async function seedMisc(users: SeededUsers, pilot: SeededPilot, requests: SeededRequests, commerce: SeededCommerce): Promise<void> {
  log.step('Communication et opérations')
  const templates = await seedEmailTemplates()
  const notifications = await seedNotifications(users, pilot, requests)
  const settings = await seedSettings()
  const audits = await seedAuditLogs(users, pilot, commerce)
  const jobs = await seedJobs(pilot)
  log.done(`${templates} modèles d'email, ${notifications} notifications, ${settings} paramètres, ${audits} entrées d'audit, ${jobs} job`)
}
