import type { CourseLevel, EnrollmentPolicy } from '../../generated/client'
import { list, paragraphs } from './helpers'

/**
 * Contenu des 10 modules du Programme de formation des Leaders Syndicaux - Session 2026
 * (docs/specs/programme_formation_2026.md, chapitre 12 du CDC).
 * Chaque module de programme devient un Course ; ses trois lignes de contenu deviennent
 * trois CourseModule, chacun avec une ou deux leçons portant au moins une activité TEXT.
 */

export type Pillar = 'protection' | 'prevention' | 'defense'

export interface LessonContent {
  slug: string
  title: string
  summary: string
  durationMinutes: number
  isPreview?: boolean
  /** HTML pédagogique (2 à 4 paragraphes) de l'activité TEXT principale. */
  html: string
}

export interface ModuleContent {
  title: string
  summary: string
  durationMinutes: number
  lessons: LessonContent[]
}

export interface CourseContent {
  code: string
  slug: string
  title: string
  summary: string
  description: string
  objectives: string[]
  audience: string
  prerequisitesText: string
  pillar: Pillar
  level: CourseLevel
  durationHours: number
  isFree: boolean
  priceAmount: number | null
  memberPriceAmount: number | null
  enrollmentPolicy: EnrollmentPolicy
  isFeatured: boolean
  position: number
  modules: ModuleContent[]
}

export const COURSE_SUBTITLE = 'Programme de formation des Leaders Syndicaux - Session 2026'

const pillarColors: Record<Pillar, string> = {
  protection: '#0259C7',
  prevention: '#9CC102',
  defense: '#F9C804',
}

export function pillarColor(pillar: Pillar): string {
  return pillarColors[pillar]
}

export const courses: CourseContent[] = [
  // ---------------------------------------------------------------------------
  // MODULE 01 - cours pilote
  // ---------------------------------------------------------------------------
  {
    code: 'M01',
    slug: 'fondamentaux-du-syndicalisme-gabonais',
    title: 'Fondamentaux du Syndicalisme Gabonais',
    summary:
      'Comprendre d’où vient le mouvement syndical gabonais, dans quel cadre juridique il agit et ce que la FETRAG porte comme mission et comme valeurs.',
    description: paragraphs(
      'Ce module d’ouverture pose les bases communes à tous les leaders syndicaux formés par la FETRAG. Il retrace l’histoire du mouvement des travailleurs au Gabon, depuis les premières organisations de l’époque coloniale jusqu’au pluralisme syndical actuel, pour donner à chaque participant une conscience claire de l’héritage dont il est dépositaire.',
      'La deuxième partie présente le cadre juridique et réglementaire dans lequel s’exerce l’action syndicale : Constitution, Code du travail, conventions internationales ratifiées par le Gabon et conventions collectives. Les participants apprennent à repérer les textes utiles, à les lire et à s’y référer avec rigueur dans leurs interventions.',
      'Enfin, le module présente la FETRAG elle-même : sa mission, ses valeurs « Travail, Efficacité, Solidarité » et son triptyque fondateur - protection de l’outil de production, prévention des conflits sociaux, défense des intérêts matériels et moraux des travailleurs - qui structure l’ensemble du programme 2026.',
    ),
    objectives: [
      'Situer les grandes étapes de l’histoire du syndicalisme gabonais et en tirer des enseignements pour l’action actuelle',
      'Identifier les principales sources du droit applicable aux relations de travail au Gabon',
      'Expliquer la mission, les valeurs et le triptyque fondateur de la FETRAG',
      'Utiliser le vocabulaire juridique et syndical de base avec précision',
    ],
    audience: 'Responsables et membres de bureaux de sections syndicales, délégués du personnel, nouveaux adhérents appelés à des responsabilités.',
    prerequisitesText: 'Aucun prérequis. Une lecture préalable des statuts de sa propre organisation est recommandée.',
    pillar: 'protection',
    level: 'INITIATION',
    durationHours: 12,
    isFree: true,
    priceAmount: null,
    memberPriceAmount: null,
    enrollmentPolicy: 'SELF',
    isFeatured: true,
    position: 1,
    modules: [
      {
        title: 'Historique du mouvement syndical au Gabon',
        summary: 'Des premières organisations de travailleurs au pluralisme syndical contemporain.',
        durationMinutes: 240,
        lessons: [
          {
            slug: 'des-origines-coloniales-a-l-independance',
            title: 'Des origines coloniales à l’indépendance',
            summary: 'Naissance du mouvement ouvrier gabonais et rôle des travailleurs dans l’accession à l’indépendance.',
            durationMinutes: 60,
            isPreview: true,
            html: paragraphs(
              'Le mouvement syndical gabonais naît dans le contexte de l’Afrique équatoriale française, lorsque les travailleurs des chantiers forestiers, des ports et de l’administration commencent à s’organiser pour défendre leurs conditions de travail. L’adoption en 1952 du Code du travail des territoires d’outre-mer reconnaît pour la première fois aux travailleurs africains le droit de constituer des syndicats, de négocier et de faire grève. Cette reconnaissance ouvre la voie à la création des premières unions locales rattachées aux grandes centrales françaises de l’époque.',
              'Dans les années qui précèdent l’indépendance de 1960, les organisations de travailleurs deviennent des lieux de formation politique et d’expression des revendications sociales : égalité de traitement entre travailleurs africains et européens, salaires, protection sociale et respect de la durée du travail. Les dirigeants syndicaux participent activement aux débats sur l’avenir du pays et beaucoup d’entre eux rejoignent les institutions du jeune État.',
              'Après l’indépendance, le syndicalisme gabonais entre dans une phase de structuration nationale. Les unions territoriales se transforment en organisations gabonaises et le pouvoir cherche à en faire un partenaire du projet de développement national. Cette période pose les fondations du dialogue social gabonais tout en limitant progressivement l’autonomie des organisations, un enjeu qui restera central jusqu’au tournant des années 1990.',
              'Retenir cette histoire permet au leader syndical d’aujourd’hui de comprendre que les droits collectifs dont il dispose ont été conquis, puis consolidés, par des générations de militants. Elle rappelle aussi que l’efficacité d’une organisation dépend autant de sa capacité à revendiquer que de sa capacité à proposer.',
            ),
          },
          {
            slug: 'pluralisme-syndical-et-dialogue-social-depuis-1990',
            title: 'Pluralisme syndical et dialogue social depuis 1990',
            summary: 'Le retour du multipartisme, l’éclosion des centrales et la construction du dialogue social tripartite.',
            durationMinutes: 60,
            html: paragraphs(
              'La Conférence nationale de 1990 marque un tournant : le retour au multipartisme s’accompagne de la reconnaissance du pluralisme syndical. Aux côtés de la confédération historique, de nouvelles centrales et de nombreux syndicats de branche voient le jour dans la fonction publique, le pétrole, les transports, l’enseignement et la santé. Cette diversité renforce la représentation des travailleurs mais pose aussi la question de l’unité d’action et de la représentativité.',
              'Le Code du travail de 1994, puis sa refonte de 2021, organisent le cadre du dialogue social : liberté syndicale, élections des délégués du personnel, négociation collective, règlement des différends et exercice du droit de grève. Les institutions tripartites réunissant l’État, les employeurs et les organisations de travailleurs deviennent le lieu privilégié de discussion des grandes réformes, qu’il s’agisse du salaire minimum, de la protection sociale ou de la formation professionnelle.',
              'Les fédérations comme la FETRAG jouent dans ce paysage un rôle d’articulation : elles mutualisent les compétences juridiques, portent les revendications transversales et forment les responsables des organisations affiliées. Le leader syndical doit connaître cette architecture pour savoir à quel niveau porter chaque question : dans l’entreprise, dans la branche ou au niveau national.',
            ),
          },
        ],
      },
      {
        title: 'Cadre juridique et réglementaire',
        summary: 'Constitution, Code du travail, conventions internationales et conventions collectives.',
        durationMinutes: 240,
        lessons: [
          {
            slug: 'le-code-du-travail-gabonais',
            title: 'Le Code du travail gabonais',
            summary: 'Architecture du Code du travail et dispositions clés pour l’action syndicale.',
            durationMinutes: 75,
            html: paragraphs(
              'Le Code du travail est la principale source légale des relations de travail au Gabon. Adopté en 1994 et profondément révisé par la loi de 2021, il organise le contrat de travail, la durée du travail, la rémunération, la représentation du personnel, la négociation collective, l’hygiène et la sécurité ainsi que le règlement des différends individuels et collectifs. Il s’applique à tous les travailleurs du secteur privé et parapublic, les agents publics relevant de statuts particuliers.',
              'Pour un responsable syndical, certaines dispositions sont d’usage quotidien : les règles relatives au contrat à durée déterminée et à sa requalification, la procédure disciplinaire et les garanties du salarié convoqué, les conditions du licenciement pour motif personnel ou économique, les attributions des délégués du personnel et la protection dont ils bénéficient, enfin le droit syndical dans l’entreprise (affichage, collecte des cotisations, réunions).',
              'Le Code renvoie souvent à des décrets d’application et à des arrêtés ministériels : montant du salaire minimum interprofessionnel garanti, modalités des élections professionnelles, seuils d’effectifs, règles d’hygiène et de sécurité. Un leader syndical efficace conserve un dossier à jour de ces textes et vérifie systématiquement la version en vigueur avant de s’en prévaloir, notamment auprès de l’inspection du travail.',
              'Dans cette leçon, vous téléchargerez des extraits du Code du travail et repérerez, pour chacun des thèmes ci-dessus, l’article de référence. Cet exercice de repérage est la base de toute intervention syndicale argumentée.',
            ),
          },
          {
            slug: 'les-conventions-collectives',
            title: 'Les conventions collectives',
            summary: 'Nature, champ d’application et force obligatoire des conventions collectives.',
            durationMinutes: 60,
            html: paragraphs(
              'La convention collective est un accord écrit conclu entre un ou plusieurs employeurs (ou leurs organisations) et une ou plusieurs organisations syndicales de travailleurs. Elle adapte et améliore les règles du Code du travail pour une branche d’activité ou une entreprise : classification des emplois, grille salariale, primes, congés, protection sociale complémentaire, procédures internes. Elle ne peut jamais prévoir des dispositions moins favorables que la loi.',
              'Au Gabon, les conventions collectives de branche (pétrole, bois, transport, commerce, bâtiment, banques, etc.) sont négociées dans un cadre paritaire et peuvent être étendues par arrêté ministériel à l’ensemble des entreprises de la branche. Un accord d’entreprise peut ensuite compléter la convention de branche pour tenir compte des spécificités locales.',
              'Le leader syndical doit connaître la convention applicable à ses adhérents, savoir la lire et vérifier son application concrète : classification effective des salariés, respect des minima conventionnels, paiement des primes et indemnités prévues. Les écarts constatés sont la matière première des revendications et des recours.',
            ),
          },
        ],
      },
      {
        title: 'La FETRAG : mission, valeurs et triptyque fondateur',
        summary: 'Identité, mission, valeurs et le triptyque qui structure l’action de la Fédération.',
        durationMinutes: 240,
        lessons: [
          {
            slug: 'mission-et-valeurs-de-la-fetrag',
            title: 'Mission et valeurs de la FETRAG',
            summary: 'Ce que la Fédération des Travailleurs du Gabon porte pour ses organisations affiliées.',
            durationMinutes: 60,
            html: paragraphs(
              'La Fédération des Travailleurs du Gabon (FETRAG) rassemble des organisations syndicales de plusieurs secteurs d’activité autour d’un projet commun : un syndicalisme responsable, compétent et solidaire, capable de défendre les travailleurs tout en contribuant à la pérennité des entreprises et des services publics. Sa devise, « Travail, Efficacité, Solidarité », résume cette ambition.',
              'Le travail est la valeur première : il fonde la dignité du travailleur et la richesse du pays. L’efficacité exprime l’exigence de résultats concrets pour les adhérents, ce qui suppose des responsables formés, des dossiers solides et des méthodes rigoureuses. La solidarité rappelle enfin que la force du mouvement syndical vient de l’union des travailleurs, entre secteurs, entre générations et entre organisations.',
              'Concrètement, la Fédération assure quatre missions : représenter ses affiliés auprès des pouvoirs publics et des employeurs, former les leaders syndicaux, apporter un appui juridique et technique aux sections et promouvoir le dialogue social comme mode privilégié de règlement des différends. Ce programme de formation est l’un des instruments majeurs de cette mission de formation.',
            ),
          },
          {
            slug: 'le-triptyque-fondateur-en-pratique',
            title: 'Le triptyque fondateur en pratique',
            summary: 'Protection, prévention, défense : trois axes pour orienter chaque décision syndicale.',
            durationMinutes: 60,
            html:
              paragraphs(
                'Le triptyque fondateur de la FETRAG organise l’action syndicale autour de trois axes complémentaires. Il sert de grille de lecture pour toute situation rencontrée par une section : avant de réagir, le leader se demande ce que la situation implique pour chacun des trois piliers.',
              ) +
              list([
                '<strong>Protection de l’outil de production</strong> : sans entreprise viable, il n’y a pas d’emploi durable. Le syndicat veille à la santé économique de l’entreprise, s’informe de sa situation et propose des solutions qui préservent l’activité.',
                '<strong>Prévention des conflits sociaux</strong> : le conflit ouvert est coûteux pour tous. Le syndicat privilégie l’alerte précoce, le dialogue et la négociation, la grève restant l’ultime recours exercé dans le respect de la loi.',
                '<strong>Défense des intérêts matériels et moraux des travailleurs</strong> : salaires, conditions de travail, sécurité, dignité, non-discrimination. Le syndicat agit avec fermeté et méthode dès qu’un droit est menacé.',
              ]) +
              paragraphs(
                'Prenons l’exemple d’une entreprise qui annonce une baisse d’activité. Le pilier protection conduit à demander les éléments économiques et à examiner les alternatives ; le pilier prévention amène à ouvrir immédiatement le dialogue avec la direction et à informer les salariés pour éviter les rumeurs ; le pilier défense impose de vérifier que toute mesure respecte les procédures et les droits de chacun. Le devoir de fin de module vous demandera d’appliquer ce raisonnement à un cas concret.',
              ),
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // MODULE 02
  // ---------------------------------------------------------------------------
  {
    code: 'M02',
    slug: 'droit-du-travail-et-contentieux',
    title: 'Droit du Travail et Contentieux',
    summary:
      'Maîtriser les sources du droit du travail gabonais, les procédures disciplinaires et de licenciement, et les voies de recours individuelles et collectives.',
    description: paragraphs(
      'Ce module donne aux leaders syndicaux les outils juridiques nécessaires pour conseiller les adhérents et les accompagner dans leurs démarches. Il présente la hiérarchie des sources du droit du travail gabonais - Constitution, conventions internationales, Code du travail, décrets, conventions collectives, règlement intérieur et contrat de travail - et apprend à s’y repérer.',
      'La deuxième partie détaille la procédure disciplinaire et les différentes formes de rupture du contrat de travail : démission, licenciement pour motif personnel, licenciement pour motif économique, rupture négociée. Les participants apprennent à vérifier la régularité d’une procédure et à identifier les manquements qui ouvrent droit à réparation.',
      'La dernière partie aborde le contentieux : la tentative de conciliation devant l’inspection du travail, la saisine de la juridiction du travail, la constitution d’un dossier probant et le suivi de l’exécution des décisions. Les différends collectifs et leurs modes de règlement sont également présentés.',
    ),
    objectives: [
      'Hiérarchiser les sources du droit du travail et identifier la norme applicable à une situation donnée',
      'Vérifier la régularité d’une procédure disciplinaire ou de licenciement',
      'Constituer un dossier de recours et accompagner un adhérent devant l’inspection du travail et la juridiction compétente',
      'Distinguer différend individuel et différend collectif et connaître leurs voies de règlement',
    ],
    audience: 'Délégués du personnel, responsables juridiques de sections, membres de bureaux syndicaux chargés de l’assistance aux adhérents.',
    prerequisitesText: 'Avoir suivi le module 01 ou disposer d’une expérience de représentation du personnel.',
    pillar: 'defense',
    level: 'INTERMEDIAIRE',
    durationHours: 15,
    isFree: true,
    priceAmount: null,
    memberPriceAmount: null,
    enrollmentPolicy: 'SELF',
    isFeatured: false,
    position: 2,
    modules: [
      {
        title: 'Sources du droit du travail gabonais',
        summary: 'La hiérarchie des normes et le principe de faveur.',
        durationMinutes: 240,
        lessons: [
          {
            slug: 'hierarchie-des-normes-et-sources-du-droit-du-travail',
            title: 'Hiérarchie des normes et sources du droit du travail',
            summary: 'De la Constitution au contrat de travail : comment s’articulent les textes.',
            durationMinutes: 75,
            isPreview: true,
            html: paragraphs(
              'Le droit du travail gabonais repose sur une pyramide de normes. Au sommet, la Constitution garantit la liberté syndicale, le droit de grève et le droit au travail. Viennent ensuite les conventions internationales ratifiées, en particulier les conventions fondamentales de l’Organisation internationale du Travail sur la liberté syndicale, la négociation collective, l’interdiction du travail forcé et du travail des enfants, et la non-discrimination. Ces conventions ont une autorité supérieure à la loi.',
              'Le Code du travail et ses décrets d’application constituent le socle légal. En dessous, les conventions collectives et accords d’entreprise précisent et améliorent la loi pour un secteur ou une entreprise. Enfin, le règlement intérieur, les usages d’entreprise et le contrat de travail individuel complètent l’ensemble. Chaque norme doit respecter celles qui lui sont supérieures.',
              'Le principe de faveur est la clé de lecture de cette hiérarchie : lorsqu’une norme inférieure prévoit une disposition plus favorable au travailleur qu’une norme supérieure, c’est la plus favorable qui s’applique. Ce principe permet au syndicat de négocier des avantages au-delà du minimum légal et interdit à l’employeur d’imposer par contrat des conditions inférieures à la convention collective.',
              'En pratique, face à une question, le leader syndical procède du haut vers le bas : que dit la loi, que dit la convention collective, que dit le contrat ? Il retient la disposition la plus favorable et vérifie qu’aucun texte supérieur ne s’y oppose.',
            ),
          },
        ],
      },
      {
        title: 'Procédures disciplinaires et licenciements',
        summary: 'Garanties du salarié et régularité des ruptures du contrat.',
        durationMinutes: 300,
        lessons: [
          {
            slug: 'la-procedure-disciplinaire',
            title: 'La procédure disciplinaire',
            summary: 'Échelle des sanctions, convocation, entretien et droits de la défense.',
            durationMinutes: 60,
            html: paragraphs(
              'Le pouvoir disciplinaire de l’employeur est encadré. Toute sanction doit reposer sur une faute réelle, être proportionnée et respecter une procédure qui garantit les droits de la défense. L’échelle des sanctions - avertissement, blâme, mise à pied, rétrogradation, licenciement - est en général fixée par le règlement intérieur ou la convention collective, et une même faute ne peut être sanctionnée deux fois.',
              'Avant toute sanction importante, le salarié doit être convoqué à un entretien préalable par écrit, avec indication de l’objet, de la date et de la possibilité de se faire assister par un représentant du personnel ou un membre de son syndicat. Lors de l’entretien, l’employeur expose les griefs et le salarié présente ses explications. La sanction est ensuite notifiée par écrit, motivée, dans les délais prévus par les textes.',
              'Le représentant syndical qui assiste un salarié prépare l’entretien avec lui : chronologie des faits, pièces, témoins, texte applicable. Il prend des notes pendant l’entretien et vérifie ensuite la régularité de la notification. Chaque irrégularité - absence de convocation écrite, délai non respecté, motif imprécis, sanction disproportionnée - peut être invoquée devant l’inspection du travail ou la juridiction compétente.',
            ),
          },
          {
            slug: 'le-licenciement-motifs-et-procedure',
            title: 'Le licenciement : motifs et procédure',
            summary: 'Licenciement pour motif personnel, pour motif économique et indemnités dues.',
            durationMinutes: 75,
            html: paragraphs(
              'Le licenciement est la rupture du contrat à durée indéterminée à l’initiative de l’employeur. Il doit reposer sur un motif légitime : soit un motif personnel (faute, insuffisance professionnelle, inaptitude), soit un motif économique lié à des difficultés, à des mutations technologiques ou à une réorganisation nécessaire à la sauvegarde de l’entreprise. Un licenciement sans motif légitime ou prononcé en violation de la procédure est abusif et ouvre droit à des dommages-intérêts.',
              'Le licenciement pour motif économique obéit à une procédure spécifique : information et consultation des délégués du personnel, communication des critères d’ordre des licenciements, information de l’inspection du travail, recherche de mesures alternatives (chômage partiel, réduction des heures supplémentaires, reclassement) et priorité de réembauche. Les représentants syndicaux doivent exiger le respect de chacune de ces étapes.',
              'Quelle que soit la cause, le salarié licencié a droit à un préavis (ou à son indemnité compensatrice), à l’indemnité de licenciement lorsqu’il remplit la condition d’ancienneté, à l’indemnité compensatrice de congés payés et à un certificat de travail. Le leader syndical vérifie le calcul de ces sommes à partir de la convention collective et du bulletin de paie, et signale toute retenue injustifiée.',
            ),
          },
        ],
      },
      {
        title: 'Contentieux individuels et collectifs devant les juridictions compétentes',
        summary: 'Conciliation, saisine, preuve et exécution des décisions.',
        durationMinutes: 300,
        lessons: [
          {
            slug: 'saisir-l-inspection-du-travail-et-la-juridiction-du-travail',
            title: 'Saisir l’inspection du travail et la juridiction du travail',
            summary: 'Les étapes d’un recours individuel, de la conciliation au jugement.',
            durationMinutes: 90,
            html: paragraphs(
              'Le différend individuel du travail oppose un salarié à son employeur à propos de l’exécution ou de la rupture du contrat. Sa première étape est en principe la tentative de conciliation devant l’inspecteur du travail : le salarié ou son syndicat dépose une requête écrite exposant les faits et les demandes, l’inspecteur convoque les parties et dresse un procès-verbal de conciliation totale, partielle ou de non-conciliation. Le procès-verbal de conciliation a force exécutoire.',
              'En cas d’échec, la juridiction du travail est saisie. La procédure est gratuite et le salarié peut se faire assister ou représenter par un délégué de son organisation syndicale. Le dossier doit contenir le contrat de travail, les bulletins de paie, les courriers échangés, le procès-verbal de l’inspection et tout élément établissant les faits (attestations, plannings, pointages). En droit du travail, la charge de la preuve est souvent partagée et l’employeur doit produire les documents qu’il détient.',
              'Les différends collectifs, qui concernent un groupe de salariés et portent sur des intérêts collectifs, suivent un autre chemin : négociation directe, conciliation, médiation puis, selon les cas, arbitrage. Ces mécanismes sont approfondis dans le module 03. Dans tous les cas, le syndicat tient un registre des recours engagés, suit les délais et informe les adhérents de l’issue et de l’exécution de la décision.',
            ),
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // MODULE 03
  // ---------------------------------------------------------------------------
  {
    code: 'M03',
    slug: 'negociation-collective-et-dialogue-social',
    title: 'Négociation Collective et Dialogue Social',
    summary:
      'Préparer, conduire et conclure une négociation collective, rédiger une convention et mobiliser la médiation, la conciliation et l’arbitrage.',
    description: paragraphs(
      'La négociation collective est le cœur du métier de leader syndical. Ce module apprend à transformer les attentes des adhérents en revendications hiérarchisées et argumentées, à préparer une délégation, à conduire les séances et à sécuriser les accords obtenus.',
      'Les participants travaillent sur la structure et la rédaction des conventions collectives et des accords d’entreprise : clauses obligatoires, clauses facultatives, durée, révision, dénonciation et procédure d’extension. Ils s’exercent à rédiger des articles clairs et applicables.',
      'La dernière partie présente les modes de règlement des différends collectifs prévus par le Code du travail : conciliation, médiation et arbitrage. Des mises en situation permettent de s’entraîner à négocier en période de tension, y compris avec l’appui d’un tiers.',
    ),
    objectives: [
      'Construire un cahier de revendications hiérarchisé et documenté',
      'Conduire une séance de négociation en maîtrisant les techniques de base',
      'Rédiger des clauses de convention collective claires et applicables',
      'Choisir et mobiliser le mode de règlement adapté à un différend collectif',
    ],
    audience: 'Négociateurs syndicaux, membres de délégations de branche ou d’entreprise, secrétaires généraux de sections.',
    prerequisitesText: 'Module 01 recommandé. Une expérience de négociation, même informelle, est un atout.',
    pillar: 'prevention',
    level: 'INTERMEDIAIRE',
    durationHours: 18,
    isFree: true,
    priceAmount: null,
    memberPriceAmount: null,
    enrollmentPolicy: 'SELF',
    isFeatured: true,
    position: 3,
    modules: [
      {
        title: 'Techniques de négociation et préparation des revendications',
        summary: 'De l’écoute des adhérents à la table de négociation.',
        durationMinutes: 360,
        lessons: [
          {
            slug: 'preparer-un-cahier-de-revendications',
            title: 'Préparer un cahier de revendications',
            summary: 'Collecter, hiérarchiser, chiffrer et argumenter les revendications.',
            durationMinutes: 90,
            isPreview: true,
            html: paragraphs(
              'Une négociation réussie se gagne d’abord en amont. Le cahier de revendications est le document qui rassemble, hiérarchise et argumente les demandes de l’organisation. Il commence par une phase d’écoute : assemblées de section, questionnaires, entretiens avec les délégués. L’objectif est de distinguer les attentes réellement partagées des demandes individuelles et de repérer les problèmes que les adhérents n’expriment pas spontanément.',
              'Chaque revendication doit ensuite être documentée : texte de référence (loi, convention, accord antérieur), constat chiffré (écart de salaire, nombre de contrats précaires, heures supplémentaires non payées), comparaison avec les pratiques de la branche et estimation du coût pour l’entreprise. Cette rigueur donne de la crédibilité à la délégation et prépare les contre-arguments.',
              'Le cahier distingue enfin les priorités : revendications essentielles sur lesquelles l’organisation ne cédera pas, revendications importantes négociables, et demandes secondaires pouvant servir de monnaie d’échange. Cette hiérarchie, validée par les instances de l’organisation, fixe le mandat de la délégation et évite les décisions improvisées en séance.',
            ),
          },
          {
            slug: 'conduire-la-negociation',
            title: 'Conduire la négociation',
            summary: 'Rôles dans la délégation, déroulement des séances et gestion des blocages.',
            durationMinutes: 90,
            html: paragraphs(
              'La délégation syndicale répartit les rôles avant chaque séance : un chef de délégation qui porte la parole et engage l’organisation, un ou deux experts qui maîtrisent les dossiers techniques, un rapporteur qui consigne les échanges et les engagements. Chacun connaît le mandat, les priorités et les limites fixées par l’organisation.',
              'Une séance de négociation suit un déroulement classique : rappel de l’ordre du jour, exposé des positions, discussion point par point, recherche de solutions, formalisation des accords partiels et fixation de la suite. Les techniques utiles sont l’écoute active, la reformulation, la question ouverte qui oblige l’autre partie à préciser sa position, et la distinction entre les positions affichées et les intérêts réels de chaque camp.',
              'Face à un blocage, la délégation dispose de plusieurs leviers : suspendre la séance pour consulter ses mandants, proposer un groupe de travail technique, élargir le champ de la négociation pour créer des marges d’échange, ou solliciter un tiers. La menace d’une action collective n’est utilisée qu’avec l’accord des instances et dans le respect strict de la loi. Chaque séance se conclut par un relevé de conclusions signé qui évite les malentendus.',
            ),
          },
        ],
      },
      {
        title: 'Rédaction et application des conventions collectives',
        summary: 'Structure d’une convention et suivi de son application.',
        durationMinutes: 300,
        lessons: [
          {
            slug: 'structure-et-clauses-d-une-convention-collective',
            title: 'Structure et clauses d’une convention collective',
            summary: 'Clauses obligatoires, clauses facultatives, durée, révision et extension.',
            durationMinutes: 90,
            html: paragraphs(
              'Une convention collective s’ouvre par des dispositions générales : parties signataires, champ d’application professionnel et territorial, durée (déterminée ou indéterminée), conditions de révision et de dénonciation, et modalités de règlement des différends nés de son interprétation. Ces clauses déterminent la vie de l’accord et méritent une attention particulière lors de la négociation.',
              'Le corps de la convention traite ensuite du contrat de travail (embauche, période d’essai, classification), de la rémunération (grille salariale, primes, indemnités), de la durée du travail et des congés, de la protection sociale complémentaire, de la formation professionnelle, de l’exercice du droit syndical et de la représentation du personnel. Les annexes portent en général les grilles de classification et de salaires, révisables sans réouvrir l’ensemble du texte.',
              'Une bonne clause est précise, mesurable et applicable : elle désigne les bénéficiaires, fixe le montant ou le mode de calcul, la date d’effet et l’organe chargé de son suivi. Le leader syndical veille aussi à la mise en place d’une commission paritaire d’interprétation et de suivi, sans laquelle une convention risque de rester lettre morte. Après signature, la convention est déposée auprès de l’administration du travail et peut faire l’objet d’une procédure d’extension.',
            ),
          },
        ],
      },
      {
        title: 'Médiation, conciliation et arbitrage',
        summary: 'Les modes de règlement des différends collectifs.',
        durationMinutes: 300,
        lessons: [
          {
            slug: 'les-modes-de-reglement-des-differends-collectifs',
            title: 'Les modes de règlement des différends collectifs',
            summary: 'Conciliation, médiation et arbitrage : rôle du tiers et effets des décisions.',
            durationMinutes: 90,
            html: paragraphs(
              'Lorsqu’une négociation échoue, le Code du travail organise une gradation de mécanismes destinés à éviter l’affrontement. La conciliation est la première étape : l’inspecteur du travail ou une commission de conciliation réunit les parties, les aide à clarifier leurs positions et consigne les points d’accord et de désaccord dans un procès-verbal. Les points d’accord ont valeur d’engagement.',
              'La médiation fait intervenir un tiers indépendant, choisi par les parties ou désigné par l’administration, qui instruit le différend, entend les parties et formule une recommandation motivée. Cette recommandation n’a pas force obligatoire mais elle pèse sur le débat public et oriente souvent la solution finale. L’arbitrage, enfin, aboutit à une sentence qui s’impose aux parties lorsqu’elles ont accepté d’y recourir ou lorsque la loi le prévoit.',
              'Pour le leader syndical, recourir à un tiers n’est pas un aveu de faiblesse mais une manière de faire avancer un dossier bloqué tout en préservant la relation de travail. Il prépare le tiers en lui remettant un mémoire clair, accompagné des pièces, et continue d’informer les adhérents à chaque étape. Le préavis de grève, lorsqu’il est envisagé, ne dispense jamais d’épuiser les procédures prévues par la loi et la convention collective.',
            ),
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // MODULE 04
  // ---------------------------------------------------------------------------
  {
    code: 'M04',
    slug: 'organisation-et-gestion-syndicale',
    title: 'Organisation et Gestion Syndicale',
    summary: 'Constituer une section syndicale, la faire fonctionner démocratiquement, gérer ses finances avec transparence et mobiliser ses adhérents.',
    description: paragraphs(
      'Une organisation syndicale n’est efficace que si elle est bien organisée. Ce module traite de la constitution d’une section syndicale - statuts, bureau, déclaration, reconnaissance dans l’entreprise - et de son fonctionnement quotidien : réunions, procès-verbaux, registres, renouvellement des instances.',
      'La deuxième partie est consacrée à la gestion financière : collecte des cotisations, budget, tenue de la comptabilité, contrôle interne et reddition des comptes devant l’assemblée. La transparence financière est une condition de la confiance des adhérents et de la crédibilité de l’organisation.',
      'Enfin, le module aborde la communication interne et la mobilisation : circulation de l’information, animation des réunions, accueil des nouveaux adhérents et organisation de campagnes d’adhésion.',
    ),
    objectives: [
      'Rédiger les statuts et constituer le bureau d’une section syndicale conforme à la loi',
      'Tenir les registres et procès-verbaux exigés pour la vie de l’organisation',
      'Établir un budget, suivre les cotisations et rendre compte de la gestion financière',
      'Concevoir un plan de communication interne et une campagne d’adhésion',
    ],
    audience: 'Fondateurs de sections, trésoriers, secrétaires et responsables à l’organisation.',
    prerequisitesText: 'Aucun prérequis.',
    pillar: 'protection',
    level: 'INITIATION',
    durationHours: 12,
    isFree: true,
    priceAmount: null,
    memberPriceAmount: null,
    enrollmentPolicy: 'SELF',
    isFeatured: false,
    position: 4,
    modules: [
      {
        title: 'Constitution et fonctionnement d’une section syndicale',
        summary: 'Statuts, bureau, déclaration et vie démocratique de la section.',
        durationMinutes: 240,
        lessons: [
          {
            slug: 'creer-et-faire-vivre-une-section',
            title: 'Créer et faire vivre une section',
            summary: 'Les étapes de création et les règles de fonctionnement d’une section syndicale.',
            durationMinutes: 90,
            isPreview: true,
            html: paragraphs(
              'La création d’une section syndicale commence par une réunion constitutive des travailleurs qui souhaitent s’organiser. Cette réunion adopte les statuts, qui fixent le nom de l’organisation, son objet, son siège, les conditions d’adhésion, la composition et le mode d’élection du bureau, les règles de fonctionnement des assemblées et le régime des cotisations. Elle élit ensuite un bureau, comprenant au minimum un secrétaire général, un secrétaire adjoint et un trésorier.',
              'Les statuts et la liste des membres du bureau sont déposés auprès des autorités compétentes conformément au Code du travail, ce qui confère à l’organisation sa personnalité juridique. L’employeur est informé de la constitution de la section et de l’identité de ses responsables, afin que ceux-ci puissent exercer les droits reconnus dans l’entreprise : affichage, réunions, collecte des cotisations et, le cas échéant, désignation de délégués.',
              'La vie de la section repose sur des règles simples mais indispensables : assemblée générale régulière, réunions de bureau avec ordre du jour et procès-verbal, registre des adhérents à jour, renouvellement des instances aux échéances prévues par les statuts. Ces formalités protègent l’organisation en cas de contestation et garantissent sa légitimité auprès des adhérents comme de l’employeur.',
            ),
          },
        ],
      },
      {
        title: 'Gestion financière et transparence',
        summary: 'Cotisations, budget, comptabilité et contrôle.',
        durationMinutes: 240,
        lessons: [
          {
            slug: 'cotisations-budget-et-controle',
            title: 'Cotisations, budget et contrôle',
            summary: 'Assurer l’autonomie financière de l’organisation et rendre des comptes.',
            durationMinutes: 90,
            html: paragraphs(
              'L’indépendance d’un syndicat repose sur ses ressources propres, au premier rang desquelles les cotisations des adhérents. Le montant et la périodicité de la cotisation sont fixés par les statuts ; sa collecte peut être organisée par prélèvement sur salaire avec l’accord écrit du salarié, ou par versement direct au trésorier. Chaque versement donne lieu à un reçu et à une inscription au registre des cotisations.',
              'Le budget annuel, préparé par le trésorier et adopté par l’assemblée, prévoit les recettes (cotisations, subventions de la fédération, produits d’activités) et les dépenses (fonctionnement, formation, actions de solidarité, contribution à la fédération). Il constitue la référence pour autoriser les dépenses en cours d’année, toute dépense importante non prévue devant être validée par le bureau.',
              'La comptabilité, même simple, doit permettre de retracer chaque opération : journal des recettes et dépenses, pièces justificatives numérotées, rapprochement bancaire mensuel. Un ou plusieurs commissaires aux comptes, élus parmi les adhérents et indépendants du bureau, vérifient les comptes et présentent un rapport à l’assemblée générale. Cette transparence est le meilleur rempart contre les soupçons qui détruisent tant d’organisations.',
            ),
          },
        ],
      },
      {
        title: 'Communication interne et mobilisation des adhérents',
        summary: 'Informer, animer et faire adhérer.',
        durationMinutes: 240,
        lessons: [
          {
            slug: 'informer-et-mobiliser-les-adherents',
            title: 'Informer et mobiliser les adhérents',
            summary: 'Circuits d’information, animation des réunions et campagnes d’adhésion.',
            durationMinutes: 90,
            html: paragraphs(
              'Un adhérent informé est un adhérent engagé. La section organise des circuits d’information réguliers : panneau d’affichage syndical, note d’information mensuelle, groupe de messagerie animé par un responsable, compte rendu systématique des réunions avec la direction. Les messages sont courts, datés, signés et distinguent clairement les faits établis des positions de l’organisation.',
              'Les réunions sont le lieu de la démocratie syndicale. Pour être utiles, elles ont un ordre du jour communiqué à l’avance, un horaire respecté, un animateur qui distribue la parole et un relevé de décisions diffusé rapidement. Il est utile d’alterner réunions d’information, où le bureau rend compte, et réunions de consultation, où les adhérents s’expriment sur les orientations et les revendications.',
              'Une campagne d’adhésion se construit comme un projet : objectif chiffré, période, message, matériel (dépliant, formulaire d’adhésion, argumentaire), équipe de militants formés et suivi des résultats. L’argument le plus convaincant reste le résultat obtenu : un droit rétabli, une prime récupérée, un adhérent défendu avec succès. L’accueil du nouvel adhérent, avec un entretien et une remise des statuts, favorise sa fidélisation.',
            ),
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // MODULE 05
  // ---------------------------------------------------------------------------
  {
    code: 'M05',
    slug: 'prevention-et-gestion-des-conflits-sociaux',
    title: 'Prévention et Gestion des Conflits Sociaux',
    summary: 'Détecter les tensions avant qu’elles n’éclatent, mettre en place des mécanismes de prévention et encadrer un mouvement de grève dans le respect de la loi.',
    description: paragraphs(
      'Le conflit social ouvert coûte cher aux travailleurs comme à l’entreprise. Ce module, au cœur du pilier « prévention » du triptyque fondateur, apprend à diagnostiquer les tensions sociales à partir de signaux faibles - absentéisme, turn-over, plaintes récurrentes, rumeurs - et à en identifier les causes profondes.',
      'La deuxième partie présente les stratégies de prévention : dispositifs d’alerte, réunions périodiques avec la direction, commissions paritaires, accords de méthode et gestion des attentes des adhérents. Les participants construisent un plan de prévention adapté à leur entreprise.',
      'La dernière partie traite du droit de grève et de son exercice responsable : conditions légales, préavis, service minimum, organisation du mouvement, sécurité des personnes et des biens, communication et sortie de conflit.',
    ),
    objectives: [
      'Établir un diagnostic du climat social à partir d’indicateurs objectifs et d’une écoute structurée',
      'Mettre en place des mécanismes de prévention et d’alerte avec l’employeur',
      'Organiser et encadrer un mouvement de grève conforme au Code du travail',
      'Négocier une sortie de conflit et un protocole de fin de grève',
    ],
    audience: 'Secrétaires généraux de sections, délégués du personnel, responsables chargés du dialogue social.',
    prerequisitesText: 'Modules 01 et 03 recommandés.',
    pillar: 'prevention',
    level: 'INTERMEDIAIRE',
    durationHours: 15,
    isFree: true,
    priceAmount: null,
    memberPriceAmount: null,
    enrollmentPolicy: 'SELF',
    isFeatured: false,
    position: 5,
    modules: [
      {
        title: 'Diagnostic des tensions sociales',
        summary: 'Repérer les signaux faibles et analyser les causes.',
        durationMinutes: 240,
        lessons: [
          {
            slug: 'lire-les-signaux-faibles',
            title: 'Lire les signaux faibles',
            summary: 'Indicateurs du climat social et méthode de diagnostic.',
            durationMinutes: 90,
            isPreview: true,
            html: paragraphs(
              'Un conflit social n’éclate jamais sans prévenir. Dans les semaines ou les mois qui précèdent, des signaux faibles apparaissent : hausse de l’absentéisme et des arrêts maladie, départs volontaires, multiplication des demandes d’entretien individuel, plaintes sur les mêmes sujets, tension dans les échanges avec l’encadrement, rumeurs sur l’avenir de l’entreprise. Le rôle du leader syndical est de collecter ces signaux et de les analyser avant qu’ils ne se transforment en revendication explosive.',
              'Le diagnostic s’appuie sur des indicateurs objectifs que l’organisation peut suivre dans le temps : taux d’absentéisme, nombre d’accidents, retards de paiement des salaires, heures supplémentaires, contrats précaires, sanctions disciplinaires. Il s’appuie aussi sur une écoute structurée : tournées d’atelier, entretiens avec les délégués, questionnaires anonymes sur le climat social.',
              'L’analyse distingue ensuite les causes immédiates (une décision mal expliquée, une prime supprimée) des causes profondes (organisation du travail, management, incertitude économique, sentiment d’injustice). Un conflit traité uniquement sur ses causes immédiates renaît rapidement. Le diagnostic, présenté au bureau puis, sous une forme adaptée, à la direction, devient la base d’un plan de prévention.',
            ),
          },
        ],
      },
      {
        title: 'Stratégies de prévention des conflits du travail',
        summary: 'Dispositifs d’alerte et de dialogue permanent.',
        durationMinutes: 240,
        lessons: [
          {
            slug: 'mecanismes-de-prevention-et-d-alerte',
            title: 'Mécanismes de prévention et d’alerte',
            summary: 'Instances de dialogue, accords de méthode et gestion des attentes.',
            durationMinutes: 90,
            html: paragraphs(
              'La prévention repose sur un dialogue permanent plutôt que sur des rencontres de crise. Les réunions périodiques entre la direction et les représentants du personnel, les commissions paritaires thématiques (emploi, sécurité, formation) et les points d’information réguliers sur la situation économique créent un climat de confiance et permettent de traiter les problèmes à leur naissance.',
              'Un accord de méthode négocié avec l’employeur peut formaliser ce dispositif : calendrier des réunions, informations transmises, délais de réponse aux questions des représentants, procédure d’alerte lorsqu’un problème collectif est signalé, et engagement mutuel de recourir aux procédures de règlement avant toute action unilatérale. Ce type d’accord est particulièrement utile dans les entreprises où le dialogue social est récent.',
              'La prévention concerne aussi la relation entre le syndicat et ses adhérents. Des attentes irréalistes, entretenues par un discours trop optimiste, conduisent à la déception puis au conflit. Le leader syndical informe honnêtement des marges de manœuvre, explique les étapes et les délais, et associe les adhérents aux décisions importantes. La confiance ainsi construite est la meilleure garantie de discipline collective lorsque la mobilisation devient nécessaire.',
            ),
          },
        ],
      },
      {
        title: 'Organisation et encadrement des mouvements de grève',
        summary: 'Le droit de grève et son exercice responsable.',
        durationMinutes: 240,
        lessons: [
          {
            slug: 'le-droit-de-greve-et-son-exercice-responsable',
            title: 'Le droit de grève et son exercice responsable',
            summary: 'Conditions légales, préavis, organisation du mouvement et sortie de conflit.',
            durationMinutes: 90,
            html: paragraphs(
              'Le droit de grève est garanti par la Constitution et encadré par le Code du travail. La grève est une cessation collective et concertée du travail destinée à appuyer des revendications professionnelles. Elle n’est licite que si les procédures de règlement des différends collectifs ont été épuisées et si un préavis, dont la durée et le contenu sont fixés par la loi, a été notifié à l’employeur et à l’administration du travail. Dans les services essentiels, un service minimum doit être assuré.',
              'L’organisation du mouvement relève de la responsabilité du syndicat : décision prise par les instances compétentes après consultation des adhérents, désignation d’un comité de grève, information claire des salariés sur leurs droits et obligations (suspension du contrat, retenue sur salaire, interdiction des voies de fait et des entraves à la liberté du travail), sécurité des installations et des personnes. Les représentants veillent à ce que le mouvement reste pacifique et concentré sur ses revendications.',
              'La sortie de conflit se prépare dès le premier jour. Le comité de grève maintient un canal de négociation ouvert, fait le point chaque jour avec les grévistes et formalise l’issue dans un protocole de fin de grève : réponses apportées aux revendications, modalités de reprise, sort des jours de grève, absence de sanction pour fait de grève licite et calendrier de suivi. Un conflit bien conclu renforce l’organisation ; un conflit mal terminé la fragilise durablement.',
            ),
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // MODULE 06
  // ---------------------------------------------------------------------------
  {
    code: 'M06',
    slug: 'defense-des-interets-materiels-et-moraux',
    title: 'Défense des Intérêts Matériels et Moraux',
    summary: 'Analyser la rémunération et les conditions de travail, protéger l’emploi et lutter contre les discriminations et le harcèlement.',
    description: paragraphs(
      'Ce module incarne le troisième pilier du triptyque fondateur. Il apprend au leader syndical à analyser la rémunération - salaire de base, primes, avantages, classification - et les conditions de travail de ses adhérents, à repérer les écarts avec la loi et la convention collective et à formuler des revendications précises.',
      'La deuxième partie traite de la protection de l’emploi : contrats précaires et leur requalification, période d’essai, modification du contrat, mobilité, sécurisation des parcours professionnels par la formation et la validation des compétences.',
      'La dernière partie est consacrée aux discriminations et au harcèlement moral et sexuel : définitions, cadre juridique national et international, procédure de signalement, accompagnement des victimes et prévention dans l’entreprise.',
    ),
    objectives: [
      'Lire un bulletin de paie et vérifier la conformité de la rémunération avec la loi et la convention collective',
      'Identifier les situations de précarité et engager les démarches de sécurisation de l’emploi',
      'Reconnaître une discrimination ou un harcèlement et accompagner la victime dans les procédures',
      'Proposer des mesures de prévention à l’employeur',
    ],
    audience: 'Délégués du personnel, responsables juridiques et sociaux de sections, référents égalité.',
    prerequisitesText: 'Module 02 recommandé.',
    pillar: 'defense',
    level: 'INTERMEDIAIRE',
    durationHours: 15,
    isFree: true,
    priceAmount: null,
    memberPriceAmount: null,
    enrollmentPolicy: 'SELF',
    isFeatured: true,
    position: 6,
    modules: [
      {
        title: 'Analyse des conditions de travail et rémunération',
        summary: 'Salaire, primes, classification et durée du travail.',
        durationMinutes: 240,
        lessons: [
          {
            slug: 'salaire-primes-et-grille-de-classification',
            title: 'Salaire, primes et grille de classification',
            summary: 'Vérifier la rémunération à partir du bulletin de paie et de la convention collective.',
            durationMinutes: 90,
            isPreview: true,
            html: paragraphs(
              'La rémunération se compose du salaire de base, déterminé par la classification du salarié dans la grille conventionnelle, et d’éléments complémentaires : primes d’ancienneté, de rendement, de risque ou de transport, indemnités de logement, majorations pour heures supplémentaires, travail de nuit ou jours fériés, avantages en nature. Le salaire ne peut être inférieur au salaire minimum interprofessionnel garanti ni au minimum conventionnel de la catégorie.',
              'Le bulletin de paie est le document de contrôle par excellence. Le leader syndical vérifie la catégorie et l’échelon mentionnés, le taux horaire, le nombre d’heures payées, le calcul des majorations, la présence des primes conventionnelles, l’exactitude des retenues sociales et fiscales et le net à payer. Un tableau comparatif entre le bulletin et la convention collective met en évidence les écarts.',
              'Les conditions de travail - durée hebdomadaire, repos, congés, pauses, équipements de protection, transport, restauration - relèvent de la même démarche d’analyse. Les constats sont rassemblés dans une note argumentée, présentée à l’employeur avec les textes de référence. En cas de refus persistant, le dossier est transmis à l’inspection du travail, dont les agents ont le pouvoir de constater les infractions.',
            ),
          },
        ],
      },
      {
        title: 'Protection de l’emploi et sécurité professionnelle',
        summary: 'Contrats précaires, modification du contrat et parcours professionnels.',
        durationMinutes: 240,
        lessons: [
          {
            slug: 'contrats-precarite-et-securisation-des-parcours',
            title: 'Contrats, précarité et sécurisation des parcours',
            summary: 'Requalification des contrats précaires et sécurisation de l’emploi.',
            durationMinutes: 90,
            html: paragraphs(
              'Le contrat à durée indéterminée est la forme normale de la relation de travail. Le contrat à durée déterminée, le contrat de mission ou le contrat journalier ne peuvent être utilisés que dans les cas et pour les durées prévus par le Code du travail. Lorsque ces limites sont dépassées - renouvellements successifs, emploi lié à l’activité permanente de l’entreprise, poursuite du travail après le terme - le salarié peut demander la requalification de son contrat en contrat à durée indéterminée, avec les droits qui s’y attachent.',
              'La modification du contrat de travail (rémunération, qualification, lieu ou durée du travail) exige en principe l’accord du salarié lorsqu’elle porte sur un élément essentiel. Le refus d’une modification ne constitue pas en soi une faute. Le représentant syndical aide le salarié à distinguer la simple modification des conditions de travail, relevant du pouvoir de direction, de la modification du contrat, qui suppose son consentement.',
              'La sécurisation des parcours passe aussi par la formation professionnelle et la reconnaissance des compétences. Le syndicat négocie des plans de formation, l’accès des salariés précaires aux dispositifs de qualification et des passerelles entre catégories. Il suit également le respect des obligations de l’employeur en matière de déclaration à la sécurité sociale, condition de l’accès aux prestations de retraite, de maladie et d’accident du travail.',
            ),
          },
        ],
      },
      {
        title: 'Lutte contre les discriminations et harcèlements',
        summary: 'Reconnaître, signaler, accompagner et prévenir.',
        durationMinutes: 240,
        lessons: [
          {
            slug: 'reconnaitre-et-agir-contre-les-discriminations-et-le-harcelement',
            title: 'Reconnaître et agir contre les discriminations et le harcèlement',
            summary: 'Cadre juridique, procédure de signalement et accompagnement des victimes.',
            durationMinutes: 90,
            html: paragraphs(
              'La discrimination consiste à traiter défavorablement une personne en raison d’un motif prohibé : sexe, origine, opinion, appartenance syndicale, religion, état de santé, situation de famille, entre autres. Elle peut intervenir à l’embauche, dans la rémunération, la promotion, la formation ou la rupture du contrat. Le harcèlement moral désigne des agissements répétés qui dégradent les conditions de travail et portent atteinte à la dignité ou à la santé ; le harcèlement sexuel recouvre les propos ou comportements à connotation sexuelle imposés à une personne. La convention n° 190 de l’OIT sur la violence et le harcèlement dans le monde du travail fixe le cadre de référence international.',
              'Face à un signalement, le représentant syndical écoute la personne sans jugement, consigne les faits avec dates, lieux et témoins, et l’informe de ses droits et des recours possibles : saisine de la hiérarchie ou du référent désigné, de l’inspection du travail, de la juridiction du travail et, pour les faits les plus graves, du procureur de la République. La protection contre les représailles s’étend à la victime et aux témoins.',
              'La prévention est l’affaire de tous. Le syndicat propose à l’employeur l’adoption d’une charte ou d’une procédure interne, la désignation de référents formés, des actions de sensibilisation et l’intégration du sujet dans l’évaluation des risques professionnels. Il veille également à l’exemplarité de ses propres instances, car un syndicat qui tolère en son sein des comportements discriminatoires perd toute crédibilité.',
            ),
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // MODULE 07
  // ---------------------------------------------------------------------------
  {
    code: 'M07',
    slug: 'protection-de-l-outil-de-production',
    title: 'Protection de l’Outil de Production',
    summary: 'Comprendre la situation économique de l’entreprise, négocier la sauvegarde de l’emploi et accompagner les restructurations et plans sociaux.',
    description: paragraphs(
      'Premier pilier du triptyque fondateur, la protection de l’outil de production part d’un constat simple : sans entreprise viable, il n’y a pas d’emploi durable. Ce module de niveau avancé donne aux leaders syndicaux les clés de compréhension de la situation économique et financière de l’entreprise : lecture du bilan et du compte de résultat, indicateurs d’activité, position sur le marché, décisions d’investissement.',
      'La deuxième partie traite de la négociation de sauvegarde de l’emploi : accords de méthode, mesures alternatives aux licenciements (chômage partiel, aménagement du temps de travail, mobilité interne, formation), contreparties et garanties de retour à meilleure fortune.',
      'La dernière partie accompagne les représentants du personnel dans les procédures de restructuration et de plans sociaux : information-consultation, critères d’ordre, mesures d’accompagnement, reclassement, suivi de l’exécution des engagements. Ce module est réservé aux demandes des organisations affiliées.',
    ),
    objectives: [
      'Lire les documents comptables et financiers de l’entreprise et en tirer un diagnostic',
      'Négocier un accord de sauvegarde de l’emploi assorti de contreparties et de garanties',
      'Conduire la procédure d’information-consultation dans une restructuration',
      'Négocier et suivre les mesures d’accompagnement d’un plan social',
    ],
    audience: 'Secrétaires généraux de sections, délégués du personnel d’entreprises en mutation, négociateurs de branche.',
    prerequisitesText: 'Modules 03 et 06 recommandés. Une expérience de représentation du personnel est nécessaire.',
    pillar: 'protection',
    level: 'AVANCE',
    durationHours: 18,
    isFree: true,
    priceAmount: null,
    memberPriceAmount: null,
    enrollmentPolicy: 'ORGANIZATION',
    isFeatured: false,
    position: 7,
    modules: [
      {
        title: 'Compréhension des enjeux économiques de l’entreprise',
        summary: 'Lire les comptes et comprendre la stratégie de l’entreprise.',
        durationMinutes: 360,
        lessons: [
          {
            slug: 'lire-les-comptes-de-l-entreprise',
            title: 'Lire les comptes de l’entreprise',
            summary: 'Bilan, compte de résultat et indicateurs utiles au représentant du personnel.',
            durationMinutes: 120,
            isPreview: true,
            html: paragraphs(
              'Le représentant du personnel n’a pas besoin d’être comptable, mais il doit savoir lire les documents qui décrivent la santé de l’entreprise. Le bilan photographie à une date donnée ce que l’entreprise possède (actif : immobilisations, stocks, créances, trésorerie) et ce qu’elle doit (passif : capitaux propres, dettes financières, dettes fournisseurs, dettes sociales et fiscales). Le compte de résultat retrace sur un exercice les produits et les charges et fait apparaître le résultat.',
              'Quelques indicateurs suffisent à établir un premier diagnostic : l’évolution du chiffre d’affaires, la valeur ajoutée et sa répartition entre salaires, impôts, créanciers et actionnaires, l’excédent brut d’exploitation qui mesure la rentabilité de l’activité, le niveau d’endettement et la trésorerie. Comparés sur plusieurs années et avec les entreprises du même secteur, ils permettent de distinguer une difficulté conjoncturelle d’une crise structurelle.',
              'Dans les entreprises soumises à l’obligation de communiquer des informations économiques aux représentants du personnel, le syndicat exige ces documents et se fait au besoin assister par un expert ou par les services de la fédération. Cette connaissance de la situation réelle est indispensable pour négocier de manière crédible : elle permet de contester des mesures injustifiées comme d’accepter, en connaissance de cause, des efforts temporaires assortis de contreparties.',
            ),
          },
        ],
      },
      {
        title: 'Négociation de sauvegarde de l’emploi',
        summary: 'Alternatives aux licenciements et accords de sauvegarde.',
        durationMinutes: 300,
        lessons: [
          {
            slug: 'accords-de-sauvegarde-et-alternatives-aux-licenciements',
            title: 'Accords de sauvegarde et alternatives aux licenciements',
            summary: 'Mesures alternatives, contreparties et clauses de retour à meilleure fortune.',
            durationMinutes: 120,
            html: paragraphs(
              'Lorsqu’une entreprise traverse des difficultés avérées, le licenciement collectif n’est pas la seule issue. Le Code du travail impose d’ailleurs de rechercher des mesures alternatives avant tout licenciement économique : réduction ou aménagement de la durée du travail, chômage partiel, suspension des heures supplémentaires, mobilité interne, formation, départs volontaires accompagnés. Le rôle du syndicat est de proposer et de négocier ces alternatives.',
              'Un accord de sauvegarde de l’emploi formalise l’équilibre trouvé : efforts consentis par les salariés (par exemple modération salariale ou aménagement temporaire du temps de travail), engagements de l’employeur (maintien des effectifs pendant une durée déterminée, investissements, transparence sur les comptes) et contreparties (participation aux résultats futurs, clause de retour à meilleure fortune restituant les efforts consentis dès que la situation s’améliore).',
              'La négociation d’un tel accord exige une information complète, un mandat clair des adhérents et un dispositif de suivi paritaire. Le leader syndical veille à ce que les efforts soient limités dans le temps, proportionnés à la difficulté réelle et répartis équitablement, direction comprise. Un accord de sauvegarde bien négocié protège à la fois l’emploi et la crédibilité de l’organisation.',
            ),
          },
        ],
      },
      {
        title: 'Accompagnement aux restructurations et plans sociaux',
        summary: 'Procédure, mesures d’accompagnement et suivi.',
        durationMinutes: 300,
        lessons: [
          {
            slug: 'le-plan-social-procedure-et-role-des-representants',
            title: 'Le plan social : procédure et rôle des représentants',
            summary: 'Information-consultation, critères d’ordre, reclassement et suivi des engagements.',
            durationMinutes: 120,
            html: paragraphs(
              'Lorsque les licenciements ne peuvent être évités, la procédure de licenciement collectif pour motif économique protège les salariés par une série d’étapes obligatoires : information écrite des représentants du personnel sur les motifs, le nombre et les catégories de salariés concernés et le calendrier ; consultation des représentants sur les mesures envisagées ; information de l’inspection du travail ; application de critères d’ordre objectifs (qualités professionnelles, ancienneté, charges de famille) ; respect du préavis et des indemnités.',
              'Le plan social regroupe les mesures d’accompagnement négociées : indemnités supra-légales, aide à la recherche d’emploi, formation de reconversion, appui à la création d’activité, priorité de réembauche, maintien temporaire de la couverture sociale. Les représentants du personnel négocient ces mesures en s’appuyant sur le diagnostic économique, sur les pratiques de la branche et sur la capacité réelle de l’entreprise.',
              'Le rôle des représentants ne s’arrête pas à la signature. Une commission de suivi vérifie l’exécution des engagements, accompagne chaque salarié concerné et signale à l’inspection du travail tout manquement. Le syndicat maintient le lien avec les salariés licenciés, dont la réembauche prioritaire dépend souvent de sa vigilance. Cette phase, ingrate mais décisive, est celle où la valeur ajoutée du syndicat se mesure le plus concrètement.',
            ),
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // MODULE 08
  // ---------------------------------------------------------------------------
  {
    code: 'M08',
    slug: 'leadership-syndical-et-ethique',
    title: 'Leadership Syndical et Éthique',
    summary: 'Assumer la posture du leader syndical, gérer les conflits internes et incarner l’intégrité et la responsabilité dans l’exercice du mandat.',
    description: paragraphs(
      'Diriger une organisation syndicale est une responsabilité exigeante. Ce module travaille la posture du leader : représenter sans se substituer, décider en associant, rendre compte sans détour. Il aborde la gestion du temps, la délégation, la préparation des interventions et la relation avec les adhérents, l’employeur et les pouvoirs publics.',
      'La deuxième partie traite des conflits internes, fréquents dans les organisations militantes : rivalités de personnes, désaccords stratégiques, contestation des instances. Les participants apprennent à les prévenir par des règles claires et à les résoudre par la médiation interne.',
      'La dernière partie propose une réflexion approfondie sur l’éthique du responsable syndical : intégrité financière, indépendance vis-à-vis de l’employeur et des partis, confidentialité, exemplarité, respect des adversaires. Une charte éthique est élaborée en atelier.',
    ),
    objectives: [
      'Définir son rôle de leader et organiser son action en fonction du mandat reçu',
      'Animer une équipe syndicale et déléguer efficacement',
      'Prévenir et résoudre les conflits internes à l’organisation',
      'Appliquer une charte éthique dans l’exercice quotidien du mandat',
    ],
    audience: 'Secrétaires généraux, présidents et membres de bureaux exécutifs d’organisations affiliées.',
    prerequisitesText: 'Exercer ou avoir exercé une responsabilité syndicale.',
    pillar: 'protection',
    level: 'INTERMEDIAIRE',
    durationHours: 12,
    isFree: false,
    priceAmount: 25000,
    memberPriceAmount: 15000,
    enrollmentPolicy: 'SELF',
    isFeatured: false,
    position: 8,
    modules: [
      {
        title: 'Rôle et posture du leader syndical',
        summary: 'Représenter, décider, rendre compte.',
        durationMinutes: 240,
        lessons: [
          {
            slug: 'le-leader-syndical-representer-decider-rendre-compte',
            title: 'Le leader syndical : représenter, décider, rendre compte',
            summary: 'Les trois responsabilités du mandat et l’organisation de l’action du leader.',
            durationMinutes: 90,
            isPreview: true,
            html: paragraphs(
              'Le leader syndical exerce un mandat : il parle et agit au nom des adhérents qui l’ont élu, dans les limites qu’ils ont fixées. Représenter, c’est porter fidèlement leurs attentes, y compris lorsqu’elles diffèrent de ses convictions personnelles, et incarner l’organisation avec dignité devant l’employeur, l’administration et les médias. Cette représentation suppose une connaissance fine de la base et une présence régulière sur le terrain.',
              'Décider fait partie du mandat : en négociation, en situation de crise ou dans la gestion quotidienne, le leader tranche. Mais il décide en associant, c’est-à-dire en consultant le bureau, en informant les adhérents et en respectant les instances prévues par les statuts. La décision solitaire est une faute de leadership, même lorsqu’elle est bonne, car elle affaiblit l’organisation.',
              'Rendre compte est la troisième responsabilité. Le leader présente régulièrement le bilan de son action, explique les résultats obtenus et les échecs, et soumet sa gestion au contrôle des adhérents. Cette redevabilité nourrit la confiance et prépare la relève. Pour tenir ces trois responsabilités, le leader organise son temps, délègue des dossiers à des membres du bureau, prépare ses interventions et prend soin de sa propre formation.',
            ),
          },
        ],
      },
      {
        title: 'Gestion des conflits internes et cohésion d’équipe',
        summary: 'Prévenir et résoudre les conflits dans l’équipe syndicale.',
        durationMinutes: 240,
        lessons: [
          {
            slug: 'prevenir-et-resoudre-les-conflits-dans-l-equipe-syndicale',
            title: 'Prévenir et résoudre les conflits dans l’équipe syndicale',
            summary: 'Sources des conflits internes, règles de fonctionnement et médiation interne.',
            durationMinutes: 90,
            html: paragraphs(
              'Les organisations syndicales rassemblent des personnalités engagées et des convictions fortes ; les conflits internes y sont donc naturels. Ils naissent de rivalités de personnes, de désaccords sur la stratégie (négocier ou se mobiliser), de soupçons sur la gestion, de la répartition des responsabilités ou de l’absence de renouvellement des instances. Non traités, ils paralysent l’organisation et sont exploités par l’employeur.',
              'La prévention passe par des règles de fonctionnement claires et respectées : statuts appliqués, mandats limités et renouvelés, répartition écrite des responsabilités, transparence financière, débats contradictoires organisés dans les instances plutôt que dans les couloirs. Le leader donne l’exemple en acceptant la critique et en distinguant le désaccord d’idées de l’attaque personnelle.',
              'Lorsqu’un conflit éclate, la médiation interne est préférable à l’exclusion ou à la scission. Une personne respectée, extérieure au différend - par exemple un responsable de la fédération - entend séparément les parties, identifie les intérêts communs et propose une solution acceptable. Le résultat est formalisé et présenté aux instances. La cohésion retrouvée est ensuite entretenue par des moments collectifs, des formations communes et une reconnaissance régulière des contributions de chacun.',
            ),
          },
        ],
      },
      {
        title: 'Intégrité, déontologie et responsabilité',
        summary: 'Les principes éthiques du responsable syndical.',
        durationMinutes: 240,
        lessons: [
          {
            slug: 'charte-ethique-du-responsable-syndical',
            title: 'Charte éthique du responsable syndical',
            summary: 'Intégrité, indépendance, confidentialité et exemplarité.',
            durationMinutes: 90,
            html:
              paragraphs(
                'L’éthique n’est pas un supplément d’âme : c’est la condition de la confiance des adhérents et de l’efficacité de l’organisation. Un responsable syndical dont l’intégrité est mise en doute perd tout pouvoir de négociation, quelle que soit la justesse de ses revendications. La charte éthique de la FETRAG repose sur quelques principes que chaque leader s’engage à respecter.',
              ) +
              list([
                '<strong>Intégrité financière</strong> : aucune confusion entre les fonds de l’organisation et les ressources personnelles ; toute dépense est justifiée et contrôlée.',
                '<strong>Indépendance</strong> : le responsable n’accepte de l’employeur, d’un parti ou d’une administration aucun avantage susceptible d’influencer son action ; les facilités accordées pour l’exercice du mandat sont déclarées.',
                '<strong>Confidentialité</strong> : les informations économiques reçues sous confidentialité et les situations personnelles des adhérents sont protégées.',
                '<strong>Loyauté et exemplarité</strong> : respect des statuts et des décisions collectives, comportement irréprochable dans l’entreprise, refus de toute forme de harcèlement ou de discrimination.',
                '<strong>Respect des adversaires</strong> : fermeté sur les positions, courtoisie dans les relations, refus de la diffamation et de la violence.',
              ]) +
              paragraphs(
                'Le respect de ces principes engage la responsabilité du leader devant les instances de son organisation et de la fédération, qui peuvent prononcer des sanctions statutaires. Au-delà des sanctions, c’est la réputation collective du mouvement syndical qui est en jeu : chaque manquement individuel nourrit le discours de ceux qui contestent la légitimité des syndicats.',
              ),
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // MODULE 09
  // ---------------------------------------------------------------------------
  {
    code: 'M09',
    slug: 'communication-et-plaidoyer',
    title: 'Communication et Plaidoyer',
    summary: 'Prendre la parole en public, communiquer avec les médias et sur le numérique, et construire un plaidoyer efficace auprès des institutions.',
    description: paragraphs(
      'La capacité à convaincre est une compétence centrale du leader syndical. Ce module travaille d’abord la prise de parole en public : structuration du message, gestion du trac, voix et posture, réponse aux questions difficiles, avec des exercices filmés et débriefés.',
      'La deuxième partie aborde la communication avec les médias traditionnels et numériques : rédaction d’un communiqué, préparation d’une interview, animation d’une page ou d’un groupe, gestion des rumeurs et des attaques en ligne, respect du droit et de la déontologie.',
      'La dernière partie enseigne la méthode du plaidoyer : analyser le contexte et les décideurs, formuler une demande précise, bâtir des alliances, choisir les canaux et mesurer l’impact. Chaque participant construit un plan de plaidoyer sur un sujet réel de son organisation.',
    ),
    objectives: [
      'Structurer et délivrer une intervention orale convaincante',
      'Rédiger un communiqué de presse et préparer une interview',
      'Animer la présence numérique de son organisation en respectant le droit et la déontologie',
      'Concevoir et piloter une stratégie de plaidoyer auprès des institutions et partenaires sociaux',
    ],
    audience: 'Porte-parole, chargés de communication, secrétaires généraux et responsables des relations institutionnelles.',
    prerequisitesText: 'Aucun prérequis.',
    pillar: 'prevention',
    level: 'INITIATION',
    durationHours: 12,
    isFree: false,
    priceAmount: 25000,
    memberPriceAmount: 15000,
    enrollmentPolicy: 'SELF',
    isFeatured: false,
    position: 9,
    modules: [
      {
        title: 'Techniques de prise de parole en public',
        summary: 'Structurer, délivrer, répondre.',
        durationMinutes: 240,
        lessons: [
          {
            slug: 'structurer-et-delivrer-une-intervention',
            title: 'Structurer et délivrer une intervention',
            summary: 'Message clé, plan en trois parties, voix, posture et gestion des questions.',
            durationMinutes: 90,
            isPreview: true,
            html: paragraphs(
              'Une intervention réussie commence par un message clé : l’idée unique que l’auditoire doit retenir, formulée en une phrase simple. Autour de ce message, le plan en trois parties reste le plus efficace - la situation, le problème, la proposition - encadré par une accroche qui capte l’attention et une conclusion qui appelle à l’action. Une intervention syndicale de cinq minutes, bien construite, vaut mieux qu’un discours de trente minutes sans fil conducteur.',
              'La délivrance compte autant que le contenu. La voix doit être posée, le débit maîtrisé, les silences assumés ; la posture ancrée et le regard distribué dans la salle inspirent confiance. Le trac se gère par la préparation, la respiration et la répétition à voix haute. Les notes tiennent sur une page, sous forme de mots clés, jamais de texte lu intégralement.',
              'Les questions difficiles se préparent à l’avance : on liste les objections probables et l’on rédige pour chacune une réponse courte, factuelle et reliée au message clé. Face à une question hostile, on reformule calmement, on répond sur le fond sans attaquer la personne et l’on revient à son message. Les exercices filmés de ce module permettent à chacun d’observer ses habitudes et de progresser rapidement.',
            ),
          },
        ],
      },
      {
        title: 'Médias et communication numérique syndicale',
        summary: 'Communiqués, interviews et réseaux sociaux.',
        durationMinutes: 240,
        lessons: [
          {
            slug: 'communiquer-avec-les-medias-et-sur-les-reseaux-sociaux',
            title: 'Communiquer avec les médias et sur les réseaux sociaux',
            summary: 'Communiqué de presse, interview, présence numérique et gestion de crise.',
            durationMinutes: 90,
            html: paragraphs(
              'Le communiqué de presse est l’outil de base de la communication syndicale externe. Il tient sur une page, porte un titre informatif, expose dès le premier paragraphe l’essentiel (qui, quoi, quand, pourquoi), cite un responsable habilité, indique un contact et est daté et signé. Il est envoyé aux rédactions à un horaire compatible avec leurs bouclages et publié simultanément sur les canaux de l’organisation.',
              'L’interview se prépare : connaître le média et son audience, fixer trois messages à faire passer, anticiper les questions, s’entraîner à répondre en phrases courtes utilisables telles quelles. Pendant l’interview, on reste sur son terrain, on ne spécule pas et l’on ne commente pas ce que l’on ne connaît pas. Rien n’est jamais « hors micro ».',
              'Sur les réseaux sociaux, l’organisation gagne à disposer d’une page officielle animée par des personnes désignées, avec une ligne éditoriale claire : information des adhérents, valorisation des résultats, prise de position sur l’actualité sociale. Les règles de droit (diffamation, injure, droit à l’image, protection des données) et de déontologie (vérification des faits, respect des personnes) s’appliquent pleinement. En cas de rumeur ou d’attaque en ligne, la réponse est rapide, factuelle et mesurée ; les échanges d’insultes sont proscrits.',
            ),
          },
        ],
      },
      {
        title: 'Plaidoyer auprès des institutions et partenaires sociaux',
        summary: 'Méthode et plan de plaidoyer.',
        durationMinutes: 240,
        lessons: [
          {
            slug: 'construire-une-strategie-de-plaidoyer',
            title: 'Construire une stratégie de plaidoyer',
            summary: 'Analyse des décideurs, formulation de la demande, alliances et suivi.',
            durationMinutes: 90,
            html: paragraphs(
              'Le plaidoyer vise à obtenir d’un décideur - ministère, parlement, organisation patronale, institution de sécurité sociale, bailleur - une décision favorable aux travailleurs : adoption d’un texte, augmentation d’un budget, application d’une convention, changement de pratique. Il se distingue de la revendication d’entreprise par son horizon plus long et par la diversité des acteurs à convaincre.',
              'La stratégie commence par une analyse : quel est précisément le problème, quelle solution proposons-nous, qui a le pouvoir de décider, qui influence ce décideur, qui partage notre position et qui s’y oppose ? De cette cartographie découle une demande formulée de manière précise et réaliste, ainsi que des alliances avec d’autres organisations syndicales, des associations, des experts ou des élus.',
              'Les canaux sont ensuite choisis en fonction des cibles : notes de position et rencontres institutionnelles, participation aux instances tripartites, campagnes publiques, mobilisation des adhérents, médias. Un calendrier, un budget et des indicateurs de résultat permettent de piloter l’action et d’en rendre compte. Le plaidoyer est un travail de longue haleine : les acquis se consolident par la présence continue de l’organisation dans les lieux de décision.',
            ),
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // MODULE 10
  // ---------------------------------------------------------------------------
  {
    code: 'M10',
    slug: 'sante-securite-et-conditions-de-travail-ssct',
    title: 'Santé, Sécurité et Conditions de Travail (SSCT)',
    summary: 'Connaître le cadre de la prévention des risques professionnels, le rôle des délégués et du CHSCT, et la reconnaissance des accidents du travail et maladies professionnelles.',
    description: paragraphs(
      'La santé et la sécurité au travail sont au cœur de la défense des intérêts des travailleurs. Ce module présente le cadre réglementaire gabonais et international de la prévention des risques professionnels : obligations générales de l’employeur, principes de prévention, évaluation des risques, formation et information des travailleurs, médecine du travail.',
      'La deuxième partie détaille le rôle des acteurs de la prévention dans l’entreprise : délégués du personnel, comité d’hygiène, de sécurité et des conditions de travail, service de santé au travail, inspection du travail. Les participants apprennent à conduire une inspection, à analyser un accident et à exercer le droit d’alerte.',
      'La dernière partie traite des accidents du travail et des maladies professionnelles : déclaration, reconnaissance, prise en charge par la sécurité sociale, réparation et accompagnement de la victime, ainsi que des actions de prévention qui en découlent.',
    ),
    objectives: [
      'Expliquer les obligations de l’employeur et les principes généraux de prévention',
      'Exercer les attributions du délégué du personnel et du CHSCT en matière de santé et sécurité',
      'Accompagner la déclaration et la reconnaissance d’un accident du travail ou d’une maladie professionnelle',
      'Analyser un accident et proposer des mesures de prévention',
    ],
    audience: 'Délégués du personnel, membres de CHSCT, référents sécurité des sections syndicales.',
    prerequisitesText: 'Aucun prérequis.',
    pillar: 'defense',
    level: 'INTERMEDIAIRE',
    durationHours: 15,
    isFree: true,
    priceAmount: null,
    memberPriceAmount: null,
    enrollmentPolicy: 'SELF',
    isFeatured: false,
    position: 10,
    modules: [
      {
        title: 'Cadre réglementaire de la prévention des risques professionnels',
        summary: 'Obligations de l’employeur et principes de prévention.',
        durationMinutes: 240,
        lessons: [
          {
            slug: 'obligations-de-l-employeur-et-principes-de-prevention',
            title: 'Obligations de l’employeur et principes de prévention',
            summary: 'Le cadre gabonais et international de la santé et sécurité au travail.',
            durationMinutes: 90,
            isPreview: true,
            html: paragraphs(
              'L’employeur est tenu d’assurer la sécurité et de protéger la santé physique et mentale des travailleurs. Cette obligation générale, posée par le Code du travail et précisée par ses textes d’application, se décline en mesures concrètes : évaluation des risques, organisation du travail et des postes, équipements de protection collective et individuelle, formation et information des travailleurs, surveillance médicale, tenue des registres de sécurité. La convention n° 155 de l’OIT sur la sécurité et la santé des travailleurs fixe le cadre international de référence.',
              'Les principes généraux de prévention hiérarchisent les actions : éviter le risque, évaluer ceux qui ne peuvent l’être, combattre le risque à la source, adapter le travail à la personne, tenir compte de l’évolution des techniques, remplacer ce qui est dangereux par ce qui l’est moins, planifier la prévention, privilégier la protection collective et donner les instructions appropriées. Le représentant du personnel vérifie que l’employeur applique cette hiérarchie et ne se contente pas de distribuer des équipements individuels.',
              'Le travailleur a de son côté l’obligation de prendre soin de sa sécurité et de celle des autres, en respectant les consignes et en utilisant les protections fournies. Il dispose en contrepartie d’un droit d’alerte et, en cas de danger grave et imminent, d’un droit de retrait qui ne peut donner lieu à sanction. Le syndicat informe les salariés de ces droits et les accompagne dans leur exercice.',
            ),
          },
        ],
      },
      {
        title: 'Rôle des délégués du personnel et CHSCT',
        summary: 'Les acteurs de la prévention dans l’entreprise.',
        durationMinutes: 240,
        lessons: [
          {
            slug: 'les-acteurs-de-la-prevention-dans-l-entreprise',
            title: 'Les acteurs de la prévention dans l’entreprise',
            summary: 'Délégués du personnel, CHSCT, service de santé au travail et inspection du travail.',
            durationMinutes: 90,
            html: paragraphs(
              'Les délégués du personnel présentent à l’employeur les réclamations relatives à l’hygiène, à la sécurité et aux conditions de travail, saisissent l’inspection du travail des manquements constatés et l’accompagnent lors de ses visites. Dans les entreprises atteignant l’effectif fixé par les textes, un comité d’hygiène, de sécurité et des conditions de travail (CHSCT) réunit des représentants de l’employeur et du personnel, le médecin du travail et le responsable sécurité.',
              'Le CHSCT contribue à la protection de la santé et de la sécurité des travailleurs : il procède à des inspections régulières, analyse les risques et les accidents, propose des actions de prévention, est consulté sur les projets modifiant les conditions de travail et sur le règlement intérieur, et peut recourir à un expert dans les cas prévus. Ses membres bénéficient d’heures de délégation et d’une formation spécifique. Ses réunions font l’objet de procès-verbaux transmis à l’inspection du travail.',
              'Le service de santé au travail assure les visites médicales d’embauche, périodiques et de reprise, conseille l’employeur et les travailleurs et participe à l’évaluation des risques. L’inspection du travail contrôle l’application des textes, peut mettre en demeure l’employeur et dresser procès-verbal. Le représentant syndical connaît ces acteurs, entretient avec eux des relations régulières et sait lequel saisir selon la situation.',
            ),
          },
        ],
      },
      {
        title: 'Accident du travail et maladies professionnelles',
        summary: 'Déclaration, reconnaissance, réparation et prévention.',
        durationMinutes: 240,
        lessons: [
          {
            slug: 'declaration-reconnaissance-et-reparation',
            title: 'Déclaration, reconnaissance et réparation',
            summary: 'La procédure de prise en charge par la sécurité sociale et l’accompagnement de la victime.',
            durationMinutes: 90,
            html: paragraphs(
              'L’accident du travail est celui qui survient par le fait ou à l’occasion du travail, y compris pendant le trajet entre le domicile et le lieu de travail dans les conditions prévues par la loi. La maladie professionnelle est une affection contractée du fait de l’exposition à un risque lié à l’activité, figurant dans les tableaux réglementaires ou reconnue par expertise. Dans les deux cas, la victime bénéficie d’une prise en charge par l’organisme de sécurité sociale : soins, indemnités journalières, rente en cas d’incapacité permanente, et prestations aux ayants droit en cas de décès.',
              'La procédure repose sur la déclaration : le travailleur informe l’employeur dans les délais prescrits, l’employeur déclare l’accident à la caisse de sécurité sociale et à l’inspection du travail, le médecin établit un certificat médical initial. Le représentant syndical veille à ce que la déclaration soit faite dans les délais et conserve une copie ; en cas de carence de l’employeur, la victime ou son syndicat peut déclarer directement l’accident à la caisse. Les témoignages et le registre des accidents sont des pièces essentielles en cas de contestation.',
              'Chaque accident doit ensuite donner lieu à une analyse : circonstances, causes techniques, organisationnelles et humaines, mesures de prévention à mettre en œuvre pour éviter sa répétition. La méthode de l’arbre des causes, pratiquée en atelier dans ce module, structure cette analyse. Le CHSCT ou les délégués présentent leurs conclusions à l’employeur et en suivent la mise en œuvre. La réparation de la victime et la prévention des accidents futurs sont les deux faces d’une même mission syndicale.',
            ),
          },
        ],
      },
    ],
  },
]

export function findCourse(code: string): CourseContent {
  const course = courses.find((c) => c.code === code)
  if (!course) throw new Error(`Seed : cours ${code} introuvable dans course-content.ts`)
  return course
}
