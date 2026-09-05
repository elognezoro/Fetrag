import { expect, test, type Locator, type Page } from '@playwright/test'
import { accounts } from '../helpers/accounts'
import { login } from '../helpers/auth'
import { expectNoServerError, expectPageHeading, firstVisible, gotoOrSkip, skipUnlessVisible, uniqueLabel } from '../helpers/ui'

/**
 * Workflow éditorial (WEB-02, WEB-18, ADR-005) : création d'une actualité dans le back-office
 * `/admin/actualites`, passage au statut « Publié », vérification sur le site public, puis archivage.
 * Le scénario écrit en base : les contenus créés portent le suffixe « E2E » et sont archivés en fin de test.
 */
test.describe('Publication d’une actualité @write', () => {
  test.describe.configure({ mode: 'serial' })

  /** Déclenche une transition de statut depuis le panneau de publication (bouton direct ou menu déroulant). */
  async function transition(page: Page, label: RegExp): Promise<boolean> {
    const direct = page.getByRole('button', { name: label })
    if (await direct.first().isVisible().catch(() => false)) {
      await direct.first().click()
    } else {
      const trigger = await firstVisible([page.getByRole('button', { name: /Changer de statut|Statut|Actions pour/ }), page.getByRole('button', { name: /^Actions/ })], 4_000)
      if (!trigger) return false
      await trigger.click()
      const item = page.getByRole('menuitem', { name: label })
      if (!(await item.first().isVisible().catch(() => false))) return false
      await item.first().click()
    }
    // Certaines transitions demandent une confirmation (dialogue Radix).
    const dialog = page.getByRole('dialog')
    if (await dialog.isVisible().catch(() => false)) {
      const confirm = dialog.getByRole('button', { name: /Confirmer|Publier|Archiver/ }).last()
      if (await confirm.isVisible().catch(() => false)) await confirm.click()
    }
    return true
  }

  /** Éditeur riche TipTap (zone `contenteditable`) ou zone de texte de repli. */
  async function contentEditor(form: Locator): Promise<Locator> {
    const rich = form.locator('[contenteditable="true"]').first()
    if (await rich.isVisible().catch(() => false)) return rich
    return form.getByRole('textbox', { name: /Texte de l[’']actualité/ })
  }

  test('un administrateur crée, publie puis archive une actualité', async ({ page }) => {
    test.setTimeout(120_000)
    const title = uniqueLabel('Assemblée des sections')
    const excerpt = 'La FETRAG réunit ses sections pour préparer le dialogue social de la rentrée.'

    await login(page, accounts.admin, '/admin/actualites')
    await gotoOrSkip(page, '/admin/actualites', 'Le back-office des actualités n’est pas encore disponible')
    await expectPageHeading(page)

    // 1. Ouvrir le formulaire de création.
    const createLink = await firstVisible([page.getByRole('link', { name: /Nouvelle actualité|Créer une actualité|Ajouter une actualité|Nouvelle publication/ }), page.getByRole('button', { name: /Nouvelle actualité|Créer une actualité/ })])
    if (createLink) {
      await createLink.click()
    } else {
      const status = await gotoOrSkip(page, '/admin/actualites/nouvelle', 'Le formulaire de création d’actualité n’est pas encore disponible')
      expect(status).toBeLessThan(400)
    }
    const titleField = page.getByLabel(/^Titre/)
    await skipUnlessVisible(titleField, 'Le formulaire d’actualité n’expose pas encore le champ « Titre »')

    // 2. Renseigner le contenu.
    const form = page.locator('form').filter({ has: titleField })
    await titleField.fill(title)
    const excerptField = page.getByLabel(/^Chapô/)
    if (await excerptField.isVisible().catch(() => false)) await excerptField.fill(excerpt)
    const editor = await contentEditor(form)
    await editor.click()
    await page.keyboard.type('Les responsables de sections de la Fédération des Travailleurs du Gabon se réunissent à Libreville. ')
    await page.keyboard.type('À l’ordre du jour : protection de l’outil de production, prévention des conflits sociaux et défense des intérêts des travailleurs.')

    // 3. Enregistrer (brouillon) : redirection vers la fiche de l'actualité créée.
    await page.getByRole('button', { name: /Créer l[’']actualité|Enregistrer/ }).click()
    await page.waitForURL(/\/admin\/actualites\/[^/]+/, { timeout: 30_000 })
    await expectNoServerError(page)
    await expect(page.getByLabel(/^Titre/)).toHaveValue(title)
    await expect(page.getByText(/Brouillon/).first()).toBeVisible()

    // 4. Publier.
    const published = await transition(page, /^Publier$/)
    if (!published) test.skip(true, 'Le panneau de publication n’expose pas encore l’action « Publier »')
    await expect(page.getByText(/^Publié/).first()).toBeVisible({ timeout: 20_000 })

    // 5. Vérifier sur le site public.
    await page.goto('/actualites')
    const publicLink = page.getByRole('link', { name: title })
    await expect(publicLink.first()).toBeVisible({ timeout: 20_000 })
    await publicLink.first().click()
    await page.waitForURL(/\/actualites\/[a-z0-9-]+$/)
    await expectPageHeading(page, title)
    await expect(page.getByText(/protection de l’outil de production/i).first()).toBeVisible()

    // 6. Archiver pour ne pas polluer le site de recette (meilleur effort : le contenu reste identifiable « E2E »).
    await page.goBack()
    await page.goBack()
    if (!/\/admin\/actualites\/[^/]+/.test(page.url())) {
      await page.goto('/admin/actualites')
      const row = page.getByRole('link', { name: title }).first()
      if (await row.isVisible().catch(() => false)) await row.click()
    }
    if (/\/admin\/actualites\/[^/]+/.test(page.url())) {
      const archived = await transition(page, /^Archiver$/)
      if (archived) await expect(page.getByText(/^Archivé/).first()).toBeVisible({ timeout: 20_000 })
    }
  })

  test('un apprenant ne voit pas le back-office des actualités', async ({ page }) => {
    await login(page, accounts.apprenantDebutant)
    const response = await page.goto('/admin/actualites')
    const status = response?.status() ?? 0
    expect(status).toBeLessThan(500)
    if (status === 404) test.skip(true, 'Le back-office des actualités n’est pas encore disponible')
    await page.waitForURL(/\/acces-refuse|\/connexion/)
    await expect(page.getByLabel(/^Titre/)).toHaveCount(0)
  })
})
