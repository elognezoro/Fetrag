import { handlers } from '@/lib/auth'

export const runtime = 'nodejs'

/** Points d'entrée Auth.js (signin, callback, session, csrf, signout...). */
export const { GET, POST } = handlers
