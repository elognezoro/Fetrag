import { expect, test, type Page } from '@playwright/test'
import { accounts, demoData } from '../helpers/accounts'
import { login } from '../helpers/auth'
import { expectNoServerError, expectPageHeading, firstVisible, gotoOrSkip } from '../helpers/ui'

/**
 * Paiement sandbox de bout en bout (WEB-08, SHR-06, ADR-003) : inscription à un module payant depuis le LMS,
 * checkout sur fetrag.ga, simulation d'un échec puis d'un succès par le fournisseur `sandbox`
 * (webhook signé HMAC), reçu et historique dans l'espace personnel.
 *
 * Prérequis : `PAYMENT_PROVIDER=sandbox`, `FEATURE_PAYMENTS=true`, les deux applications démarrées avec le
 * même `AUTH_SECRET` (la session est partagée entre les ports de `localhost`).
 */
const lmsUrl = process.env.E2E_LMS_URL ?? 'http://localhost:3001'

test.describe('Paiement sandbox @write', () => {
  test.describe.configure({ mode: 'serial' })

  /** Connexion sur le LMS si la session web n'y est pas reconnue (AUTH_SECRET différent, cookie non partagé). */
  async function ensureLmsSession(page: Page): Promise<void> {
    const loginLink = page.getByRole('link', { name: /Se connecter pour s[’']inscrire/ })
    if (!(await loginLink.isVisible().catch(() => false))) return
    await loginLink.click()
    await page.getByLabel(/^Adresse email/).fill(accounts.apprenantDebutant.email)
    await page.getByLabel(/^Mot de passe/).fill(accounts.apprenantDebutant.password)
    await page.getByRole('button', { name: /^Se connecter/ }).click()
    await page.waitForURL(/\/cours\//, { timeout: 30_000 })
  }

  /** Lance un paiement depuis le checkout et atteint la page de simulation sandbox. */
  async function payAndReachSandbox(page: Page): Promise<void> {
    await expectPageHeading(page, /Régler la commande/)
    const phone = page.getByLabel(/Numéro Mobile Money/)
    if ((await phone.isVisible().catch(() => false)) && !(await phone.inputValue()).trim()) await phone.fill('077522798')
    const pay = page.getByRole('button', { name: /^Payer/ })
    await expect(pay).toBeEnabled()
    await pay.click()
    await page.waitForURL(/\/paiement\/[^/]+\/(sandbox|retour)|\/paiement\/[^/]+$/, { timeout: 30_000 })
    if (!/\/sandbox/.test(page.url())) {
      const resume = page.getByRole('link', { name: /Poursuivre la simulation/ })
      if (await resume.isVisible().catch(() => false)) await resume.click()
    }
    await page.waitForURL(/\/sandbox/, { timeout: 20_000 })
    await expectPageHeading(page, /Simuler le fournisseur de paiement/)
  }

  test('un apprenant règle un module payant : échec simulé puis succès, reçu et historique', async ({ page }) => {
    test.setTimeout(180_000)
    await login(page, accounts.apprenantDebutant)

    // 1. Depuis la fiche LMS du module payant (M08), lancer l'inscription payante.
    const courseResponse = await page.goto(`${lmsUrl}/cours/${demoData.paidCourseSlug}`)
    expect(courseResponse?.status() ?? 0, 'Fiche de cours LMS injoignable').toBeLessThan(400)
    await ensureLmsSession(page)
    await expectPageHeading(page, /Leadership/)
    await expect(page.getByText(/25\s?000/).first()).toBeVisible()

    const checkoutButton = page.getByRole('button', { name: /S[’']inscrire/ })
    if (await checkoutButton.isVisible().catch(() => false)) {
      await checkoutButton.click()
      await page.waitForURL(/\/paiement\/[^/]+/, { timeout: 30_000 })
    } else {
      // Déjà inscrit lors d'un précédent passage : reprendre une commande en attente dans l'espace personnel.
      await page.goto('/espace/paiements')
      const pending = await firstVisible([page.getByRole('link', { name: /Régler|Payer|Reprendre le paiement/ })], 5_000)
      if (!pending) {
        test.skip(true, 'Aucune commande à régler : l’apprenant de test est déjà inscrit au module payant et aucune commande n’est en attente (réinitialiser le seed pour rejouer).')
        return
      }
      await pending.click()
      await page.waitForURL(/\/paiement\/[^/]+/, { timeout: 30_000 })
    }
    const orderPath = new URL(page.url()).pathname.replace(/\/(sandbox|retour)$/, '')
    await expectNoServerError(page)

    // 2. Échec simulé : la commande reste réglable, aucun accès ouvert.
    await payAndReachSandbox(page)
    await page.getByRole('button', { name: /Simuler un échec/ }).click()
    await page.waitForURL(/\/retour/, { timeout: 30_000 })
    await expectPageHeading(page, /n[’']a pas abouti/)
    await expect(page.getByText(/Aucun montant n[’']a été débité/)).toBeVisible()

    // 3. Relance puis succès simulé : commande payée, inscription et reçu.
    await page.goto(orderPath)
    await expect(page.getByText(/Le dernier paiement a échoué/)).toBeVisible()
    await payAndReachSandbox(page)
    await page.getByRole('button', { name: /Simuler un paiement réussi/ }).click()
    await page.waitForURL(/\/retour/, { timeout: 30_000 })
    await expectPageHeading(page, /Paiement confirmé/)
    await expect(page.getByText(/Merci pour votre confiance/)).toBeVisible()
    await expectNoServerError(page)

    // 4. Espace personnel : historique et reçu numéroté (WEB-10, chapitre 19).
    await page.goto('/espace/paiements')
    await expectPageHeading(page)
    await expect(page.getByText(/CMD-\d{4}-[A-Z0-9]+/).first()).toBeVisible()
    await expect(page.getByText(/^Payée?$/).first()).toBeVisible()
    const orderId = orderPath.split('/').pop() ?? ''
    await gotoOrSkip(page, `/espace/paiements/${orderId}`, 'Le détail de commande n’est pas encore disponible')
    await expectPageHeading(page)
    await expect(page.getByText(/Reçu|REC-|Télécharger le reçu/i).first()).toBeVisible()

    // 5. L'accès au module est ouvert côté LMS.
    await page.goto(`${lmsUrl}/cours/${demoData.paidCourseSlug}`)
    await ensureLmsSession(page)
    await expect(page.getByRole('link', { name: /Reprendre|Revoir la formation/ }).first()).toBeVisible({ timeout: 20_000 })
  })

  test('une commande d’un autre utilisateur est introuvable (isolation des données)', async ({ page }) => {
    await login(page, accounts.apprenantCertifie)
    await page.goto('/espace/paiements')
    const firstOrder = page.getByText(/CMD-\d{4}-[A-Z0-9]+/).first()
    if (!(await firstOrder.isVisible().catch(() => false))) {
      test.skip(true, 'Aucune commande seedée pour apprenant1 : impossible de tester l’isolation')
      return
    }
    const link = page.getByRole('link', { name: /Détail|Voir|CMD-/ }).first()
    if (!(await link.isVisible().catch(() => false))) {
      test.skip(true, 'La liste des paiements n’expose pas encore de lien de détail')
      return
    }
    const href = await link.getAttribute('href')
    expect(href).toBeTruthy()

    await page.context().clearCookies()
    await login(page, accounts.apprenantDebutant)
    const response = await page.goto(href as string)
    expect([403, 404]).toContain(response?.status() ?? 0)
  })
})
