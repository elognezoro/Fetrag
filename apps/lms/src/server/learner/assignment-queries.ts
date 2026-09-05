import 'server-only'
import { sanitizeHtml } from '@fetrag/cms'
import { isDomainError, type Principal } from '@fetrag/domain'
import { assignments } from '@fetrag/lms-core'
import { readString, resolveFileUrl } from './content'

export type LearnerAssignmentRow = Awaited<ReturnType<typeof assignments.listForUser>>[number]
export type LearnerAssignmentState = LearnerAssignmentRow['state']

export interface RubricCriterion {
  criterion: string
  maxPoints: number
}

export interface AssignmentView {
  data: Awaited<ReturnType<typeof assignments.getForLearner>>
  rubric: RubricCriterion[]
  /** Étude de cas (HTML assaini) fournie dans `Activity.content.caseStudy`. */
  caseStudyHtml: string | null
  /** Fichier déjà déposé, résolu en URL signée consultable. */
  submissionFileUrl: string | null
  rubricScores: Record<string, number> | null
}

/** Grille d'évaluation tolérante : `[{ criterion, maxPoints }]` (format du seed). */
export function readRubric(raw: unknown): RubricCriterion[] {
  if (!Array.isArray(raw)) return []
  const out: RubricCriterion[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const record = item as Record<string, unknown>
    const criterion = typeof record.criterion === 'string' ? record.criterion : typeof record.label === 'string' ? record.label : null
    const maxPoints = typeof record.maxPoints === 'number' ? record.maxPoints : typeof record.points === 'number' ? record.points : null
    if (criterion && maxPoints !== null) out.push({ criterion, maxPoints })
  }
  return out
}

function readScores(raw: unknown): Record<string, number> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const out: Record<string, number> = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'number') out[key] = value
  }
  return Object.keys(out).length ? out : null
}

export async function listMyAssignments(principal: Principal): Promise<LearnerAssignmentRow[]> {
  return assignments.listForUser(principal)
}

export async function getAssignmentView(principal: Principal, assignmentId: string): Promise<AssignmentView | null> {
  let data: AssignmentView['data']
  try {
    data = await assignments.getForLearner(principal, assignmentId)
  } catch (error) {
    if (isDomainError(error)) return null
    throw error
  }
  const caseStudy = readString(data.activity.content, 'caseStudy')
  const submissionFileUrl = data.submission?.fileUrl ? await resolveFileUrl(data.submission.fileUrl, { download: true }) : null
  return {
    data,
    rubric: readRubric(data.assignment.rubric),
    caseStudyHtml: caseStudy ? sanitizeHtml(caseStudy) : null,
    submissionFileUrl,
    rubricScores: readScores(data.submission?.grade?.rubricScores),
  }
}
