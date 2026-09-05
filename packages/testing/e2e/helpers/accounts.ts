/**
 * Comptes de démonstration créés par `pnpm db:seed` (BUILD_BRIEF section 3, README).
 * Mot de passe commun : Fetrag2026!. Les tests E2E ne créent jamais de compte privilégié.
 */

export const DEMO_PASSWORD = process.env.E2E_PASSWORD ?? 'Fetrag2026!'

export interface DemoAccount {
  email: string
  password: string
  /** Libellé du rôle (roleLabels de @fetrag/contracts). */
  role: string
}

export const accounts = {
  admin: { email: 'admin@fetrag.ga', password: DEMO_PASSWORD, role: 'Super administrateur' },
  coordination: { email: 'coordination@fetrag.ga', password: DEMO_PASSWORD, role: 'Coordinateur formation' },
  formateur: { email: 'formateur@fetrag.ga', password: DEMO_PASSWORD, role: 'Formateur' },
  editeur: { email: 'editeur@fetrag.ga', password: DEMO_PASSWORD, role: 'Éditeur communication' },
  services: { email: 'services@fetrag.ga', password: DEMO_PASSWORD, role: 'Responsable services' },
  finance: { email: 'finance@fetrag.ga', password: DEMO_PASSWORD, role: 'Finance / contrôle' },
  support: { email: 'support@fetrag.ga', password: DEMO_PASSWORD, role: 'Support' },
  responsable: { email: 'responsable@synatep-demo.ga', password: DEMO_PASSWORD, role: "Responsable d'organisation" },
  /** Apprenant ayant terminé le cours pilote (certificat émis). */
  apprenantCertifie: { email: 'apprenant1@demo.fetrag.ga', password: DEMO_PASSWORD, role: 'Apprenant' },
  /** Apprenant en début de parcours (progression faible) : idéal pour tester la progression et le quiz. */
  apprenantDebutant: { email: 'apprenant10@demo.fetrag.ga', password: DEMO_PASSWORD, role: 'Apprenant' },
} as const satisfies Record<string, DemoAccount>

/** Données de démonstration référencées par les scénarios (seed `packages/db/prisma/seed`). */
export const demoData = {
  /** Cours pilote M01 (gratuit, contenu complet, cohorte SYNATEP). */
  pilotCourseSlug: 'fondamentaux-du-syndicalisme-gabonais',
  pilotCourseCode: 'M01',
  /** Module payant (offres standard 25 000 XAF / adhérent 15 000 XAF). */
  paidCourseSlug: 'leadership-syndical-et-ethique',
  paidCourseCode: 'M08',
  /** Codes de vérification des certificats émis par le seed. */
  certificateVerifyCodes: ['K7MP-3QXR-9TVD', 'W4HN-8BZC-2SGK'],
  invalidVerifyCode: 'AAAA-0000-ZZZZ',
  organizationName: 'SYNATEP',
  /** Actualité publiée par le seed. */
  articleSlug: 'lancement-programme-formation-leaders-syndicaux-2026',
} as const
