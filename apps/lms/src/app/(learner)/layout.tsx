import type { ReactNode } from 'react'

/**
 * Groupe de routes de l'expérience apprenant (accueil, catalogue, fiches, tableau de bord, lecteur...).
 * Chaque page lit la session pour adapter ses actions : rendu dynamique sur tout le groupe.
 * La barre de navigation et le pied de page viennent du layout racine.
 */
export const dynamic = 'force-dynamic'

export default function LearnerLayout({ children }: { children: ReactNode }) {
  return children
}
