/**
 * Pont local vers `@fetrag/contracts`.
 *
 * Le lot UI n'est pas autorisé à installer de dépendance : `@fetrag/contracts` n'est donc pas
 * encore déclaré dans `packages/ui/package.json`. Pour éviter toute duplication des libellés et
 * des enums, on importe directement la source du package de contrats (résolution par chemin
 * relatif, fonctionnelle sous Next.js car les packages sont transpilés depuis leur chemin réel).
 *
 * À remplacer par `from '@fetrag/contracts'` dès que la dépendance est déclarée et installée.
 */
export {
  pillars,
  pillarLabels,
  type PillarName,
  roleLabels,
  contentStatusLabels,
  accessLevelLabels,
  courseModalityLabels,
  courseLevelLabels,
  enrollmentStatusLabels,
  activityTypeLabels,
  questionTypeLabels,
  sessionModeLabels,
  attendanceStatusLabels,
  cohortStatusLabels,
  trainingRequestStatusLabels,
  certificateStatusLabels,
  orderStatusLabels,
  paymentStatusLabels,
  paymentMethodLabels,
  eventKindLabels,
  serviceRequestStatusLabels,
  formKindLabels,
  resourceKindLabels,
} from '@fetrag/contracts'
