import type { Guide } from '@fetrag/contracts'

/** Guide du responsable d’organisation (plateforme de formation, rôle ORG_MANAGER). Contenu en cours de rédaction. */
export const lmsOrganisation: Guide = {
  id: 'lms-organisation',
  platform: 'lms',
  role: 'ORG_MANAGER',
  title: 'Guide du responsable d’organisation',
  subtitle: 'Demander des formations et suivre vos participants',
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
