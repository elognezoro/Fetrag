import { expect, test } from '@playwright/test'
import { demoData } from '../helpers/accounts'
import { expectLoginRedirect } from '../helpers/auth'
import { expectNoServerError, expectPageHeading, openMainNavigation } from '../helpers/ui'

/**
 * Accueil et catalogue de formation.fetrag.ga (LMS-01, WEB-04, chapitre 12) : les dix modules du
 * Programme de formation des Leaders Syndicaux 2026, filtres, fiche de cours et protection des espaces.
 */
test.describe('Accueil et catalogue du LMS @smoke', () => {
  test('l’accueil présente le programme 2026, la devise et l’accès au catalogue', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/FETRAG/)
    await expectPageHeading(page)
    await expectNoServerError(page)
    await expect(page.getByText(/Travail · Efficacité · Solidarité/).first()).toBeVisible()
    await expect(page.getByText(/Les 10 modules|10 modules/i).first()).toBeVisible()
    await expect(page.getByText(/Ensemble, construisons l[’']avenir du mouvement syndical/).first()).toBeVisible()
    const nav = await openMainNavigation(page)
    await expect(nav.getByRole('link', { name: 'Catalogue', exact: true })).toBeVisible()
  })

  test('le catalogue liste les modules numérotés et se filtre par mot clé', async ({ page }) => {
    await page.goto('/catalogue')
    await expectPageHeading(page)
    const results = page.getByRole('list', { name: 'Résultats du catalogue' })
    await expect(results).toBeVisible()
    const cards = results.getByRole('listitem')
    expect(await cards.count()).toBeGreaterThanOrEqual(1)
    expect(await cards.count()).toBeLessThanOrEqual(10)
    await expect(results.getByText(/Fondamentaux du Syndicalisme Gabonais/)).toBeVisible()
    await expect(results.getByText(/^01$|Module 01/).first()).toBeVisible()

    const filters = page.getByRole('form', { name: 'Filtrer le catalogue' }).or(page.locator('form[aria-label="Filtrer le catalogue"]'))
    await filters.getByLabel('Rechercher').fill('Droit du travail')
    const submit = filters.getByRole('button', { name: /Filtrer|Rechercher|Appliquer/ })
    if (await submit.first().isVisible().catch(() => false)) await submit.first().click()
    else await filters.getByLabel('Rechercher').press('Enter')
    await page.waitForURL(/q=Droit/i)
    await expect(page.getByRole('list', { name: 'Résultats du catalogue' }).getByText(/Droit du Travail et Contentieux/)).toBeVisible()
    await expect(page.getByRole('list', { name: 'Résultats du catalogue' }).getByText(/Santé, Sécurité/)).toHaveCount(0)
  })

  test('un filtre sans résultat affiche un état vide explicite', async ({ page }) => {
    await page.goto('/catalogue?q=zzzz-aucun-module')
    await expectPageHeading(page)
    await expect(page.getByText(/Aucune formation|Aucun module|Aucun résultat/i).first()).toBeVisible()
    await expectNoServerError(page)
  })

  test('la fiche du module pilote détaille objectifs, programme et modalités', async ({ page }) => {
    await page.goto(`/cours/${demoData.pilotCourseSlug}`)
    await expectPageHeading(page, /Fondamentaux du Syndicalisme/)
    await expect(page.getByText(/Module 01/).first()).toBeVisible()
    await expect(page.getByRole('heading', { name: /Modules, leçons et activités/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Cohortes ouvertes/ })).toBeVisible()
    await expect(page.getByText(/Gratuit/i).first()).toBeVisible()
    await expect(page.getByText(/Attestation vérifiable/)).toBeVisible()
    // Visiteur anonyme : invitation à se connecter, avec retour sur la fiche.
    const loginLink = page.getByRole('link', { name: /Se connecter pour s[’']inscrire/ })
    await expect(loginLink).toBeVisible()
    await expect(loginLink).toHaveAttribute('href', new RegExp(`callbackUrl=.*${demoData.pilotCourseSlug}`))
    await expect(page.getByRole('link', { name: 'Créer un compte' })).toBeVisible()
  })

  test('le module payant affiche son tarif en XAF', async ({ page }) => {
    await page.goto(`/cours/${demoData.paidCourseSlug}`)
    await expectPageHeading(page, /Leadership Syndical/)
    await expect(page.getByText(/25\s?000/).first()).toBeVisible()
    await expect(page.getByText(/XAF|FCFA|F CFA/).first()).toBeVisible()
  })

  test('un slug de cours inconnu renvoie une page introuvable', async ({ page }) => {
    const response = await page.goto('/cours/module-inexistant')
    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('les espaces institutionnels exigent une session', async ({ page }) => {
    await expectLoginRedirect(page, '/demande-formation')
    await expectLoginRedirect(page, '/organisation')
    for (const path of ['/dashboard', '/mes-formations', '/certificats', '/calendrier']) {
      const response = await page.goto(path)
      const status = response?.status() ?? 0
      expect(status, `Erreur serveur sur ${path}`).toBeLessThan(500)
      if (status === 404) continue
      await page.waitForURL(/\/connexion/)
      expect(new URL(page.url()).searchParams.get('callbackUrl') ?? '').toContain(path)
    }
  })

  test('santé et documentation OpenAPI de l’API partagée', async ({ page }) => {
    const health = await page.request.get('/api/health')
    expect(health.ok()).toBeTruthy()
    expect(((await health.json()) as { ok?: boolean }).ok).toBe(true)

    const openapi = await page.request.get('/api/v1/openapi.json')
    expect(openapi.ok()).toBeTruthy()
    const spec = (await openapi.json()) as { openapi?: string; paths?: Record<string, unknown> }
    expect(spec.openapi ?? '').toMatch(/^3\./)
    expect(Object.keys(spec.paths ?? {}).length).toBeGreaterThan(0)
  })
})
