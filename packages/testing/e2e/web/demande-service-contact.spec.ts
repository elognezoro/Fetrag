import { expect, test } from '@playwright/test'
import { accounts } from '../helpers/accounts'
import { login } from '../helpers/auth'
import { expectNoServerError, expectPageHeading, fillRequiredFields, firstVisible, gotoOrSkip, skipUnlessVisible, uniqueEmail, uniqueLabel } from '../helpers/ui'

/**
 * Formulaires configurables (WEB-06) et catalogue de services (WEB-03) : contact avec validation
 * et accusé de réception, puis demande de service suivie dans l'espace personnel.
 * Les données créées portent le suffixe « E2E » et une adresse `example.com` non routable.
 */
test.describe('Contact et demande de service @write', () => {
  test('le formulaire de contact refuse un envoi vide et signale les champs en erreur', async ({ page }) => {
    await gotoOrSkip(page, '/contact', 'La page de contact n’est pas encore disponible')
    await expectPageHeading(page)
    const submit = page.getByRole('button', { name: /Envoyer le message/ })
    await skipUnlessVisible(submit, 'Le formulaire de contact n’est pas encore disponible')
    await submit.click()
    // Messages d'erreur associés aux champs (FormField : role="alert", aria-describedby).
    await expect(page.getByRole('alert').first()).toBeVisible()
    await expect(page.getByLabel(/^Nom complet/)).toHaveAttribute('aria-invalid', 'true')
    await expectNoServerError(page)
  })

  test('un visiteur envoie un message et reçoit un accusé de réception', async ({ page }) => {
    await gotoOrSkip(page, '/contact', 'La page de contact n’est pas encore disponible')
    const submit = page.getByRole('button', { name: /Envoyer le message/ })
    await skipUnlessVisible(submit, 'Le formulaire de contact n’est pas encore disponible')

    await page.getByLabel(/^Nom complet/).fill('Scénario E2E FETRAG')
    await page.getByLabel(/^Adresse email/).fill(uniqueEmail('contact'))
    const phone = page.getByLabel(/^Téléphone/)
    if (await phone.isVisible().catch(() => false)) await phone.fill('066 23 00 33')
    const subject = page.getByLabel(/^Objet/)
    if (await subject.isVisible().catch(() => false)) await subject.fill(uniqueLabel('Demande d’information'))
    await page.getByLabel(/^Votre message/).fill('Bonjour, je souhaite connaître les modalités d’adhésion d’une section syndicale à la FETRAG. Merci. (message de test automatisé)')

    // Consentement éventuel (SHR-08) : case à cocher obligatoire.
    const consent = page.getByRole('checkbox').first()
    if ((await consent.isVisible().catch(() => false)) && !(await consent.isChecked())) await consent.click()

    await submit.click()
    await expect(page.getByText(/Et maintenant \?|accusé de réception|Merci|bien reçu|a été envoyé/i).first()).toBeVisible({ timeout: 20_000 })
    await expectNoServerError(page)
  })

  test('le catalogue des services présente des fiches administrables', async ({ page }) => {
    await gotoOrSkip(page, '/services', 'Le catalogue des services n’est pas encore disponible')
    await expectPageHeading(page)
    const serviceLinks = page.getByRole('link', { name: /Orientation juridique|section syndicale|contentieux|convention collective/i })
    await expect(serviceLinks.first()).toBeVisible()
    await serviceLinks.first().click()
    await page.waitForURL(/\/services\/[a-z0-9-]+$/)
    await expectPageHeading(page)
    await expect(page.getByRole('button', { name: /Déposer ma demande|Déposer et payer/ }).first()).toBeVisible()
  })

  test('un utilisateur connecté dépose une demande de service et la retrouve dans son espace', async ({ page }) => {
    test.setTimeout(90_000)
    await login(page, accounts.apprenantDebutant)
    const status = await gotoOrSkip(page, '/services/orientation-juridique', 'La fiche du service « Orientation juridique » n’est pas encore disponible')
    expect(status).toBeLessThan(400)
    await expectPageHeading(page, /Orientation juridique/i)

    const submit = await firstVisible([page.getByRole('button', { name: /Déposer ma demande/ }), page.getByRole('button', { name: /Déposer et payer/ })])
    if (!submit) {
      test.skip(true, 'Le formulaire de demande de service n’est pas encore disponible')
      return
    }
    const form = page.locator('form').filter({ has: submit })

    // Coordonnées : préremplies par la session quand c'est possible, complétées sinon.
    const fullName = form.getByLabel(/^Nom complet/)
    if (!(await fullName.inputValue()).trim()) await fullName.fill('Apprenant Dix (E2E)')
    const email = form.getByLabel(/^Adresse email/)
    if (!(await email.inputValue()).trim()) await email.fill(accounts.apprenantDebutant.email)
    const organization = form.getByLabel(/^Organisation/)
    if ((await organization.isVisible().catch(() => false)) && !(await organization.inputValue()).trim()) await organization.fill('SYNATEP (démonstration)')
    const message = form.getByLabel(/^Message complémentaire/)
    if (await message.isVisible().catch(() => false)) await message.fill(`${uniqueLabel('Demande')} - Je sollicite un rendez-vous d’orientation au sujet d’un litige sur des heures supplémentaires non payées.`)
    await fillRequiredFields(form, { email: accounts.apprenantDebutant.email })

    await submit.click()
    await expect(page.getByText(/Demande enregistrée|bien reçu|accusé|Votre demande|Suivre ma demande|Régler/i).first()).toBeVisible({ timeout: 20_000 })
    await expectNoServerError(page)

    // Suivi dans l'espace personnel (WEB-10) : la demande apparaît avec un statut.
    await page.goto('/espace/demandes')
    await expectPageHeading(page)
    await expect(page.getByText(/Orientation juridique/i).first()).toBeVisible()
    await expect(page.getByText(/Nouvelle|En cours|À l’étude|En attente de paiement|Reçue/i).first()).toBeVisible()
  })
})
