import { expect, type Page } from '@playwright/test'
import type { DemoAccount } from './accounts'

/**
 * Connexion par le formulaire local (email + mot de passe) des deux applications.
 * Le formulaire (`components/auth/login-form.tsx`) expose les champs « Adresse email » et
 * « Mot de passe » et le bouton « Se connecter » ; en cas de MFA, un champ « Code de vérification »
 * apparaît (aucun compte de démonstration n'a la MFA activée).
 */
export async function login(page: Page, account: DemoAccount, callbackUrl?: string): Promise<void> {
  const target = callbackUrl ? `/connexion?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/connexion'
  await page.goto(target)
  await page.getByLabel(/^Adresse email/).fill(account.email)
  await page.getByLabel(/^Mot de passe/).fill(account.password)
  await page.getByRole('button', { name: /^Se connecter/ }).click()
  await page.waitForURL((url) => !url.pathname.startsWith('/connexion'), { timeout: 30_000 })
  await expect(page.getByRole('button', { name: /^Se connecter/ })).toHaveCount(0)
}

/**
 * Tente une connexion et retourne le message d'erreur affiché (sans quitter `/connexion`).
 * Utilisé pour les identifiants invalides : la page reste sur le formulaire.
 */
export async function loginExpectingError(page: Page, email: string, password: string): Promise<string> {
  await page.goto('/connexion')
  await page.getByLabel(/^Adresse email/).fill(email)
  await page.getByLabel(/^Mot de passe/).fill(password)
  await page.getByRole('button', { name: /^Se connecter/ }).click()
  const message = page.getByText(/incorrect|désactivé|Trop de tentatives|Vérifiez les informations/i).first()
  await expect(message).toBeVisible()
  expect(new URL(page.url()).pathname).toBe('/connexion')
  return (await message.textContent()) ?? ''
}

/** Déconnexion par la page dédiée (Server Action `logoutAction`, bouton « Confirmer la déconnexion »). */
export async function logout(page: Page): Promise<void> {
  await page.goto('/deconnexion')
  const confirm = page.getByRole('button', { name: /déconnexion|se déconnecter/i })
  if (await confirm.count()) await confirm.first().click()
  await page.waitForURL((url) => !url.pathname.startsWith('/deconnexion'), { timeout: 20_000 })
}

/** Vérifie qu'une page protégée renvoie vers la connexion avec le `callbackUrl` attendu. */
export async function expectLoginRedirect(page: Page, protectedPath: string): Promise<void> {
  await page.goto(protectedPath)
  await page.waitForURL(/\/connexion/)
  const url = new URL(page.url())
  expect(url.pathname).toBe('/connexion')
  expect(url.searchParams.get('callbackUrl') ?? '').toContain(protectedPath.split('?')[0] ?? protectedPath)
}

/** Vrai si une session est ouverte : le lien « Espace personnel » / « Se connecter » a disparu au profit du menu utilisateur. */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const loginLinks = page.getByRole('link', { name: /^(Espace personnel|Se connecter)$/ })
  return (await loginLinks.count()) === 0
}
