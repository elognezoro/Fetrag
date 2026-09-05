import { StaffNotFound } from '@/components/staff/staff-not-found'

export default function NotFound() {
  return <StaffNotFound title="Élément introuvable" description="La demande, la cohorte, le certificat ou l'organisation demandé n'existe pas." backHref="/coordination" backLabel="Retour à la coordination" />
}
