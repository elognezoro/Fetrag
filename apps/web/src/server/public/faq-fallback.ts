/**
 * Questions fréquentes de repli (rédigées par la Fédération) lorsque le CMS n'a pas encore
 * de contenu publié. Les réponses sont des fragments HTML statiques (aucune saisie utilisateur).
 */
import type { FaqGroup } from './faq'

export const FAQ_FALLBACK: FaqGroup[] = [
  {
    key: 'general',
    label: 'Questions générales',
    items: [
      {
        id: 'fallback-general-1',
        question: "Qu'est-ce que la FETRAG ?",
        answer:
          "<p>La Fédération des Travailleurs du Gabon (FETRAG) est une fédération syndicale intersectorielle. Elle représente ses organisations affiliées auprès des pouvoirs publics, des employeurs et des instances de dialogue social, forme les leaders syndicaux et apporte un appui juridique aux sections et à leurs adhérents.</p>",
        group: 'general',
        position: 0,
        isActive: true,
      },
      {
        id: 'fallback-general-2',
        question: 'Que signifie le triptyque fondateur ?',
        answer:
          "<p>Trois engagements indissociables structurent l'action de la Fédération : <strong>01 la protection de l'outil de production</strong>, <strong>02 la prévention des conflits sociaux</strong> et <strong>03 la défense des intérêts matériels et moraux des travailleurs</strong>. Ils guident chaque négociation, chaque formation et chaque décision.</p>",
        group: 'general',
        position: 1,
        isActive: true,
      },
      {
        id: 'fallback-general-3',
        question: 'Comment contacter la Fédération ?',
        answer:
          '<p>Par le formulaire de la page Contact, par email ou par téléphone aux numéros indiqués en bas de page. La permanence du siège, à Libreville, est ouverte du lundi au vendredi. Nous répondons aux messages sous cinq jours ouvrés.</p>',
        group: 'general',
        position: 2,
        isActive: true,
      },
    ],
  },
  {
    key: 'adhesion',
    label: 'Adhésion et affiliation',
    items: [
      {
        id: 'fallback-adhesion-1',
        question: 'Qui peut rejoindre la FETRAG ?',
        answer:
          "<p>Les organisations syndicales (syndicats, sections d'entreprise, unions sectorielles) peuvent demander leur affiliation. Les travailleurs à titre individuel sont orientés vers l'organisation affiliée de leur secteur ou accompagnés dans la création d'une section syndicale.</p>",
        group: 'adhesion',
        position: 0,
        isActive: true,
      },
      {
        id: 'fallback-adhesion-2',
        question: "Comment se déroule une demande d'affiliation ?",
        answer:
          "<p>Vous déposez une demande depuis la page Adhésion. Le Secrétariat général vous contacte pour un entretien, examine les statuts de votre organisation puis présente la demande aux instances de la Fédération. L'affiliation est confirmée par courrier officiel.</p>",
        group: 'adhesion',
        position: 1,
        isActive: true,
      },
    ],
  },
  {
    key: 'formation',
    label: 'Formation et certificats',
    items: [
      {
        id: 'fallback-formation-1',
        question: 'Comment accéder au programme de formation ?',
        answer:
          "<p>Le Programme de formation des Leaders Syndicaux (dix modules) est dispensé sur la plateforme formation.fetrag.ga. Créez un compte, choisissez un module et inscrivez-vous. Les organisations affiliées peuvent aussi déposer une demande de formation groupée pour leurs responsables.</p>",
        group: 'formation',
        position: 0,
        isActive: true,
      },
      {
        id: 'fallback-formation-2',
        question: 'Les certificats sont-ils vérifiables ?',
        answer:
          "<p>Oui. Chaque attestation ou certificat porte un numéro unique et un code QR. Toute personne peut en vérifier l'authenticité depuis la page « Vérifier un certificat » : seuls le nom du titulaire, l'intitulé de la formation et la date d'émission sont affichés.</p>",
        group: 'formation',
        position: 1,
        isActive: true,
      },
      {
        id: 'fallback-formation-3',
        question: 'Les formations sont-elles payantes ?',
        answer:
          "<p>La plupart des modules sont gratuits pour les membres des organisations affiliées. Certaines formations spécialisées ou master class peuvent être payantes ; le tarif est alors indiqué sur la fiche et le paiement se fait en ligne par Mobile Money ou carte bancaire.</p>",
        group: 'formation',
        position: 2,
        isActive: true,
      },
    ],
  },
  {
    key: 'services',
    label: 'Services aux adhérents',
    items: [
      {
        id: 'fallback-services-1',
        question: 'Quels services propose la Fédération ?',
        answer:
          "<p>Conseil juridique en droit du travail, accompagnement à la création d'une section syndicale, médiation et prévention des conflits, appui à la négociation collective, formation sur mesure. Le catalogue complet est disponible sur la page Services.</p>",
        group: 'services',
        position: 0,
        isActive: true,
      },
      {
        id: 'fallback-services-2',
        question: 'Comment suivre ma demande de service ?',
        answer:
          '<p>Chaque demande reçoit une référence (SRV-…) rappelée dans l’accusé de réception. Connecté à votre espace personnel, vous suivez son avancement dans la rubrique « Mes demandes » et recevez une notification à chaque changement de statut.</p>',
        group: 'services',
        position: 1,
        isActive: true,
      },
    ],
  },
  {
    key: 'compte',
    label: 'Compte et sécurité',
    items: [
      {
        id: 'fallback-compte-1',
        question: 'Un seul compte pour le site et la plateforme de formation ?',
        answer:
          '<p>Oui. Votre compte FETRAG est commun à fetrag.ga et à formation.fetrag.ga : une seule connexion donne accès à votre espace personnel, à vos demandes, à vos inscriptions et à vos certificats.</p>',
        group: 'compte',
        position: 0,
        isActive: true,
      },
      {
        id: 'fallback-compte-2',
        question: 'Comment sont protégées mes données ?',
        answer:
          "<p>Les données sont hébergées sur une infrastructure sécurisée, les accès sont journalisés et les comptes à privilèges sont protégés par une vérification en deux étapes. Vous pouvez exercer vos droits d'accès, de rectification et d'effacement depuis la page Contact. Consultez notre politique de confidentialité pour le détail.</p>",
        group: 'compte',
        position: 1,
        isActive: true,
      },
    ],
  },
]
