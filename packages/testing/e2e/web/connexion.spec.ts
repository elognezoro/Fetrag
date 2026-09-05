import { expect, test } from '@playwright/test'
import { accounts } from '../helpers/accounts'
import { expectLoginRedirect, login, loginExpectingError, logout } from '../helpers/auth'
import { expectNoServerError, expectPageHeading } from '../helpers/ui'

/**
 * Connexion sur fetrag.ga (WEB-05, SHR-01, ADR-002) : compte de démonstration `admin@fetrag.ga`,
 * redirection `callbackUrl`, identifiants invalides, déconnexion et protection des pages.
 */
test.describe('Connexion au site institutionnel', () => {
  test('une page protégée renvoie vers la connexion avec un callbackUrl @smoke', async ({ page }) => {
    await expectLoginRedirect(page, '/espace')
    await expectPageHeading(page, /Bienvenue/)
    await expect(page.getByLabel(/^Adresse email/)).toBeVisible()
    await expect(page.getByLabel(/^Mot de passe/)).toBeVisible()
    await expect(page.getByRole('link', { name: /Mot de passe oublié/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Créer un compte/ })).toBeVisible()
  })

  test('des identifiants invalides affichent un message et laissent le formulaire en place @smoke', async ({ page }) => {
    const message = await loginExpectingError(page, accounts.admin.email, 'mot-de-passe-errone')
    expect(message).toMatch(/incorrect/i)
    await expect(page.getByLabel(/^Adresse email/)).toHaveValue(accounts.admin.email)
  })

  test('admin@fetrag.ga se connecte, atteint son espace personnel puis se déconnecte @auth', async ({ page }) => {
    await login(page, accounts.admin)
    expect(new URL(page.url()).pathname).toBe('/espace')
    await expectPageHeading(page, /Bonjour/)
    await expectNoServerError(page)

    // Navigation de l'espace personnel (WEB-10).
    for (const label of ['Profil', 'Mes demandes', 'Mes inscriptions', 'Paiements et reçus', 'Notifications', 'Sécurité']) {
      await expect(page.getByRole('link', { name: label }).first()).toBeAttached()
    }

    await logout(page)
    await expectLoginRedirect(page, '/espace')
  })

  test('le callbackUrl est respecté après connexion @auth', async ({ page }) => {
    await login(page, accounts.admin, '/espace/profil')
    expect(new URL(page.url()).pathname).toBe('/espace/profil')
    await expectPageHeading(page)
    await expect(page.getByLabel(/^Adresse email/).first()).toHaveValue(accounts.admin.email)
  })

  test('une page de connexion visitée avec une session ouverte redirige vers l’espace @auth', async ({ page }) => {
    await login(page, accounts.admin)
    await page.goto('/connexion')
    await page.waitForURL((url) => !url.pathname.startsWith('/connexion'))
    expect(new URL(page.url()).pathname).toBe('/espace')
  })

  test('un apprenant n’accède pas au back-office vitrine @auth', async ({ page }) => {
    await login(page, accounts.apprenantDebutant)
    const response = await page.goto('/admin')
    const status = response?.status() ?? 0
    expect(status).toBeLessThan(500)
    if (status === 404) test.skip(true, 'Le back-office /admin n’est pas encore disponible')
    await page.waitForURL(/\/acces-refuse|\/connexion/)
    await expectPageHeading(page)
    await expect(page.getByRole('link', { name: /Tableau de bord|Actualités/ })).toHaveCount(0)
  })

  test('la page de déconnexion sans session propose de se reconnecter @smoke', async ({ page }) => {
    await page.goto('/deconnexion')
    await expect(page.getByText(/Aucune session active/)).toBeVisible()
    await expect(page.getByRole('link', { name: 'Se reconnecter' })).toHaveAttribute('href', '/connexion')
  })
})
