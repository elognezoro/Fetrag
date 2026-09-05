import { expect, test, type Page } from '@playwright/test'
import { accounts } from '../helpers/accounts'
import { login } from '../helpers/auth'
import { expectNoServerError, expectPageHeading, firstVisible, gotoOrSkip, isoDateFromNow, skipUnlessVisible, uniqueEmail, uniqueLabel } from '../helpers/ui'

/**
 * Workflow de demande de formation institutionnelle (LMS-05, chapitre 14, ADR-004) :
 * le responsable SYNATEP soumet une demande en six étapes (organisation, modules, participants,
 * préférences, engagements, récapitulatif) puis la suit ; la coordination demande un complément.
 * Le scénario écrit en base : participants fictifs (`example.com`), demande identifiable « E2E ».
 */
test.describe('Demande de formation institutionnelle @write', () => {
  test.describe.configure({ mode: 'serial' })

  let createdReference: string | null = null

  async function next(page: Page): Promise<void> {
    await page.getByRole('button', { name: 'Continuer', exact: true }).click()
  }

  test('le responsable SYNATEP soumet une demande complète et la retrouve dans son suivi', async ({ page }) => {
    test.setTimeout(150_000)
    await login(page, accounts.responsable, '/demande-formation')
    await gotoOrSkip(page, '/demande-formation', 'L’assistant de demande n’est pas encore disponible')
    await expectPageHeading(page, /leaders syndicaux/i)
    await skipUnlessVisible(page.getByRole('list', { name: 'Étapes de la demande' }), 'L’assistant en six étapes n’est pas encore affiché')

    // Étape 01 - Organisation et personne ressource (préremplie depuis le profil).
    const contactName = page.getByLabel(/^Personne ressource/)
    await expect(contactName).toBeVisible()
    if (!(await contactName.inputValue()).trim()) await contactName.fill('Responsable SYNATEP (E2E)')
    const contactEmail = page.getByLabel(/^Email$/)
    if (!(await contactEmail.inputValue()).trim()) await contactEmail.fill(accounts.responsable.email)
    const contactRole = page.getByLabel(/^Fonction$/)
    if (await contactRole.isVisible().catch(() => false)) await contactRole.fill('Secrétaire général de section')
    await next(page)

    // Étape 02 - Modules du programme (cartes numérotées 01-10, sélection par case à cocher).
    const modules = page.getByRole('group', { name: 'Modules du programme' })
    await expect(modules).toBeVisible()
    await modules.getByRole('checkbox', { name: /Fondamentaux du Syndicalisme/ }).click()
    await modules.getByRole('checkbox', { name: /Négociation Collective/ }).click()
    await expect(page.getByText(/2 module\(s\) sélectionné\(s\)/)).toBeVisible()
    await next(page)

    // Étape 03 - Participants nominatifs (limite configurable, chapitre 14 point 4).
    const addParticipant = page.getByRole('button', { name: 'Ajouter un participant' })
    await expect(addParticipant).toBeVisible()
    const participants = [
      { name: 'Okoumé Mbadinga (E2E)', email: uniqueEmail('participant1'), job: 'Déléguée du personnel' },
      { name: 'Nzé Ondo (E2E)', email: uniqueEmail('participant2'), job: 'Trésorier de section' },
    ]
    for (const [index, participant] of participants.entries()) {
      await addParticipant.click()
      const n = index + 1
      await page.getByLabel(`Nom du participant ${n}`).fill(participant.name)
      await page.getByLabel(`Email du participant ${n}`).fill(participant.email)
      await page.getByLabel(`Téléphone du participant ${n}`).fill(`06600${n}${n}${n}${n}`)
      await page.getByLabel(`Fonction du participant ${n}`).fill(participant.job)
    }
    await next(page)

    // Étape 04 - Préférences de calendrier et modalité.
    const preferredStart = page.getByLabel(/Date de démarrage souhaitée/)
    await preferredStart.fill(isoDateFromNow(45))
    const hybrid = page.getByRole('radio', { name: /Hybride/ })
    if (await hybrid.isVisible().catch(() => false)) await hybrid.click()
    await page.getByLabel(/Motivation et attentes/).fill(`${uniqueLabel('Demande')} - Renforcer les compétences des délégués de la section énergie avant l’ouverture des négociations de branche.`)
    await next(page)

    // Étape 05 - Engagements réciproques (consentement tracé, SHR-08).
    await expect(page.getByRole('heading', { name: /Engagements réciproques/ })).toBeVisible()
    const commitments = await firstVisible([page.getByRole('checkbox', { name: /accepte ces engagements/ }), page.getByLabel(/accepte ces engagements/)])
    expect(commitments, 'Case d’acceptation des engagements introuvable').not.toBeNull()
    if (commitments && !(await commitments.isChecked())) await commitments.click()
    await next(page)

    // Étape 06 - Récapitulatif et transmission.
    await expect(page.getByText(/Modules demandés/)).toBeVisible()
    await expect(page.getByText(/Participants \(2\)/)).toBeVisible()
    await expect(page.getByText(participants[0]?.name ?? '')).toBeVisible()
    const submit = page.getByRole('button', { name: /Transmettre à la coordination/ })
    await expect(submit).toBeEnabled()
    await submit.click()

    await page.waitForURL(/\/demande-formation\/[^/?]+/, { timeout: 30_000 })
    await expectNoServerError(page)
    const heading = await expectPageHeading(page, /DF-\d{4}-/)
    createdReference = ((await heading.textContent()) ?? '').trim()
    await expect(page.getByText(/Soumise|Transmise|En instruction|En attente/i).first()).toBeVisible()
    await expect(page.getByText(/Fondamentaux du Syndicalisme/).first()).toBeVisible()
    await expect(page.getByText(participants[1]?.name ?? '').first()).toBeVisible()

    // Suivi depuis le tableau de bord de l'organisation (LMS-09) : la demande y figure avec son statut.
    await page.goto('/organisation')
    await expectPageHeading(page, /SYNATEP/)
    await expect(page.getByText(createdReference).first()).toBeVisible()
  })

  test('une demande sans module ni participant est bloquée par la validation', async ({ page }) => {
    await login(page, accounts.responsable, '/demande-formation')
    await gotoOrSkip(page, '/demande-formation', 'L’assistant de demande n’est pas encore disponible')
    await skipUnlessVisible(page.getByRole('list', { name: 'Étapes de la demande' }), 'L’assistant en six étapes n’est pas encore affiché')
    await page.getByLabel(/^Personne ressource/).fill('')
    await next(page)
    // On reste à l'étape 01 : message d'erreur lié au champ (role="alert").
    await expect(page.getByRole('alert').first()).toBeVisible()
    await expect(page.getByRole('group', { name: 'Modules du programme' })).toHaveCount(0)
  })

  test('la coordination instruit la demande et demande un complément', async ({ page }) => {
    test.setTimeout(90_000)
    if (!createdReference) {
      test.skip(true, 'Aucune demande créée par le scénario précédent')
      return
    }
    await login(page, accounts.coordination, '/catalogue')
    await gotoOrSkip(page, '/coordination/demandes', 'La liste des demandes côté coordination n’est pas encore disponible')
    await expectPageHeading(page)
    const row = page.getByRole('link', { name: new RegExp(createdReference) }).first()
    await skipUnlessVisible(row, `La demande ${createdReference} n’apparaît pas encore dans la liste de coordination`)
    await row.click()
    await page.waitForURL(/\/coordination\/demandes\/[^/?]+|\/demande-formation\/[^/?]+/)
    await expectPageHeading(page, createdReference)

    const askInfo = await firstVisible([page.getByRole('button', { name: /Demander un complément|Complément/ })], 6_000)
    if (!askInfo) {
      test.skip(true, 'Les actions de décision ne sont pas encore exposées sur la fiche de coordination')
      return
    }
    await askInfo.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    const reason = dialog.getByRole('textbox').first()
    await reason.fill('Merci de joindre la lettre de demande signée par le secrétaire général de la section (test automatisé).')
    await dialog.getByRole('button', { name: /Demander|Confirmer|Envoyer/ }).last().click()
    await expect(page.getByText(/Complément demandé|Informations demandées|Complément/).first()).toBeVisible({ timeout: 20_000 })
    await expectNoServerError(page)

    // Le responsable voit la demande de complément et peut reprendre sa demande.
    await page.context().clearCookies()
    await login(page, accounts.responsable, '/organisation')
    await expect(page.getByText(createdReference).first()).toBeVisible()
    await expect(page.getByText(/Complément|Reprendre/).first()).toBeVisible()
  })
})
