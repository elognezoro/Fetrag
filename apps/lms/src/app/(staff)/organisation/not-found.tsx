import { StaffNotFound } from '@/components/staff/staff-not-found'

export default function NotFound() {
  return <StaffNotFound title="Élément introuvable" description="Cette demande, cohorte ou ressource n'existe pas ou n'appartient pas à votre organisation." backHref="/organisation" backLabel="Retour au tableau de bord" />
}
