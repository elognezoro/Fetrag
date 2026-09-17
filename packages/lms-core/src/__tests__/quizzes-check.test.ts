import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Gardes de la vérification immédiate (mode entraînement) `quizzes.check` :
 * propriétaire, statut de la tentative, configuration du quiz (correction affichée,
 * plusieurs tentatives), temps imparti, questions hors quiz ignorées, verdicts.
 * Prisma est doublé : aucun accès base.
 */

const { attemptFindUnique } = vi.hoisted(() => ({ attemptFindUnique: vi.fn() }))

vi.mock('@fetrag/db', () => ({
  prisma: {
    attempt: { findUnique: attemptFindUnique },
    systemSetting: { findUnique: vi.fn().mockResolvedValue(null) },
  },
}))

import { check } from '../quizzes'
import type { Principal } from '../types'

const learner: Principal = { id: 'user-1', roles: ['LEARNER'], scopes: {} } as unknown as Principal

const QUESTION_ID = '11111111-1111-4111-8111-111111111111'
const OTHER_QUESTION_ID = '22222222-2222-4222-8222-222222222222'
const ATTEMPT_ID = '33333333-3333-4333-8333-333333333333'
const OPTION_OK = '44444444-4444-4444-8444-444444444444'
const OPTION_KO = '55555555-5555-4555-8555-555555555555'

function attemptFixture(overrides: { quiz?: Record<string, unknown>; attempt?: Record<string, unknown> } = {}) {
  return {
    id: ATTEMPT_ID,
    userId: 'user-1',
    status: 'IN_PROGRESS',
    startedAt: new Date(),
    quiz: {
      id: 'quiz-1',
      activityId: 'activity-1',
      isSurvey: false,
      showCorrection: true,
      maxAttempts: 3,
      timeLimitMinutes: null,
      passScore: 60,
      questions: [
        {
          questionId: QUESTION_ID,
          points: 1,
          question: {
            id: QUESTION_ID,
            type: 'SINGLE_CHOICE',
            points: 1,
            explanation: 'Article 13 du Code du travail.',
            config: null,
            options: [
              { id: OPTION_OK, label: 'In dubio pro operario', isCorrect: true, feedback: null, position: 1, matchValue: null },
              { id: OPTION_KO, label: 'Non bis in idem', isCorrect: false, feedback: null, position: 2, matchValue: null },
            ],
          },
        },
      ],
      ...overrides.quiz,
    },
    ...overrides.attempt,
  }
}

function input(optionId: string, questionId = QUESTION_ID) {
  return { attemptId: ATTEMPT_ID, answers: [{ questionId, response: { type: 'choice' as const, optionIds: [optionId] } }] }
}

beforeEach(() => {
  attemptFindUnique.mockReset()
})

describe('quizzes.check (vérification immédiate)', () => {
  it('rejette une tentative inexistante', async () => {
    attemptFindUnique.mockResolvedValue(null)
    await expect(check(learner, input(OPTION_OK))).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it("rejette la tentative d'un autre apprenant", async () => {
    attemptFindUnique.mockResolvedValue(attemptFixture({ attempt: { userId: 'user-2' } }))
    await expect(check(learner, input(OPTION_OK))).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('rejette une tentative déjà soumise', async () => {
    attemptFindUnique.mockResolvedValue(attemptFixture({ attempt: { status: 'SUBMITTED' } }))
    await expect(check(learner, input(OPTION_OK))).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' })
  })

  it('reste indisponible quand la correction est masquée (examen final)', async () => {
    attemptFindUnique.mockResolvedValue(attemptFixture({ quiz: { showCorrection: false } }))
    await expect(check(learner, input(OPTION_OK))).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' })
  })

  it('reste indisponible pour un quiz à tentative unique (pas d\'oracle avant remise)', async () => {
    attemptFindUnique.mockResolvedValue(attemptFixture({ quiz: { maxAttempts: 1 } }))
    await expect(check(learner, input(OPTION_OK))).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' })
  })

  it('reste indisponible pour un questionnaire de satisfaction', async () => {
    attemptFindUnique.mockResolvedValue(attemptFixture({ quiz: { isSurvey: true } }))
    await expect(check(learner, input(OPTION_OK))).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' })
  })

  it('rejette au-delà du temps imparti (tolérance comprise)', async () => {
    attemptFindUnique.mockResolvedValue(
      attemptFixture({ quiz: { timeLimitMinutes: 20 }, attempt: { startedAt: new Date(Date.now() - 22 * 60 * 1000) } }),
    )
    await expect(check(learner, input(OPTION_OK))).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' })
  })

  it('rend un verdict correct avec feedback, sans persister', async () => {
    attemptFindUnique.mockResolvedValue(attemptFixture())
    const verdicts = await check(learner, input(OPTION_OK))
    expect(verdicts).toEqual([{ questionId: QUESTION_ID, isCorrect: true, feedback: 'Article 13 du Code du travail.', needsManualGrading: false }])
  })

  it('rend un verdict incorrect pour une mauvaise réponse', async () => {
    attemptFindUnique.mockResolvedValue(attemptFixture())
    const verdicts = await check(learner, input(OPTION_KO))
    expect(verdicts).toHaveLength(1)
    expect(verdicts[0]).toMatchObject({ questionId: QUESTION_ID, isCorrect: false })
  })

  it('ignore une question étrangère au quiz et déduplique par question', async () => {
    attemptFindUnique.mockResolvedValue(attemptFixture())
    const verdicts = await check(learner, {
      attemptId: ATTEMPT_ID,
      answers: [
        { questionId: OTHER_QUESTION_ID, response: { type: 'choice', optionIds: [OPTION_OK] } },
        { questionId: QUESTION_ID, response: { type: 'choice', optionIds: [OPTION_KO] } },
        { questionId: QUESTION_ID, response: { type: 'choice', optionIds: [OPTION_OK] } },
      ],
    })
    expect(verdicts).toEqual([{ questionId: QUESTION_ID, isCorrect: true, feedback: 'Article 13 du Code du travail.', needsManualGrading: false }])
  })
})
