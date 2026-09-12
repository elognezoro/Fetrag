import type { Guide } from '@fetrag/contracts'

/** Guide de l’apprenant (plateforme de formation, rôle LEARNER). Contenu en cours de rédaction. */
export const lmsApprenant: Guide = {
  id: 'lms-apprenant',
  platform: 'lms',
  role: 'LEARNER',
  title: 'Guide de l’apprenant',
  subtitle: 'Suivre une formation sur la plateforme',
  audience: 'À compléter.',
  summary: 'À compléter.',
  tone: 'blue',
  icon: 'graduation-cap',
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
