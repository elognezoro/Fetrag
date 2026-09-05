import 'server-only'
import { faq } from '@fetrag/cms'
import type { Faq } from '@fetrag/db'
import { safeQuery } from './safe'

export interface FaqGroup {
  key: string
  label: string
  items: Faq[]
}

/** Libellés lisibles des groupes de questions (clé technique → titre affiché). */
const groupLabels: Record<string, string> = {
  general: 'Questions générales',
  formation: 'Formation et certificats',
  services: 'Services aux adhérents',
  adhesion: 'Adhésion et affiliation',
  paiement: 'Paiements et reçus',
  compte: 'Compte et sécurité',
  evenements: 'Événements',
}

const groupOrder = ['general', 'adhesion', 'formation', 'services', 'evenements', 'paiement', 'compte']

export function faqGroupLabel(key: string): string {
  if (groupLabels[key]) return groupLabels[key]
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ')
}

/** Questions actives regroupées par thème, dans un ordre éditorial stable. */
export async function getFaqGroups(): Promise<FaqGroup[]> {
  const rows = await safeQuery('faq.listActive', () => faq.listActive(), [])
  const map = new Map<string, Faq[]>()
  for (const row of rows) {
    const list = map.get(row.group) ?? []
    list.push(row)
    map.set(row.group, list)
  }
  const keys = [...map.keys()].sort((a, b) => {
    const ia = groupOrder.indexOf(a)
    const ib = groupOrder.indexOf(b)
    if (ia === -1 && ib === -1) return a.localeCompare(b, 'fr')
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
  return keys.map((key) => ({ key, label: faqGroupLabel(key), items: map.get(key) ?? [] }))
}
