import { redirect } from 'next/navigation'
import { webHref } from '@/lib/site'

/** L'inscription est gérée par le site institutionnel (compte unique) : redirection vers fetrag.ga. */
export default function InscriptionPage(): never {
  redirect(webHref('/inscription'))
}
