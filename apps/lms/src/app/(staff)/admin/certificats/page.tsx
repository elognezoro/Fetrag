import type { Metadata } from 'next'
import Link from 'next/link'
import { Award, Plus, Star } from 'lucide-react'
import { certificateStatusLabels } from '@fetrag/contracts'
import { formatDate } from '@fetrag/domain'
import { Badge, Button, Card, CardContent, CertificateSeal, EmptyState, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@fetrag/ui'
import { CertificateRowActions } from '@/components/staff/certificate-actions'
import { StaffPageHeader, StaffSection } from '@/components/staff/staff-page'
import { RemoveTemplateButton } from '@/components/staff/template-form'
import { guards } from '@/lib/auth'
import { listTemplatesAdmin } from '@/server/staff/admin-queries'

export const metadata: Metadata = { title: 'Modèles de certificats' }
export const dynamic = 'force-dynamic'

/** Modèles d'attestations et de certificats (liste, défaut, critères) et derniers certificats émis avec régénération du PDF. */
export default async function AdminCertificatesPage() {
  const principal = await guards.requireCan('certificate.issue', {}, '/admin/certificats')
  const { templates, recent } = await listTemplatesAdmin(principal)
  const defaultTemplate = templates.find((t) => t.isDefault) ?? null

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Modèles de certificats' }]}
        eyebrow="Certification"
        title={
          <>
            {templates.length} modèle{templates.length > 1 ? 's' : ''} <span className="italic text-gold-700">d’attestations et de certificats</span>
          </>
        }
        description="Un modèle définit les textes imprimés, le signataire, les critères d'éligibilité (score, assiduité, achèvement) et la validité. Le modèle par défaut s'applique aux cours sans modèle dédié."
        tone="gold"
        actions={
          <>
            <Button asChild variant="primary" size="sm">
              <Link href="/admin/certificats/nouveau">
                <Plus aria-hidden="true" />
                Nouveau modèle
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/coordination/certificats">Registre des certificats</Link>
            </Button>
          </>
        }
      />

      <Card pillar="defense" className="mb-8">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <CertificateSeal size={84} decorative />
          <div className="text-sm text-neutral-700">
            <p className="font-display text-lg font-semibold text-navy">{defaultTemplate ? `Modèle par défaut : ${defaultTemplate.name}` : 'Aucun modèle par défaut'}</p>
            <p>{defaultTemplate ? 'Utilisé à la clôture des cohortes et à l’achèvement automatique lorsque le cours n’a pas de modèle dédié.' : 'Sans modèle par défaut, seuls les cours disposant d’un modèle dédié peuvent délivrer un certificat.'}</p>
          </div>
        </CardContent>
      </Card>

      <StaffSection number="01" title="Modèles" tone="gold">
        {templates.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modèle</TableHead>
                <TableHead>Cours</TableHead>
                <TableHead>Critères</TableHead>
                <TableHead>Validité</TableHead>
                <TableHead>Émis</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((t) => {
                const criteria = (t.criteria ?? {}) as { minScore?: number; minAttendanceRate?: number; requireCompletion?: boolean }
                return (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Link href={`/admin/certificats/${t.id}`} className="font-semibold text-navy hover:underline">
                        {t.name}
                      </Link>
                      <span className="mt-1 flex flex-wrap gap-1">
                        <Badge variant={t.kind === 'CERTIFICATE' ? 'blue' : 'neutral'} size="sm">
                          {t.kind === 'CERTIFICATE' ? 'Certificat' : 'Attestation'}
                        </Badge>
                        {t.isDefault ? (
                          <Badge variant="gold" size="sm">
                            <Star className="size-3" aria-hidden="true" />
                            Par défaut
                          </Badge>
                        ) : null}
                      </span>
                    </TableCell>
                    <TableCell className="text-neutral-700">{t.course ? `${t.course.code} · ${t.course.title}` : <span className="text-neutral-400">Tous les cours</span>}</TableCell>
                    <TableCell className="text-sm text-neutral-700">
                      Score ≥ {criteria.minScore ?? 60} %
                      <span className="block text-xs text-neutral-500">
                        Assiduité ≥ {criteria.minAttendanceRate ?? 0} %{criteria.requireCompletion === false ? '' : ' · formation terminée'}
                      </span>
                    </TableCell>
                    <TableCell className="text-neutral-700">{t.validityMonths ? `${t.validityMonths} mois` : 'Sans expiration'}</TableCell>
                    <TableCell>{t._count.certificates}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-1">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/certificats/${t.id}`}>Ouvrir</Link>
                        </Button>
                        <RemoveTemplateButton templateId={t.id} name={t.name} usage={t._count.certificates} />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <Card>
            <EmptyState
              icon={Award}
              title="Aucun modèle"
              description="Créez un modèle d'attestation par défaut pour permettre l'émission des certificats à la clôture des cohortes."
              action={
                <Button asChild variant="primary">
                  <Link href="/admin/certificats/nouveau">Créer un modèle</Link>
                </Button>
              }
            />
          </Card>
        )}
      </StaffSection>

      <StaffSection
        number="02"
        title="Derniers certificats émis"
        tone="navy"
        description="Le PDF est généré par la file de jobs ; relancez la génération si un document manque ou après modification d'un modèle."
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/coordination/certificats">Tout le registre</Link>
          </Button>
        }
      >
        {recent.items.length ? (
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
              {recent.items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/certificats/${c.id}`} className="font-semibold text-navy hover:underline">
                      {c.number}
                    </Link>
                  </TableCell>
                  <TableCell>{c.holderName}</TableCell>
                  <TableCell>
                    {c.courseTitle}
                    {c.cohort ? <span className="block text-xs text-neutral-500">{c.cohort.name}</span> : null}
                  </TableCell>
                  <TableCell className="text-neutral-600">{formatDate(c.issuedAt)}</TableCell>
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
            <EmptyState compact icon={Award} title="Aucun certificat émis" description="Les certificats émis à la clôture des cohortes apparaîtront ici." />
          </Card>
        )}
      </StaffSection>
    </>
  )
}
