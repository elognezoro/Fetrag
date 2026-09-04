import {
  AccessLevel,
  ContentStatus,
  EventKind,
  EventRegistrationStatus,
  FormKind,
  FormSubmissionStatus,
  MenuLocation,
  PartnerKind,
  ResourceKind,
  ServiceRequestStatus,
  SessionMode,
} from '@prisma/client'
import { prisma } from '../../src/client'
import type { SeededCatalog } from './catalog'
import { at, daysFromNow, excerptOf, fixedDate, get, inBatches, json, list, log, paragraphs, readingTimeMinutes, stableId } from './helpers'
import type { SeededUser, SeededUsers } from './users'

/**
 * Contenus du site institutionnel : pages, menus, actualités, ressources, partenaires,
 * services et demandes, FAQ, événements et inscriptions, formulaires, newsletter.
 */

export interface SeededEvent {
  id: string
  slug: string
  title: string
  priceAmount: number | null
}

export interface SeededService {
  id: string
  slug: string
  name: string
  priceAmount: number | null
}

export interface SeededCms {
  events: Record<string, SeededEvent>
  services: Record<string, SeededService>
  /** Inscription de l'apprenant 3 à la Master Class (rattachée à la commande payée par le lot commerce). */
  masterclassRegistrationId: string
}

// -----------------------------------------------------------------------------
// Pages
// -----------------------------------------------------------------------------

interface PageSeed {
  slug: string
  title: string
  excerpt: string
  template: string
  content: string
  blocks?: unknown
  seoTitle: string
  seoDescription: string
}

const pages: PageSeed[] = [
  {
    slug: 'la-fetrag',
    title: 'La Fédération des Travailleurs du Gabon',
    excerpt: 'Histoire, missions, valeurs et gouvernance de la FETRAG, fédération syndicale au service des travailleurs gabonais.',
    template: 'institutional',
    content: paragraphs(
      'La Fédération des Travailleurs du Gabon (FETRAG) est une organisation syndicale fédérative qui rassemble des syndicats de travailleurs de plusieurs secteurs d’activité. Elle a pour vocation de représenter, de former et d’accompagner ses organisations affiliées dans la défense des droits et des intérêts des travailleurs, dans un esprit de dialogue et de responsabilité.',
      'Sa devise, « Travail, Efficacité, Solidarité », et son triptyque fondateur - protection de l’outil de production, prévention des conflits sociaux, défense des intérêts matériels et moraux des travailleurs - guident l’ensemble de ses actions.',
    ),
    blocks: [
      {
        type: 'hero',
        eyebrow: 'La Fédération',
        title: 'Un syndicalisme responsable, compétent et solidaire',
        text: 'La FETRAG rassemble des organisations de travailleurs de tous les secteurs autour d’un projet commun : défendre les travailleurs tout en contribuant à la pérennité des entreprises et des services publics.',
        cta: { label: 'Rejoindre la Fédération', href: '/adhesion' },
      },
      {
        type: 'section',
        id: 'histoire',
        title: 'Notre histoire',
        html: paragraphs(
          'La FETRAG s’inscrit dans la longue histoire du mouvement des travailleurs gabonais, des premières organisations de l’époque coloniale au pluralisme syndical né de la Conférence nationale de 1990. Elle est née de la volonté d’organisations de plusieurs secteurs de mutualiser leurs compétences et de porter ensemble des revendications transversales.',
          'Depuis sa création, la Fédération a fait de la formation de ses responsables une priorité : un leader syndical formé négocie mieux, prévient les conflits et défend plus efficacement les travailleurs. Le Programme de formation des Leaders Syndicaux 2026 est l’aboutissement de cet engagement.',
        ),
      },
      {
        type: 'list',
        id: 'missions',
        title: 'Nos missions',
        items: [
          'Représenter les organisations affiliées auprès des pouvoirs publics, des employeurs et des institutions de dialogue social.',
          'Former les leaders syndicaux et les représentants du personnel.',
          'Apporter un appui juridique et technique aux sections syndicales et à leurs adhérents.',
          'Promouvoir le dialogue social et la négociation collective comme modes privilégiés de règlement des différends.',
          'Contribuer à l’amélioration de la santé, de la sécurité et des conditions de travail.',
        ],
      },
      {
        type: 'values',
        id: 'valeurs',
        title: 'Nos valeurs',
        items: [
          { title: 'Travail', text: 'Le travail fonde la dignité du travailleur et la richesse du pays. Nous le défendons et nous le valorisons.' },
          { title: 'Efficacité', text: 'Des responsables formés, des dossiers solides, des méthodes rigoureuses : nous devons des résultats concrets à nos adhérents.' },
          { title: 'Solidarité', text: 'La force du mouvement syndical vient de l’union des travailleurs, entre secteurs, entre générations et entre organisations.' },
        ],
      },
      {
        type: 'governance',
        id: 'gouvernance',
        title: 'Gouvernance',
        html: paragraphs(
          'La Fédération est dirigée par un Bureau exécutif élu par le Congrès des organisations affiliées, qui se réunit en Assemblée générale annuelle. Le Secrétariat général assure la conduite quotidienne des activités, la représentation institutionnelle et la coordination des sections.',
          'Les comptes de la Fédération sont contrôlés chaque année par des commissaires aux comptes indépendants et présentés à l’Assemblée générale.',
        ),
        members: [{ name: 'Jocelyn Louis NGOMA', role: 'Secrétaire Général' }],
      },
      {
        type: 'triptych',
        id: 'triptyque',
        title: 'Le triptyque fondateur',
        pillars: [
          { key: 'protection', title: 'Protection de l’outil de production', text: 'Sans entreprise viable, il n’y a pas d’emploi durable.' },
          { key: 'prevention', title: 'Prévention des conflits sociaux', text: 'Le dialogue d’abord ; la grève reste l’ultime recours, exercé dans le respect de la loi.' },
          { key: 'defense', title: 'Défense des intérêts matériels et moraux', text: 'Salaires, conditions de travail, sécurité, dignité et non-discrimination.' },
        ],
      },
    ],
    seoTitle: 'La FETRAG - Fédération des Travailleurs du Gabon',
    seoDescription: 'Histoire, missions, valeurs, gouvernance et triptyque fondateur de la Fédération des Travailleurs du Gabon.',
  },
  {
    slug: 'mentions-legales',
    title: 'Mentions légales',
    excerpt: 'Éditeur, hébergement et conditions d’utilisation des sites fetrag.ga et formation.fetrag.ga.',
    template: 'legal',
    content:
      '<h2>Éditeur</h2>' +
      paragraphs(
        'Les sites fetrag.ga et formation.fetrag.ga sont édités par la Fédération des Travailleurs du Gabon (FETRAG), organisation syndicale dont le siège est situé à Libreville, Gabon. Directeur de la publication : le Secrétaire Général de la FETRAG.',
      ) +
      '<h2>Hébergement</h2>' +
      paragraphs('Les sites sont hébergés sur une infrastructure d’hébergement infonuagique. Les données sont stockées dans une base de données PostgreSQL managée.') +
      '<h2>Propriété intellectuelle</h2>' +
      paragraphs(
        'L’ensemble des contenus (textes, logos, illustrations, contenus de formation) est la propriété de la FETRAG ou de ses partenaires et ne peut être reproduit sans autorisation écrite. Les textes officiels (lois, décrets, conventions) reproduits ou cités restent soumis à leur régime propre.',
      ) +
      '<h2>Conditions d’utilisation</h2>' +
      paragraphs(
        'L’accès aux espaces personnels et à la plateforme de formation suppose la création d’un compte et l’acceptation des présentes conditions ainsi que de la politique de confidentialité. Tout usage frauduleux d’un compte entraîne sa suspension.',
      ),
    seoTitle: 'Mentions légales - FETRAG',
    seoDescription: 'Mentions légales des sites de la Fédération des Travailleurs du Gabon.',
  },
  {
    slug: 'confidentialite',
    title: 'Politique de confidentialité',
    excerpt: 'Comment la FETRAG collecte, utilise et protège vos données personnelles.',
    template: 'legal',
    content:
      '<h2>Données collectées</h2>' +
      paragraphs(
        'Nous collectons les données nécessaires à la gestion de votre compte (identité, adresse email, téléphone), au suivi de vos formations (inscriptions, progression, résultats, présences, certificats), au traitement de vos demandes de services et à la gestion des paiements. Les données de paiement sont traitées par notre prestataire de paiement et ne sont jamais stockées en clair par la FETRAG.',
      ) +
      '<h2>Finalités et base légale</h2>' +
      paragraphs(
        'Vos données sont utilisées pour exécuter les services que vous demandez, assurer la sécurité de la plateforme, répondre à nos obligations légales et, avec votre consentement, vous adresser des informations sur nos activités. Vous pouvez retirer votre consentement à tout moment depuis votre espace personnel.',
      ) +
      '<h2>Conservation et sécurité</h2>' +
      paragraphs(
        'Les données sont conservées pendant la durée de votre relation avec la FETRAG puis archivées conformément aux obligations légales. Les certificats émis restent vérifiables publiquement par leur numéro, sans exposer d’autres données que le nom du titulaire, l’intitulé de la formation et la date d’émission.',
      ) +
      '<h2>Vos droits</h2>' +
      paragraphs(
        'Vous disposez d’un droit d’accès, de rectification, d’effacement et d’opposition. Toute demande peut être adressée par le formulaire de contact ou par courrier au siège de la Fédération.',
      ),
    seoTitle: 'Politique de confidentialité - FETRAG',
    seoDescription: 'Politique de protection des données personnelles de la FETRAG.',
  },
  {
    slug: 'adhesion',
    title: 'Adhérer à la FETRAG',
    excerpt: 'Rejoindre la Fédération en tant qu’organisation affiliée ou manifester votre intérêt en tant que travailleur.',
    template: 'default',
    content:
      paragraphs(
        'La FETRAG accueille les organisations syndicales de travailleurs qui partagent ses valeurs et son projet. L’affiliation donne accès à l’appui juridique et technique de la Fédération, au Programme de formation des Leaders Syndicaux, aux services aux adhérents et à la représentation dans les instances de dialogue social.',
      ) +
      '<h2>Organisations syndicales</h2>' +
      paragraphs('L’affiliation se fait sur décision des instances de l’organisation candidate et du Bureau exécutif de la Fédération, après examen des statuts et de la liste des membres du bureau.') +
      list([
        'Statuts de l’organisation et récépissé de dépôt',
        'Procès-verbal de la décision d’affiliation',
        'Liste des membres du bureau et coordonnées de la personne ressource',
        'Estimation du nombre d’adhérents',
      ]) +
      '<h2>Travailleurs</h2>' +
      paragraphs(
        'Si vous êtes travailleur et souhaitez rejoindre une organisation affiliée, ou créer une section syndicale dans votre entreprise, utilisez le formulaire ci-dessous. Notre service d’accompagnement à la création de section vous répondra sous cinq jours ouvrés.',
      ),
    seoTitle: 'Adhésion - FETRAG',
    seoDescription: 'Comment rejoindre la Fédération des Travailleurs du Gabon.',
  },
  {
    slug: 'faq',
    title: 'Questions fréquentes',
    excerpt: 'Réponses aux questions les plus courantes sur la Fédération, la formation et les services.',
    template: 'faq',
    content: paragraphs(
      'Vous trouverez ci-dessous les réponses aux questions les plus fréquentes. Si vous ne trouvez pas la vôtre, contactez-nous par le formulaire de contact.',
    ),
    seoTitle: 'FAQ - FETRAG',
    seoDescription: 'Questions fréquentes sur la FETRAG, ses formations et ses services.',
  },
]

async function seedPages(users: SeededUsers): Promise<number> {
  for (const page of pages) {
    const data = {
      title: page.title,
      excerpt: page.excerpt,
      content: page.content,
      blocks: page.blocks ? json(page.blocks) : undefined,
      template: page.template,
      status: ContentStatus.PUBLISHED,
      locale: 'fr' as const,
      publishedAt: fixedDate(2026, 1, 10),
      authorId: users.editeur.id,
      version: 1,
      showInSitemap: true,
    }
    const saved = await prisma.page.upsert({
      where: { slug: page.slug },
      create: { id: stableId('page', page.slug), slug: page.slug, ...data },
      update: data,
      select: { id: true },
    })
    await prisma.pageRevision.upsert({
      where: { pageId_version: { pageId: saved.id, version: 1 } },
      create: {
        id: stableId('page-revision', page.slug, 1),
        pageId: saved.id,
        version: 1,
        title: page.title,
        content: page.content,
        blocks: page.blocks ? json(page.blocks) : undefined,
        editedBy: users.editeur.id,
      },
      update: { title: page.title, content: page.content, blocks: page.blocks ? json(page.blocks) : undefined },
    })
    await prisma.seoRecord.upsert({
      where: { pageId: saved.id },
      create: { id: stableId('seo-page', page.slug), pageId: saved.id, title: page.seoTitle, description: page.seoDescription },
      update: { title: page.seoTitle, description: page.seoDescription },
    })
  }
  return pages.length
}

// -----------------------------------------------------------------------------
// Menus
// -----------------------------------------------------------------------------

interface MenuItemSeed {
  key: string
  label: string
  href: string
  icon?: string
  isExternal?: boolean
}

const menus: Array<{ location: MenuLocation; name: string; items: MenuItemSeed[] }> = [
  {
    location: MenuLocation.HEADER,
    name: 'Navigation principale',
    items: [
      { key: 'accueil', label: 'Accueil', href: '/' },
      { key: 'fetrag', label: 'La FETRAG', href: '/la-fetrag' },
      { key: 'organisations', label: 'Organisations', href: '/organisations' },
      { key: 'actualites', label: 'Actualités', href: '/actualites' },
      { key: 'formations', label: 'Formations', href: '/formations' },
      { key: 'services', label: 'Services', href: '/services' },
      { key: 'ressources', label: 'Ressources', href: '/ressources' },
      { key: 'evenements', label: 'Événements', href: '/evenements' },
      { key: 'contact', label: 'Contact', href: '/contact' },
    ],
  },
  {
    location: MenuLocation.FOOTER,
    name: 'Pied de page',
    items: [
      { key: 'adhesion', label: 'Adhésion', href: '/adhesion' },
      { key: 'partenariat', label: 'Partenariat', href: '/partenariat' },
      { key: 'faq', label: 'Questions fréquentes', href: '/faq' },
      { key: 'certificats', label: 'Vérifier un certificat', href: '/certificats/verifier' },
      { key: 'lms', label: 'Plateforme de formation', href: 'https://formation.fetrag.ga', isExternal: true },
      { key: 'mentions', label: 'Mentions légales', href: '/mentions-legales' },
      { key: 'confidentialite', label: 'Confidentialité', href: '/confidentialite' },
    ],
  },
]

async function seedMenus(): Promise<number> {
  let count = 0
  for (const menu of menus) {
    const saved = await prisma.menu.upsert({
      where: { location: menu.location },
      create: { id: stableId('menu', menu.location), location: menu.location, name: menu.name },
      update: { name: menu.name },
      select: { id: true },
    })
    await inBatches(menu.items, async (item, index) => {
      const id = stableId('menu-item', menu.location, item.key)
      const data = { label: item.label, href: item.href, icon: item.icon ?? null, position: index + 1, isExternal: item.isExternal ?? false }
      await prisma.menuItem.upsert({ where: { id }, create: { id, menuId: saved.id, parentId: null, ...data }, update: data })
      count += 1
    })
  }
  return count
}

// -----------------------------------------------------------------------------
// Actualités
// -----------------------------------------------------------------------------

interface ArticleSeed {
  slug: string
  title: string
  categorySlug: string
  isCommunique: boolean
  isFeatured: boolean
  tags: string[]
  publishedAt: Date
  content: string
}

const articles: ArticleSeed[] = [
  {
    slug: 'communique-revalorisation-du-smig-calendrier',
    title: 'Communiqué : la FETRAG appelle au respect du calendrier de revalorisation du salaire minimum',
    categorySlug: 'communiques',
    isCommunique: true,
    isFeatured: false,
    tags: ['communiqué', 'SMIG', 'salaires'],
    publishedAt: fixedDate(2026, 2, 3),
    content: paragraphs(
      'Libreville, le 3 février 2026. Le Bureau exécutif de la Fédération des Travailleurs du Gabon (FETRAG) a pris connaissance des conclusions de la dernière réunion tripartite consacrée à la revalorisation du salaire minimum interprofessionnel garanti. La Fédération prend acte des engagements pris et appelle l’ensemble des parties à en respecter le calendrier.',
      'La FETRAG rappelle que le salaire minimum n’a pas été revalorisé depuis de nombreuses années alors que le coût de la vie, en particulier des denrées de première nécessité, du logement et du transport, a fortement augmenté pour les ménages de travailleurs. Une revalorisation progressive, assortie d’un mécanisme d’indexation régulier, est une mesure de justice sociale et un facteur de stabilité pour les entreprises.',
      'La Fédération invite ses organisations affiliées à recenser, dans leurs secteurs respectifs, les entreprises qui n’appliqueraient pas le minimum légal ou les minima conventionnels, et à saisir l’inspection du travail des manquements constatés. Un modèle de requête est mis à disposition dans la bibliothèque de ressources.',
      'La FETRAG réaffirme sa disponibilité pour poursuivre le dialogue avec le Gouvernement et les organisations d’employeurs dans un esprit de responsabilité, conformément à son triptyque fondateur : protection de l’outil de production, prévention des conflits sociaux et défense des intérêts matériels et moraux des travailleurs.',
      'Pour le Bureau exécutif, le Secrétaire Général.',
    ),
  },
  {
    slug: 'ouverture-negociations-convention-collective-secteur-bois',
    title: 'Ouverture des négociations sur la convention collective du secteur bois',
    categorySlug: 'dialogue-social',
    isCommunique: false,
    isFeatured: false,
    tags: ['négociation collective', 'bois', 'convention collective'],
    publishedAt: fixedDate(2026, 2, 18),
    content: paragraphs(
      'Les négociations en vue de la révision de la convention collective des industries du bois se sont ouvertes cette semaine à Libreville. La délégation des travailleurs, à laquelle participent des représentants d’organisations affiliées à la FETRAG, a présenté un cahier de revendications préparé pendant plusieurs mois avec les sections des scieries et des unités de transformation.',
      'Les principaux points portés par la délégation concernent la révision de la grille de classification, devenue inadaptée aux nouveaux métiers de la transformation, la revalorisation des minima conventionnels, la prime de risque pour les postes exposés et le renforcement des dispositions relatives à la santé et à la sécurité au travail, dans un secteur où les accidents restent nombreux.',
      'La délégation a également proposé la création d’une commission paritaire de suivi de la convention, chargée d’interpréter le texte et de veiller à son application dans toutes les entreprises de la branche, y compris celles de l’intérieur du pays où le contrôle de l’inspection du travail est plus difficile.',
      'Les organisations d’employeurs ont fait part de leurs contraintes liées à la conjoncture du marché international du bois transformé. Les deux parties ont convenu d’un calendrier de cinq séances d’ici la fin du deuxième trimestre. La FETRAG accompagne la délégation par un appui juridique et par la mise à disposition des données comparatives de la branche.',
      'Les sections concernées seront informées après chaque séance par leurs représentants. Les adhérents peuvent transmettre leurs observations sur le cahier de revendications par l’intermédiaire de leur secrétaire de section.',
    ),
  },
  {
    slug: 'lancement-programme-formation-leaders-syndicaux-2026',
    title: 'Lancement du Programme de formation des Leaders Syndicaux - Session 2026',
    categorySlug: 'formation',
    isCommunique: false,
    isFeatured: true,
    tags: ['formation', 'programme 2026', 'leaders syndicaux'],
    publishedAt: fixedDate(2026, 1, 20),
    content: paragraphs(
      'La FETRAG lance officiellement son Programme de formation des Leaders Syndicaux pour la session 2026. Structuré en dix modules, ce programme s’adresse aux responsables et membres de bureaux des sections syndicales, aux délégués du personnel et aux cadres désignés par les organisations affiliées.',
      'Les dix modules couvrent l’ensemble des compétences attendues d’un leader syndical : fondamentaux du syndicalisme gabonais, droit du travail et contentieux, négociation collective et dialogue social, organisation et gestion syndicale, prévention et gestion des conflits sociaux, défense des intérêts matériels et moraux, protection de l’outil de production, leadership et éthique, communication et plaidoyer, santé, sécurité et conditions de travail.',
      'Nouveauté de cette session : les formations sont désormais accessibles sur la plateforme formation.fetrag.ga, en mode hybride. Les participants alternent des séances en présentiel au siège de la Fédération et des activités à distance - lectures, vidéos, capsules audio, quiz, devoirs et forums - conçues pour fonctionner en bas débit. Chaque module validé donne lieu à une attestation ou à un certificat vérifiable en ligne.',
      'Les organisations affiliées peuvent dès à présent déposer une demande de formation en désignant jusqu’à dix cadres par session. Le coordinateur formation de la Fédération examine chaque demande, propose un calendrier et constitue les cohortes. Les travailleurs à titre individuel peuvent s’inscrire directement aux modules ouverts à l’auto-inscription.',
      'Le premier module, « Fondamentaux du Syndicalisme Gabonais », est lancé avec une cohorte pilote constituée avec l’une de nos organisations affiliées du secteur de l’énergie. Les retours de cette cohorte serviront à ajuster les modules suivants.',
      'Renseignements et inscriptions : rubrique Formations du site ou coordination@fetrag.ga.',
    ),
  },
  {
    slug: 'journee-internationale-du-travail-mobilisation-des-sections',
    title: 'Journée internationale du travail : la FETRAG mobilise ses sections',
    categorySlug: 'vie-de-la-federation',
    isCommunique: false,
    isFeatured: false,
    tags: ['1er mai', 'mobilisation', 'sections'],
    publishedAt: fixedDate(2026, 4, 24),
    content: paragraphs(
      'À l’approche du 1er mai, la FETRAG appelle l’ensemble de ses sections à participer aux manifestations de la Journée internationale du travail organisées dans les principales villes du pays. Cette journée est l’occasion de rappeler les acquis du mouvement syndical et de porter les revendications des travailleurs gabonais.',
      'Le thème retenu par la Fédération cette année est « Former pour mieux défendre ». Il met en avant le Programme de formation des Leaders Syndicaux et la conviction que la compétence des responsables est la première condition de l’efficacité syndicale.',
      'Les sections sont invitées à organiser, dans la semaine précédant le 1er mai, des assemblées d’information sur les thèmes prioritaires de l’année : revalorisation du salaire minimum, application des conventions collectives, santé et sécurité au travail et lutte contre les contrats précaires. Un kit d’animation (argumentaire, affiche, modèle de tract) est disponible dans la bibliothèque de ressources.',
      'Le défilé de Libreville partira du siège de la Fédération à 8 heures. Les responsables de section sont priés de communiquer le nombre prévisionnel de participants avant le 28 avril pour l’organisation logistique.',
      'La Fédération rappelle que cette journée doit se dérouler dans le calme et la dignité, conformément à ses valeurs. Les responsables veillent à l’encadrement des cortèges et à la sécurité des participants.',
    ),
  },
  {
    slug: 'dialogue-social-bilan-rencontre-tripartite',
    title: 'Dialogue social : bilan de la rencontre tripartite sur l’emploi et la formation professionnelle',
    categorySlug: 'dialogue-social',
    isCommunique: false,
    isFeatured: false,
    tags: ['dialogue social', 'tripartite', 'formation professionnelle'],
    publishedAt: fixedDate(2026, 3, 12),
    content: paragraphs(
      'Une délégation de la FETRAG a participé à la rencontre tripartite consacrée à l’emploi et à la formation professionnelle, réunissant les représentants de l’administration du travail, des organisations d’employeurs et des organisations de travailleurs. Trois sujets étaient à l’ordre du jour : l’insertion des jeunes, la formation continue des salariés et la lutte contre l’emploi informel.',
      'Sur l’insertion des jeunes, la FETRAG a plaidé pour que les dispositifs de stage et d’apprentissage soient encadrés par des conventions garantissant une rémunération minimale, une couverture sociale et un tutorat effectif, afin d’éviter que ces dispositifs ne se substituent à des emplois durables.',
      'Sur la formation continue, la Fédération a rappelé que le droit à la formation est un droit du travailleur, et proposé que les plans de formation des entreprises soient soumis à l’avis des représentants du personnel. Elle a présenté son propre programme de formation des leaders syndicaux comme contribution à la qualification des acteurs du dialogue social.',
      'Sur l’emploi informel, les participants ont convenu de la nécessité d’un plan d’action conjoint associant incitations à la formalisation et renforcement des contrôles. La FETRAG a insisté sur l’extension de la protection sociale aux travailleurs de l’économie informelle, qui constituent une part importante de la population active.',
      'Un relevé de conclusions a été adopté. Il prévoit la mise en place de trois groupes de travail thématiques dont les résultats seront présentés lors de la prochaine session plénière. La FETRAG y participera et rendra compte à ses affiliés.',
    ),
  },
  {
    slug: 'code-du-travail-2021-delegues-du-personnel',
    title: 'Ce que change le Code du travail de 2021 pour les délégués du personnel',
    categorySlug: 'juridique',
    isCommunique: false,
    isFeatured: false,
    tags: ['code du travail', 'délégués du personnel', 'décryptage'],
    publishedAt: fixedDate(2026, 3, 26),
    content: paragraphs(
      'Le Code du travail adopté en 2021 a modernisé plusieurs dispositions relatives à la représentation du personnel. Ce décryptage, préparé par le service juridique de la FETRAG, présente les points essentiels que tout délégué du personnel doit connaître. Il ne se substitue pas à la lecture du texte, disponible dans notre bibliothèque de ressources.',
      'Les attributions des délégués sont confirmées et précisées : présenter à l’employeur les réclamations individuelles et collectives relatives aux salaires, à l’application du Code, des conventions collectives et du règlement intérieur ; saisir l’inspection du travail de toute plainte ou observation ; être consultés sur les projets de licenciement pour motif économique, le règlement intérieur et l’organisation du temps de travail.',
      'La protection des délégués contre le licenciement est maintenue : tout licenciement d’un délégué titulaire ou suppléant, ou d’un candidat aux élections, est soumis à l’autorisation préalable de l’inspecteur du travail. Un licenciement prononcé sans cette autorisation est nul et ouvre droit à réintégration.',
      'Le texte renforce les moyens des délégués : crédit d’heures de délégation payées comme temps de travail, liberté de circulation dans l’entreprise pour l’exercice du mandat, local et affichage, réception collective par l’employeur au moins une fois par mois. Le refus de l’employeur de recevoir les délégués ou de leur fournir les informations dues constitue une entrave.',
      'Enfin, le Code articule les attributions des délégués avec celles du comité d’hygiène, de sécurité et des conditions de travail dans les entreprises qui en sont dotées. Le module 10 du Programme de formation des Leaders Syndicaux détaille ce point.',
      'Le service juridique reste à la disposition des sections pour toute question d’application. Utilisez le service « Orientation juridique » depuis la rubrique Services.',
    ),
  },
  {
    slug: 'cycle-de-webinaires-ssct',
    title: 'Santé et sécurité au travail : la FETRAG lance un cycle de webinaires SSCT',
    categorySlug: 'formation',
    isCommunique: false,
    isFeatured: false,
    tags: ['SSCT', 'webinaire', 'prévention'],
    publishedAt: fixedDate(2026, 4, 8),
    content: paragraphs(
      'En complément du module 10 de son programme de formation, la FETRAG lance un cycle de webinaires gratuits consacrés à la santé, à la sécurité et aux conditions de travail. Ouverts à tous les délégués du personnel et membres de CHSCT des organisations affiliées, ces webinaires d’une heure et demie sont animés par des formateurs de la Fédération et des intervenants invités.',
      'Le premier webinaire portera sur les obligations de l’employeur et les principes généraux de prévention. Les suivants aborderont l’analyse des accidents du travail par la méthode de l’arbre des causes, les risques chimiques dans l’industrie, les troubles musculo-squelettiques et les risques psychosociaux.',
      'Chaque webinaire est enregistré et mis à disposition en replay, avec sa transcription, sur la plateforme de formation, afin que les participants disposant d’une connexion limitée puissent y accéder à leur rythme. Un questionnaire de satisfaction et un quiz d’auto-évaluation complètent chaque séance.',
      'Les inscriptions se font depuis la rubrique Événements du site. Le nombre de places en direct est limité ; une liste d’attente est ouverte dès que la jauge est atteinte.',
    ),
  },
  {
    slug: 'assemblee-generale-2026-convocation-et-ordre-du-jour',
    title: 'Assemblée générale 2026 : convocation et ordre du jour',
    categorySlug: 'vie-de-la-federation',
    isCommunique: true,
    isFeatured: false,
    tags: ['assemblée générale', 'convocation', 'gouvernance'],
    publishedAt: fixedDate(2026, 4, 15),
    content: paragraphs(
      'Conformément aux statuts de la Fédération, le Bureau exécutif convoque l’Assemblée générale ordinaire des organisations affiliées. Elle se tiendra au siège de la FETRAG à Libreville ; la date et l’heure précises figurent dans la rubrique Événements et dans la convocation adressée à chaque organisation.',
      'L’ordre du jour est le suivant : rapport moral du Secrétaire Général ; rapport financier de l’exercice écoulé et rapport des commissaires aux comptes ; bilan du premier semestre du Programme de formation des Leaders Syndicaux ; orientations pour les négociations de branche à venir ; questions diverses.',
      'Chaque organisation affiliée est représentée par ses délégués désignés conformément à ses statuts, dans la limite fixée par le règlement intérieur de la Fédération. Les délégués doivent être munis d’un mandat signé par le responsable de leur organisation. Les documents préparatoires seront disponibles dans l’espace réservé aux organisations dix jours avant l’Assemblée.',
      'Les organisations qui souhaitent inscrire un point aux questions diverses doivent le transmettre par écrit au Secrétariat général au moins sept jours avant la date de l’Assemblée.',
      'Pour le Bureau exécutif, le Secrétaire Général.',
    ),
  },
]

async function seedArticles(users: SeededUsers, catalog: SeededCatalog): Promise<number> {
  for (const article of articles) {
    const category = get(catalog.categories, article.categorySlug, 'catégorie')
    const data = {
      title: article.title,
      excerpt: excerptOf(article.content, 200),
      content: article.content,
      coverImageUrl: null,
      coverAlt: null,
      categoryId: category.id,
      authorId: users.editeur.id,
      isCommunique: article.isCommunique,
      isFeatured: article.isFeatured,
      status: ContentStatus.PUBLISHED,
      locale: 'fr' as const,
      tags: article.tags,
      readingTime: readingTimeMinutes(article.content),
      publishedAt: article.publishedAt,
    }
    const saved = await prisma.article.upsert({
      where: { slug: article.slug },
      create: { id: stableId('article', article.slug), slug: article.slug, ...data },
      update: data,
      select: { id: true },
    })
    await prisma.seoRecord.upsert({
      where: { articleId: saved.id },
      create: { id: stableId('seo-article', article.slug), articleId: saved.id, title: article.title, description: data.excerpt.slice(0, 160) },
      update: { title: article.title, description: data.excerpt.slice(0, 160) },
    })
  }
  return articles.length
}

// -----------------------------------------------------------------------------
// Ressources documentaires (la ressource « Code du travail » est créée par le cours pilote)
// -----------------------------------------------------------------------------

interface ResourceSeed {
  slug: string
  title: string
  summary: string
  kind: ResourceKind
  categorySlug: string
  accessLevel: AccessLevel
  externalUrl: string | null
  source: string
  authorName: string
  publishedOn: Date
  keywords: string[]
  isPremium?: boolean
  organizationSlug?: string
}

const resources: ResourceSeed[] = [
  {
    slug: 'conventions-fondamentales-de-l-oit',
    title: 'Les conventions fondamentales de l’OIT',
    summary: 'Présentation des conventions fondamentales de l’Organisation internationale du Travail (liberté syndicale, négociation collective, travail forcé, travail des enfants, non-discrimination, sécurité et santé) et de leur statut de ratification.',
    kind: ResourceKind.LEGAL_TEXT,
    categorySlug: 'textes-juridiques',
    accessLevel: AccessLevel.PUBLIC,
    externalUrl: 'https://normlex.ilo.org/dyn/normlex/fr/f?p=NORMLEXPUB:12000:0::NO:::',
    source: 'Organisation internationale du Travail - NORMLEX',
    authorName: 'OIT',
    publishedOn: fixedDate(2025, 6, 1),
    keywords: ['OIT', 'conventions fondamentales', 'liberté syndicale'],
  },
  {
    slug: 'guide-creation-d-une-section-syndicale',
    title: 'Guide pratique : créer une section syndicale',
    summary: 'Étapes, modèles de statuts, procès-verbal de réunion constitutive et formalités de dépôt pour créer une section syndicale conforme au Code du travail.',
    kind: ResourceKind.GUIDE,
    categorySlug: 'guides-pratiques',
    accessLevel: AccessLevel.PUBLIC,
    externalUrl: null,
    source: 'FETRAG - Service juridique',
    authorName: 'FETRAG',
    publishedOn: fixedDate(2026, 1, 12),
    keywords: ['section syndicale', 'statuts', 'création'],
  },
  {
    slug: 'guide-du-delegue-du-personnel',
    title: 'Guide du délégué du personnel',
    summary: 'Attributions, moyens, protection et bonnes pratiques du délégué du personnel : préparer une réunion mensuelle, rédiger une réclamation, saisir l’inspection du travail.',
    kind: ResourceKind.GUIDE,
    categorySlug: 'guides-pratiques',
    accessLevel: AccessLevel.MEMBER,
    externalUrl: null,
    source: 'FETRAG - Service juridique',
    authorName: 'FETRAG',
    publishedOn: fixedDate(2026, 2, 5),
    keywords: ['délégué du personnel', 'réclamation', 'inspection du travail'],
  },
  {
    slug: 'modele-de-convention-collective-cadre',
    title: 'Modèle de convention collective cadre',
    summary: 'Trame commentée de convention collective : dispositions générales, classification, rémunération, durée du travail, droit syndical, commission paritaire.',
    kind: ResourceKind.FORM,
    categorySlug: 'formulaires',
    accessLevel: AccessLevel.ORGANIZATION,
    externalUrl: null,
    source: 'FETRAG - Service négociation',
    authorName: 'FETRAG',
    publishedOn: fixedDate(2026, 2, 20),
    keywords: ['convention collective', 'modèle', 'négociation'],
  },
  {
    slug: 'rapport-d-activite-2025',
    title: 'Rapport d’activité 2025 de la Fédération',
    summary: 'Bilan des actions de représentation, de formation et d’appui aux sections menées en 2025, et comptes de l’exercice.',
    kind: ResourceKind.REPORT,
    categorySlug: 'rapports',
    accessLevel: AccessLevel.ORGANIZATION,
    externalUrl: null,
    source: 'FETRAG - Secrétariat général',
    authorName: 'FETRAG',
    publishedOn: fixedDate(2026, 3, 30),
    keywords: ['rapport d’activité', '2025', 'bilan'],
  },
  {
    slug: 'formulaire-de-demande-de-formation',
    title: 'Formulaire de demande de formation institutionnelle',
    summary: 'Version imprimable du formulaire de demande de formation pour les organisations affiliées : personne ressource, modules choisis, liste des participants, engagements.',
    kind: ResourceKind.FORM,
    categorySlug: 'formulaires',
    accessLevel: AccessLevel.PUBLIC,
    externalUrl: null,
    source: 'FETRAG - Coordination formation',
    authorName: 'FETRAG',
    publishedOn: fixedDate(2026, 1, 20),
    keywords: ['formation', 'demande', 'formulaire'],
  },
  {
    slug: 'analyse-comparative-des-grilles-salariales-secteur-energie',
    title: 'Analyse comparative des grilles salariales du secteur de l’énergie',
    summary: 'Étude premium comparant les grilles de classification et de salaires des principales conventions du secteur de l’énergie en Afrique centrale, avec recommandations pour la négociation.',
    kind: ResourceKind.REPORT,
    categorySlug: 'rapports',
    accessLevel: AccessLevel.PREMIUM,
    externalUrl: null,
    source: 'FETRAG - Observatoire des salaires',
    authorName: 'FETRAG',
    publishedOn: fixedDate(2026, 4, 2),
    keywords: ['salaires', 'énergie', 'grille', 'comparatif'],
    isPremium: true,
  },
]

async function seedResources(catalog: SeededCatalog): Promise<number> {
  for (const r of resources) {
    const category = get(catalog.categories, r.categorySlug, 'catégorie')
    const data = {
      title: r.title,
      summary: r.summary,
      kind: r.kind,
      categoryId: category.id,
      accessLevel: r.accessLevel,
      fileUrl: null,
      fileName: null,
      externalUrl: r.externalUrl,
      mimeType: r.externalUrl ? 'text/html' : 'application/pdf',
      language: 'fr' as const,
      source: r.source,
      authorName: r.authorName,
      publishedOn: r.publishedOn,
      keywords: r.keywords,
      isPremium: r.isPremium ?? false,
      status: ContentStatus.PUBLISHED,
    }
    await prisma.resource.upsert({
      where: { slug: r.slug },
      create: { id: stableId('resource', r.slug), slug: r.slug, ...data },
      update: data,
    })
  }
  return resources.length
}

// -----------------------------------------------------------------------------
// Partenaires
// -----------------------------------------------------------------------------

const partners = [
  {
    slug: 'ministere-du-travail',
    name: 'Ministère du Travail',
    acronym: null,
    kind: PartnerKind.INSTITUTION,
    sector: 'Administration du travail',
    description: 'Administration de tutelle des relations de travail, de l’emploi et du dialogue social au Gabon.',
    website: null,
    city: 'Libreville',
  },
  {
    slug: 'cnss',
    name: 'Caisse Nationale de Sécurité Sociale',
    acronym: 'CNSS',
    kind: PartnerKind.INSTITUTION,
    sector: 'Protection sociale',
    description: 'Organisme gestionnaire des prestations familiales, des pensions et des risques professionnels des travailleurs du secteur privé.',
    website: null,
    city: 'Libreville',
  },
  {
    slug: 'one',
    name: 'Office National de l’Emploi',
    acronym: 'ONE',
    kind: PartnerKind.INSTITUTION,
    sector: 'Emploi',
    description: 'Service public de l’emploi : intermédiation, orientation et insertion professionnelle.',
    website: null,
    city: 'Libreville',
  },
  {
    slug: 'oit',
    name: 'Organisation internationale du Travail',
    acronym: 'OIT',
    kind: PartnerKind.INTERNATIONAL,
    sector: 'Normes internationales du travail',
    description: 'Agence tripartite des Nations Unies chargée des normes internationales du travail et de la promotion du travail décent.',
    website: 'https://www.ilo.org',
    city: 'Genève',
  },
  {
    slug: 'cabinet-equite-et-travail',
    name: 'Cabinet Équité & Travail',
    acronym: null,
    kind: PartnerKind.PARTNER,
    sector: 'Conseil juridique',
    description: 'Cabinet de conseil fictif de démonstration, partenaire du service d’assistance contentieux de la Fédération.',
    website: null,
    city: 'Libreville',
  },
  {
    slug: 'synatep',
    name: "Syndicat National des Travailleurs de l'Énergie et du Pétrole",
    acronym: 'SYNATEP',
    kind: PartnerKind.AFFILIATE,
    sector: 'Énergie et pétrole',
    description: 'Organisation affiliée fictive de démonstration.',
    website: null,
    city: 'Libreville',
  },
]

async function seedPartners(): Promise<number> {
  await inBatches(partners, async (p, index) => {
    const data = {
      name: p.name,
      acronym: p.acronym,
      kind: p.kind,
      sector: p.sector,
      description: p.description,
      logoUrl: null,
      website: p.website,
      city: p.city,
      country: p.slug === 'oit' ? 'CH' : 'GA',
      position: index + 1,
      isActive: true,
    }
    await prisma.partner.upsert({
      where: { slug: p.slug },
      create: { id: stableId('partner', p.slug), slug: p.slug, ...data },
      update: data,
    })
  })
  return partners.length
}

// -----------------------------------------------------------------------------
// Services et demandes de service
// -----------------------------------------------------------------------------

interface ServiceSeed {
  slug: string
  name: string
  summary: string
  description: string
  conditions: string
  icon: string
  isPaid: boolean
  priceAmount: number | null
  requiresAccount: boolean
  slaDays: number
  formSchema: unknown
}

const services: ServiceSeed[] = [
  {
    slug: 'orientation-juridique',
    name: 'Orientation juridique',
    summary: 'Un premier avis gratuit sur votre situation de travail et les démarches possibles.',
    description: paragraphs(
      'Le service d’orientation juridique apporte aux travailleurs et aux sections une première analyse de leur situation : contrat, salaire, sanction, licenciement, accident du travail. Un juriste de la Fédération vous répond par écrit ou vous propose un rendez-vous.',
      'Ce service ne constitue pas une représentation en justice. Si votre situation le nécessite, nous vous orienterons vers le service d’assistance contentieux.',
    ),
    conditions: 'Gratuit pour les adhérents des organisations affiliées et pour toute première demande.',
    icon: 'scale',
    isPaid: false,
    priceAmount: null,
    requiresAccount: true,
    slaDays: 5,
    formSchema: {
      fields: [
        { name: 'situation', label: 'Votre situation', type: 'select', required: true, options: ['Contrat de travail', 'Salaire et primes', 'Sanction disciplinaire', 'Licenciement', 'Accident du travail', 'Autre'] },
        { name: 'employer', label: 'Employeur (facultatif)', type: 'text', required: false },
        { name: 'description', label: 'Décrivez votre situation', type: 'textarea', required: true },
      ],
    },
  },
  {
    slug: 'accompagnement-creation-de-section',
    name: 'Accompagnement à la création de section',
    summary: 'Un appui de A à Z pour créer votre section syndicale dans l’entreprise.',
    description: paragraphs(
      'La Fédération accompagne les travailleurs qui souhaitent créer une section syndicale : réunion constitutive, rédaction des statuts, élection du bureau, formalités de dépôt et information de l’employeur. Un responsable expérimenté vous guide à chaque étape.',
      'Le service comprend la mise à disposition des modèles de documents, deux réunions d’accompagnement et un suivi jusqu’à la reconnaissance de la section.',
    ),
    conditions: 'Gratuit. Réservé aux entreprises où aucune organisation affiliée n’est encore présente.',
    icon: 'users',
    isPaid: false,
    priceAmount: null,
    requiresAccount: true,
    slaDays: 7,
    formSchema: {
      fields: [
        { name: 'company', label: 'Entreprise', type: 'text', required: true },
        { name: 'sector', label: 'Secteur d’activité', type: 'text', required: true },
        { name: 'headcount', label: 'Effectif approximatif', type: 'number', required: true },
        { name: 'founders', label: 'Nombre de travailleurs déjà mobilisés', type: 'number', required: false },
      ],
    },
  },
  {
    slug: 'assistance-contentieux',
    name: 'Assistance contentieux',
    summary: 'Constitution du dossier et assistance devant l’inspection du travail et la juridiction du travail.',
    description: paragraphs(
      'Le service d’assistance contentieux prend en charge votre dossier de différend individuel : analyse des pièces, rédaction de la requête en conciliation, assistance lors de l’audience devant l’inspecteur du travail et, en cas d’échec, préparation de la saisine de la juridiction du travail avec notre cabinet partenaire.',
      'La participation demandée couvre les frais de constitution du dossier. Elle peut être prise en charge par votre organisation affiliée.',
    ),
    conditions: 'Participation forfaitaire de 15 000 FCFA. Prise en charge possible par l’organisation affiliée.',
    icon: 'gavel',
    isPaid: true,
    priceAmount: 15000,
    requiresAccount: true,
    slaDays: 10,
    formSchema: {
      fields: [
        { name: 'dispute', label: 'Nature du différend', type: 'select', required: true, options: ['Licenciement', 'Salaires impayés', 'Sanction', 'Requalification de contrat', 'Autre'] },
        { name: 'employer', label: 'Employeur', type: 'text', required: true },
        { name: 'facts', label: 'Exposé des faits', type: 'textarea', required: true },
        { name: 'documents', label: 'Pièces disponibles', type: 'checkboxes', required: false, options: ['Contrat de travail', 'Bulletins de paie', 'Lettre de licenciement', 'Courriers échangés'] },
      ],
    },
  },
  {
    slug: 'audit-de-convention-collective',
    name: 'Audit de convention collective',
    summary: 'Vérification de l’application de votre convention collective et plan de revendications.',
    description: paragraphs(
      'Le service d’audit examine, pour une section ou une organisation, l’application effective de la convention collective dans l’entreprise : classifications, minima, primes, durée du travail, droit syndical. Il produit un rapport d’écarts chiffré et un plan de revendications priorisé.',
      'L’audit mobilise un juriste et un négociateur de la Fédération pendant deux à trois semaines, avec une restitution auprès du bureau de la section.',
    ),
    conditions: 'Forfait de 50 000 FCFA par entreprise auditée, à la charge de l’organisation demanderesse.',
    icon: 'clipboard-check',
    isPaid: true,
    priceAmount: 50000,
    requiresAccount: true,
    slaDays: 21,
    formSchema: {
      fields: [
        { name: 'organization', label: 'Organisation demanderesse', type: 'text', required: true },
        { name: 'company', label: 'Entreprise auditée', type: 'text', required: true },
        { name: 'agreement', label: 'Convention collective applicable', type: 'text', required: true },
        { name: 'headcount', label: 'Effectif', type: 'number', required: true },
      ],
    },
  },
  {
    slug: 'mediation',
    name: 'Médiation',
    summary: 'Intervention d’un médiateur de la Fédération pour dénouer un différend collectif ou interne.',
    description: paragraphs(
      'La Fédération met à disposition des sections et des organisations affiliées un médiateur expérimenté pour faciliter le règlement d’un différend collectif avec l’employeur ou d’un conflit interne à l’organisation. Le médiateur entend les parties, identifie les points d’accord possibles et formule une recommandation.',
      'Ce service est gratuit pour les organisations affiliées ; les frais de déplacement hors de Libreville sont à la charge de l’organisation demanderesse.',
    ),
    conditions: 'Gratuit pour les organisations affiliées. Frais de déplacement à la charge du demandeur hors Libreville.',
    icon: 'handshake',
    isPaid: false,
    priceAmount: null,
    requiresAccount: true,
    slaDays: 7,
    formSchema: {
      fields: [
        { name: 'kind', label: 'Type de différend', type: 'select', required: true, options: ['Différend collectif avec l’employeur', 'Conflit interne à l’organisation'] },
        { name: 'parties', label: 'Parties concernées', type: 'text', required: true },
        { name: 'context', label: 'Contexte et enjeux', type: 'textarea', required: true },
        { name: 'urgency', label: 'Urgence', type: 'select', required: true, options: ['Faible', 'Moyenne', 'Élevée'] },
      ],
    },
  },
]

async function seedServices(): Promise<Record<string, SeededService>> {
  const result: Record<string, SeededService> = {}
  for (const [index, s] of services.entries()) {
    const data = {
      name: s.name,
      summary: s.summary,
      description: s.description,
      conditions: s.conditions,
      icon: s.icon,
      isPaid: s.isPaid,
      priceAmount: s.priceAmount,
      currency: 'XAF',
      requiresAccount: s.requiresAccount,
      formSchema: json(s.formSchema),
      slaDays: s.slaDays,
      status: ContentStatus.PUBLISHED,
      position: index + 1,
    }
    const saved = await prisma.service.upsert({
      where: { slug: s.slug },
      create: { id: stableId('service', s.slug), slug: s.slug, ...data },
      update: data,
      select: { id: true, slug: true, name: true, priceAmount: true },
    })
    await prisma.seoRecord.upsert({
      where: { serviceId: saved.id },
      create: { id: stableId('seo-service', s.slug), serviceId: saved.id, title: `${s.name} - Services FETRAG`, description: s.summary },
      update: { title: `${s.name} - Services FETRAG`, description: s.summary },
    })
    result[saved.slug] = saved
  }
  return result
}

interface ServiceRequestSeed {
  reference: string
  serviceSlug: string
  requester: SeededUser
  status: ServiceRequestStatus
  organization: string
  message: string
  payload: unknown
  assigneeId: string | null
  internalNote: string | null
  createdAt: Date
  history: Array<{ from: ServiceRequestStatus | null; to: ServiceRequestStatus; comment: string }>
}

async function seedServiceRequests(users: SeededUsers, servicesBySlug: Record<string, SeededService>): Promise<number> {
  const learner = (i: number) => at(users.learners, i, 'apprenant')
  const requests: ServiceRequestSeed[] = [
    {
      reference: 'SRV-2026-A3K7MP',
      serviceSlug: 'orientation-juridique',
      requester: learner(7),
      status: ServiceRequestStatus.NEW,
      organization: 'SYNATEP',
      message: 'Mon employeur a modifié mes horaires sans accord écrit et refuse de payer les heures de nuit. Que puis-je faire ?',
      payload: { situation: 'Salaire et primes', employer: 'Site de production - Port-Gentil (fictif)' },
      assigneeId: null,
      internalNote: null,
      createdAt: daysFromNow(-2, 10),
      history: [{ from: null, to: ServiceRequestStatus.NEW, comment: 'Demande reçue via le site.' }],
    },
    {
      reference: 'SRV-2026-B8N2QT',
      serviceSlug: 'accompagnement-creation-de-section',
      requester: users.responsable,
      status: ServiceRequestStatus.IN_PROGRESS,
      organization: 'SYNATEP',
      message: 'Un groupe de quinze travailleurs d’une entreprise de sous-traitance souhaite créer une section rattachée au SYNATEP.',
      payload: { company: 'Sous-traitance maintenance (fictif)', sector: 'Énergie', headcount: 80, founders: 15 },
      assigneeId: users.services.id,
      internalNote: 'Première réunion d’accompagnement planifiée. Modèles de statuts transmis.',
      createdAt: daysFromNow(-9, 14),
      history: [
        { from: null, to: ServiceRequestStatus.NEW, comment: 'Demande reçue.' },
        { from: ServiceRequestStatus.NEW, to: ServiceRequestStatus.IN_REVIEW, comment: 'Prise en charge par le service.' },
        { from: ServiceRequestStatus.IN_REVIEW, to: ServiceRequestStatus.IN_PROGRESS, comment: 'Accompagnement engagé.' },
      ],
    },
    {
      reference: 'SRV-2026-C5R9WD',
      serviceSlug: 'orientation-juridique',
      requester: learner(3),
      status: ServiceRequestStatus.RESOLVED,
      organization: 'SYNATEP',
      message: 'Convoquée à un entretien préalable à sanction, puis-je me faire assister par un délégué de mon syndicat ?',
      payload: { situation: 'Sanction disciplinaire' },
      assigneeId: users.services.id,
      internalNote: 'Réponse écrite envoyée : droit à l’assistance confirmé, modèle de courrier joint.',
      createdAt: daysFromNow(-15, 9),
      history: [
        { from: null, to: ServiceRequestStatus.NEW, comment: 'Demande reçue.' },
        { from: ServiceRequestStatus.NEW, to: ServiceRequestStatus.IN_REVIEW, comment: 'Analyse par le juriste.' },
        { from: ServiceRequestStatus.IN_REVIEW, to: ServiceRequestStatus.RESOLVED, comment: 'Réponse transmise à la demanderesse.' },
      ],
    },
  ]
  for (const r of requests) {
    const service = get(servicesBySlug, r.serviceSlug, 'service')
    const data = {
      serviceId: service.id,
      requesterId: r.requester.id,
      assigneeId: r.assigneeId,
      fullName: r.requester.name,
      email: r.requester.email,
      phone: null,
      organization: r.organization,
      message: r.message,
      payload: json(r.payload),
      status: r.status,
      internalNote: r.internalNote,
      createdAt: r.createdAt,
    }
    const saved = await prisma.serviceRequest.upsert({
      where: { reference: r.reference },
      create: { id: stableId('service-request', r.reference), reference: r.reference, ...data },
      update: data,
      select: { id: true },
    })
    await inBatches(r.history, async (h, index) => {
      const id = stableId('status-event', 'service-request', r.reference, index)
      await prisma.statusEvent.upsert({
        where: { id },
        create: {
          id,
          entityType: 'ServiceRequest',
          entityId: saved.id,
          serviceRequestId: saved.id,
          fromStatus: h.from,
          toStatus: h.to,
          actorId: index === 0 ? r.requester.id : users.services.id,
          comment: h.comment,
          createdAt: new Date(r.createdAt.getTime() + index * 86_400_000),
        },
        update: { comment: h.comment },
      })
    })
  }
  return requests.length
}

// -----------------------------------------------------------------------------
// FAQ
// -----------------------------------------------------------------------------

const faqs = [
  {
    key: 'affiliation',
    group: 'general',
    question: 'Comment une organisation syndicale peut-elle s’affilier à la FETRAG ?',
    answer: 'L’affiliation se fait sur décision des instances de l’organisation candidate et du Bureau exécutif de la Fédération, après examen des statuts et de la composition du bureau. Le dossier est présenté sur la page Adhésion.',
  },
  {
    key: 'inscription-formation',
    group: 'formation',
    question: 'Qui peut s’inscrire aux formations du Programme des Leaders Syndicaux ?',
    answer: 'Les organisations affiliées déposent une demande de formation pour leurs cadres (jusqu’à dix participants par session). Les travailleurs à titre individuel peuvent s’inscrire directement aux modules ouverts à l’auto-inscription ; certains modules sont réservés aux demandes des organisations.',
  },
  {
    key: 'certificat',
    group: 'formation',
    question: 'Comment vérifier l’authenticité d’un certificat FETRAG ?',
    answer: 'Chaque certificat porte un numéro unique et un code de vérification (ou un QR code). Saisissez ce code sur la page « Vérifier un certificat » : le site confirme le titulaire, l’intitulé de la formation et la date d’émission, sans révéler d’autres données personnelles.',
  },
  {
    key: 'paiement',
    group: 'general',
    question: 'Quels moyens de paiement sont acceptés pour les formations et services payants ?',
    answer: 'Le paiement en ligne accepte le mobile money et la carte bancaire selon les moyens proposés par notre prestataire. Un reçu numéroté est émis pour chaque paiement réussi. Les organisations peuvent prendre en charge tout ou partie du montant pour leurs adhérents.',
  },
  {
    key: 'bas-debit',
    group: 'formation',
    question: 'Puis-je suivre les formations avec une connexion internet limitée ?',
    answer: 'Oui. Chaque vidéo ou fichier audio dispose d’une transcription et, quand c’est possible, d’une version allégée. La progression est enregistrée à chaque activité ; vous pouvez reprendre là où vous vous étiez arrêté après une coupure.',
  },
]

async function seedFaqs(): Promise<number> {
  await inBatches(faqs, async (f, index) => {
    const id = stableId('faq', f.key)
    const data = { question: f.question, answer: f.answer, group: f.group, position: index + 1, isActive: true }
    await prisma.faq.upsert({ where: { id }, create: { id, ...data }, update: data })
  })
  return faqs.length
}

// -----------------------------------------------------------------------------
// Événements et inscriptions
// -----------------------------------------------------------------------------

interface EventSeed {
  key: string
  slug: string
  title: string
  summary: string
  description: string
  kind: EventKind
  categorySlug: string
  startsAt: Date
  endsAt: Date
  location: string | null
  city: string
  mode: SessionMode
  meetingUrl: string | null
  speakerName: string | null
  speakerTitle: string | null
  speakerBio: string | null
  capacity: number
  isFree: boolean
  priceAmount: number | null
  issuesCertificate: boolean
  isFeatured: boolean
}

function eventSeeds(): EventSeed[] {
  return [
    {
      key: 'masterclass',
      slug: 'master-class-negocier-en-periode-de-crise',
      title: 'Master Class « Négocier en période de crise »',
      summary: 'Une demi-journée avec une intervenante invitée pour apprendre à négocier lorsque l’entreprise traverse des difficultés économiques.',
      description: paragraphs(
        'Comment obtenir des garanties pour les travailleurs quand l’employeur invoque la crise ? Cette Master Class alterne exposés, analyse de cas réels et simulation de négociation. Elle s’adresse aux négociateurs de branche et d’entreprise, aux secrétaires généraux de sections et aux délégués du personnel confrontés à des projets de restructuration.',
        'Programme : lecture critique des arguments économiques de l’employeur ; alternatives aux licenciements ; clauses de sauvegarde et de retour à meilleure fortune ; communication avec les salariés pendant la négociation. Les participants repartent avec une boîte à outils et une attestation de participation.',
      ),
      kind: EventKind.MASTERCLASS,
      categorySlug: 'formation',
      startsAt: daysFromNow(25, 9),
      endsAt: daysFromNow(25, 13),
      location: 'Siège de la FETRAG, salle de conférence',
      city: 'Libreville',
      mode: SessionMode.HYBRID,
      meetingUrl: 'https://meet.jit.si/fetrag-masterclass-negocier-en-crise',
      speakerName: 'Me Aurélie MBADINGA',
      speakerTitle: 'Avocate en droit social, intervenante invitée (profil fictif de démonstration)',
      speakerBio:
        'Avocate en droit social, elle accompagne depuis quinze ans des délégations de travailleurs dans des négociations de sauvegarde de l’emploi et des plans sociaux en Afrique centrale. Profil fictif utilisé pour la démonstration.',
      capacity: 60,
      isFree: false,
      priceAmount: 10000,
      issuesCertificate: true,
      isFeatured: true,
    },
    {
      key: 'assembly',
      slug: 'assemblee-generale-2026',
      title: 'Assemblée générale ordinaire 2026',
      summary: 'Assemblée générale des organisations affiliées : rapports moral et financier, bilan du programme de formation et orientations.',
      description: paragraphs(
        'Conformément aux statuts, l’Assemblée générale ordinaire réunit les délégués des organisations affiliées. Ordre du jour : rapport moral du Secrétaire Général, rapport financier et rapport des commissaires aux comptes, bilan du premier semestre du Programme de formation des Leaders Syndicaux, orientations pour les négociations de branche, questions diverses.',
        'Les délégués doivent être munis d’un mandat signé par le responsable de leur organisation. Les documents préparatoires sont disponibles dans l’espace des organisations dix jours avant la date.',
      ),
      kind: EventKind.ASSEMBLY,
      categorySlug: 'vie-de-la-federation',
      startsAt: daysFromNow(45, 9),
      endsAt: daysFromNow(45, 16),
      location: 'Siège de la FETRAG',
      city: 'Libreville',
      mode: SessionMode.IN_PERSON,
      meetingUrl: null,
      speakerName: null,
      speakerTitle: null,
      speakerBio: null,
      capacity: 150,
      isFree: true,
      priceAmount: null,
      issuesCertificate: false,
      isFeatured: false,
    },
    {
      key: 'webinar',
      slug: 'webinaire-ssct-obligations-de-l-employeur',
      title: 'Webinaire SSCT : obligations de l’employeur et principes de prévention',
      summary: 'Premier webinaire gratuit du cycle santé, sécurité et conditions de travail.',
      description: paragraphs(
        'Ce webinaire d’une heure et demie présente les obligations générales de l’employeur en matière de santé et de sécurité, les principes généraux de prévention et les droits d’alerte et de retrait des travailleurs. Il est animé par un formateur de la Fédération et suivi d’une séance de questions-réponses.',
        'Le webinaire est enregistré ; le replay et la transcription sont mis à disposition sur la plateforme de formation.',
      ),
      kind: EventKind.WEBINAR,
      categorySlug: 'formation',
      startsAt: daysFromNow(10, 17),
      endsAt: daysFromNow(10, 18, 30),
      location: null,
      city: 'En ligne',
      mode: SessionMode.VIRTUAL,
      meetingUrl: 'https://meet.jit.si/fetrag-webinaire-ssct-1',
      speakerName: 'Clarisse MAPANGOU',
      speakerTitle: 'Formatrice principale, FETRAG',
      speakerBio: null,
      capacity: 200,
      isFree: true,
      priceAmount: null,
      issuesCertificate: false,
      isFeatured: false,
    },
  ]
}

async function seedEvents(catalog: SeededCatalog): Promise<Record<string, SeededEvent>> {
  const result: Record<string, SeededEvent> = {}
  for (const e of eventSeeds()) {
    const category = get(catalog.categories, e.categorySlug, 'catégorie')
    const data = {
      title: e.title,
      summary: e.summary,
      description: e.description,
      kind: e.kind,
      categoryId: category.id,
      coverImageUrl: null,
      startsAt: e.startsAt,
      endsAt: e.endsAt,
      location: e.location,
      city: e.city,
      mode: e.mode,
      meetingUrl: e.meetingUrl,
      speakerName: e.speakerName,
      speakerTitle: e.speakerTitle,
      speakerBio: e.speakerBio,
      capacity: e.capacity,
      isFree: e.isFree,
      priceAmount: e.priceAmount,
      currency: 'XAF',
      issuesCertificate: e.issuesCertificate,
      status: ContentStatus.PUBLISHED,
      isFeatured: e.isFeatured,
      publishedAt: fixedDate(2026, 4, 1),
    }
    const saved = await prisma.event.upsert({
      where: { slug: e.slug },
      create: { id: stableId('event', e.slug), slug: e.slug, ...data },
      update: data,
      select: { id: true, slug: true, title: true, priceAmount: true },
    })
    await prisma.seoRecord.upsert({
      where: { eventId: saved.id },
      create: { id: stableId('seo-event', e.slug), eventId: saved.id, title: `${e.title} - FETRAG`, description: e.summary },
      update: { title: `${e.title} - FETRAG`, description: e.summary },
    })
    result[e.key] = saved
  }
  return result
}

async function seedRegistrations(users: SeededUsers, events: Record<string, SeededEvent>): Promise<string> {
  const masterclass = get(events, 'masterclass', 'événement')
  const webinar = get(events, 'webinar', 'événement')
  const assembly = get(events, 'assembly', 'événement')
  const registrations = [
    { event: masterclass, user: at(users.learners, 2, 'apprenant'), createdAt: daysFromNow(-4, 11) },
    { event: webinar, user: users.responsable, createdAt: daysFromNow(-3, 9) },
    { event: webinar, user: at(users.learners, 6, 'apprenant'), createdAt: daysFromNow(-2, 16) },
    { event: assembly, user: users.formateur, createdAt: daysFromNow(-1, 8) },
  ]
  let masterclassRegistrationId = ''
  for (const r of registrations) {
    const saved = await prisma.eventRegistration.upsert({
      where: { eventId_userId: { eventId: r.event.id, userId: r.user.id } },
      create: {
        id: stableId('event-registration', r.event.slug, r.user.email),
        eventId: r.event.id,
        userId: r.user.id,
        status: EventRegistrationStatus.REGISTERED,
        createdAt: r.createdAt,
      },
      update: { status: EventRegistrationStatus.REGISTERED },
      select: { id: true },
    })
    if (r.event.id === masterclass.id) masterclassRegistrationId = saved.id
  }
  return masterclassRegistrationId
}

// -----------------------------------------------------------------------------
// Formulaires et newsletter
// -----------------------------------------------------------------------------

async function seedForms(users: SeededUsers): Promise<number> {
  const submissions = [
    {
      reference: 'MSG-2026-D4H7KP',
      kind: FormKind.CONTACT,
      userId: null,
      fullName: 'Serge MOUNGUENGUI',
      email: 'serge.moungengui@example.ga',
      phone: '+241 07 40 00 11',
      subject: 'Demande d’information sur les formations',
      message: 'Bonjour, je suis délégué du personnel dans une entreprise de transport et je souhaite savoir si je peux suivre le module 10 sur la santé et la sécurité au travail à titre individuel.',
      payload: { consent: true },
      status: FormSubmissionStatus.NEW,
      assignedTo: null,
      answeredAt: null,
      createdAt: daysFromNow(-1, 15),
    },
    {
      reference: 'MSG-2026-E9M3RT',
      kind: FormKind.PARTNERSHIP,
      userId: null,
      fullName: 'Institut de Formation Professionnelle (fictif)',
      email: 'partenariats@ifp-demo.ga',
      phone: '+241 01 44 00 22',
      subject: 'Proposition de partenariat formation',
      message: 'Notre institut propose de mettre ses salles et ses équipements à disposition des sessions de formation de la FETRAG en province, en échange d’une visibilité sur vos supports.',
      payload: { organization: 'Institut de Formation Professionnelle (fictif)', partnershipType: 'formation', consent: true },
      status: FormSubmissionStatus.ANSWERED,
      assignedTo: users.editeur.id,
      answeredAt: daysFromNow(-5, 10),
      createdAt: daysFromNow(-8, 11),
    },
  ]
  for (const s of submissions) {
    const data = {
      kind: s.kind,
      userId: s.userId,
      fullName: s.fullName,
      email: s.email,
      phone: s.phone,
      subject: s.subject,
      message: s.message,
      payload: json(s.payload),
      status: s.status,
      assignedTo: s.assignedTo,
      answeredAt: s.answeredAt,
      createdAt: s.createdAt,
    }
    await prisma.formSubmission.upsert({
      where: { reference: s.reference },
      create: { id: stableId('form-submission', s.reference), reference: s.reference, ...data },
      update: data,
    })
  }
  return submissions.length
}

async function seedNewsletter(users: SeededUsers): Promise<number> {
  const learner = at(users.learners, 0, 'apprenant')
  const subscriptions = [
    { email: learner.email, userId: learner.id, confirmedAt: daysFromNow(-20, 12), source: 'inscription' },
    { email: 'lecteur.newsletter@example.ga', userId: null, confirmedAt: null, source: 'site' },
  ]
  for (const s of subscriptions) {
    await prisma.newsletterSubscription.upsert({
      where: { email: s.email },
      create: {
        id: stableId('newsletter', s.email),
        email: s.email,
        userId: s.userId,
        confirmedAt: s.confirmedAt,
        token: stableId('newsletter-token', s.email),
        source: s.source,
      },
      update: { userId: s.userId, confirmedAt: s.confirmedAt, source: s.source },
    })
  }
  return subscriptions.length
}

// -----------------------------------------------------------------------------
// Orchestration CMS
// -----------------------------------------------------------------------------

/** Charge l'ensemble des contenus du site institutionnel. */
export async function seedCms(users: SeededUsers, catalog: SeededCatalog): Promise<SeededCms> {
  log.step('CMS : pages, menus, actualités, ressources, partenaires, services, FAQ, événements')
  const pageCount = await seedPages(users)
  const menuItemCount = await seedMenus()
  log.done(`${pageCount} pages, ${menuItemCount} entrées de menu`)
  const articleCount = await seedArticles(users, catalog)
  const resourceCount = await seedResources(catalog)
  const partnerCount = await seedPartners()
  log.done(`${articleCount} actualités, ${resourceCount + 1} ressources (dont le Code du travail), ${partnerCount} partenaires`)
  const servicesBySlug = await seedServices()
  const serviceRequestCount = await seedServiceRequests(users, servicesBySlug)
  const faqCount = await seedFaqs()
  log.done(`${Object.keys(servicesBySlug).length} services, ${serviceRequestCount} demandes de service, ${faqCount} FAQ`)
  const events = await seedEvents(catalog)
  const masterclassRegistrationId = await seedRegistrations(users, events)
  const formCount = await seedForms(users)
  const newsletterCount = await seedNewsletter(users)
  log.done(`${Object.keys(events).length} événements, 4 inscriptions, ${formCount} formulaires, ${newsletterCount} abonnements newsletter`)
  return { events, services: servicesBySlug, masterclassRegistrationId }
}
