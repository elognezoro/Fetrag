import { StaffNotFound } from '@/components/staff/staff-not-found'

export default function NotFound() {
  return <StaffNotFound title="Élément introuvable" description="Le cours, la question, le modèle ou le compte demandé n'existe pas." backHref="/admin" backLabel="Retour à l'administration" />
}
