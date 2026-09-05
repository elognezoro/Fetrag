import { StaffNotFound } from '@/components/staff/staff-not-found'

export default function NotFound() {
  return <StaffNotFound title="Demande introuvable" description="Cette demande de formation n'existe pas ou n'appartient pas à votre organisation." backHref="/demande-formation" backLabel="Retour à mes demandes" />
}
