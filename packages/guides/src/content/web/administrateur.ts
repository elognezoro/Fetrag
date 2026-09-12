import type { Guide } from '@fetrag/contracts'

/** Guide du super administrateur (site institutionnel, rôle SUPER_ADMIN). Contenu en cours de rédaction. */
export const webAdministrateur: Guide = {
  id: 'web-administrateur',
  platform: 'web',
  role: 'SUPER_ADMIN',
  title: 'Guide du super administrateur',
  subtitle: 'Piloter le site institutionnel de bout en bout',
  audience: 'À compléter.',
  summary: 'À compléter.',
  tone: 'navy',
  icon: 'shield',
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
