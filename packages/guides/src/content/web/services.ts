import type { Guide } from '@fetrag/contracts'

/** Guide du responsable des services (site institutionnel, rôle SERVICES_MANAGER). Contenu en cours de rédaction. */
export const webServices: Guide = {
  id: 'web-services',
  platform: 'web',
  role: 'SERVICES_MANAGER',
  title: 'Guide du responsable des services',
  subtitle: 'Gérer le catalogue de services et les demandes',
  audience: 'À compléter.',
  summary: 'À compléter.',
  tone: 'green',
  icon: 'life-buoy',
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
