import type { Guide } from '@fetrag/contracts'

/** Guide du coordinateur formation sur le site (site institutionnel, rôle COORDINATOR). Contenu en cours de rédaction. */
export const webCoordination: Guide = {
  id: 'web-coordination',
  platform: 'web',
  role: 'COORDINATOR',
  title: 'Guide du coordinateur formation sur le site',
  subtitle: 'Organisations, prises en charge et rapports depuis fetrag.ga',
  audience: 'À compléter.',
  summary: 'À compléter.',
  tone: 'gold',
  icon: 'clipboard-list',
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
