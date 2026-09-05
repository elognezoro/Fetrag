import 'server-only'

/**
 * Exécute une lecture de données en tolérant l'indisponibilité de la base :
 * une section vide vaut mieux qu'une page d'accueil en erreur. L'échec est journalisé.
 */
export async function safeQuery<T>(label: string, task: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await task()
  } catch (error) {
    console.error(`[web:public] lecture « ${label} » impossible :`, error instanceof Error ? error.message : error)
    return fallback
  }
}
