import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Award, Star } from 'lucide-react'
import { certificateStatusLabels } from '@fetrag/contracts'
import { formatDate, formatDateTime, isDomainError } from '@fetrag/domain'
import { Badge, Card, CardContent, CardHeader, CardTitle, EmptyState, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@fetrag/ui'
import { CertificateRowActions } from '@/components/staff/certificate-actions'
import { CertificatePreview } from '@/components/staff/certificate-preview'
import { DetailItem, DetailList, StaffPageHeader, StaffSection } from '@/components/staff/staff-page'
import { RemoveTemplateButton, TemplateForm } from '@/components/staff/template-form'
import { guards } from '@/lib/auth'
import { getTemplateAdmin } from '@/server/staff/admin-queries'
import { listCoursesForSelect } from '@/server/staff/queries'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

async function load(id: string) {
  const principal = await guards.requireCan('certificate.issue', {}, `/admin/certificats/${id}`)
  try {
    return await getTemplateAdmin(principal, id)
  } catch (error) {
    if (isDomainError(error) && (error.code === 'NOT_FOUND' || error.code === 'FORBIDDEN')) notFound()
    throw error
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const template = await load(id)
  return { title: `Modèle · ${template.name}` }
}

/** Fiche d'un modèle : aperçu visuel, critères, édition, suppression, certificats émis avec ce modèle. */
export default async function AdminCertificateTemplatePage({ params }: PageProps) {
  const { id } = await params
  const [template, courses] = await Promise.all([load(id), listCoursesForSelect()])
  const criteria = (template.criteria ?? {}) as { minScore?: number; minAttendanceRate?: number; requireCompletion?: boolean }

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Modèles de certificats', href: '/admin/certificats' }, { label: template.name }]}
        eyebrow={template.kind === 'CERTIFICATE' ? 'Certificat' : 'Attestation'}
        title={template.name}
        description={template.course ? `Modèle dédié au cours ${template.course.code} · ${template.course.title}.` : 'Modèle générique applicable à tous les cours sans modèle dédié.'}
        tone="gold"
        meta={
          <>
            {template.isDefault ? (
              <Badge variant="gold">
                <Star className="size-3" aria-hidden="true" />
                Modèle par défaut
              </Badge>
            ) : null}
            <span>{template._count.certificates} certificat(s) émis</span>
            <span>Créé le {formatDate(template.createdAt)}</span>
          </>
        }
        actions={
          <>
            <TemplateForm
              courses={courses.map((c) => ({ id: c.id, code: c.code, title: c.title }))}
              template={{
                id: template.id,
                name: template.name,
                kind: template.kind,
                courseId: template.courseId,
                titleText: template.titleText,
                bodyText: template.bodyText,
                signatoryName: template.signatoryName,
                signatoryTitle: template.signatoryTitle,
                criteria,
                validityMonths: template.validityMonths,
                isDefault: template.isDefault,
              }}
            />
            <RemoveTemplateButton templateId={template.id} name={template.name} usage={template._count.certificates} redirectTo="/admin/certificats" />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StaffSection number="01" title="Aperçu" tone="gold" className="mb-0" description="Mise en page du PDF : sceau FETRAG, textes imprimés, signataire, numéro séquentiel et code QR de vérification.">
            <CertificatePreview kind={template.kind} titleText={template.titleText} bodyText={template.bodyText} signatoryName={template.signatoryName} signatoryTitle={template.signatoryTitle} courseTitle={template.course?.title ?? null} validityMonths={template.validityMonths} />
          </StaffSection>
        </div>
        <Card pillar="defense" className="h-fit">
          <CardHeader>
            <CardTitle as="h3">Critères d’éligibilité</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailList columns={2}>
              <DetailItem label="Score minimal">{criteria.minScore ?? 60} %</DetailItem>
              <DetailItem label="Assiduité minimale">{criteria.minAttendanceRate ?? 0} %</DetailItem>
              <DetailItem label="Formation terminée">{criteria.requireCompletion === false ? 'Non requise' : 'Requise'}</DetailItem>
              <DetailItem label="Validité">{template.validityMonths ? `${template.validityMonths} mois` : 'Sans expiration'}</DetailItem>
            </DetailList>
            <p className="mt-4 text-xs text-neutral-500">Un score nul (cours sans évaluation notée) ne bloque pas le critère de score. L’assiduité n’est contrôlée que pour les inscriptions en cohorte avec sessions.</p>
          </CardContent>
        </Card>
      </div>

      <StaffSection number="02" title="Certificats émis avec ce modèle" tone="navy" className="mt-10" actions={template._count.certificates > 10 ? <Link href={`/coordination/certificats${template.courseId ? `?cours=${template.courseId}` : ''}`} className="text-sm font-semibold text-blue-700 hover:underline">Tout le registre</Link> : undefined}>
        {template.certificates.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Titulaire</TableHead>
                <TableHead>Formation</TableHead>
                <TableHead>Émis le</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>PDF</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {template.certificates.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/certificats/${c.id}`} className="font-semibold text-navy hover:underline">
                      {c.number}
                    </Link>
                  </TableCell>
                  <TableCell>{c.holderName}</TableCell>
                  <TableCell>{c.courseTitle}</TableCell>
                  <TableCell className="text-neutral-600">{formatDateTime(c.issuedAt)}</TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} labels={certificateStatusLabels} size="sm" />
                  </TableCell>
                  <TableCell>{c.pdfUrl ? <Badge variant="success" size="sm">Disponible</Badge> : <Badge variant="neutral" size="sm">En génération</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <CertificateRowActions certificateId={c.id} number={c.number} status={c.status} hasPdf={Boolean(c.pdfUrl)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Card>
            <EmptyState compact icon={Award} title="Aucun certificat" description="Ce modèle n'a encore servi à aucune émission." />
          </Card>
        )}
      </StaffSection>
    </>
  )
}
