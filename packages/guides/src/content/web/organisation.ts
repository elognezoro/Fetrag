import type { Guide } from '@fetrag/contracts'

/** Guide du responsable d’organisation (site institutionnel, rôle ORG_MANAGER). Contenu en cours de rédaction. */
export const webOrganisation: Guide = {
  id: 'web-organisation',
  platform: 'web',
  role: 'ORG_MANAGER',
  title: 'Guide du responsable d’organisation',
  subtitle: 'Représenter votre organisation sur fetrag.ga',
  audience: 'À compléter.',
  summary: 'À compléter.',
  tone: 'green',
  icon: 'building',
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
