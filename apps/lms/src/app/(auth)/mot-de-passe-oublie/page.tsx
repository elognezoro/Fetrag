import { redirect } from 'next/navigation'
import { webHref } from '@/lib/site'

/** La réinitialisation du mot de passe est gérée par le site institutionnel : redirection vers fetrag.ga. */
export default function MotDePasseOubliePage(): never {
  redirect(webHref('/mot-de-passe-oublie'))
}
