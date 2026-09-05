'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { idSchema } from '@fetrag/contracts'
import { can, ForbiddenError } from '@fetrag/domain'
import { successState, type ActionState } from './action-state'
import { runAction } from './context'
import { ORGANIZATION_COOKIE } from './org-context'

/** Mémorise l'organisation active du responsable (cookie de session, portée LMS). */
export async function selectOrganization(input: { organizationId: string }): Promise<ActionState> {
  return runAction(async (principal) => {
    const organizationId = idSchema.parse(input.organizationId)
    if (!can(principal, 'organization.read', { organizationId })) throw new ForbiddenError("Cette organisation n'est pas accessible")
    const store = await cookies()
    store.set(ORGANIZATION_COOKIE, organizationId, { path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 30 })
    revalidatePath('/organisation')
    revalidatePath('/organisation/participants')
    revalidatePath('/organisation/rapports')
    revalidatePath('/demande-formation')
    return successState()
  })
}
