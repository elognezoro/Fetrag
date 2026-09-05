import type { ReactNode } from 'react'
import { TrainerSpace } from '@/components/staff/spaces'

export default function Layout({ children }: { children: ReactNode }) {
  return <TrainerSpace>{children}</TrainerSpace>
}
