/**
 * Comptes de démonstration créés par le seed (BUILD_BRIEF §3).
 * Ce module est importable par les applications (écran de connexion de recette,
 * documentation) sans tirer le script de seed lui-même.
 */

export const DEMO_PASSWORD = 'Fetrag2026!'

export const DEMO_ORGANIZATION_SLUG = 'synatep'

export type DemoRole =
  | 'SUPER_ADMIN'
  | 'COORDINATOR'
  | 'TRAINER'
  | 'EDITOR'
  | 'SERVICES_MANAGER'
  | 'FINANCE'
  | 'SUPPORT'
  | 'ORG_MANAGER'
  | 'LEARNER'

export interface DemoAccount {
  email: string
  role: DemoRole
  firstName: string
  lastName: string
  /** Fonction affichée dans le profil (fictive). */
  jobTitle: string
  employer: string
  phone: string
  /** Description courte de l'usage du compte pour la recette. */
  usage: string
}

export const staffAccounts: DemoAccount[] = [
  {
    email: 'admin@fetrag.ga',
    role: 'SUPER_ADMIN',
    firstName: 'Sylvie',
    lastName: 'MOUKAGNI',
    jobTitle: 'Administratrice de la plateforme',
    employer: 'FETRAG',
    phone: '+241 06 10 00 01',
    usage: 'Tout (paramétrage, rôles, audit)',
  },
  {
    email: 'coordination@fetrag.ga',
    role: 'COORDINATOR',
    firstName: 'Hervé',
    lastName: 'BOUSSOUGOU',
    jobTitle: 'Coordinateur formation',
    employer: 'FETRAG',
    phone: '+241 06 10 00 02',
    usage: 'Pilotage LMS (demandes, cohortes, certificats)',
  },
  {
    email: 'formateur@fetrag.ga',
    role: 'TRAINER',
    firstName: 'Clarisse',
    lastName: 'MAPANGOU',
    jobTitle: 'Formatrice principale',
    employer: 'FETRAG',
    phone: '+241 06 10 00 03',
    usage: 'Formatrice du cours pilote',
  },
  {
    email: 'editeur@fetrag.ga',
    role: 'EDITOR',
    firstName: 'Landry',
    lastName: 'OYONO',
    jobTitle: 'Chargé de communication',
    employer: 'FETRAG',
    phone: '+241 06 10 00 04',
    usage: 'CMS vitrine (pages, actualités, ressources)',
  },
  {
    email: 'services@fetrag.ga',
    role: 'SERVICES_MANAGER',
    firstName: 'Nadège',
    lastName: 'MBOUMBA',
    jobTitle: 'Responsable des services aux adhérents',
    employer: 'FETRAG',
    phone: '+241 06 10 00 05',
    usage: 'Services et demandes',
  },
  {
    email: 'finance@fetrag.ga',
    role: 'FINANCE',
    firstName: 'Rodrigue',
    lastName: 'ANGUILET',
    jobTitle: 'Responsable financier',
    employer: 'FETRAG',
    phone: '+241 06 10 00 06',
    usage: 'Paiements, reçus, remboursements',
  },
  {
    email: 'support@fetrag.ga',
    role: 'SUPPORT',
    firstName: 'Estelle',
    lastName: 'NGUEMA',
    jobTitle: 'Chargée d’assistance',
    employer: 'FETRAG',
    phone: '+241 06 10 00 07',
    usage: 'Assistance utilisateurs',
  },
  {
    email: 'responsable@synatep-demo.ga',
    role: 'ORG_MANAGER',
    firstName: 'Jean-Baptiste',
    lastName: 'ALLOGHO',
    jobTitle: 'Secrétaire général du SYNATEP',
    employer: 'SYNATEP (organisation fictive)',
    phone: '+241 06 20 00 01',
    usage: 'Responsable de l’organisation de démonstration SYNATEP',
  },
]

export const learnerAccounts: DemoAccount[] = [
  ['Marc', 'ONDO', 'Technicien de maintenance'],
  ['Pélagie', 'NZÉ', 'Secrétaire de section syndicale'],
  ['Yannick', 'MBA', 'Opérateur de production'],
  ['Grâce', 'OBAME', 'Déléguée du personnel'],
  ['Stéphane', 'BOUANGA', 'Chef d’équipe logistique'],
  ['Carine', 'MOUSSAVOU', 'Assistante administrative'],
  ['Patrick', 'NDONG', 'Électricien industriel'],
  ['Élodie', 'KOUMBA', 'Agent de laboratoire'],
  ['Alain', 'MINTSA', 'Conducteur d’installations'],
  ['Rachel', 'IBINGA', 'Chargée de sécurité'],
].map(([firstName, lastName, jobTitle], index) => ({
  email: `apprenant${index + 1}@demo.fetrag.ga`,
  role: 'LEARNER' as const,
  firstName: firstName ?? '',
  lastName: lastName ?? '',
  jobTitle: jobTitle ?? '',
  employer: 'Secteur énergie et pétrole - Libreville (fictif)',
  phone: `+241 07 30 00 ${String(index + 1).padStart(2, '0')}`,
  usage: `Apprenant ${index + 1} de la cohorte pilote`,
}))

export const demoAccounts: DemoAccount[] = [...staffAccounts, ...learnerAccounts]

export function findDemoAccount(email: string): DemoAccount | undefined {
  return demoAccounts.find((a) => a.email === email)
}
