import type { Guide } from '@fetrag/contracts'

/** Guide du membre (site institutionnel, rôle MEMBER). Contenu en cours de rédaction. */
export const webMembre: Guide = {
  id: 'web-membre',
  platform: 'web',
  role: 'MEMBER',
  title: 'Guide du membre',
  subtitle: 'Votre compte et votre espace personnel sur fetrag.ga',
  audience: 'À compléter.',
  summary: 'À compléter.',
  tone: 'blue',
  icon: 'user',
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
