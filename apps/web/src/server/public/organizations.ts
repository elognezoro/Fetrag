import 'server-only'
import { partnerKindLabels, partners, type PartnerKind } from '@fetrag/cms'
import type { Organization, Partner } from '@fetrag/db'
import { listAffiliates, listSectors } from './home'
import { safeQuery } from './safe'

export interface PartnerGroup {
  kind: PartnerKind
  label: string
  description: string
  items: Partner[]
}

export interface OrganizationsDirectory {
  affiliates: Organization[]
  groups: PartnerGroup[]
  sectors: string[]
  sector: string | undefined
  total: number
}

const groupOrder: PartnerKind[] = ['AFFILIATE', 'PARTNER', 'INSTITUTION', 'INTERNATIONAL']

const groupDescriptions: Record<PartnerKind, string> = {
  AFFILIATE: 'Organisations syndicales membres de la Fédération, représentées dans ses instances.',
  PARTNER: 'Structures qui accompagnent la Fédération dans ses actions de formation, de conseil et de plaidoyer.',
  INSTITUTION: 'Administrations et institutions publiques avec lesquelles la FETRAG dialogue au quotidien.',
  INTERNATIONAL: 'Organisations internationales et réseaux syndicaux avec lesquels la Fédération coopère.',
}

function matchesSector(sector: string | null, wanted: string | undefined): boolean {
  if (!wanted) return true
  return Boolean(sector && sector.trim().toLowerCase() === wanted.trim().toLowerCase())
}

/**
 * Annuaire public : organisations affiliées (modèle `Organization`) et partenaires (`Partner`)
 * regroupés par type, filtrables par secteur d'activité.
 */
export async function getOrganizationsDirectory(sector?: string): Promise<OrganizationsDirectory> {
  const [affiliates, partnerList, sectors] = await Promise.all([
    listAffiliates(sector),
    safeQuery('partners.listActive', () => partners.listActive(), []),
    listSectors(),
  ])
  const filteredPartners = partnerList.filter((partner) => matchesSector(partner.sector, sector))
  const groups: PartnerGroup[] = groupOrder
    .map((kind) => ({
      kind,
      label: kind === 'AFFILIATE' ? 'Autres organisations affiliées' : partnerKindLabels[kind] + 's',
      description: groupDescriptions[kind],
      items: filteredPartners.filter((partner) => partner.kind === kind),
    }))
    .filter((group) => group.items.length > 0)

  return {
    affiliates,
    groups,
    sectors,
    sector,
    total: affiliates.length + filteredPartners.length,
  }
}
