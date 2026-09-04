/**
 * Hook d'instrumentation Next.js (exécuté une fois au démarrage du serveur).
 * Enregistre les handlers de jobs de @fetrag/jobs côté runtime Node uniquement ;
 * l'import est protégé pour ne pas bloquer le démarrage si le package n'est pas encore livré.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const mod: Record<string, unknown> = await import('@fetrag/jobs')
      const registerDefaultHandlers = mod.registerDefaultHandlers
      if (typeof registerDefaultHandlers === 'function') {
        await (registerDefaultHandlers as () => void | Promise<void>)()
      }
    } catch (error) {
      console.warn('[instrumentation] handlers de jobs non enregistrés :', error instanceof Error ? error.message : error)
    }
  }
}
