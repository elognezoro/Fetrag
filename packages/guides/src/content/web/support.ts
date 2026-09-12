import type { Guide } from '@fetrag/contracts'

/** Guide du support (site institutionnel, rôle SUPPORT). Contenu en cours de rédaction. */
export const webSupport: Guide = {
  id: 'web-support',
  platform: 'web',
  role: 'SUPPORT',
  title: 'Guide du support',
  subtitle: 'Répondre aux messages et accompagner les utilisateurs',
  audience: 'À compléter.',
  summary: 'À compléter.',
  tone: 'green',
  icon: 'headphones',
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
