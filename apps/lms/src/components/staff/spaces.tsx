import 'server-only'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { prisma } from '@fetrag/db'
import { pendingCoordinationStatuses } from '@fetrag/lms-core'
import { guards } from '@/lib/auth'
import { accessibleSpaces, adminNav, canAccessAdminSpace, canAccessCoordinationSpace, canAccessOrganizationSpace, canAccessTrainerSpace, coordinationNav, organisationNav, trainerNav } from '@/server/staff/navigation'
import { currentOrganization } from '@/server/staff/org-context'
import { NoOrganization } from './no-organization'
import { StaffShell } from './staff-shell'

/**
 * Coquilles serveur des espaces institutionnels : chacune vérifie l'accès (identité + rôle + portée)
 * puis monte `StaffShell` avec la navigation adaptée. Utilisées par les layouts de `(staff)`.
 */

export async function OrganisationSpace({ children, context = 'organisation' }: { children: ReactNode; context?: 'organisation' | 'demande' }) {
  const principal = await guards.requireUser(context === 'demande' ? '/demande-formation' : '/organisation')
  if (!canAccessOrganizationSpace(principal)) return <NoOrganization context={context} />
  const { organizations, current } = await currentOrganization(principal)
  if (!current) return <NoOrganization context={context} />
  const subtitle = organizations.length > 1 ? `${organizations.length} organisations` : (current.acronym ?? current.name)
  return (
    <StaffShell space="Organisation" subtitle={subtitle} tone="blue" items={organisationNav} spaces={accessibleSpaces(principal)}>
      {children}
    </StaffShell>
  )
}

export async function TrainerSpace({ children }: { children: ReactNode }) {
  const principal = await guards.requireUser('/formateur')
  if (!canAccessTrainerSpace(principal)) redirect('/acces-refuse')
  return (
    <StaffShell space="Formateur" subtitle={principal.name ?? principal.email} tone="green" items={trainerNav} spaces={accessibleSpaces(principal)}>
      {children}
    </StaffShell>
  )
}

export async function CoordinationSpace({ children }: { children: ReactNode }) {
  const principal = await guards.requireCan('training_request.decide', {}, '/coordination')
  if (!canAccessCoordinationSpace(principal)) redirect('/acces-refuse')
  const pendingRequests = await prisma.trainingRequest.count({ where: { status: { in: [...pendingCoordinationStatuses, 'INFO_REQUESTED'] } } }).catch(() => 0)
  return (
    <StaffShell space="Coordination" subtitle="Pilotage de la formation" tone="gold" items={coordinationNav({ pendingRequests })} spaces={accessibleSpaces(principal)}>
      {children}
    </StaffShell>
  )
}

export async function AdminSpace({ children }: { children: ReactNode }) {
  const principal = await guards.requireCan('course.publish', {}, '/admin')
  if (!canAccessAdminSpace(principal)) redirect('/acces-refuse')
  return (
    <StaffShell space="Administration" subtitle="Cours, questions, certificats, comptes" tone="navy" items={adminNav(principal)} spaces={accessibleSpaces(principal)}>
      {children}
    </StaffShell>
  )
}
