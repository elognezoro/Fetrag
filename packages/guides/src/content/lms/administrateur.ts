import type { Guide } from '@fetrag/contracts'

/** Guide de l’administration de la plateforme (plateforme de formation, rôle SUPER_ADMIN). Contenu en cours de rédaction. */
export const lmsAdministrateur: Guide = {
  id: 'lms-administrateur',
  platform: 'lms',
  role: 'SUPER_ADMIN',
  title: 'Guide de l’administration de la plateforme',
  subtitle: 'Cours, banque de questions, comptes et paramètres',
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
