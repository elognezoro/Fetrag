import { enqueue } from '@fetrag/jobs'
import { notifyRole, notifyUser, sendEmail, type NotificationCategory, type NotifyInput, type TemplateVars } from '@fetrag/notifications'
import type { RoleName } from '@fetrag/contracts'

/**
 * Point d'intégration unique vers @fetrag/jobs et @fetrag/notifications.
 * Les échecs de notification ne doivent jamais faire échouer une opération métier :
 * ils sont journalisés et le job persistant prend le relais côté plateforme.
 */

export type { NotificationCategory, TemplateVars }

/** Clés de templates email (registre `templateKeys` de @fetrag/notifications). */
export const emailTemplates = {
  /** Variables : loginUrl (obligatoire). */
  welcome: 'welcome',
  /** Invitation d'un participant créé par le workflow institutionnel (même gabarit que welcome). */
  invitation: 'welcome',
  /** Variables : reference, dashboardUrl (obligatoires) ; organizationName, modules, preferredStart. */
  requestSubmitted: 'training-request-submitted',
  /** Variables : reference, dashboardUrl, comment. */
  requestInfoRequested: 'training-request-info-requested',
  /** Variables : reference, dashboardUrl ; proposedStart, proposedMode, comment. */
  requestAccepted: 'training-request-accepted',
  /** Variables : reference, dashboardUrl, comment. */
  requestRejected: 'training-request-rejected',
  /** Pas de gabarit dédié : notification générique (title, body, href). */
  requestRescheduled: 'notification',
  /** Variables : reference, cohortName, dashboardUrl ; startsAt, mode, location, participantCount. */
  requestScheduled: 'training-request-scheduled',
  /** Variables : sessionTitle, startsAt, calendarUrl ; courseTitle, endsAt, mode, location, trainerName, meetingUrl. */
  sessionConvocation: 'session-convocation',
  /** Variables : courseTitle, courseUrl ; cohortName, startsAt, durationHours. */
  enrollmentConfirmed: 'enrollment-confirmed',
  /** Variables : assignmentTitle, dueAt, assignmentUrl ; courseTitle, lateAllowed. */
  assignmentLate: 'assignment-late',
  /** Variables : activityTitle, score, resultUrl ; courseTitle, maxScore, passed, feedback. */
  result: 'result-available',
  /** Variables : courseTitle, certificateNumber, certificateUrl ; verifyUrl, kindLabel. */
  certificateIssued: 'certificate-issued',
  /** Variables : title, body ; href, ctaLabel. */
  notification: 'notification',
} as const

export interface EmailMessage {
  to: string
  template: string
  variables?: TemplateVars
  /** Remplace le sujet du template (obligatoire pour `custom`). */
  subject?: string
  html?: string
  text?: string
  userId?: string | null
}

export interface UserNotification {
  title: string
  body: string
  /** Lien relatif au LMS (par défaut) ou absolu. */
  href?: string
  app?: 'web' | 'lms'
  category?: NotificationCategory
  email?: boolean
  emailTemplate?: string
  emailVariables?: NotifyInput['emailVariables']
}

export async function safeSendEmail(message: EmailMessage): Promise<void> {
  try {
    await sendEmail(message)
  } catch (error) {
    console.error('[lms-core] envoi email impossible', message.template, error)
  }
}

export async function safeNotifyUser(userId: string, notification: UserNotification): Promise<void> {
  try {
    await notifyUser(userId, { app: 'lms', ...notification })
  } catch (error) {
    console.error('[lms-core] notification impossible', notification.title, error)
  }
}

export async function safeNotifyRole(role: RoleName, notification: UserNotification): Promise<void> {
  try {
    await notifyRole(role, { app: 'lms', ...notification })
  } catch (error) {
    console.error('[lms-core] notification de rôle impossible', role, notification.title, error)
  }
}

export async function safeEnqueue(
  type: string,
  payload: Record<string, unknown>,
  options: { idempotencyKey?: string; runAt?: Date; priority?: number } = {},
): Promise<void> {
  try {
    await enqueue(type, payload, options)
  } catch (error) {
    console.error('[lms-core] mise en file du job impossible', type, error)
  }
}
