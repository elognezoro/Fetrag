import type { Guide } from '@fetrag/contracts'

/** Guide finance et contrôle (site institutionnel, rôle FINANCE). Contenu en cours de rédaction. */
export const webFinance: Guide = {
  id: 'web-finance',
  platform: 'web',
  role: 'FINANCE',
  title: 'Guide finance et contrôle',
  subtitle: 'Suivre les paiements, les remboursements et les prises en charge',
  audience: 'À compléter.',
  summary: 'À compléter.',
  tone: 'gold',
  icon: 'hand-coins',
  readingMinutes: 10,
  updatedAt: '2026-09-12',
  version: '0.1',
  sections: [
    {
      id: 'en-preparation',
      title: 'Guide en préparation',
      blocks: [{ type: 'paragraph', text: 'Ce guide est en cours de rédaction.' }],
    },
  ],
}
