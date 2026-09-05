import type { Metadata } from 'next'
import { CertificatePreview } from '@/components/staff/certificate-preview'
import { StaffPageHeader, StaffSection } from '@/components/staff/staff-page'
import { TemplateForm } from '@/components/staff/template-form'
import { guards } from '@/lib/auth'
import { listCoursesForSelect } from '@/server/staff/queries'

export const metadata: Metadata = { title: 'Nouveau modèle de certificat' }
export const dynamic = 'force-dynamic'

/** Création d'un modèle : le formulaire s'ouvre immédiatement, l'aperçu montre la mise en page par défaut. */
export default async function NewCertificateTemplatePage() {
  await guards.requireCan('certificate.issue', {}, '/admin/certificats/nouveau')
  const courses = await listCoursesForSelect()
  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Modèles de certificats', href: '/admin/certificats' }, { label: 'Nouveau modèle' }]}
        eyebrow="Certification"
        title={
          <>
            Créer un <span className="italic text-gold-700">modèle de certificat</span>
          </>
        }
        description="Nom, nature (attestation ou certificat), cours concerné, textes imprimés, signataire, critères d'éligibilité et validité. L'aperçu ci-dessous reprend la mise en page du PDF."
        tone="gold"
        actions={<TemplateForm courses={courses.map((c) => ({ id: c.id, code: c.code, title: c.title }))} defaultOpen successHref="/admin/certificats/{id}" />}
      />
      <StaffSection number="01" title="Aperçu de la mise en page par défaut" tone="gold" description="Les valeurs par défaut correspondent à l'attestation du programme 2026 signée par le Secrétaire Général.">
        <CertificatePreview kind="ATTESTATION" titleText="Attestation de formation" bodyText="a suivi avec succès la formation" signatoryName="Jocelyn Louis NGOMA" signatoryTitle="Secrétaire Général de la FETRAG" />
      </StaffSection>
    </>
  )
}
