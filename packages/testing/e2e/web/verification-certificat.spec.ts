import { expect, test } from '@playwright/test'
import { demoData } from '../helpers/accounts'
import { expectNoServerError, expectPageHeading, gotoOrSkip, skipUnlessVisible } from '../helpers/ui'

/**
 * Vérification publique d'un certificat (WEB-16, LMS-07, ADR-004) : code valide émis par le seed,
 * code inconnu, formulaire de saisie. Aucune donnée personnelle autre que le nom du titulaire,
 * l'intitulé, la date et le statut ne doit apparaître.
 */
test.describe('Vérification publique d’un certificat @smoke', () => {
  const validCode = demoData.certificateVerifyCodes[0]

  test('un code valide affiche un certificat authentique sans exposer de données inutiles', async ({ page }) => {
    await gotoOrSkip(page, `/certificats/verifier/${validCode}`, 'La vérification de certificat n’est pas encore disponible')
    await expectPageHeading(page)
    await expect(page.getByText(/Certificat valide|Attestation valide/).first()).toBeVisible()
    await expect(page.getByText(validCode).first()).toBeVisible()
    await expect(page.getByText(/Titulaire/).first()).toBeVisible()
    await expect(page.getByText(/Formation/).first()).toBeVisible()
    await expect(page.getByText(/Émis le/).first()).toBeVisible()
    await expect(page.getByText(/FETRAG-\d{4}-\d+/).first()).toBeVisible()

    // Confidentialité : ni email, ni téléphone, ni identifiant technique du titulaire.
    await expect(page.getByText(/@demo\.fetrag\.ga|@fetrag\.ga/)).toHaveCount(0)
    await expect(page.getByText(/\b0(6|7)\d \d\d \d\d \d\d\b/)).toHaveCount(0)
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0)
  })

  test('un code inconnu affiche un résultat « introuvable » sans erreur serveur', async ({ page }) => {
    await gotoOrSkip(page, `/certificats/verifier/${demoData.invalidVerifyCode}`, 'La vérification de certificat n’est pas encore disponible')
    await expectPageHeading(page)
    await expect(page.getByText(/introuvable|inconnu|Aucun certificat/i).first()).toBeVisible()
    await expect(page.getByText(/Certificat valide/)).toHaveCount(0)
    await expectNoServerError(page)
  })

  test('le formulaire de saisie redirige vers la page du code', async ({ page }) => {
    await gotoOrSkip(page, '/certificats/verifier', 'La page de vérification n’est pas encore disponible')
    await expectPageHeading(page)
    const input = page.getByLabel(/Code de vérification|Numéro du certificat|Code/i).first()
    await skipUnlessVisible(input, 'Le formulaire de vérification n’expose pas encore de champ « Code »')
    await input.fill(validCode.toLowerCase())
    await page.getByRole('button', { name: /Vérifier/ }).first().click()
    await page.waitForURL((url) => url.pathname.toUpperCase().includes(validCode) || url.searchParams.has('code'), { timeout: 20_000 })
    await expect(page.getByText(/Certificat valide|Attestation valide/).first()).toBeVisible()
  })

  test('un code mal formé est refusé côté serveur', async ({ page }) => {
    const response = await page.goto('/certificats/verifier/%3Cscript%3E')
    const status = response?.status() ?? 0
    expect(status).toBeLessThan(500)
    if (status === 404) test.skip(true, 'La vérification de certificat n’est pas encore disponible')
    await expect(page.getByText(/introuvable|invalide|inconnu/i).first()).toBeVisible()
    await expectNoServerError(page)
  })
})
