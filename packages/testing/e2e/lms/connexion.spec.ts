import { expect, test } from '@playwright/test'
import { accounts } from '../helpers/accounts'
import { expectLoginRedirect, login, loginExpectingError, logout } from '../helpers/auth'
import { expectNoServerError, expectPageHeading, gotoOrSkip } from '../helpers/ui'

/**
 * Connexion sur le LMS et atterrissage par rôle (SHR-01, SHR-02, ADR-002) : apprenant, responsable
 * d'organisation, coordination, formateur, administration ; refus des accès croisés.
 */
test.describe('Connexion et espaces par rôle @auth', () => {
  test('des identifiants invalides sont refusés', async ({ page }) => {
    const message = await loginExpectingError(page, accounts.apprenantDebutant.email, 'mauvais-mot-de-passe')
    expect(message).toMatch(/incorrect/i)
  })

  test('un apprenant se connecte et voit sa navigation personnelle', async ({ page }) => {
    await login(page, accounts.apprenantDebutant, '/catalogue')
    expect(new URL(page.url()).pathname).toBe('/catalogue')
    await expectNoServerError(page)
    for (const label of ['Tableau de bord', 'Mes formations', 'Calendrier', 'Certificats']) {
      await expect(page.getByRole('link', { name: label }).first()).toBeAttached()
    }
    await logout(page)
    await expectLoginRedirect(page, '/demande-formation')
  })

  test('un apprenant n’accède pas au workflow institutionnel', async ({ page }) => {
    await login(page, accounts.apprenantDebutant, '/catalogue')
    const response = await page.goto('/demande-formation')
    expect(response?.status() ?? 0).toBeLessThan(500)
    await expect(page.getByRole('button', { name: /Transmettre à la coordination|Continuer/ })).toHaveCount(0)
    await expect(page.getByRole('group', { name: 'Modules du programme' })).toHaveCount(0)
  })

  test('le responsable SYNATEP atteint le tableau de bord de son organisation', async ({ page }) => {
    await login(page, accounts.responsable, '/organisation')
    expect(new URL(page.url()).pathname).toBe('/organisation')
    await expectPageHeading(page, /SYNATEP/)
    await expect(page.getByRole('heading', { name: /Demandes de formation/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Déposer une demande|Demande de formation|Nouvelle demande/ }).first()).toBeVisible()
    // Isolation : aucune autre organisation affiliée n'apparaît dans son espace.
    await expect(page.getByText(/Union des Travailleurs des Transports/)).toHaveCount(0)
  })

  test('le coordinateur atteint l’espace de pilotage', async ({ page }) => {
    await login(page, accounts.coordination, '/catalogue')
    await gotoOrSkip(page, '/coordination', 'L’espace coordination n’est pas encore disponible')
    await expectPageHeading(page)
    await expect(page.getByRole('link', { name: /^Demandes/ }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /^Cohortes/ }).first()).toBeVisible()
  })

  test('le formateur atteint son espace sans droits globaux', async ({ page }) => {
    await login(page, accounts.formateur, '/catalogue')
    await gotoOrSkip(page, '/formateur', 'L’espace formateur n’est pas encore disponible')
    await expectPageHeading(page)
    await expect(page.getByRole('link', { name: /Mes cohortes/ }).first()).toBeVisible()
    const admin = await page.goto('/admin')
    if ((admin?.status() ?? 0) !== 404) {
      await page.waitForURL(/\/acces-refuse|\/connexion|\/formateur|\/dashboard/)
      expect(new URL(page.url()).pathname).not.toBe('/admin')
    }
  })

  test('le super administrateur atteint l’administration LMS', async ({ page }) => {
    await login(page, accounts.admin, '/catalogue')
    await gotoOrSkip(page, '/admin', 'L’administration LMS n’est pas encore disponible')
    await expectPageHeading(page)
    for (const label of [/^Cours/, /Banque de questions/, /Modèles de certificats/, /Utilisateurs et rôles/]) {
      await expect(page.getByRole('link', { name: label }).first()).toBeAttached()
    }
  })

  test('le responsable d’organisation ne voit pas l’espace coordination', async ({ page }) => {
    await login(page, accounts.responsable, '/organisation')
    const response = await page.goto('/coordination')
    const status = response?.status() ?? 0
    expect(status).toBeLessThan(500)
    if (status === 404) test.skip(true, 'L’espace coordination n’est pas encore disponible')
    await page.waitForURL(/\/acces-refuse|\/organisation|\/dashboard/)
    expect(new URL(page.url()).pathname).not.toBe('/coordination')
  })
})
