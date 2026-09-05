/**
 * Export de réversibilité (chapitre 41 du CDC) : utilisateurs, organisations, cours,
 * inscriptions, résultats, certificats, paiements (et, en complément, cohortes et demandes
 * institutionnelles) au format JSON et CSV, directement depuis PostgreSQL via Prisma.
 *
 * Lancement (depuis la racine du dépôt ; `tsx` et le client Prisma sont fournis par @fetrag/db) :
 *
 *   pnpm --filter @fetrag/db exec tsx ../../scripts/export-data.ts
 *   pnpm --filter @fetrag/db exec tsx ../../scripts/export-data.ts --out ../../exports/2026-09-04 --format csv
 *   pnpm --filter @fetrag/db exec tsx ../../scripts/export-data.ts --only users,certificates --page-size 500
 *
 * Options :
 *   --out <dossier>        dossier de sortie (défaut : exports/<horodatage> à la racine du dépôt)
 *   --format json|csv|both (défaut : both)
 *   --only a,b,c           sous-ensemble des jeux de données (voir DATASETS)
 *   --page-size <n>        taille des pages lues en base (défaut : 200)
 *
 * Le script lit `DATABASE_URL` dans l'environnement ou, à défaut, dans le fichier `.env` racine.
 * Aucune donnée secrète n'est exportée (hash de mot de passe, secret TOTP, codes de secours,
 * jetons de session exclus). Les exports contiennent des données personnelles : à stocker chiffrés
 * et à supprimer selon la politique de conservation (runbook `scripts/backup.md`).
 */

import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import type { PrismaClient } from '@prisma/client'

// -----------------------------------------------------------------------------
// Localisation du dépôt, chargement de l'environnement et du client Prisma
// -----------------------------------------------------------------------------

function findRepoRoot(start: string): string {
  let current = path.resolve(start)
  for (let i = 0; i < 10; i += 1) {
    if (fs.existsSync(path.join(current, 'pnpm-workspace.yaml'))) return current
    const parent = path.dirname(current)
    if (parent === current) break
    current = parent
  }
  throw new Error('Racine du monorepo introuvable (pnpm-workspace.yaml).')
}

const scriptDir = typeof __dirname === 'string' ? __dirname : process.cwd()
const repoRoot = findRepoRoot(scriptDir)

/** Parser .env minimal (mêmes règles que next.config.ts) ; n'écrase jamais une variable existante. */
function loadRootEnv(): void {
  const envPath = path.join(repoRoot, '.env')
  if (!fs.existsSync(envPath)) return
  const content = fs.readFileSync(envPath, 'utf8')
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const separator = line.indexOf('=')
    if (separator <= 0) continue
    const key = line.slice(0, separator).trim().replace(/^export\s+/, '')
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue
    let value = line.slice(separator + 1).trim()
    const first = value.charAt(0)
    const last = value.charAt(value.length - 1)
    if (value.length >= 2 && ((first === '"' && last === '"') || (first === "'" && last === "'"))) {
      value = value.slice(1, -1)
    } else {
      const comment = value.indexOf(' #')
      if (comment >= 0) value = value.slice(0, comment).trim()
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

if (!process.env.DATABASE_URL) loadRootEnv()
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL est introuvable (environnement ou .env racine).')
  process.exit(2)
}

/**
 * Le client Prisma généré vit dans packages/db (postinstall `prisma generate`). Le script n'ayant
 * pas de node_modules propre, on le résout depuis ce package.
 */
const requireFromDb = createRequire(path.join(repoRoot, 'packages', 'db', 'package.json'))
const { PrismaClient: PrismaClientCtor } = requireFromDb('@prisma/client') as { PrismaClient: new (options?: { log?: Array<'error' | 'warn'> }) => PrismaClient }
const prisma: PrismaClient = new PrismaClientCtor({ log: ['error'] })

// -----------------------------------------------------------------------------
// Options
// -----------------------------------------------------------------------------

type Format = 'json' | 'csv' | 'both'

interface Options {
  out: string
  format: Format
  only: Set<string> | null
  pageSize: number
}

function timestampSlug(date: Date): string {
  return date.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19)
}

function parseOptions(argv: string[]): Options {
  const options: Options = {
    out: path.join(repoRoot, 'exports', timestampSlug(new Date())),
    format: 'both',
    only: null,
    pageSize: 200,
  }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    const next = argv[i + 1]
    switch (arg) {
      case '--out':
        if (!next) fail('--out attend un dossier')
        options.out = path.resolve(process.cwd(), next)
        i += 1
        break
      case '--format':
        if (next !== 'json' && next !== 'csv' && next !== 'both') fail('--format attend json, csv ou both')
        options.format = next
        i += 1
        break
      case '--only':
        if (!next) fail('--only attend une liste séparée par des virgules')
        options.only = new Set(next.split(',').map((s) => s.trim()).filter(Boolean))
        i += 1
        break
      case '--page-size': {
        const value = Number(next)
        if (!Number.isInteger(value) || value < 1 || value > 5000) fail('--page-size attend un entier entre 1 et 5000')
        options.pageSize = value
        i += 1
        break
      }
      case '--help':
      case '-h':
        console.info('Usage : tsx scripts/export-data.ts [--out <dossier>] [--format json|csv|both] [--only a,b] [--page-size n]')
        process.exit(0)
      // eslint-disable-next-line no-fallthrough
      default:
        fail(`Option inconnue : ${arg}`)
    }
  }
  return options
}

function fail(message: string): never {
  console.error(message)
  process.exit(2)
}

// -----------------------------------------------------------------------------
// Écriture JSON (tableau écrit au fil de l'eau) et CSV (séparateur « ; », BOM UTF-8)
// -----------------------------------------------------------------------------

type Row = Record<string, unknown>

const CSV_SEPARATOR = ';'
const BOM = '\uFEFF'

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  let text: string
  if (value instanceof Date) text = value.toISOString()
  else if (typeof value === 'object') text = JSON.stringify(value)
  else text = String(value)
  // Neutralise les injections de formules dans les tableurs.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  if (text.includes(CSV_SEPARATOR) || text.includes('"') || text.includes('\n') || text.includes('\r')) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

class DatasetWriter {
  private readonly jsonStream: fs.WriteStream | null
  private readonly csvStream: fs.WriteStream | null
  private csvColumns: string[] | null = null
  private count = 0

  constructor(directory: string, name: string, format: Format) {
    this.jsonStream = format === 'csv' ? null : fs.createWriteStream(path.join(directory, `${name}.json`), { encoding: 'utf8' })
    this.csvStream = format === 'json' ? null : fs.createWriteStream(path.join(directory, `${name}.csv`), { encoding: 'utf8' })
    this.jsonStream?.write('[\n')
    this.csvStream?.write(BOM)
  }

  write(row: Row): void {
    if (this.jsonStream) {
      this.jsonStream.write(`${this.count > 0 ? ',\n' : ''}${JSON.stringify(row, jsonReplacer, 2)}`)
    }
    if (this.csvStream) {
      if (!this.csvColumns) {
        this.csvColumns = Object.keys(row)
        this.csvStream.write(`${this.csvColumns.map(csvCell).join(CSV_SEPARATOR)}\n`)
      }
      const columns = this.csvColumns
      this.csvStream.write(`${columns.map((c) => csvCell(row[c])).join(CSV_SEPARATOR)}\n`)
    }
    this.count += 1
  }

  async close(): Promise<number> {
    const streams: fs.WriteStream[] = []
    if (this.jsonStream) {
      this.jsonStream.write('\n]\n')
      streams.push(this.jsonStream)
    }
    if (this.csvStream) {
      if (!this.csvColumns) this.csvStream.write('\n')
      streams.push(this.csvStream)
    }
    await Promise.all(streams.map((s) => new Promise<void>((resolve, reject) => s.end((error?: Error | null) => (error ? reject(error) : resolve())))))
    return this.count
  }
}

function jsonReplacer(_key: string, value: unknown): unknown {
  if (typeof value === 'bigint') return value.toString()
  return value
}

// -----------------------------------------------------------------------------
// Pagination par curseur (id croissant) : mémoire bornée quel que soit le volume
// -----------------------------------------------------------------------------

async function paginate<T extends { id: string }>(
  fetchPage: (cursor: string | null, take: number) => Promise<T[]>,
  pageSize: number,
  onRow: (row: T) => void,
): Promise<void> {
  let cursor: string | null = null
  for (;;) {
    const page: T[] = await fetchPage(cursor, pageSize)
    for (const row of page) onRow(row)
    const last = page[page.length - 1]
    if (!last || page.length < pageSize) break
    cursor = last.id
  }
}

function cursorArgs(cursor: string | null, take: number) {
  return { take, skip: cursor ? 1 : 0, cursor: cursor ? { id: cursor } : undefined, orderBy: { id: 'asc' as const } }
}

// -----------------------------------------------------------------------------
// Jeux de données
// -----------------------------------------------------------------------------

type DatasetRunner = (writer: DatasetWriter, pageSize: number) => Promise<void>

const DATASETS: Record<string, { description: string; run: DatasetRunner }> = {
  users: {
    description: 'Comptes, rôles (avec portée), consentements et appartenances - sans secret',
    run: (writer, pageSize) =>
      paginate(
        (cursor, take) =>
          prisma.user.findMany({
            ...cursorArgs(cursor, take),
            select: {
              id: true,
              email: true,
              emailVerified: true,
              name: true,
              firstName: true,
              lastName: true,
              phone: true,
              jobTitle: true,
              employer: true,
              locale: true,
              timezone: true,
              isActive: true,
              totpEnabled: true,
              lastLoginAt: true,
              createdAt: true,
              updatedAt: true,
              roleAssignments: { select: { role: true, scopeType: true, scopeId: true, expiresAt: true, createdAt: true } },
              consents: { select: { kind: true, granted: true, version: true, createdAt: true } },
              memberships: { select: { organizationId: true, title: true, isManager: true, joinedAt: true } },
              accounts: { select: { provider: true, providerAccountId: true } },
            },
          }),
        pageSize,
        (u) =>
          writer.write({
            id: u.id,
            email: u.email,
            emailVerified: u.emailVerified,
            name: u.name,
            firstName: u.firstName,
            lastName: u.lastName,
            phone: u.phone,
            jobTitle: u.jobTitle,
            employer: u.employer,
            locale: u.locale,
            timezone: u.timezone,
            isActive: u.isActive,
            mfaEnabled: u.totpEnabled,
            lastLoginAt: u.lastLoginAt,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
            roles: u.roleAssignments,
            consents: u.consents,
            memberships: u.memberships,
            externalIdentities: u.accounts,
          }),
      ),
  },

  organizations: {
    description: 'Organisations affiliées, contacts et membres',
    run: (writer, pageSize) =>
      paginate(
        (cursor, take) =>
          prisma.organization.findMany({
            ...cursorArgs(cursor, take),
            include: {
              contacts: { select: { fullName: true, role: true, email: true, phone: true, isPrimary: true, userId: true } },
              memberships: { select: { userId: true, title: true, isManager: true, joinedAt: true, user: { select: { email: true } } } },
            },
          }),
        pageSize,
        (o) =>
          writer.write({
            id: o.id,
            slug: o.slug,
            name: o.name,
            acronym: o.acronym,
            sector: o.sector,
            description: o.description,
            address: o.address,
            city: o.city,
            country: o.country,
            phone: o.phone,
            email: o.email,
            website: o.website,
            isAffiliate: o.isAffiliate,
            isActive: o.isActive,
            memberCount: o.memberCount,
            createdAt: o.createdAt,
            updatedAt: o.updatedAt,
            contacts: o.contacts,
            members: o.memberships.map((m) => ({ userId: m.userId, email: m.user.email, title: m.title, isManager: m.isManager, joinedAt: m.joinedAt })),
          }),
      ),
  },

  courses: {
    description: 'Catalogue : cours, versions, modules, leçons et activités (structure et règles)',
    run: (writer, pageSize) =>
      paginate(
        (cursor, take) =>
          prisma.course.findMany({
            ...cursorArgs(cursor, take),
            include: {
              category: { select: { name: true, slug: true } },
              trainers: { select: { userId: true, user: { select: { email: true } } } },
              versions: {
                orderBy: { version: 'asc' },
                include: {
                  modules: {
                    orderBy: { position: 'asc' },
                    include: {
                      lessons: {
                        orderBy: { position: 'asc' },
                        include: {
                          activities: {
                            orderBy: { position: 'asc' },
                            select: {
                              id: true,
                              type: true,
                              title: true,
                              instructions: true,
                              content: true,
                              position: true,
                              durationMinutes: true,
                              isRequired: true,
                              completionRule: true,
                              maxScore: true,
                              passScore: true,
                              weight: true,
                              lowBandwidthAlternative: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          }),
        pageSize,
        (c) =>
          writer.write({
            id: c.id,
            code: c.code,
            slug: c.slug,
            title: c.title,
            subtitle: c.subtitle,
            summary: c.summary,
            description: c.description,
            objectives: c.objectives,
            prerequisitesText: c.prerequisitesText,
            audience: c.audience,
            category: c.category,
            modality: c.modality,
            level: c.level,
            language: c.language,
            durationHours: c.durationHours,
            pillar: c.pillar,
            enrollmentPolicy: c.enrollmentPolicy,
            isFree: c.isFree,
            priceAmount: c.priceAmount,
            memberPriceAmount: c.memberPriceAmount,
            currency: c.currency,
            capacity: c.capacity,
            status: c.status,
            isFeatured: c.isFeatured,
            publishedAt: c.publishedAt,
            currentVersionId: c.currentVersionId,
            trainers: c.trainers.map((t) => ({ userId: t.userId, email: t.user.email })),
            versions: c.versions.map((v) => ({
              id: v.id,
              version: v.version,
              label: v.label,
              changelog: v.changelog,
              isPublished: v.isPublished,
              publishedAt: v.publishedAt,
              completionRules: v.completionRules,
              modules: v.modules.map((m) => ({
                id: m.id,
                title: m.title,
                summary: m.summary,
                position: m.position,
                durationMinutes: m.durationMinutes,
                isOptional: m.isOptional,
                lessons: m.lessons.map((l) => ({
                  id: l.id,
                  slug: l.slug,
                  title: l.title,
                  summary: l.summary,
                  position: l.position,
                  durationMinutes: l.durationMinutes,
                  isPreview: l.isPreview,
                  activities: l.activities,
                })),
              })),
            })),
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          }),
      ),
  },

  cohorts: {
    description: 'Cohortes, sessions et présences',
    run: (writer, pageSize) =>
      paginate(
        (cursor, take) =>
          prisma.cohort.findMany({
            ...cursorArgs(cursor, take),
            include: {
              course: { select: { code: true, title: true } },
              organization: { select: { name: true } },
              trainer: { select: { email: true, name: true } },
              members: { select: { userId: true, role: true, joinedAt: true, user: { select: { email: true } } } },
              sessions: {
                orderBy: { startsAt: 'asc' },
                include: { attendances: { select: { userId: true, status: true, checkedInAt: true, note: true } } },
              },
            },
          }),
        pageSize,
        (k) =>
          writer.write({
            id: k.id,
            code: k.code,
            name: k.name,
            courseCode: k.course.code,
            courseTitle: k.course.title,
            courseVersionId: k.courseVersionId,
            organizationId: k.organizationId,
            organizationName: k.organization?.name ?? null,
            trainer: k.trainer ? { email: k.trainer.email, name: k.trainer.name } : null,
            trainingRequestId: k.trainingRequestId,
            status: k.status,
            mode: k.mode,
            capacity: k.capacity,
            startsAt: k.startsAt,
            endsAt: k.endsAt,
            location: k.location,
            isPrivate: k.isPrivate,
            members: k.members.map((m) => ({ userId: m.userId, email: m.user.email, role: m.role, joinedAt: m.joinedAt })),
            sessions: k.sessions.map((s) => ({
              id: s.id,
              title: s.title,
              mode: s.mode,
              startsAt: s.startsAt,
              endsAt: s.endsAt,
              location: s.location,
              trainerName: s.trainerName,
              attendances: s.attendances,
            })),
            createdAt: k.createdAt,
          }),
      ),
  },

  enrollments: {
    description: 'Inscriptions, progression et achèvements par activité',
    run: (writer, pageSize) =>
      paginate(
        (cursor, take) =>
          prisma.enrollment.findMany({
            ...cursorArgs(cursor, take),
            include: {
              user: { select: { email: true, name: true } },
              course: { select: { code: true, title: true } },
              courseVersion: { select: { version: true } },
              cohort: { select: { code: true } },
              organization: { select: { name: true } },
              completions: { select: { activityId: true, completed: true, score: true, timeSpentSeconds: true, completedAt: true } },
            },
          }),
        pageSize,
        (e) =>
          writer.write({
            id: e.id,
            userId: e.userId,
            userEmail: e.user.email,
            userName: e.user.name,
            courseId: e.courseId,
            courseCode: e.course.code,
            courseTitle: e.course.title,
            courseVersion: e.courseVersion.version,
            cohortCode: e.cohort?.code ?? null,
            organizationName: e.organization?.name ?? null,
            status: e.status,
            source: e.source,
            orderId: e.orderId,
            progressPercent: e.progressPercent,
            score: e.score,
            timeSpentSeconds: e.timeSpentSeconds,
            startedAt: e.startedAt,
            completedAt: e.completedAt,
            expiresAt: e.expiresAt,
            createdAt: e.createdAt,
            completions: e.completions,
          }),
      ),
  },

  results: {
    description: 'Résultats : tentatives de quiz (avec réponses) puis dépôts de devoirs notés',
    run: async (writer, pageSize) => {
      await paginate(
        (cursor, take) =>
          prisma.attempt.findMany({
            ...cursorArgs(cursor, take),
            include: {
              user: { select: { email: true } },
              quiz: { select: { activity: { select: { id: true, title: true, lesson: { select: { module: { select: { courseVersion: { select: { course: { select: { code: true } } } } } } } } } } } },
              answers: { select: { questionId: true, response: true, isCorrect: true, score: true, feedback: true } },
            },
          }),
        pageSize,
        (a) =>
          writer.write({
            kind: 'quiz_attempt',
            id: a.id,
            userId: a.userId,
            userEmail: a.user.email,
            courseCode: a.quiz.activity.lesson.module.courseVersion.course.code,
            activityId: a.quiz.activity.id,
            activityTitle: a.quiz.activity.title,
            enrollmentId: a.enrollmentId,
            number: a.number,
            status: a.status,
            score: a.score,
            maxScore: a.maxScore,
            percent: a.percent,
            passed: a.passed,
            startedAt: a.startedAt,
            submittedAt: a.submittedAt,
            gradedAt: a.gradedAt,
            timeSpentSeconds: a.timeSpentSeconds,
            details: a.answers,
          }),
      )
      await paginate(
        (cursor, take) =>
          prisma.submission.findMany({
            ...cursorArgs(cursor, take),
            include: {
              user: { select: { email: true } },
              grader: { select: { email: true } },
              grade: true,
              assignment: { select: { activity: { select: { id: true, title: true, lesson: { select: { module: { select: { courseVersion: { select: { course: { select: { code: true } } } } } } } } } } } },
            },
          }),
        pageSize,
        (s) =>
          writer.write({
            kind: 'assignment_submission',
            id: s.id,
            userId: s.userId,
            userEmail: s.user.email,
            courseCode: s.assignment.activity.lesson.module.courseVersion.course.code,
            activityId: s.assignment.activity.id,
            activityTitle: s.assignment.activity.title,
            enrollmentId: s.enrollmentId,
            number: null,
            status: s.status,
            score: s.grade?.score ?? null,
            maxScore: s.grade?.maxScore ?? null,
            percent: s.grade ? Math.round((s.grade.score / Math.max(1, s.grade.maxScore)) * 100) : null,
            passed: null,
            startedAt: s.createdAt,
            submittedAt: s.submittedAt,
            gradedAt: s.grade?.gradedAt ?? null,
            timeSpentSeconds: null,
            details: {
              isLate: s.isLate,
              text: s.text,
              fileName: s.fileName,
              fileUrl: s.fileUrl,
              grader: s.grader?.email ?? null,
              feedback: s.grade?.feedback ?? null,
              rubricScores: s.grade?.rubricScores ?? null,
            },
          }),
      )
    },
  },

  certificates: {
    description: 'Certificats et attestations (numéro, code de vérification, statut, révocations)',
    run: (writer, pageSize) =>
      paginate(
        (cursor, take) =>
          prisma.certificate.findMany({
            ...cursorArgs(cursor, take),
            include: {
              user: { select: { email: true } },
              cohort: { select: { code: true } },
              template: { select: { name: true, kind: true } },
              _count: { select: { verifications: true } },
            },
          }),
        pageSize,
        (c) =>
          writer.write({
            id: c.id,
            number: c.number,
            verifyCode: c.verifyCode,
            kind: c.kind,
            status: c.status,
            userId: c.userId,
            userEmail: c.user.email,
            holderName: c.holderName,
            courseTitle: c.courseTitle,
            enrollmentId: c.enrollmentId,
            cohortCode: c.cohort?.code ?? null,
            template: c.template,
            score: c.score,
            attendanceRate: c.attendanceRate,
            issuedAt: c.issuedAt,
            expiresAt: c.expiresAt,
            revokedAt: c.revokedAt,
            revokedReason: c.revokedReason,
            pdfStorageKey: c.pdfUrl,
            verificationCount: c._count.verifications,
            metadata: c.metadata,
          }),
      ),
  },

  payments: {
    description: 'Commandes, lignes, paiements, remboursements et reçus',
    run: (writer, pageSize) =>
      paginate(
        (cursor, take) =>
          prisma.order.findMany({
            ...cursorArgs(cursor, take),
            include: {
              user: { select: { email: true } },
              organization: { select: { name: true } },
              coupon: { select: { code: true } },
              lines: { select: { label: true, quantity: true, unitAmount: true, totalAmount: true, offerId: true } },
              payments: {
                select: {
                  id: true,
                  provider: true,
                  providerRef: true,
                  method: true,
                  status: true,
                  amount: true,
                  currency: true,
                  failureReason: true,
                  confirmedAt: true,
                  createdAt: true,
                  refunds: { select: { id: true, amount: true, reason: true, status: true, providerRef: true, processedAt: true } },
                },
              },
              receipt: { select: { number: true, issuedAt: true, pdfUrl: true } },
            },
          }),
        pageSize,
        (o) =>
          writer.write({
            id: o.id,
            reference: o.reference,
            userId: o.userId,
            userEmail: o.user.email,
            organizationName: o.organization?.name ?? null,
            status: o.status,
            subtotalAmount: o.subtotalAmount,
            discountAmount: o.discountAmount,
            totalAmount: o.totalAmount,
            currency: o.currency,
            couponCode: o.coupon?.code ?? null,
            sponsorshipId: o.sponsorshipId,
            paidAt: o.paidAt,
            createdAt: o.createdAt,
            lines: o.lines,
            payments: o.payments,
            receipt: o.receipt,
          }),
      ),
  },

  'training-requests': {
    description: 'Demandes de formation institutionnelles, participants, pièces et historique des décisions',
    run: (writer, pageSize) =>
      paginate(
        (cursor, take) =>
          prisma.trainingRequest.findMany({
            ...cursorArgs(cursor, take),
            include: {
              organization: { select: { name: true } },
              requester: { select: { email: true } },
              modules: { orderBy: { position: 'asc' }, select: { course: { select: { code: true, title: true } } } },
              participants: { select: { fullName: true, email: true, phone: true, jobTitle: true, userId: true, enrolled: true } },
              attachments: { select: { fileName: true, fileUrl: true, mimeType: true, size: true, label: true, createdAt: true } },
              decisions: { orderBy: { createdAt: 'asc' }, select: { fromStatus: true, toStatus: true, comment: true, createdAt: true, actor: { select: { email: true } } } },
              cohort: { select: { code: true } },
            },
          }),
        pageSize,
        (r) =>
          writer.write({
            id: r.id,
            reference: r.reference,
            organizationId: r.organizationId,
            organizationName: r.organization.name,
            requesterEmail: r.requester.email,
            contactName: r.contactName,
            contactRole: r.contactRole,
            contactEmail: r.contactEmail,
            contactPhone: r.contactPhone,
            status: r.status,
            preferredStart: r.preferredStart,
            preferredMode: r.preferredMode,
            participantLimit: r.participantLimit,
            motivation: r.motivation,
            commitmentsAccepted: r.commitmentsAccepted,
            commitmentsAcceptedAt: r.commitmentsAcceptedAt,
            coordinatorNote: r.coordinatorNote,
            proposedStart: r.proposedStart,
            proposedMode: r.proposedMode,
            submittedAt: r.submittedAt,
            decidedAt: r.decidedAt,
            cohortCode: r.cohort?.code ?? null,
            modules: r.modules.map((m) => m.course),
            participants: r.participants,
            attachments: r.attachments,
            decisions: r.decisions.map((d) => ({ ...d, actor: d.actor?.email ?? null })),
            createdAt: r.createdAt,
          }),
      ),
  },
}

// -----------------------------------------------------------------------------
// Exécution
// -----------------------------------------------------------------------------

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2))
  const names = Object.keys(DATASETS).filter((name) => !options.only || options.only.has(name))
  if (options.only) {
    const unknown = [...options.only].filter((name) => !(name in DATASETS))
    if (unknown.length > 0) fail(`Jeux de données inconnus : ${unknown.join(', ')}. Disponibles : ${Object.keys(DATASETS).join(', ')}`)
  }

  fs.mkdirSync(options.out, { recursive: true })
  console.info(`Export FETRAG vers ${options.out} (format ${options.format}, pages de ${options.pageSize})`)

  const startedAt = Date.now()
  const manifest: Record<string, { description: string; count: number; files: string[] }> = {}

  for (const name of names) {
    const dataset = DATASETS[name]
    if (!dataset) continue
    const writer = new DatasetWriter(options.out, name, options.format)
    process.stdout.write(`  ${name.padEnd(20)} `)
    await dataset.run(writer, options.pageSize)
    const count = await writer.close()
    const files = [options.format !== 'csv' ? `${name}.json` : null, options.format !== 'json' ? `${name}.csv` : null].filter((f): f is string => f !== null)
    manifest[name] = { description: dataset.description, count, files }
    process.stdout.write(`${String(count).padStart(7)} enregistrement(s)\n`)
  }

  fs.writeFileSync(
    path.join(options.out, 'manifest.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: 'FETRAG - scripts/export-data.ts',
        schema: 'packages/db/prisma/schema.prisma',
        notice: 'Données personnelles : conservation limitée, stockage chiffré, accès restreint (chapitre 41 du CDC).',
        datasets: manifest,
      },
      null,
      2,
    ),
  )
  console.info(`Terminé en ${((Date.now() - startedAt) / 1000).toFixed(1)} s. Manifeste : ${path.join(options.out, 'manifest.json')}`)
}

main()
  .catch((error: unknown) => {
    console.error('Export FETRAG - échec :', error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
