import { prisma } from '../../src/client'
import { DEMO_ORGANIZATION_SLUG } from '../../src/seed-data'
import { inBatches, log, stableId } from './helpers'
import type { SeededUsers } from './users'

export interface SeededOrganization {
  id: string
  slug: string
  name: string
  acronym: string
}

export interface SeededOrganizations {
  bySlug: Record<string, SeededOrganization>
  /** Organisation de démonstration SYNATEP (fictive). */
  synatep: SeededOrganization
  others: SeededOrganization[]
}

interface OrganizationSeed {
  slug: string
  name: string
  acronym: string
  sector: string
  description: string
  address: string
  city: string
  phone: string
  email: string
  website: string | null
  memberCount: number
  contacts: Array<{ key: string; fullName: string; role: string; email: string; phone: string; isPrimary: boolean; userEmail?: string }>
}

const organizations: OrganizationSeed[] = [
  {
    slug: DEMO_ORGANIZATION_SLUG,
    name: "Syndicat National des Travailleurs de l'Énergie et du Pétrole",
    acronym: 'SYNATEP',
    sector: 'Énergie et pétrole',
    description:
      'Organisation syndicale fictive de démonstration. Elle regroupe les travailleurs des sites de production, de raffinage et de distribution d’énergie de Libreville et de Port-Gentil. Affiliée à la FETRAG, elle est utilisée pour la recette du workflow de demande de formation.',
    address: 'Quartier Louis, rue de la Mairie',
    city: 'Libreville',
    phone: '+241 06 20 00 01',
    email: 'contact@synatep-demo.ga',
    website: null,
    memberCount: 420,
    contacts: [
      {
        key: 'sg',
        fullName: 'Jean-Baptiste ALLOGHO',
        role: 'Secrétaire général',
        email: 'responsable@synatep-demo.ga',
        phone: '+241 06 20 00 01',
        isPrimary: true,
        userEmail: 'responsable@synatep-demo.ga',
      },
      {
        key: 'tresorier',
        fullName: 'Mireille NTOUTOUME',
        role: 'Trésorière',
        email: 'tresorerie@synatep-demo.ga',
        phone: '+241 06 20 00 02',
        isPrimary: false,
      },
    ],
  },
  {
    slug: 'syntrabof',
    name: 'Syndicat National des Travailleurs du Bois et de la Forêt',
    acronym: 'SYNTRABOF',
    sector: 'Bois et forêts',
    description:
      'Organisation fictive de démonstration représentant les ouvriers des scieries, des unités de transformation du bois et des exploitations forestières de la zone économique spéciale et de l’intérieur du pays.',
    address: 'Zone industrielle de Nkok',
    city: 'Ntoum',
    phone: '+241 06 21 00 01',
    email: 'contact@syntrabof-demo.ga',
    website: null,
    memberCount: 310,
    contacts: [
      {
        key: 'sg',
        fullName: 'Guy-Roger MOUNDOUNGA',
        role: 'Secrétaire général',
        email: 'sg@syntrabof-demo.ga',
        phone: '+241 06 21 00 01',
        isPrimary: true,
      },
    ],
  },
  {
    slug: 'uttl',
    name: 'Union des Travailleurs des Transports et de la Logistique',
    acronym: 'UTTL',
    sector: 'Transport et logistique',
    description:
      'Organisation fictive de démonstration regroupant les conducteurs, dockers, agents de manutention et personnels portuaires et ferroviaires.',
    address: 'Boulevard du Port, Owendo',
    city: 'Owendo',
    phone: '+241 06 22 00 01',
    email: 'contact@uttl-demo.ga',
    website: null,
    memberCount: 275,
    contacts: [
      {
        key: 'president',
        fullName: 'Aristide LEKOGO',
        role: 'Président',
        email: 'president@uttl-demo.ga',
        phone: '+241 06 22 00 01',
        isPrimary: true,
      },
      {
        key: 'sga',
        fullName: 'Béatrice MENGUE',
        role: 'Secrétaire générale adjointe',
        email: 'sga@uttl-demo.ga',
        phone: '+241 06 22 00 02',
        isPrimary: false,
      },
    ],
  },
  {
    slug: 'sypesag',
    name: 'Syndicat des Personnels de Santé du Gabon',
    acronym: 'SYPESAG',
    sector: 'Santé',
    description:
      'Organisation fictive de démonstration représentant les infirmiers, sages-femmes, techniciens de laboratoire et personnels administratifs des structures de santé publiques et privées.',
    address: 'Avenue de Cointet',
    city: 'Libreville',
    phone: '+241 06 23 00 01',
    email: 'contact@sypesag-demo.ga',
    website: null,
    memberCount: 530,
    contacts: [
      {
        key: 'sg',
        fullName: 'Prisca ONDO MEZUI',
        role: 'Secrétaire générale',
        email: 'sg@sypesag-demo.ga',
        phone: '+241 06 23 00 01',
        isPrimary: true,
      },
    ],
  },
]

/**
 * Crée l'organisation de démonstration SYNATEP et trois organisations affiliées fictives,
 * leurs contacts, puis rattache le responsable (isManager) et les dix apprenants au SYNATEP.
 */
export async function seedOrganizations(users: SeededUsers): Promise<SeededOrganizations> {
  log.step('Organisations affiliées')
  const bySlug: Record<string, SeededOrganization> = {}

  for (const org of organizations) {
    const data = {
      name: org.name,
      acronym: org.acronym,
      sector: org.sector,
      description: org.description,
      address: org.address,
      city: org.city,
      country: 'GA',
      phone: org.phone,
      email: org.email,
      website: org.website,
      isAffiliate: true,
      isActive: true,
      memberCount: org.memberCount,
    }
    const saved = await prisma.organization.upsert({
      where: { slug: org.slug },
      create: { id: stableId('organization', org.slug), slug: org.slug, ...data },
      update: data,
      select: { id: true, slug: true, name: true, acronym: true },
    })
    bySlug[saved.slug] = { id: saved.id, slug: saved.slug, name: saved.name, acronym: saved.acronym ?? org.acronym }

    await inBatches(org.contacts, async (contact) => {
      const id = stableId('org-contact', org.slug, contact.key)
      const userId = contact.userEmail ? (users.byEmail[contact.userEmail]?.id ?? null) : null
      const contactData = {
        fullName: contact.fullName,
        role: contact.role,
        email: contact.email,
        phone: contact.phone,
        isPrimary: contact.isPrimary,
        userId,
      }
      await prisma.organizationContact.upsert({
        where: { id },
        create: { id, organizationId: saved.id, ...contactData },
        update: contactData,
      })
    })
  }

  const synatep = bySlug[DEMO_ORGANIZATION_SLUG]
  if (!synatep) throw new Error('Seed : organisation SYNATEP non créée')

  // Appartenances : responsable (manager) + 10 apprenants.
  await prisma.organizationMembership.upsert({
    where: { organizationId_userId: { organizationId: synatep.id, userId: users.responsable.id } },
    create: { organizationId: synatep.id, userId: users.responsable.id, title: 'Secrétaire général', isManager: true },
    update: { title: 'Secrétaire général', isManager: true },
  })
  await inBatches(users.learners, async (learner, index) => {
    await prisma.organizationMembership.upsert({
      where: { organizationId_userId: { organizationId: synatep.id, userId: learner.id } },
      create: {
        organizationId: synatep.id,
        userId: learner.id,
        title: index < 3 ? 'Membre du bureau de section' : 'Adhérent',
        isManager: false,
      },
      update: { isManager: false },
    })
  })

  log.done(`${organizations.length} organisations, ${users.learners.length + 1} appartenances SYNATEP`)

  return {
    bySlug,
    synatep,
    others: organizations.filter((o) => o.slug !== DEMO_ORGANIZATION_SLUG).map((o) => {
      const saved = bySlug[o.slug]
      if (!saved) throw new Error(`Seed : organisation ${o.slug} non créée`)
      return saved
    }),
  }
}
