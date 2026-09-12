import type { Guide } from '@fetrag/contracts'

/** Guide de l’éditeur communication (site institutionnel, rôle EDITOR). Contenu en cours de rédaction. */
export const webEditeur: Guide = {
  id: 'web-editeur',
  platform: 'web',
  role: 'EDITOR',
  title: 'Guide de l’éditeur communication',
  subtitle: 'Publier et animer le site institutionnel',
  audience: 'À compléter.',
  summary: 'À compléter.',
  tone: 'blue',
  icon: 'newspaper',
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
