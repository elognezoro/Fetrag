import type { ReactNode } from 'react'

/**
 * Enveloppe des pages publiques de fetrag.ga. L'en-tête et le pied de page viennent du layout racine ;
 * ce groupe de routes ne fait qu'isoler les pages institutionnelles des espaces authentifiés.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-[60dvh] flex-col">{children}</div>
}
