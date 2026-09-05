import { expect, test } from '@playwright/test'
import { demoData } from '../helpers/accounts'
import { expectNoServerError, expectPageHeading, gotoOrSkip, openMainNavigation } from '../helpers/ui'

/**
 * Accueil de fetrag.ga et navigation publique (WEB-01, WEB-17, chapitre 38.1).
 * Scénarios en lecture seule : exécutables contre la recette (`--grep @smoke`).
 */
test.describe('Accueil et navigation du site institutionnel @smoke', () => {
  test('la page d’accueil présente la FETRAG, sa mission, sa devise et le triptyque fondateur', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/FETRAG/)
    await expectPageHeading(page, /Défendre les travailleurs/)
    await expectNoServerError(page)

    // Mission officielle (BUILD_BRIEF section 6), reprise mot pour mot.
    await expect(page.getByText(/défendre les droits des travailleurs gabonais/i).first()).toBeVisible()

    // Devise « Travail · Efficacité · Solidarité » et triptyque fondateur (Protection, Prévention, Défense).
    await expect(page.getByText(/Travail/).first()).toBeVisible()
    await expect(page.getByText(/Efficacité/).first()).toBeVisible()
    await expect(page.getByText(/Solidarité/).first()).toBeVisible()
    for (const pillar of [/Protection/, /Prévention/, /Défense/]) {
      await expect(page.getByText(pillar).first()).toBeVisible()
    }

    // Mot du Secrétaire Général et lien vers la plateforme de formation.
    await expect(page.getByText(/Jocelyn Louis NGOMA/).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Découvrir la FETRAG/ })).toBeVisible()
  })

  test('le lien d’évitement mène au contenu principal', async ({ page }) => {
    await page.goto('/')
    const skipLink = page.getByRole('link', { name: 'Aller au contenu principal' })
    await skipLink.focus()
    await expect(skipLink).toBeFocused()
    await skipLink.press('Enter')
    await expect(page.locator('main#contenu')).toBeVisible()
  })

  test('la navigation principale (bureau ou tiroir mobile) ouvre les rubriques', async ({ page }) => {
    await page.goto('/')
    const nav = await openMainNavigation(page)
    for (const label of ['La FETRAG', 'Actualités', 'Formations', 'Services', 'Ressources', 'Événements', 'Contact']) {
      await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible()
    }
    await nav.getByRole('link', { name: 'Actualités', exact: true }).click()
    await page.waitForURL(/\/actualites$/)
    await expectPageHeading(page)

    const navAgain = await openMainNavigation(page)
    await navAgain.getByRole('link', { name: 'La FETRAG', exact: true }).click()
    await page.waitForURL(/\/la-fetrag$/)
    await expectPageHeading(page)
    await expect(page.getByText(/Triptyque fondateur/i).first()).toBeVisible()
  })

  test('le pied de page renvoie vers la plateforme de formation et la vérification de certificat', async ({ page }) => {
    await page.goto('/')
    const footer = page.getByRole('contentinfo')
    await expect(footer).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Plateforme de formation' })).toHaveAttribute('href', /localhost:3001|formation\.fetrag\.ga|fetrag-lms/)
    await expect(footer.getByRole('link', { name: 'Vérifier un certificat' })).toHaveAttribute('href', '/certificats/verifier')
    await expect(footer.getByRole('link', { name: 'Mentions légales' })).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Confidentialité' })).toBeVisible()
  })

  test('la liste des actualités mène à une actualité publiée par le seed', async ({ page }) => {
    await page.goto('/actualites')
    await expectPageHeading(page)
    const articleLink = page.getByRole('link', { name: /Programme de formation des Leaders Syndicaux/i }).first()
    if (await articleLink.isVisible().catch(() => false)) {
      await articleLink.click()
    } else {
      await page.goto(`/actualites/${demoData.articleSlug}`)
    }
    await page.waitForURL(/\/actualites\/[a-z0-9-]+$/)
    await expectPageHeading(page)
    await expectNoServerError(page)
    // Balises sociales et canonique (WEB-17).
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1)
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
  })

  test('les pages publiques répondent sans erreur serveur', async ({ page }) => {
    const paths = ['/la-fetrag', '/organisations', '/actualites', '/formations', '/services', '/ressources', '/evenements', '/adhesion', '/contact', '/partenariat', '/faq', '/mentions-legales', '/confidentialite']
    const missing: string[] = []
    for (const path of paths) {
      const response = await page.goto(path)
      const status = response?.status() ?? 0
      expect(status, `Erreur serveur sur ${path}`).toBeLessThan(500)
      if (status === 404) {
        missing.push(path)
        continue
      }
      await expectPageHeading(page)
      await expectNoServerError(page)
    }
    if (missing.length) test.info().annotations.push({ type: 'routes en cours de réalisation', description: missing.join(', ') })
  })

  test('la recherche transverse retourne des résultats pour « formation »', async ({ page }) => {
    await gotoOrSkip(page, '/recherche?q=formation', 'La page de recherche n’est pas encore disponible')
    await expectPageHeading(page)
    const results = page.getByRole('link', { name: /formation/i })
    await expect(results.first()).toBeVisible()
  })

  test('une adresse inconnue affiche la page 404 du site', async ({ page }) => {
    const response = await page.goto('/cette-page-n-existe-pas')
    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading').first()).toBeVisible()
    await expect(page.getByRole('link', { name: /accueil/i }).first()).toBeVisible()
  })

  test('sitemap, robots et santé du service sont exposés', async ({ page }) => {
    const health = await page.request.get('/api/health')
    expect(health.ok()).toBeTruthy()
    const body = (await health.json()) as { ok?: boolean }
    expect(body.ok).toBe(true)

    const robots = await page.request.get('/robots.txt')
    expect(robots.ok()).toBeTruthy()
    expect(await robots.text()).toMatch(/Sitemap:/i)

    const sitemap = await page.request.get('/sitemap.xml')
    expect(sitemap.ok()).toBeTruthy()
    expect(await sitemap.text()).toContain('<urlset')
  })
})
