import type { ReactNode } from 'react'
import { CoordinationSpace } from '@/components/staff/spaces'

export default function Layout({ children }: { children: ReactNode }) {
  return <CoordinationSpace>{children}</CoordinationSpace>
}
