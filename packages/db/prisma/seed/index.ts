import { prisma } from '../../src/client'
import { DEMO_PASSWORD, demoAccounts } from '../../src/seed-data'
import { seedCatalog } from './catalog'
import { seedCms } from './cms'
import { seedCommerce } from './commerce'
import { log } from './helpers'
import { seedMisc } from './misc'
import { seedOrganizations } from './organizations'
import { seedPilotCourse } from './pilot-course'
import { seedTrainingRequests } from './requests'
import { seedUsers } from './users'

/**
 * Seed de démonstration FETRAG (chapitres 12 et 40 du CDC).
 * Lancement : `pnpm db:seed` (dotenv -e ../../.env -- tsx prisma/seed/index.ts).
 * Idempotent : chaque exécution met à jour les enregistrements existants (clés naturelles
 * ou identifiants stables) sans créer de doublons.
 */

async function summary(): Promise<void> {
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.roleAssignment.count(),
    prisma.organization.count(),
    prisma.category.count(),
    prisma.course.count(),
    prisma.courseModule.count(),
    prisma.lesson.count(),
    prisma.activity.count(),
    prisma.question.count(),
    prisma.cohort.count(),
    prisma.enrollment.count(),
    prisma.activityCompletion.count(),
    prisma.certificate.count(),
    prisma.trainingRequest.count(),
    prisma.page.count(),
    prisma.article.count(),
    prisma.resource.count(),
    prisma.partner.count(),
    prisma.service.count(),
    prisma.event.count(),
    prisma.offer.count(),
    prisma.order.count(),
    prisma.payment.count(),
    prisma.emailTemplate.count(),
    prisma.notification.count(),
    prisma.systemSetting.count(),
  ])
  const labels = [
    'utilisateurs',
    'rôles',
    'organisations',
    'catégories',
    'cours',
    'modules de cours',
    'leçons',
    'activités',
    'questions',
    'cohortes',
    'inscriptions',
    'achèvements d’activités',
    'certificats',
    'demandes de formation',
    'pages',
    'actualités',
    'ressources',
    'partenaires',
    'services',
    'événements',
    'offres',
    'commandes',
    'paiements',
    'modèles d’email',
    'notifications',
    'paramètres système',
  ]
  log.step('Résumé de la base')
  labels.forEach((label, i) => log.info(`${String(counts[i] ?? 0).padStart(5)}  ${label}`))
}

function printAccounts(): void {
  log.step(`Comptes de démonstration (mot de passe commun : ${DEMO_PASSWORD})`)
  for (const account of demoAccounts) {
    log.info(`${account.email.padEnd(32)} ${account.role.padEnd(17)} ${account.usage}`)
  }
}

async function main(): Promise<void> {
  const startedAt = Date.now()
  console.info('Seed FETRAG - démarrage')

  const users = await seedUsers()
  const orgs = await seedOrganizations(users)
  const catalog = await seedCatalog(users)
  const pilot = await seedPilotCourse(users, orgs, catalog)
  const cms = await seedCms(users, catalog)
  const requests = await seedTrainingRequests(users, orgs, catalog, pilot)
  const commerce = await seedCommerce(users, orgs, catalog, cms)
  await seedMisc(users, pilot, requests, commerce)

  await summary()
  printAccounts()
  console.info(`\nSeed terminé en ${((Date.now() - startedAt) / 1000).toFixed(1)} s.`)
}

main()
  .catch((error: unknown) => {
    console.error('\nSeed FETRAG - échec :', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
