import type { ReactNode } from 'react'
import { OrganisationSpace } from '@/components/staff/spaces'

export default function Layout({ children }: { children: ReactNode }) {
  return <OrganisationSpace context="demande">{children}</OrganisationSpace>
}
