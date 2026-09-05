import { StaffNotFound } from '@/components/staff/staff-not-found'

export default function NotFound() {
  return <StaffNotFound title="Cohorte introuvable" description="Cette cohorte n'existe pas ou ne vous est pas attribuée." backHref="/formateur" backLabel="Retour à l'espace formateur" />
}
