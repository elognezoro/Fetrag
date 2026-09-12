import type { Guide } from '@fetrag/contracts'
import { lmsAdministrateur } from './content/lms/administrateur'
import { lmsApprenant } from './content/lms/apprenant'
import { lmsCoordination } from './content/lms/coordination'
import { lmsFormateur } from './content/lms/formateur'
import { lmsOrganisation } from './content/lms/organisation'
import { webAdministrateur } from './content/web/administrateur'
import { webCoordination } from './content/web/coordination'
import { webEditeur } from './content/web/editeur'
import { webFinance } from './content/web/finance'
import { webMembre } from './content/web/membre'
import { webOrganisation } from './content/web/organisation'
import { webServices } from './content/web/services'
import { webSupport } from './content/web/support'

/**
 * Catalogue des guides d'utilisation, dans l'ordre d'affichage (guide commun d'abord, puis rôles
 * par dominance croissante). Un seul guide par couple plateforme / rôle.
 *
 * Site institutionnel (fetrag.ga)            Plateforme de formation (formation.fetrag.ga)
 *   web-membre          tout compte            lms-apprenant        tout compte
 *   web-organisation    ORG_MANAGER            lms-organisation     ORG_MANAGER
 *   web-support         SUPPORT                lms-formateur        TRAINER
 *   web-services        SERVICES_MANAGER       lms-coordination     COORDINATOR
 *   web-editeur         EDITOR                 lms-administrateur   SUPER_ADMIN
 *   web-finance         FINANCE
 *   web-coordination    COORDINATOR
 *   web-administrateur  SUPER_ADMIN
 *
 * Les rôles sans espace propre sur une plateforme (ex. FINANCE sur la plateforme de formation)
 * utilisent le guide commun de cette plateforme.
 */
export const guides: Guide[] = [
  webMembre,
  webOrganisation,
  webSupport,
  webServices,
  webEditeur,
  webFinance,
  webCoordination,
  webAdministrateur,
  lmsApprenant,
  lmsOrganisation,
  lmsFormateur,
  lmsCoordination,
  lmsAdministrateur,
]
