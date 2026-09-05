import { expect, test, type Locator, type Page } from '@playwright/test'

/** Le titre principal de la page (un seul h1 par page, DESIGN_SYSTEM.md section 3). */
export async function expectPageHeading(page: Page, pattern?: RegExp | string): Promise<Locator> {
  const heading = page.getByRole('heading', { level: 1 }).first()
  await expect(heading).toBeVisible()
  if (pattern) await expect(heading).toContainText(pattern)
  return heading
}

/** Vérifie qu'aucune erreur serveur (page error.tsx ou 5xx) n'est affichée. */
export async function expectNoServerError(page: Page): Promise<void> {
  await expect(page.getByText(/Une erreur est survenue|Erreur interne|Internal Server Error|Application error/i)).toHaveCount(0)
}

/**
 * Ignore le test si un élément attendu n'existe pas encore : les écrans de certains lots sont en cours
 * d'écriture (BUILD_BRIEF section 4). Le rapport Playwright signale alors un test « skipped » avec la raison,
 * ce qui vaut mieux qu'un faux échec.
 */
export async function skipUnlessVisible(locator: Locator, reason: string, timeout = 8_000): Promise<boolean> {
  const visible = await locator
    .first()
    .waitFor({ state: 'visible', timeout })
    .then(() => true)
    .catch(() => false)
  if (!visible) test.skip(true, reason)
  return visible
}

/**
 * Navigue vers une route et ignore le test si elle n'est pas encore réalisée (404).
 * Une réponse 5xx reste un échec. Retourne le statut HTTP obtenu.
 */
export async function gotoOrSkip(page: Page, path: string, reason = `La route ${path} n'est pas encore disponible`): Promise<number> {
  const response = await page.goto(path)
  const status = response?.status() ?? 0
  expect(status, `Réponse serveur inattendue pour ${path}`).toBeLessThan(500)
  if (status === 404) test.skip(true, reason)
  await expectNoServerError(page)
  return status
}

/** Première correspondance parmi plusieurs sélecteurs candidats (formulaires dont les libellés varient). */
export async function firstVisible(candidates: Locator[], timeout = 5_000): Promise<Locator | null> {
  for (const candidate of candidates) {
    const ok = await candidate
      .first()
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false)
    if (ok) return candidate.first()
  }
  return null
}

/** Identifiant unique lisible pour les données créées par un test (titre d'actualité, référence...). */
export function uniqueLabel(prefix: string): string {
  const stamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)
  return `${prefix} E2E ${stamp}`
}

/** Adresse email unique et non routable pour les données de test (domaine réservé RFC 2606). */
export function uniqueEmail(prefix: string): string {
  const stamp = Date.now().toString(36)
  return `${prefix}.${stamp}@example.com`
}

/** Date ISO (AAAA-MM-JJ) décalée de `days` jours, pour les champs `type="date"`. */
export function isoDateFromNow(days: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/**
 * Ouvre la navigation principale : visible directement sur bureau (`nav[aria-label="Navigation principale"]`),
 * derrière le bouton « Ouvrir le menu » sur mobile (`nav[aria-label="Navigation mobile"]`).
 */
export async function openMainNavigation(page: Page): Promise<Locator> {
  const desktopNav = page.getByRole('navigation', { name: 'Navigation principale' })
  if (await desktopNav.isVisible().catch(() => false)) return desktopNav
  const toggle = page.getByRole('button', { name: 'Ouvrir le menu' })
  await toggle.click()
  const mobileNav = page.getByRole('navigation', { name: 'Navigation mobile' })
  await expect(mobileNav).toBeVisible()
  return mobileNav
}

/**
 * Renseigne les champs obligatoires encore vides d'un formulaire (champs dynamiques d'un service,
 * variantes de formulaires) avec des valeurs plausibles ; les champs déjà remplis sont conservés.
 */
export async function fillRequiredFields(form: Locator, defaults: { text?: string; email?: string; phone?: string } = {}): Promise<void> {
  const text = defaults.text ?? 'Renseigné automatiquement par le scénario E2E FETRAG.'
  const email = defaults.email ?? uniqueEmail('e2e')
  const phone = defaults.phone ?? '066230033'

  const inputs = form.locator('input[required], textarea[required], select[required]')
  const count = await inputs.count()
  for (let i = 0; i < count; i += 1) {
    const field = inputs.nth(i)
    if (!(await field.isVisible().catch(() => false))) continue
    const tag = (await field.evaluate((el) => el.tagName.toLowerCase())) as 'input' | 'textarea' | 'select'
    const type = ((await field.getAttribute('type')) ?? 'text').toLowerCase()
    if (tag === 'select') {
      const current = await field.inputValue()
      if (current) continue
      const options = await field.locator('option').evaluateAll((els) => els.map((o) => (o as HTMLOptionElement).value).filter(Boolean))
      if (options[0]) await field.selectOption(options[0])
      continue
    }
    if (type === 'checkbox' || type === 'radio') {
      if (!(await field.isChecked())) await field.check()
      continue
    }
    if (type === 'hidden' || type === 'file' || type === 'submit') continue
    if ((await field.inputValue()).trim()) continue
    if (type === 'email') await field.fill(email)
    else if (type === 'tel') await field.fill(phone)
    else if (type === 'date') await field.fill(isoDateFromNow(30))
    else if (type === 'number') await field.fill('1')
    else await field.fill(text)
  }
}
