/**
 * Contenus institutionnels officiels (BUILD_BRIEF §6) et textes de repli des pages
 * « La FETRAG », « Mentions légales » et « Confidentialité » lorsque le CMS ne fournit pas la page.
 * Les fragments HTML ci-dessous sont rédigés par l'équipe FETRAG (aucune saisie utilisateur) et rendus via `Prose`.
 */

export const MISSION_TEXT =
  "La FETRAG s'engage à défendre les droits des travailleurs gabonais et à promouvoir un dialogue social constructif. Notre mission est de créer un environnement de travail équitable et respectueux pour tous."

export const SG_NAME = 'Jocelyn Louis NGOMA'
export const SG_TITLE = 'Secrétaire Général'
export const SG_PHOTO = '/brand/sg-ngoma.webp'

/** Mot du Secrétaire Général, repris mot pour mot (trois paragraphes). */
export const SG_MESSAGE: readonly string[] = [
  'Au nom de la Fédération des Travailleurs du Gabon, je vous souhaite la bienvenue sur la plateforme officielle de la FETRAG.',
  'Dans un monde du travail en pleine mutation, où les défis sociaux, économiques et professionnels deviennent chaque jour plus complexes, notre responsabilité est claire : bâtir un syndicalisme nouveau, moderne, crédible et profondément attaché à la défense de la dignité du travailleur gabonais.',
  "La FETRAG est née d'une conviction forte : le progrès social ne peut se construire sans des organisations syndicales responsables, compétentes, réformatrices et capables de dialoguer avec intelligence, fermeté et vision. Nous portons un syndicalisme de propositions, un syndicalisme de résultats, un syndicalisme qui refuse la résignation et qui croit en la capacité des travailleurs du Gabon à devenir des acteurs majeurs du développement national.",
]

export interface TimelineEntry {
  date: string
  title: string
  description: string
}

/** Repères historiques du mouvement des travailleurs gabonais et de la Fédération. */
export const HISTORY_TIMELINE: TimelineEntry[] = [
  {
    date: 'Années 1950',
    title: 'Naissance du mouvement ouvrier gabonais',
    description:
      "Les premières organisations de travailleurs se structurent dans les chantiers forestiers, les ports et l'administration : elles portent déjà les revendications de dignité et de salaire décent qui fondent le syndicalisme gabonais.",
  },
  {
    date: '1960',
    title: 'Indépendance et reconnaissance du fait syndical',
    description:
      "Le jeune État reconnaît le rôle des organisations de travailleurs dans la construction nationale. Le droit syndical entre dans le cadre juridique du travail au Gabon.",
  },
  {
    date: '1990',
    title: 'Conférence nationale et pluralisme syndical',
    description:
      "Le pluralisme syndical ouvre la voie à des organisations autonomes, sectorielles et fédératives. Le dialogue social devient un espace de négociation reconnu entre l'État, les employeurs et les travailleurs.",
  },
  {
    date: 'Création de la FETRAG',
    title: 'Une fédération intersectorielle',
    description:
      "Des organisations de plusieurs secteurs mutualisent leurs compétences et portent ensemble des revendications transversales : la Fédération des Travailleurs du Gabon est née, avec sa devise Travail · Efficacité · Solidarité.",
  },
  {
    date: '2026',
    title: 'Programme de formation des Leaders Syndicaux',
    description:
      "Dix modules, une plateforme de formation en ligne et des certificats vérifiables : la Fédération fait de la compétence de ses responsables le levier d'un syndicalisme de propositions et de résultats.",
  },
]

export interface ValueEntry {
  title: string
  description: string
}

export const VALUES: ValueEntry[] = [
  {
    title: 'Travail',
    description: 'Le travail fonde la dignité du travailleur et la richesse du pays. Nous le défendons et nous le valorisons dans chaque négociation.',
  },
  {
    title: 'Efficacité',
    description: 'Des responsables formés, des dossiers solides, des méthodes rigoureuses : nous devons des résultats concrets aux travailleurs et à leurs organisations.',
  },
  {
    title: 'Solidarité',
    description: "La force du mouvement syndical vient de l'union des travailleurs, entre secteurs, entre générations et entre organisations.",
  },
]

export const MISSIONS: string[] = [
  'Représenter les organisations affiliées auprès des pouvoirs publics, des employeurs et des institutions de dialogue social.',
  'Former les leaders syndicaux et les représentants du personnel grâce au Programme de formation des Leaders Syndicaux.',
  'Apporter un appui juridique et technique aux sections syndicales et à leurs adhérents.',
  'Promouvoir le dialogue social et la négociation collective comme modes privilégiés de règlement des différends.',
  "Contribuer à l'amélioration de la santé, de la sécurité et des conditions de travail.",
]

export const GOVERNANCE_HTML =
  "<p>La Fédération est dirigée par un Bureau exécutif élu par le Congrès des organisations affiliées, qui se réunit en Assemblée générale annuelle. Le Secrétariat général assure la conduite quotidienne des activités, la représentation institutionnelle et la coordination des sections.</p><p>Les comptes de la Fédération sont contrôlés chaque année par des commissaires aux comptes indépendants et présentés à l'Assemblée générale.</p>"

export const PILLAR_DESCRIPTIONS = {
  protection: "Sans entreprise viable, il n'y a pas d'emploi durable : comprendre les enjeux économiques pour protéger l'outil de travail.",
  prevention: 'Le dialogue d’abord ; la grève reste l’ultime recours, exercé dans le respect de la loi et de la dignité de chacun.',
  defense: 'Salaires, conditions de travail, sécurité, dignité et non-discrimination : la raison d’être du syndicalisme.',
} as const

export const LEGAL_NOTICE_HTML =
  '<h2>Éditeur</h2>' +
  '<p>Les sites fetrag.ga et formation.fetrag.ga sont édités par la Fédération des Travailleurs du Gabon (FETRAG), organisation syndicale dont le siège est situé à Libreville, Gabon (BP 1234). Directeur de la publication : le Secrétaire Général de la FETRAG, Jocelyn Louis NGOMA.</p>' +
  '<h2>Hébergement</h2>' +
  '<p>Les sites sont hébergés sur une infrastructure infonuagique. Les données sont stockées dans une base de données PostgreSQL managée, sauvegardée quotidiennement.</p>' +
  '<h2>Propriété intellectuelle</h2>' +
  "<p>L'ensemble des contenus (textes, logos, illustrations, contenus de formation) est la propriété de la FETRAG ou de ses partenaires et ne peut être reproduit sans autorisation écrite. Les textes officiels (lois, décrets, conventions) reproduits ou cités restent soumis à leur régime propre.</p>" +
  "<h2>Conditions d'utilisation</h2>" +
  "<p>L'accès aux espaces personnels et à la plateforme de formation suppose la création d'un compte et l'acceptation des présentes conditions ainsi que de la politique de confidentialité. Tout usage frauduleux d'un compte entraîne sa suspension. Les certificats émis sont vérifiables publiquement par leur numéro.</p>" +
  '<h2>Contact</h2>' +
  '<p>Pour toute question relative au site, écrivez-nous depuis la page Contact ou par courrier au siège de la Fédération.</p>'

export const PRIVACY_HTML =
  '<h2>Données collectées</h2>' +
  "<p>Nous collectons les données nécessaires à la gestion de votre compte (identité, adresse email, téléphone), au suivi de vos formations (inscriptions, progression, résultats, présences, certificats), au traitement de vos demandes de services et à la gestion des paiements. Les données de paiement sont traitées par notre prestataire de paiement et ne sont jamais stockées en clair par la FETRAG.</p>" +
  '<h2>Finalités et base légale</h2>' +
  "<p>Vos données sont utilisées pour exécuter les services que vous demandez, assurer la sécurité de la plateforme, répondre à nos obligations légales et, avec votre consentement, vous adresser des informations sur nos activités. Vous pouvez retirer votre consentement à tout moment depuis votre espace personnel ou via le lien de désinscription présent dans chaque lettre d'information.</p>" +
  '<h2>Conservation et sécurité</h2>' +
  "<p>Les données sont conservées pendant la durée de votre relation avec la FETRAG puis archivées conformément aux obligations légales. Les certificats émis restent vérifiables publiquement par leur numéro, sans exposer d'autres données que le nom du titulaire, l'intitulé de la formation et la date d'émission. Les accès sont journalisés et les comptes à privilèges sont protégés par une vérification en deux étapes.</p>" +
  '<h2>Vos droits</h2>' +
  "<p>Vous disposez d'un droit d'accès, de rectification, d'effacement et d'opposition. Toute demande peut être adressée par le formulaire de contact ou par courrier au siège de la Fédération. Nous y répondons dans un délai d'un mois.</p>"
