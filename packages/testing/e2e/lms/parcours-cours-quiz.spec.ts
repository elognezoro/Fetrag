import { expect, test, type Locator, type Page } from '@playwright/test'
import { accounts, demoData } from '../helpers/accounts'
import { login } from '../helpers/auth'
import { expectNoServerError, expectPageHeading, firstVisible, gotoOrSkip, skipUnlessVisible } from '../helpers/ui'

/**
 * Parcours d'apprentissage (LMS-02, LMS-03, LMS-08, LMS-22, ADR-004) : inscription libre au module pilote,
 * lecteur pédagogique mobile-first, progression, évaluation (tentative, réponses, soumission, résultat)
 * et consultation des certificats. Le scénario écrit en base (inscription, tentative de quiz).
 */
test.describe('Parcours de cours et quiz', () => {
  /** Rejoint le lecteur du module pilote : inscription libre (« Commencer ») ou reprise. */
  async function openReader(page: Page): Promise<void> {
    await page.goto(`/cours/${demoData.pilotCourseSlug}`)
    await expectPageHeading(page, /Fondamentaux du Syndicalisme/)
    const cta = await firstVisible([page.getByRole('button', { name: /^Commencer$/ }), page.getByRole('link', { name: /^Reprendre$|Revoir la formation/ })])
    expect(cta, 'Aucune action d’inscription ou de reprise sur la fiche du module pilote').not.toBeNull()
    await (cta as Locator).click()
    await page.waitForURL(/\/apprendre\//, { timeout: 30_000 })
    const status = (await page.request.get(page.url())).status()
    if (status === 404) test.skip(true, 'Le lecteur pédagogique /apprendre n’est pas encore disponible')
    await expectNoServerError(page)
  }

  /** Répond à la question affichée avec la première option disponible selon le type. */
  async function answerCurrentQuestion(card: Locator): Promise<void> {
    const radio = card.getByRole('radio').first()
    if (await radio.isVisible().catch(() => false)) {
      await radio.click()
      return
    }
    const checkbox = card.getByRole('checkbox').first()
    if (await checkbox.isVisible().catch(() => false)) {
      await checkbox.click()
      return
    }
    const select = card.locator('select').first()
    if (await select.isVisible().catch(() => false)) {
      const values = await select.locator('option').evaluateAll((els) => els.map((o) => (o as HTMLOptionElement).value).filter(Boolean))
      if (values[0]) await select.selectOption(values[0])
      return
    }
    const textarea = card.getByRole('textbox').first()
    if (await textarea.isVisible().catch(() => false)) {
      await textarea.fill('Le Code du travail gabonais et les conventions collectives encadrent le dialogue social.')
    }
  }

  test('un apprenant s’inscrit au module pilote et progresse dans le lecteur @write', async ({ page }) => {
    test.setTimeout(120_000)
    await login(page, accounts.apprenantDebutant, `/cours/${demoData.pilotCourseSlug}`)
    await openReader(page)

    await expectPageHeading(page)
    const activityNav = page.getByRole('navigation', { name: 'Navigation entre les activités' })
    await expect(activityNav).toBeVisible()
    await expect(page.getByText(/Progression|%/).first()).toBeVisible()

    // Avancer de deux activités : la progression est enregistrée côté serveur (reprise idempotente, LMS-20).
    for (let i = 0; i < 2; i += 1) {
      const nextLink = activityNav.getByRole('link', { name: /Suivant/ })
      if (!(await nextLink.isVisible().catch(() => false))) break
      await nextLink.click()
      await page.waitForLoadState('networkidle')
      await expectNoServerError(page)
    }

    // Retour à la fiche : l'inscription est active et propose de reprendre.
    await page.goto(`/cours/${demoData.pilotCourseSlug}`)
    await expect(page.getByRole('link', { name: /^Reprendre$|Revoir la formation/ })).toBeVisible()
    await expect(page.getByText(/Progression|Terminée/).first()).toBeVisible()
  })

  test('un apprenant passe l’évaluation du module pilote et obtient un résultat @write', async ({ page }) => {
    test.setTimeout(180_000)
    await login(page, accounts.apprenantDebutant, `/cours/${demoData.pilotCourseSlug}`)
    await openReader(page)

    // Trouver un lien vers une évaluation : sur la page courante, dans le sommaire, sinon en avançant.
    let evaluationLink = page.locator('a[href*="/evaluations/"]').first()
    for (let i = 0; i < 12 && !(await evaluationLink.isVisible().catch(() => false)); i += 1) {
      const nextLink = page.getByRole('navigation', { name: 'Navigation entre les activités' }).getByRole('link', { name: /Suivant/ })
      if (!(await nextLink.isVisible().catch(() => false))) break
      await nextLink.click()
      await page.waitForLoadState('networkidle')
      evaluationLink = page.locator('a[href*="/evaluations/"]').first()
    }
    await skipUnlessVisible(evaluationLink, 'Aucune évaluation atteignable depuis le lecteur du module pilote')
    await evaluationLink.click()
    await page.waitForURL(/\/evaluations\//, { timeout: 30_000 })
    await expectPageHeading(page)

    const exhausted = page.getByText(/Nombre maximal de tentatives atteint/)
    if (await exhausted.isVisible().catch(() => false)) {
      await expect(page.getByRole('heading', { name: /Historique des tentatives|Tentatives/ }).first()).toBeVisible()
      test.info().annotations.push({ type: 'note', description: 'Tentatives épuisées : résultat vérifié depuis l’historique uniquement.' })
      return
    }

    const start = await firstVisible([page.getByRole('button', { name: /Commencer l[’']évaluation|Reprendre la tentative en cours|Nouvelle tentative|Répondre au questionnaire/ })], 8_000)
    if (!start) {
      test.skip(true, 'L’évaluation n’est pas ouverte à cet apprenant (inscription requise ou activité non disponible)')
      return
    }
    await start.click()

    // Répondre question par question (mode « une par une ») ou toutes à la fois.
    const submitLabel = /Soumettre mes réponses/
    for (let guard = 0; guard < 40; guard += 1) {
      const cards = page.locator('fieldset')
      const count = await cards.count()
      for (let i = 0; i < count; i += 1) {
        const card = cards.nth(i)
        if (await card.isVisible().catch(() => false)) await answerCurrentQuestion(card)
      }
      const submit = page.getByRole('button', { name: submitLabel })
      if (await submit.first().isVisible().catch(() => false)) {
        await submit.first().click()
        break
      }
      const nextQuestion = page.getByRole('button', { name: 'Suivante', exact: true })
      await expect(nextQuestion).toBeVisible()
      await nextQuestion.click()
    }

    const dialog = page.getByRole('dialog')
    if (await dialog.isVisible().catch(() => false)) {
      await dialog.getByRole('button', { name: /Soumettre quand même/ }).click()
    }

    await expect(page.getByText(/Score :|en attente de correction|Merci pour vos réponses/).first()).toBeVisible({ timeout: 30_000 })
    await expectNoServerError(page)
    await expect(page.getByRole('link', { name: /Retour à la leçon/ })).toBeVisible()
  })

  test('l’apprenant certifié consulte ses certificats et leur lien de vérification @smoke', async ({ page }) => {
    await login(page, accounts.apprenantCertifie, '/catalogue')
    await gotoOrSkip(page, '/certificats', 'La page des certificats n’est pas encore disponible')
    await expectPageHeading(page)
    await expect(page.getByText(/FETRAG-\d{4}-\d+/).first()).toBeVisible()
    await expect(page.getByText(/Fondamentaux du Syndicalisme/).first()).toBeVisible()
    const verifyLink = page.getByRole('link', { name: /Vérifier/ }).first()
    await expect(verifyLink).toHaveAttribute('href', /\/certificats\/verifier\//)
  })

  test('« Mes formations » présente les inscriptions et la progression @smoke', async ({ page }) => {
    await login(page, accounts.apprenantCertifie, '/catalogue')
    await gotoOrSkip(page, '/mes-formations', 'La page « Mes formations » n’est pas encore disponible')
    await expectPageHeading(page)
    await expect(page.getByText(/Fondamentaux du Syndicalisme/).first()).toBeVisible()
    await expect(page.getByText(/%|Terminée|En cours/).first()).toBeVisible()
  })

  test('le tableau de bord apprenant est lisible sur mobile @smoke', async ({ page }) => {
    await login(page, accounts.apprenantCertifie, '/catalogue')
    await gotoOrSkip(page, '/dashboard', 'Le tableau de bord apprenant n’est pas encore disponible')
    await expectPageHeading(page)
    await expect(page.getByText(/Progression|Échéances|Certificats|Résultats/).first()).toBeVisible()
    // Aucun défilement horizontal (mobile-first, DESIGN_SYSTEM.md section 8).
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(1)
  })
})
