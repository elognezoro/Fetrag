import type { ReactNode } from 'react'
import { AdminSpace } from '@/components/staff/spaces'

export default function Layout({ children }: { children: ReactNode }) {
  return <AdminSpace>{children}</AdminSpace>
}
