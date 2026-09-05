'use server'

import { idSchema, questionTypeSchema, z } from '@fetrag/contracts'
import { questionBank } from '@fetrag/lms-core'
import { guards } from '@/lib/auth'
import { errorState } from './context'
import { searchUsers } from './queries'

/**
 * Recherches à la volée utilisées par les sélecteurs client (ajout de membres, banque de questions).
 * Chaque recherche vérifie la permission du principal via les lecteurs du lot.
 */

export interface UserHit {
  id: string
  label: string
  email: string
  jobTitle: string | null
  employer: string | null
}

export interface QuestionHit {
  id: string
  type: string
  prompt: string
  points: number
  category: string | null
  difficulty: number
  optionCount: number
}

export type LookupResult<T> = { ok: true; items: T[] } | { ok: false; message: string }

const userSearchSchema = z.object({
  q: z.string().trim().max(120).default(''),
  organizationId: idSchema.nullable().optional(),
  excludeCohortId: idSchema.nullable().optional(),
})

export async function searchUsersAction(input: z.input<typeof userSearchSchema>): Promise<LookupResult<UserHit>> {
  try {
    const principal = await guards.api.requireUser()
    const data = userSearchSchema.parse(input)
    const items = await searchUsers(principal, data.q, { organizationId: data.organizationId ?? null, excludeCohortId: data.excludeCohortId ?? null, limit: 40 })
    return { ok: true, items }
  } catch (error) {
    const state = errorState(error, 'Recherche impossible pour le moment.')
    return { ok: false, message: state.status === 'error' ? state.message : 'Recherche impossible' }
  }
}

const questionSearchSchema = z.object({
  q: z.string().trim().max(200).default(''),
  type: questionTypeSchema.optional(),
  category: z.string().trim().max(120).optional(),
  excludeIds: z.array(idSchema).max(200).default([]),
})

export async function searchQuestionsAction(input: z.input<typeof questionSearchSchema>): Promise<LookupResult<QuestionHit>> {
  try {
    const principal = await guards.api.requireUser()
    const data = questionSearchSchema.parse(input)
    const result = await questionBank.list(principal, { q: data.q || undefined, type: data.type, category: data.category || undefined, pageSize: 50 })
    const excluded = new Set(data.excludeIds)
    return {
      ok: true,
      items: result.items
        .filter((q) => !excluded.has(q.id))
        .map((q) => ({ id: q.id, type: q.type, prompt: q.prompt, points: q.points, category: q.category, difficulty: q.difficulty, optionCount: q.options.length })),
    }
  } catch (error) {
    const state = errorState(error, 'Recherche impossible pour le moment.')
    return { ok: false, message: state.status === 'error' ? state.message : 'Recherche impossible' }
  }
}
