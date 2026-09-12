import type { Guide } from '@fetrag/contracts'

/** Guide du formateur (plateforme de formation, rôle TRAINER). Contenu en cours de rédaction. */
export const lmsFormateur: Guide = {
  id: 'lms-formateur',
  platform: 'lms',
  role: 'TRAINER',
  title: 'Guide du formateur',
  subtitle: 'Animer vos cohortes, corriger et suivre l’assiduité',
  audience: 'À compléter.',
  summary: 'À compléter.',
  tone: 'green',
  icon: 'users-round',
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
