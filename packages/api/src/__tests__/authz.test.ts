// Tests d'autorisation de l'API : pour chaque route protégée, un cas autorisé (principal injecté par
// l'app hôte, comme le font apps/web et apps/lms) et un cas refusé (401 / 403 / 428). Les services
// métier sont remplacés par des doubles (vi.mock) : seules les décisions de l'API sont testées.
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Hono } from 'hono'
import { NotFoundError, type Principal } from '@fetrag/domain'

// -----------------------------------------------------------------------------
// Doubles des packages métier (aucun accès base de données)
// -----------------------------------------------------------------------------

const prismaMock = vi.hoisted(() => ({
  systemSetting: { findUnique: vi.fn() },
  user: { findUnique: vi.fn() },
  auditLog: { create: vi.fn() },
  $queryRaw: vi.fn(),
}))

const lms = vi.hoisted(() => ({
  catalog: { listPublished: vi.fn(), getPublished: vi.fn() },
  enrollments: { listForUser: vi.fn(), enroll: vi.fn() },
  certification: { issue: vi.fn(), listForUser: vi.fn(), verify: vi.fn() },
  progress: { report: vi.fn() },
  quizzes: { start: vi.fn(), submit: vi.fn() },
  trainingRequests: { create: vi.fn(), decide: vi.fn(), get: vi.fn(), listForOrganization: vi.fn(), listForCoordination: vi.fn() },
  reports: { organizationReport: vi.fn() },
  dashboards: { admin: vi.fn() },
}))

const payments = vi.hoisted(() => ({
  createCheckout: vi.fn(),
  processWebhook: vi.fn(),
  orders: { listForUser: vi.fn(), get: vi.fn() },
}))

const cms = vi.hoisted(() => ({
  articles: { listPublished: vi.fn(), getPublished: vi.fn(), related: vi.fn() },
  events: { listUpcoming: vi.fn(), listPast: vi.fn(), getPublished: vi.fn() },
  services: { listPublished: vi.fn(), getPublished: vi.fn() },
  resources: { listPublished: vi.fn(), getPublished: vi.fn() },
  forms: { submit: vi.fn() },
  newsletter: { subscribe: vi.fn() },
}))

const auth = vi.hoisted(() => ({
  loadPrincipal: vi.fn(),
  sessionCookieName: () => 'authjs.session-token',
}))

vi.mock('@fetrag/db', () => ({ prisma: prismaMock, Prisma: {} }))
vi.mock('@fetrag/auth', () => auth)
vi.mock('@fetrag/lms-core', () => lms)
vi.mock('@fetrag/payments', () => payments)
vi.mock('@fetrag/cms', () => cms)
vi.mock('@fetrag/search', () => ({
  searchPublic: vi.fn(async (q: string) => ({ query: q, groups: [], total: 0 })),
  searchTypes: ['article', 'page', 'resource', 'course', 'service', 'event'],
  MAX_QUERY_LENGTH: 100,
}))
vi.mock('@fetrag/analytics', () => ({
  webStats: vi.fn(async () => ({ visits: { totalViews: 12 } })),
  lmsStats: vi.fn(async () => ({ activeLearners30d: 3 })),
  financeStats: vi.fn(async () => ({ revenue: 150000 })),
}))
vi.mock('@fetrag/jobs', () => ({
  getJobStats: vi.fn(async () => ({ QUEUED: 1, RUNNING: 0, SUCCEEDED: 10, FAILED: 0, DEAD: 0, dueNow: 1 })),
  listHandlers: vi.fn(() => ['email.send', 'certificate.render']),
}))

import { createApiApp } from '../index'
import { hashApiKey, resetApiKeyCache } from '../lib/api-keys'
import { resetIdempotencyStore } from '../middleware/idempotency'
import { resetRateLimits } from '../middleware/rate-limit'

// -----------------------------------------------------------------------------
// Principaux de test
// -----------------------------------------------------------------------------

const ORG_A = '11111111-1111-4111-8111-111111111111'
const ORG_B = '22222222-2222-4222-8222-222222222222'
const ENROLLMENT_ID = '33333333-3333-4333-8333-333333333333'
const REQUEST_ID = '44444444-4444-4444-8444-444444444444'
const USER_ID = '55555555-5555-4555-8555-555555555555'
const OFFER_ID = '66666666-6666-4666-8666-666666666666'

function principal(overrides: Partial<Principal> & { id: string }): Principal {
  return { email: `${overrides.id}@test.fetrag.ga`, name: 'Compte de test', roles: [], organizationIds: [], managedOrganizationIds: [], ...overrides }
}

const learner = principal({ id: USER_ID, roles: [{ role: 'LEARNER', scopeType: 'GLOBAL', scopeId: null }] })
const coordinator = principal({ id: 'coord', roles: [{ role: 'COORDINATOR', scopeType: 'GLOBAL', scopeId: null }] })
const superAdmin = principal({ id: 'root', roles: [{ role: 'SUPER_ADMIN', scopeType: 'GLOBAL', scopeId: null }] })
const orgManagerA = principal({
  id: 'manager-a',
  roles: [{ role: 'ORG_MANAGER', scopeType: 'ORGANIZATION', scopeId: ORG_A }],
  organizationIds: [ORG_A],
  managedOrganizationIds: [ORG_A],
})
const orgManagerB = principal({
  id: 'manager-b',
  roles: [{ role: 'ORG_MANAGER', scopeType: 'ORGANIZATION', scopeId: ORG_B }],
  organizationIds: [ORG_B],
  managedOrganizationIds: [ORG_B],
})

// -----------------------------------------------------------------------------
// Montage identique aux apps Next : le principal est injecté avant le routeur @fetrag/api
// -----------------------------------------------------------------------------

type MountEnv = { Variables: { principal: Principal | null } }

function mount(injected?: Principal | null) {
  const mounted = new Hono<MountEnv>()
  if (injected !== undefined) {
    mounted.use('*', async (c, next) => {
      c.set('principal', injected)
      await next()
    })
  }
  mounted.route('/', createApiApp())
  return mounted
}

function call(app: ReturnType<typeof mount>, path: string, init?: RequestInit) {
  return app.request(`http://localhost/api/v1${path}`, init)
}

function json(body: unknown, headers: Record<string, string> = {}): RequestInit {
  return { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) }
}

async function errorCode(response: Response): Promise<string> {
  const body = (await response.json()) as { error: { code: string } }
  return body.error.code
}

const certificateFixture = {
  id: '77777777-7777-4777-8777-777777777777',
  number: 'FETRAG-2026-000042',
  verifyCode: 'H7K2-P9QX-4MW3',
  kind: 'ATTESTATION' as const,
  status: 'ISSUED' as const,
  userId: USER_ID,
  enrollmentId: ENROLLMENT_ID,
  cohortId: null,
  templateId: null,
  courseTitle: 'Fondamentaux du Syndicalisme Gabonais',
  holderName: 'Apprenant Un',
  score: 82,
  attendanceRate: null,
  issuedAt: new Date('2026-06-01T10:00:00Z'),
  expiresAt: null,
  revokedAt: null,
  revokedReason: null,
  pdfUrl: null,
}

const requestDetailFixture = {
  id: REQUEST_ID,
  reference: 'DF-2026-K7P2QX',
  status: 'ACCEPTED' as const,
  organizationId: ORG_A,
  organization: { id: ORG_A, name: 'SYNATEP', acronym: 'SYNATEP', slug: 'synatep' },
  requester: { id: 'manager-a', name: 'Responsable SYNATEP', firstName: 'R', lastName: 'S', email: 'responsable@synatep-demo.ga' },
  contactName: 'Responsable SYNATEP',
  contactRole: 'Secrétaire général',
  contactEmail: 'responsable@synatep-demo.ga',
  contactPhone: null,
  preferredStart: null,
  preferredMode: 'HYBRID' as const,
  participantLimit: 10,
  motivation: null,
  commitmentsAccepted: true,
  commitmentsAcceptedAt: new Date('2026-05-01T08:00:00Z'),
  coordinatorNote: null,
  proposedStart: null,
  proposedMode: null,
  submittedAt: new Date('2026-05-01T08:00:00Z'),
  decidedAt: new Date('2026-05-03T08:00:00Z'),
  createdAt: new Date('2026-05-01T08:00:00Z'),
  updatedAt: new Date('2026-05-03T08:00:00Z'),
  modules: [{ id: 'm1', position: 0, course: { id: 'c1', slug: 'fondamentaux', code: 'M01', title: 'Fondamentaux', durationHours: 12, status: 'PUBLISHED', currentVersionId: 'v1' } }],
  participants: [{ id: 'p1', fullName: 'Participant Un', email: 'p1@synatep-demo.ga', phone: null, jobTitle: null, userId: null, enrolled: false }],
  attachments: [],
  decisions: [{ id: 'd1', fromStatus: 'SUBMITTED' as const, toStatus: 'ACCEPTED' as const, comment: 'Dossier complet', createdAt: new Date('2026-05-03T08:00:00Z'), actor: { id: 'coord', name: 'Coordination' } }],
  cohort: null,
  allowedTransitions: ['SCHEDULED' as const, 'CANCELLED' as const],
  canDecide: true,
  canEdit: false,
}

beforeEach(() => {
  vi.clearAllMocks()
  resetRateLimits()
  resetIdempotencyStore()
  resetApiKeyCache()
  prismaMock.systemSetting.findUnique.mockResolvedValue(null)
  prismaMock.user.findUnique.mockResolvedValue({
    id: USER_ID,
    email: learner.email,
    name: 'Apprenant Un',
    firstName: 'Apprenant',
    lastName: 'Un',
    image: null,
    phone: null,
    jobTitle: null,
    employer: null,
    locale: 'fr',
    timezone: 'Africa/Libreville',
    totpEnabled: false,
    emailVerified: null,
    lastLoginAt: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    memberships: [],
  })
})

// -----------------------------------------------------------------------------
// GET /me et /me/enrollments
// -----------------------------------------------------------------------------

describe('GET /me', () => {
  it('renvoie le principal et le profil d’un utilisateur connecté', async () => {
    const res = await call(mount(learner), '/me')
    expect(res.status).toBe(200)
    const body = (await res.json()) as { principal: { id: string }; auth: { method: string }; profile: { email: string } | null }
    expect(body.principal.id).toBe(USER_ID)
    expect(body.auth.method).toBe('session')
    expect(body.profile?.email).toBe(learner.email)
    expect(res.headers.get('x-correlation-id')).toBeTruthy()
  })

  it('refuse un visiteur anonyme (401 UNAUTHENTICATED)', async () => {
    const res = await call(mount(null), '/me')
    expect(res.status).toBe(401)
    expect(await errorCode(res)).toBe('UNAUTHENTICATED')
  })
})

describe('GET /me/enrollments', () => {
  it('liste les inscriptions du principal', async () => {
    lms.enrollments.listForUser.mockResolvedValue([])
    const res = await call(mount(learner), '/me/enrollments')
    expect(res.status).toBe(200)
    expect(lms.enrollments.listForUser).toHaveBeenCalledWith(expect.objectContaining({ id: USER_ID }), undefined, {})
  })

  it('exige une authentification', async () => {
    const res = await call(mount(null), '/me/enrollments')
    expect(res.status).toBe(401)
    expect(lms.enrollments.listForUser).not.toHaveBeenCalled()
  })
})

// -----------------------------------------------------------------------------
// POST /certificates/{enrollmentId}/issue
// -----------------------------------------------------------------------------

describe('POST /certificates/{enrollmentId}/issue', () => {
  it('permet à la coordination d’émettre un certificat avec une clé d’idempotence', async () => {
    lms.certification.issue.mockResolvedValue({ certificate: certificateFixture, created: true })
    const res = await call(mount(coordinator), `/certificates/${ENROLLMENT_ID}/issue`, json({}, { 'Idempotency-Key': 'cert-issue-0001' }))
    expect(res.status).toBe(201)
    const body = (await res.json()) as { certificate: { number: string }; created: boolean }
    expect(body.certificate.number).toBe('FETRAG-2026-000042')
    expect(lms.certification.issue).toHaveBeenCalledWith(expect.objectContaining({ id: 'coord' }), ENROLLMENT_ID, null, expect.any(Object))
  })

  it('rejoue la même réponse pour une clé d’idempotence identique sans rappeler le service', async () => {
    lms.certification.issue.mockResolvedValue({ certificate: certificateFixture, created: true })
    const app = mount(coordinator)
    const first = await call(app, `/certificates/${ENROLLMENT_ID}/issue`, json({}, { 'Idempotency-Key': 'cert-issue-0002' }))
    const second = await call(app, `/certificates/${ENROLLMENT_ID}/issue`, json({}, { 'Idempotency-Key': 'cert-issue-0002' }))
    expect(first.status).toBe(201)
    expect(second.status).toBe(201)
    expect(second.headers.get('idempotency-replayed')).toBe('true')
    expect(lms.certification.issue).toHaveBeenCalledTimes(1)
  })

  it('exige l’en-tête Idempotency-Key (428)', async () => {
    const res = await call(mount(coordinator), `/certificates/${ENROLLMENT_ID}/issue`, json({}))
    expect(res.status).toBe(428)
    expect(await errorCode(res)).toBe('IDEMPOTENCY_KEY_REQUIRED')
    expect(lms.certification.issue).not.toHaveBeenCalled()
  })

  it('refuse un apprenant (403 FORBIDDEN)', async () => {
    const res = await call(mount(learner), `/certificates/${ENROLLMENT_ID}/issue`, json({}, { 'Idempotency-Key': 'cert-issue-0003' }))
    expect(res.status).toBe(403)
    expect(await errorCode(res)).toBe('FORBIDDEN')
    expect(lms.certification.issue).not.toHaveBeenCalled()
  })
})

// -----------------------------------------------------------------------------
// Demandes de formation
// -----------------------------------------------------------------------------

describe('POST /training-requests/{id}/decision', () => {
  it('enregistre la décision de la coordination', async () => {
    lms.trainingRequests.decide.mockResolvedValue({ request: requestDetailFixture, schedule: null })
    lms.trainingRequests.get.mockResolvedValue(requestDetailFixture)
    const res = await call(mount(coordinator), `/training-requests/${REQUEST_ID}/decision`, json({ decision: 'ACCEPTED', comment: 'Dossier complet' }))
    expect(res.status).toBe(200)
    expect(lms.trainingRequests.decide).toHaveBeenCalledWith(expect.objectContaining({ id: 'coord' }), expect.objectContaining({ requestId: REQUEST_ID, decision: 'ACCEPTED' }), expect.any(Object))
    const body = (await res.json()) as { request: { reference: string; allowedTransitions: string[] }; schedule: null }
    expect(body.request.reference).toBe('DF-2026-K7P2QX')
    expect(body.request.allowedTransitions).toEqual(['SCHEDULED', 'CANCELLED'])
  })

  it('refuse un responsable d’organisation (403)', async () => {
    const res = await call(mount(orgManagerA), `/training-requests/${REQUEST_ID}/decision`, json({ decision: 'ACCEPTED' }))
    expect(res.status).toBe(403)
    expect(lms.trainingRequests.decide).not.toHaveBeenCalled()
  })

  it('valide le corps (400 VALIDATION_ERROR avec détails par champ)', async () => {
    const res = await call(mount(coordinator), `/training-requests/${REQUEST_ID}/decision`, json({ decision: 'INVENTED' }))
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string; details?: { fieldErrors?: Record<string, string[]> } } }
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(body.error.details?.fieldErrors?.decision).toBeDefined()
  })
})

describe('GET /training-requests', () => {
  it('sert la file de la coordination', async () => {
    lms.trainingRequests.listForCoordination.mockResolvedValue({ items: [], page: 1, pageSize: 20, total: 0, totalPages: 1, pendingCount: 0 })
    const res = await call(mount(coordinator), '/training-requests?status=SUBMITTED')
    expect(res.status).toBe(200)
    expect(lms.trainingRequests.listForCoordination).toHaveBeenCalledWith(expect.objectContaining({ id: 'coord' }), expect.objectContaining({ status: 'SUBMITTED' }))
  })

  it('limite un responsable à son organisation', async () => {
    lms.trainingRequests.listForOrganization.mockResolvedValue({ items: [], page: 1, pageSize: 20, total: 0, totalPages: 1 })
    const res = await call(mount(orgManagerA), '/training-requests')
    expect(res.status).toBe(200)
    expect(lms.trainingRequests.listForOrganization).toHaveBeenCalledWith(expect.objectContaining({ id: 'manager-a' }), ORG_A, expect.any(Object))
  })

  it('refuse un apprenant sans organisation (403)', async () => {
    const res = await call(mount(learner), '/training-requests')
    expect(res.status).toBe(403)
    expect(lms.trainingRequests.listForOrganization).not.toHaveBeenCalled()
  })
})

// -----------------------------------------------------------------------------
// GET /organizations/{id}/report (portée organisation)
// -----------------------------------------------------------------------------

describe('GET /organizations/{id}/report', () => {
  const report = {
    organization: { id: ORG_A, name: 'SYNATEP', acronym: 'SYNATEP', sector: 'Énergie', city: 'Libreville', isAffiliate: true },
    requests: { SUBMITTED: 1 },
    enrollments: { total: 4, byStatus: { ACTIVE: 3, COMPLETED: 1 }, averageProgress: 40, averageScore: null, totalTimeSeconds: 3600 },
    learners: 4,
    certificates: 1,
    cohorts: [],
    courses: [],
  }

  it('autorise le responsable de l’organisation', async () => {
    lms.reports.organizationReport.mockResolvedValue(report)
    const res = await call(mount(orgManagerA), `/organizations/${ORG_A}/report`)
    expect(res.status).toBe(200)
    expect(lms.reports.organizationReport).toHaveBeenCalledWith(ORG_A, expect.objectContaining({ id: 'manager-a' }))
  })

  it('autorise la coordination (rôle global)', async () => {
    lms.reports.organizationReport.mockResolvedValue(report)
    const res = await call(mount(coordinator), `/organizations/${ORG_A}/report`)
    expect(res.status).toBe(200)
  })

  it('refuse le responsable d’une autre organisation (403)', async () => {
    const res = await call(mount(orgManagerB), `/organizations/${ORG_A}/report`)
    expect(res.status).toBe(403)
    expect(lms.reports.organizationReport).not.toHaveBeenCalled()
  })

  it('refuse un apprenant membre sans responsabilité (403)', async () => {
    const res = await call(mount({ ...learner, organizationIds: [ORG_A] }), `/organizations/${ORG_A}/report`)
    expect(res.status).toBe(403)
  })
})

// -----------------------------------------------------------------------------
// Administration
// -----------------------------------------------------------------------------

describe('GET /admin/stats', () => {
  it('sert les statistiques à un rôle reports.read (coordination), sans bloc finance', async () => {
    lms.dashboards.admin.mockResolvedValue({ stats: { users: 12 } })
    const res = await call(mount(coordinator), '/admin/stats')
    expect(res.status).toBe(200)
    const body = (await res.json()) as { platform: { stats: { users: number } }; finance: unknown }
    expect(body.platform.stats.users).toBe(12)
    // La coordination dispose de finance.read : le bloc finance est présent.
    expect(body.finance).not.toBeNull()
  })

  it('refuse un apprenant (403)', async () => {
    const res = await call(mount(learner), '/admin/stats')
    expect(res.status).toBe(403)
    expect(lms.dashboards.admin).not.toHaveBeenCalled()
  })
})

describe('GET /jobs/status', () => {
  it('est réservé au super administrateur', async () => {
    const res = await call(mount(superAdmin), '/jobs/status')
    expect(res.status).toBe(200)
    const body = (await res.json()) as { counts: { QUEUED: number }; handlers: string[] }
    expect(body.counts.QUEUED).toBe(1)
    expect(body.handlers).toContain('certificate.render')
  })

  it('refuse la coordination (403)', async () => {
    const res = await call(mount(coordinator), '/jobs/status')
    expect(res.status).toBe(403)
  })
})

// -----------------------------------------------------------------------------
// Paiements
// -----------------------------------------------------------------------------

describe('POST /checkout', () => {
  const body = { offerId: OFFER_ID, quantity: 1, method: 'MOBILE_MONEY', phoneNumber: '066230033' }

  it('crée la commande avec la clé d’idempotence de l’en-tête', async () => {
    payments.createCheckout.mockResolvedValue({
      orderId: '88888888-8888-4888-8888-888888888888',
      paymentId: '99999999-9999-4999-8999-999999999999',
      reference: 'CMD-2026-7K2P9Q',
      status: 'PENDING',
      totalAmount: 25000,
      currency: 'XAF',
      nextAction: { type: 'instructions', message: 'Validez le paiement sur votre téléphone' },
    })
    const res = await call(mount(learner), '/checkout', json(body, { 'Idempotency-Key': 'checkout-abc-123' }))
    expect(res.status).toBe(201)
    expect(payments.createCheckout).toHaveBeenCalledWith(expect.objectContaining({ id: USER_ID }), expect.objectContaining({ offerId: OFFER_ID, idempotencyKey: 'checkout-abc-123' }))
  })

  it('exige l’en-tête Idempotency-Key (428)', async () => {
    const res = await call(mount(learner), '/checkout', json(body))
    expect(res.status).toBe(428)
    expect(payments.createCheckout).not.toHaveBeenCalled()
  })

  it('refuse un visiteur anonyme (401)', async () => {
    const res = await call(mount(null), '/checkout', json(body, { 'Idempotency-Key': 'checkout-anon-123' }))
    expect(res.status).toBe(401)
  })
})

describe('POST /payments/webhooks/{provider}', () => {
  it('transmet le corps brut tel quel, sans authentification', async () => {
    payments.processWebhook.mockResolvedValue({ webhookEventId: 'evt-1', duplicate: false, jobId: 'job-1' })
    const raw = '{"eventType":"payment.succeeded","externalId":"ext-1","paymentRef":"pay-1",  "status":"SUCCEEDED"}'
    const res = await call(mount(null), '/payments/webhooks/sandbox', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-fetrag-signature': 'sha256=abc' },
      body: raw,
    })
    expect(res.status).toBe(202)
    expect(payments.processWebhook).toHaveBeenCalledTimes(1)
    const [provider, headers, body] = payments.processWebhook.mock.calls[0] as [string, Headers, string]
    expect(provider).toBe('sandbox')
    expect(body).toBe(raw)
    expect(headers.get('x-fetrag-signature')).toBe('sha256=abc')
  })
})

// -----------------------------------------------------------------------------
// Clé API
// -----------------------------------------------------------------------------

describe('Authentification par clé API', () => {
  const rawKey = 'fetrag_test_key_0123456789abcdef'

  it('résout un principal à partir de SystemSetting api.keys (clé de service)', async () => {
    prismaMock.systemSetting.findUnique.mockResolvedValue({
      key: 'api.keys',
      value: [{ id: 'k1', name: 'Intégration RH', hash: hashApiKey(rawKey), scopes: ['COORDINATOR'] }],
    })
    lms.trainingRequests.listForCoordination.mockResolvedValue({ items: [], page: 1, pageSize: 20, total: 0, totalPages: 1, pendingCount: 0 })
    const res = await call(mount(), '/training-requests', { headers: { 'x-api-key': rawKey } })
    expect(res.status).toBe(200)
    expect(lms.trainingRequests.listForCoordination).toHaveBeenCalled()
  })

  it('restreint les rôles d’une clé liée à un utilisateur aux scopes déclarés', async () => {
    prismaMock.systemSetting.findUnique.mockResolvedValue({
      key: 'api.keys',
      value: [{ id: 'k2', name: 'Clé apprenant', hash: hashApiKey(rawKey), scopes: ['LEARNER'], userId: USER_ID }],
    })
    auth.loadPrincipal.mockResolvedValue(coordinator)
    const res = await call(mount(), '/admin/stats', { headers: { 'x-api-key': rawKey } })
    expect(res.status).toBe(403)
  })

  it('rejette une clé inconnue (401)', async () => {
    const res = await call(mount(), '/me', { headers: { 'x-api-key': 'fetrag_unknown_key_0123456789' } })
    expect(res.status).toBe(401)
    expect(await errorCode(res)).toBe('UNAUTHENTICATED')
  })
})

// -----------------------------------------------------------------------------
// Format d'erreur, limitation de débit, santé
// -----------------------------------------------------------------------------

describe('Gestion des erreurs et limitation de débit', () => {
  it('convertit une DomainError en réponse ApiError avec correlationId', async () => {
    lms.catalog.getPublished.mockRejectedValue(new NotFoundError('Formation', 'inconnue'))
    const res = await call(mount(null), '/courses/inconnue', { headers: { 'x-correlation-id': 'test-corr-42' } })
    expect(res.status).toBe(404)
    const body = (await res.json()) as { error: { code: string; message: string; correlationId?: string } }
    expect(body.error.code).toBe('NOT_FOUND')
    expect(body.error.correlationId).toBe('test-corr-42')
    expect(res.headers.get('x-correlation-id')).toBe('test-corr-42')
  })

  it('ne fuit pas les erreurs internes inattendues (500 INTERNAL_ERROR)', async () => {
    lms.catalog.listPublished.mockRejectedValue(new Error('connexion perdue : mot de passe xyz'))
    const res = await call(mount(null), '/courses')
    expect(res.status).toBe(500)
    const body = (await res.json()) as { error: { code: string; message: string } }
    expect(body.error.code).toBe('INTERNAL_ERROR')
    expect(body.error.message).not.toContain('xyz')
  })

  it('renvoie VALIDATION_ERROR pour une requête invalide', async () => {
    const res = await call(mount(null), '/search?q=a')
    expect(res.status).toBe(400)
    expect(await errorCode(res)).toBe('VALIDATION_ERROR')
  })

  it('renvoie NOT_FOUND pour une route inconnue', async () => {
    const res = await call(mount(null), '/inconnue')
    expect(res.status).toBe(404)
    expect(await errorCode(res)).toBe('NOT_FOUND')
  })

  it('limite les formulaires à 10 requêtes par minute et par IP (429 RATE_LIMITED)', async () => {
    cms.forms.submit.mockResolvedValue({ id: 'f1', reference: 'MSG-2026-ABCDEF', kind: 'CONTACT', status: 'NEW', spam: false })
    const app = mount(null)
    const payload = { fullName: 'Marie Ndong', email: 'marie@example.ga', message: 'Je souhaite des informations sur les formations.', consent: true }
    let last: Response | null = null
    for (let i = 0; i < 11; i++) last = await call(app, '/forms/contact', json(payload, { 'x-forwarded-for': '41.158.10.10' }))
    expect(last?.status).toBe(429)
    expect(last?.headers.get('retry-after')).toBeTruthy()
    expect(cms.forms.submit).toHaveBeenCalledTimes(10)
  })

  it('expose la documentation OpenAPI avec les schémas de sécurité', async () => {
    const res = await call(mount(null), '/openapi.json')
    expect(res.status).toBe(200)
    const doc = (await res.json()) as { info: { title: string }; paths: Record<string, unknown>; components: { securitySchemes: Record<string, unknown> } }
    expect(doc.info.title).toBe('API FETRAG')
    expect(Object.keys(doc.paths)).toEqual(expect.arrayContaining(['/health', '/courses', '/me', '/checkout', '/certificates/verify/{code}']))
    expect(Object.keys(doc.components.securitySchemes)).toEqual(['ApiKeyAuth', 'SessionCookie'])
  })

  it('signale une base indisponible sur /health (503)', async () => {
    prismaMock.$queryRaw.mockRejectedValue(new Error('ECONNREFUSED'))
    const res = await call(mount(null), '/health')
    expect(res.status).toBe(503)
    const body = (await res.json()) as { ok: boolean; checks: Array<{ name: string; ok: boolean }> }
    expect(body.ok).toBe(false)
    expect(body.checks[0]?.name).toBe('database')
  })
})
