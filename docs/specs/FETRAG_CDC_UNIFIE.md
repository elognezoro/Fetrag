> **Note.** Source de vérité fonctionnelle du projet (chapitre 37 du CDC). Converti depuis `FETRAG_Cahier_des_charges_UNIFIE_Monorepo_Web_LMS_v2.0.docx`.

# CAHIER DES CHARGES UNIFIÉ - ÉCOSYSTÈME NUMÉRIQUE FETRAG

**FÉDÉRATION DES TRAVAILLEURS DU GABON - FETRAG**

Site institutionnel fetrag.ga + LMS formation.fetrag.ga - Monorepo Node.js

Version 2.0 - Septembre 2026

Document maître de réalisation - Claude Code / Node.js

Travail · Efficacité · Solidarité

Site vitrine : fetrag.ga | LMS : formation.fetrag.ga

## Sommaire

- [0. Contrôle du document et statut](#0-contrôle-du-document-et-statut)
- [1. Objet et note de consolidation](#1-objet-et-note-de-consolidation)
- [2. Vision produit](#2-vision-produit)
- [3. Objectifs stratégiques](#3-objectifs-stratégiques)
- [4. Périmètre fonctionnel](#4-périmètre-fonctionnel)
- [5. Publics et rôles](#5-publics-et-rôles)
- [6. Architecture cible](#6-architecture-cible)
- [7. Architecture monorepo](#7-architecture-monorepo)
- [8. Stack technique de référence](#8-stack-technique-de-référence)
- [9. Exigences fonctionnelles - site vitrine](#9-exigences-fonctionnelles---site-vitrine)
- [10. Exigences fonctionnelles - LMS](#10-exigences-fonctionnelles---lms)
- [11. Exigences partagées](#11-exigences-partagées)
- [12. Catalogue initial des formations FETRAG](#12-catalogue-initial-des-formations-fetrag)
- [13. Modèle pédagogique](#13-modèle-pédagogique)
- [14. Workflow de demande institutionnelle](#14-workflow-de-demande-institutionnelle)
- [15. Identité, SSO et autorisations](#15-identité-sso-et-autorisations)
- [16. Modèle de données - domaines](#16-modèle-de-données---domaines)
- [17. API et contrats](#17-api-et-contrats)
- [18. CMS et gouvernance éditoriale](#18-cms-et-gouvernance-éditoriale)
- [19. Paiements et modèle économique](#19-paiements-et-modèle-économique)
- [20. Notifications et communication](#20-notifications-et-communication)
- [21. UX, design system et accessibilité](#21-ux-design-system-et-accessibilité)
- [22. Bas débit, PWA et continuité d’apprentissage](#22-bas-débit-pwa-et-continuité-dapprentissage)
- [23. Sécurité et confidentialité](#23-sécurité-et-confidentialité)
- [24. Performance et qualité de service - cibles proposées](#24-performance-et-qualité-de-service---cibles-proposées)
- [25. SEO, recherche et découvrabilité](#25-seo-recherche-et-découvrabilité)
- [26. Reporting et tableaux de bord](#26-reporting-et-tableaux-de-bord)
- [27. Environnements, DevOps et déploiement](#27-environnements-devops-et-déploiement)
- [28. Sauvegarde, supervision et continuité](#28-sauvegarde-supervision-et-continuité)
- [29. Tests et assurance qualité](#29-tests-et-assurance-qualité)
- [30. Critères de recette globale](#30-critères-de-recette-globale)
- [31. Phasage recommandé](#31-phasage-recommandé)
- [32. Priorisation MVP / après MVP](#32-priorisation-mvp--après-mvp)
- [33. Livrables](#33-livrables)
- [34. Éléments à chiffrer](#34-éléments-à-chiffrer)
- [35. Hors périmètre initial sauf décision explicite](#35-hors-périmètre-initial-sauf-décision-explicite)
- [36. Décisions à verrouiller au cadrage](#36-décisions-à-verrouiller-au-cadrage)
- [37. Règles de réalisation avec Claude Code](#37-règles-de-réalisation-avec-claude-code)
- [38. Routes minimales](#38-routes-minimales)
- [39. Variables d’environnement - familles attendues](#39-variables-denvironnement---familles-attendues)
- [40. Seed de démonstration et recette](#40-seed-de-démonstration-et-recette)
- [41. Réversibilité](#41-réversibilité)
- [42. Conclusion](#42-conclusion)

Site institutionnel fetrag.ga + LMS formation.fetrag.ga - Monorepo Node.js

Version 2.0 - Septembre 2026

Maîtrise d’ouvrage : FETRAG - Fédération des Travailleurs du Gabon

Devise : Travail · Efficacité · Solidarité

Document de référence fonctionnel, technique, UX, sécurité, exploitation et recette - destiné à la réalisation neuve de l’écosystème avec Claude Code.

## 0. Contrôle du document et statut

| Champ | Valeur |
|---|---|
| Document | Cahier des charges unifié - Portail Web + LMS |
| Version | 2.0 |
| Date | Septembre 2026 |
| Statut | Base de réalisation / à valider par FETRAG |
| Domaines cibles | fetrag.ga ; formation.fetrag.ga |
| Architecture imposée | Monorepo pnpm + Turborepo ; applications Next.js + TypeScript |
| Base de données | PostgreSQL |
| Périmètre | Gabon, extensible régionalement et internationalement |
| Sources consolidées | Cahier des charges Vitrine Web v1.0 ; Cahier des charges LMS v1.0 ; Programme de formation Leaders Syndicaux - Session 2026 |

## 1. Objet et note de consolidation

Le présent document remplace, pour la construction technique, les deux cahiers des charges séparés « Vitrine Web » et « LMS ». Il conserve les objectifs métier, les parcours, les exigences de sécurité, de mobile-first, de paiement, de reporting et de réversibilité, tout en les traduisant dans une architecture concrète correspondant au choix du maître d’œuvre : pnpm + Turborepo + Next.js + TypeScript, dans un monorepo unique.

Les exigences issues des documents FETRAG sont distinguées des décisions d’architecture proposées ici. Les décisions techniques peuvent être ajustées par ADR (Architecture Decision Record), mais une modification ne doit jamais dégrader une exigence MUST sans validation formelle de la FETRAG.

## 2. Vision produit

L’écosystème FETRAG doit donner à l’utilisateur l’impression d’un seul produit numérique : une identité visuelle unique, un seul compte, des transitions transparentes et des services cohérents. Techniquement, il reste modulaire afin que la vitrine, le LMS, l’API et les services d’infrastructure puissent évoluer et être déployés indépendamment.

- fetrag.ga : communication institutionnelle, actualités, ressources, services, événements, orientation, espace personnel et portail d’accès.
- formation.fetrag.ga : apprentissage, demandes institutionnelles, cours, cohortes, évaluations, présences, certification, Master Class et reporting pédagogique.
- Backend partagé : identité, organisations, catalogue, paiements, notifications, stockage, recherche, analytics, audit et API.
- Principe directeur : tout-en-un pour l’utilisateur, modulaire pour la technique.

## 3. Objectifs stratégiques

- Moderniser la présence institutionnelle de la FETRAG et renforcer visibilité, confiance et transparence.
- Former à grande échelle avec une qualité homogène, traçable et certifiable.
- Rendre les parcours utilisables prioritairement sur smartphone et en connectivité dégradée.
- Digitaliser la demande de formation par les organisations syndicales, de la demande au rapport final.
- Unifier comptes, catalogues, paiements, notifications et indicateurs.
- Préparer un modèle économique durable : formations, certifications, Master Class, services, événements, ressources premium et offres organisations.
- Préparer l’extension à plusieurs langues, pays, organisations et services futurs.

## 4. Périmètre fonctionnel

### 4.1 Site institutionnel / portail - fetrag.ga

- Accueil et proposition de valeur FETRAG.
- Historique, missions, valeurs, gouvernance, organisation et triptyque fondateur.
- Organisations affiliées et partenaires.
- Actualités, communiqués, catégories, partage et recherche.
- Ressources documentaires avec niveaux d’accès.
- Catalogue public de formations provenant du LMS.
- Catalogue des services et formulaires associés.
- Agenda, événements et inscriptions.
- Adhésion/intérêt, contact et partenariats.
- Espace personnel consolidé.
- Paiements, reçus et historique lorsque le service est payant.
- Vérification publique de certificats.

### 4.2 LMS - formation.fetrag.ga

- Catalogue de formations et sessions.
- Parcours asynchrones, synchrones et hybrides.
- Lecteur pédagogique mobile-first.
- Évaluations, devoirs, feedback, progression et achèvement.
- Cohortes, groupes, calendriers, présences et émargement.
- Workflow institutionnel de demande de formation.
- Dashboards apprenant, formateur, organisation, coordination et administration.
- Forums et communications de cours.
- Certificats/attestations avec QR de vérification.
- Master Class et événements de formation.
- Reporting pédagogique et financier.
- Bibliothèque de ressources et interopérabilité H5P/SCORM/xAPI selon phase.

## 5. Publics et rôles

| Rôle | Portée | Responsabilités principales |
|---|---|---|
| Visiteur | Public | Consulter contenus publics, rechercher, voir catalogue, vérifier un certificat. |
| Utilisateur / travailleur | Global | Gérer son profil, demander un service, s’inscrire, payer, consulter historique. |
| Apprenant | LMS/cours | Suivre les cours, activités, évaluations, forums, certificats. |
| Responsable d’organisation | Organisation | Soumettre demandes, désigner participants, suivre progression agrégée. |
| Formateur | Cours/session | Publier/animer selon habilitation, corriger, gérer présence et feedback. |
| Coordinateur formation FETRAG | LMS global | Valider demandes, planifier, créer cohortes, affecter formateurs, clôturer sessions. |
| Éditeur communication | Web | Pages, actualités, ressources, agenda, SEO. |
| Responsable services | Web/services | Catalogue de services, demandes, statuts, routage. |
| Finance / contrôle | Paiements | Transactions, rapprochements, reçus, remboursements autorisés, exports. |
| Support | Support | Assistance et diagnostic sans accès excessif au dossier pédagogique. |
| Super administrateur | Global | Paramétrage, sécurité, rôles, intégrations, audit. |

## 6. Architecture cible

Architecture logique recommandée :

Utilisateur -> fetrag.ga / formation.fetrag.ga -> IdP OIDC -> API partagée -> PostgreSQL / Redis / S3 / services de notification et paiement.

- Les deux interfaces publiques sont des applications Next.js distinctes dans le même monorepo.
- L’API métier partagée est un service Node.js TypeScript (Fastify recommandé) afin de centraliser autorisations, règles métier, intégrations et futur accès mobile.
- Les traitements asynchrones sont délégués à un worker Node.js et une file de jobs (Redis/BullMQ ou équivalent).
- PostgreSQL est la source de vérité relationnelle.
- Les médias et pièces jointes sont conservés dans un stockage objet S3-compatible.
- Le fournisseur d’identité est un composant OIDC/OAuth2 dédié ; les applications ne doivent pas fabriquer un protocole SSO maison.
- Les services externes (paiement, email, SMS/WhatsApp, visio, analytics) sont intégrés par adaptateurs.

## 7. Architecture monorepo

```text
fetrag/
├─ apps/
│  ├─ web/                 # Next.js — fetrag.ga
│  ├─ lms/                 # Next.js — formation.fetrag.ga
│  ├─ api/                 # Fastify/TypeScript — API métier partagée
│  └─ worker/              # Jobs asynchrones : email, certificats, webhooks, exports
├─ packages/
│  ├─ ui/                  # composants React partagés
│  ├─ design-tokens/       # couleurs, typographies, espaces, icônes
│  ├─ contracts/           # schémas Zod, DTO, erreurs, événements
│  ├─ db/                  # Prisma, migrations, seed
│  ├─ auth/                # client OIDC, guards, RBAC/scopes
│  ├─ domain/              # règles métier communes
│  ├─ cms/                 # logique éditoriale
│  ├─ lms-core/            # progression, activités, évaluation, certification
│  ├─ payments/            # interface PSP + adaptateurs
│  ├─ storage/             # S3, URLs signées, politiques d’accès
│  ├─ notifications/       # orchestration email/interne/SMS/WhatsApp
│  ├─ search/              # recherche PostgreSQL et abstractions
│  ├─ analytics/           # événements métier et agrégations
│  ├─ observability/       # logs, traces, métriques
│  ├─ config/              # env validé et config runtime
│  ├─ eslint-config/
│  ├─ tsconfig/
│  └─ testing/
├─ infra/
│  ├─ docker/
│  ├─ proxy/
│  └─ deployment/
├─ docs/
│  ├─ architecture/
│  ├─ adr/
│  ├─ api/
│  └─ runbooks/
├─ scripts/
├─ pnpm-workspace.yaml
├─ turbo.json
├─ package.json
└─ README.md
```

Règle de dépendance : les applications peuvent dépendre des packages partagés, mais les packages de domaine ne dépendent jamais des applications. Les adaptateurs d’infrastructure dépendent des contrats du domaine et non l’inverse. Toute logique métier partagée doit vivre hors des pages React.

## 8. Stack technique de référence

| Couche | Choix de référence | Règle |
|---|---|---|
| Workspace | pnpm workspaces + Turborepo | Versions épinglées ; cache Turbo ; commandes homogènes. |
| Frontends | Next.js App Router + React + TypeScript strict | SSR/SSG pour le public, Server Components quand pertinent. |
| API | Fastify + TypeScript | REST /v1, OpenAPI, validation Zod. |
| UI | Tailwind CSS + primitives accessibles | Composants dans packages/ui ; pas de duplication de design. |
| ORM | Prisma ORM | Migrations versionnées ; transactions sur opérations critiques. |
| Données | PostgreSQL | UTC en base ; UUID/ULID ; indexation pensée dès le schéma. |
| Cache / jobs | Redis + BullMQ (ou équivalent validé) | Jobs idempotents, retry, dead-letter strategy. |
| Stockage | S3-compatible | Buckets publics/privés séparés ; URL signées. |
| Auth | OIDC/OAuth2 via fournisseur d’identité | MFA administrateurs ; apps = clients OIDC. |
| Validation | Zod | Contrats partagés client/API. |
| Tests | Vitest + Testing Library + Playwright | Unitaires, intégration, E2E. |
| Observabilité | Logs JSON + OpenTelemetry/APM | Correlation ID de bout en bout. |
| CI/CD | Pipeline automatisé | Lint, types, tests, build, scan, migration, déploiement. |

## 9. Exigences fonctionnelles - site vitrine

| ID | Priorité | Exigence | Critère de recette |
|---|---|---|---|
| WEB-01 | MUST | Interface responsive mobile-first, navigation claire et CTA prioritaires visibles. | Parcours critiques validés sur smartphones Android/iOS et navigateurs modernes. |
| WEB-02 | MUST | CMS intégré administrable par la FETRAG : pages, actualités, médias, documents, menus, formulaires, SEO et comptes éditeurs. | Un éditeur non technique publie et modifie un contenu sans intervention développeur. |
| WEB-03 | MUST | Catalogue de services : fiches, conditions, tarifs éventuels, demande/inscription et suivi. | Chaque service est administrable, activable/désactivable et traçable. |
| WEB-04 | MUST | Catalogue public de formations alimenté par le LMS, sans double saisie. | Une formation publiée côté LMS apparaît côté vitrine selon son statut de publication. |
| WEB-05 | MUST | Compte utilisateur unique et SSO entre la vitrine et le LMS. | Un utilisateur déjà authentifié ouvre le LMS sans ressaisir son mot de passe. |
| WEB-06 | MUST | Formulaires configurables : contact, assistance, demande de service, adhésion/intérêt, partenariat. | Accusé de réception, routage interne, statut et export disponibles. |
| WEB-07 | SHOULD | Recherche sur pages, actualités, ressources, services et formations publiques. | Recherche tolérante avec filtres de base. |
| WEB-08 | MUST | Paiement en ligne via couche d’adaptation PSP : mobile money, cartes et autres moyens retenus. | Paiement sandbox de bout en bout, statut, reçu et rapprochement démontrés. |
| WEB-09 | SHOULD | Offres gratuites ou payantes : formation, événement, ressource premium, service. | Tarif, période, quota, coupon, gratuité et prise en charge configurables. |
| WEB-10 | SHOULD | Espace personnel : profil, demandes, inscriptions, paiements/reçus, notifications, accès LMS. | Historique consolidé par utilisateur. |
| WEB-11 | SHOULD | Agenda/événements : inscription, jauge, liste d’attente, calendrier. | Confirmation envoyée et liste de participants exportable. |
| WEB-12 | MUST | Bibliothèque documentaire avec catégories, métadonnées, aperçu, téléchargement et niveaux d’accès. | Document public, membre, organisation ou premium géré correctement. |
| WEB-13 | SHOULD | Newsletter et notifications opt-in avec consentement et désinscription. | Consentements traçables et exportables. |
| WEB-14 | MUST | Internationalisation : français au lancement, structure prête pour anglais et autres langues. | Une langue supplémentaire peut être ajoutée sans refonte du modèle. |
| WEB-15 | SHOULD | Tableau de bord d’administration : trafic, demandes, ventes, conversions, contenus populaires. | Indicateurs consultables et exportables. |
| WEB-16 | COULD | Vérification publique de certificat LMS par code/QR. | Vérification sans exposition excessive de données personnelles. |
| WEB-17 | MUST | SEO technique : métadonnées, sitemap, robots, Open Graph, canonical, données structurées pertinentes. | Audit SEO sans erreur bloquante sur pages publiques essentielles. |
| WEB-18 | MUST | Gestion éditoriale par statuts : brouillon, relecture, publication, archivage et planification. | Les droits de publication respectent les rôles FETRAG. |

## 10. Exigences fonctionnelles - LMS

| ID | Priorité | Exigence | Critère de recette |
|---|---|---|---|
| LMS-01 | MUST | Catalogue de formations : catégories, objectifs, prérequis, durée, modalités, langue, public, prix, sessions. | Catalogue filtrable et administrable. |
| LMS-02 | MUST | Cours asynchrones, synchrones et hybrides ; texte riche, vidéo, audio, PDF, présentations, liens, contenus interactifs. | Cours pilote avec au moins trois types de ressources et une séance synchrone. |
| LMS-03 | MUST | Évaluations : QCU, QCM, vrai/faux, trous, appariement, ordre, réponse courte, composition, devoir, sondage. | Tentatives, scores, corrections, barèmes et règles de réussite conservés. |
| LMS-04 | MUST | Cohortes, groupes, sessions, calendriers, quotas et inscriptions. | Une session peut être réservée à une organisation donnée. |
| LMS-05 | MUST | Workflow de demande de formation institutionnelle FETRAG. | Demande, modules, participants, engagements, pièces, validation et historique gérés. |
| LMS-06 | MUST | Présences et émargement pour présentiel/virtuel. | Présence visible dans le rapport de session. |
| LMS-07 | MUST | Certificats/attestations : numéro unique, QR, critères d’éligibilité, statut, révocation. | Émission uniquement si les conditions configurées sont remplies. |
| LMS-08 | MUST | Tableau de bord apprenant : progression, échéances, résultats, certificats, historique. | Compréhensible sur smartphone. |
| LMS-09 | SHOULD | Tableau de bord organisation : demandes, participants, progression agrégée, résultats et documents. | Un responsable n’accède qu’aux données de son organisation. |
| LMS-10 | MUST | Tableau de bord formateur : participants, contenus, corrections, présence, messagerie, statistiques. | Gestion d’une session sans droits globaux. |
| LMS-11 | SHOULD | Notifications : email, internes, adaptateurs SMS/WhatsApp optionnels. | Rappels configurables pour inscription, session, retard et certification. |
| LMS-12 | SHOULD | Forums / espaces de discussion modérés par cours ou cohorte. | Accès limité aux inscrits et modération disponible. |
| LMS-13 | SHOULD | Interopérabilité pédagogique : H5P/équivalent et import SCORM/xAPI selon priorité. | Import pilote et suivi d’achèvement démontrés. |
| LMS-14 | SHOULD | Bibliothèque de ressources pédagogiques transversales et recherche. | Réutilisation d’une ressource dans plusieurs cours. |
| LMS-15 | SHOULD | Master Class : inscription, paiement, intervenant invité, synchrone, replay, certificat optionnel. | Événement pilote géré de bout en bout. |
| LMS-16 | SHOULD | Questionnaires de satisfaction et impact post-formation. | Résultats agrégés par module/session. |
| LMS-17 | MUST | Versionnement des cours et traçabilité des modifications importantes. | Une cohorte terminée conserve la version suivie du contenu. |
| LMS-18 | MUST | Banque de questions réutilisable, catégorisée et versionnée. | Questions réutilisées sans duplication non maîtrisée. |
| LMS-19 | MUST | Gestion de devoirs avec dépôt de fichiers, texte riche, date limite, correction et feedback. | Soumission, notation et feedback traçables. |
| LMS-20 | SHOULD | Reprise après interruption réseau et mode bas débit ; téléchargement contrôlé de ressources autorisées. | Progression non perdue après coupure sur scénarios testés. |
| LMS-21 | MUST | Rapports : actifs, inscrits, complétion, réussite, assiduité, temps, certificats, revenus, satisfaction. | Exports CSV/XLSX/PDF ou équivalents exploitables. |
| LMS-22 | MUST | Règles d’achèvement configurables par activité, séquence et cours. | Le certificat et la progression suivent ces règles. |

## 11. Exigences partagées

| ID | Priorité | Exigence | Critère de recette |
|---|---|---|---|
| SHR-01 | MUST | Identité fédérée par OIDC/OAuth2 avec fournisseur d’identité dédié ; aucune authentification sensible réimplémentée artisanalement. | SSO fonctionnel sur les deux sous-domaines ; MFA pour administrateurs au niveau de l’IdP. |
| SHR-02 | MUST | RBAC avec portées globales, organisationnelles, de cours et de session. | Tests automatiques empêchent les accès croisés non autorisés. |
| SHR-03 | MUST | PostgreSQL comme base relationnelle principale ; migrations versionnées. | Migration reproductible sur environnement vierge. |
| SHR-04 | MUST | Stockage objet S3-compatible pour médias et pièces jointes ; URL signées pour contenus privés. | Accès privé impossible sans autorisation. |
| SHR-05 | MUST | Service de notifications asynchrones avec file de jobs et reprise sur erreur. | Échec d’envoi rejouable et journalisé. |
| SHR-06 | MUST | Paiements via interface d’adaptation PSP, aucun fournisseur codé en dur dans le domaine métier. | Un faux PSP/sandbox permet les tests automatisés. |
| SHR-07 | MUST | Journal d’audit pour authentification, changements de rôles, paiements, notes, certificats, publications et actions sensibles. | Entrées immuables fonctionnellement et consultables par rôle habilité. |
| SHR-08 | MUST | Gestion des consentements et préférences de communication. | Consentement, retrait et horodatage disponibles. |
| SHR-09 | SHOULD | Recherche unifiée MVP via PostgreSQL FTS/trigram ; moteur dédié possible ultérieurement. | Recherche transverse fonctionnelle sans service externe obligatoire. |
| SHR-10 | MUST | API versionnée et documentée pour intégrations et futurs canaux. | Documentation OpenAPI générée et testée. |
| SHR-11 | MUST | Design system commun FETRAG : bleu, vert et or issus du logo ; composants accessibles. | Composants partagés par les deux sites. |
| SHR-12 | MUST | Observabilité : logs structurés, métriques, erreurs applicatives et santé des services. | Tableau de santé et alertes minimales disponibles. |

## 12. Catalogue initial des formations FETRAG

Le catalogue initial doit être préchargé en seed et éditable. Il reprend les dix modules du Programme de formation des Leaders Syndicaux - Session 2026.

| N° | Module | Contenus initiaux |
|---|---|---|
| 01 | Fondamentaux du Syndicalisme Gabonais | Historique du mouvement syndical au Gabon ; cadre juridique et réglementaire (Code du travail, conventions collectives) ; FETRAG : mission, valeurs et triptyque fondateur. |
| 02 | Droit du Travail et Contentieux | Sources du droit du travail gabonais ; procédures disciplinaires et licenciements ; contentieux individuels et collectifs. |
| 03 | Négociation Collective et Dialogue Social | Techniques de négociation et préparation des revendications ; conventions collectives ; médiation, conciliation et arbitrage. |
| 04 | Organisation et Gestion Syndicale | Constitution et fonctionnement d’une section syndicale ; gestion financière et transparence ; communication interne et mobilisation. |
| 05 | Prévention et Gestion des Conflits Sociaux | Diagnostic des tensions sociales ; prévention des conflits du travail ; organisation et encadrement des mouvements de grève. |
| 06 | Défense des Intérêts Matériels et Moraux | Conditions de travail et rémunération ; protection de l’emploi et sécurité professionnelle ; discriminations et harcèlements. |
| 07 | Protection de l’Outil de Production | Enjeux économiques de l’entreprise ; sauvegarde de l’emploi ; restructurations et plans sociaux. |
| 08 | Leadership Syndical et Éthique | Posture du leader ; conflits internes et cohésion ; intégrité, déontologie et responsabilité. |
| 09 | Communication et Plaidoyer | Prise de parole ; médias et communication numérique syndicale ; plaidoyer institutionnel. |
| 10 | Santé, Sécurité et Conditions de Travail (SSCT) | Prévention des risques professionnels ; rôle des délégués et CHSCT ; accidents du travail et maladies professionnelles. |

Le LMS doit aussi mettre en valeur le triptyque fondateur présenté dans le programme : Protection de l’outil de production - Prévention des conflits sociaux - Défense des intérêts matériels et moraux des travailleurs.

## 13. Modèle pédagogique

- Structure recommandée : Cours -> Version de cours -> Modules -> Leçons -> Activités.
- Chaque activité possède un type, des instructions, des conditions d’achèvement, une durée indicative et éventuellement une note.
- Un cours peut être auto-inscrit, inscrit par validation, inscrit par organisation ou conditionné à un paiement/une prise en charge.
- Chaque version de cours conserve ses règles de réussite pour assurer l’audit des cohortes passées.
- Les activités synchrones stockent date, intervenant, lien de classe virtuelle, présence et replay éventuel.
- Les ressources lourdes doivent avoir une alternative bas débit : audio, transcription, document ou résolution vidéo réduite quand pertinent.

### 13.1 Types d’activités minimales

- Contenu texte riche et tableaux ; fichiers PDF/Office ; liens ; audio ; vidéo ; présentation.
- QCU, QCM, vrai/faux, texte à trous, appariement, classement/ordre, réponse courte, composition.
- Devoir avec dépôt de fichier et/ou réponse texte.
- Sondage, questionnaire de satisfaction et auto-évaluation.
- Forum modéré.
- Session synchrone / présentielle avec présence.
- Contenu H5P ou équivalent ; SCORM/xAPI en phase d’interopérabilité.

## 14. Workflow de demande institutionnelle

1. Le responsable d’organisation s’authentifie par le SSO ou initialise son accès.
2. Il sélectionne/valide son organisation, la personne ressource et les coordonnées.
3. Il choisit un ou plusieurs modules du catalogue.
4. Il désigne nominativement les cadres à former ; la limite de dix personnes du processus actuel devient un paramètre configurable.
5. Il accepte les engagements applicables et ajoute, si nécessaire, une pièce officielle.
6. Le coordinateur FETRAG reçoit la demande et peut demander un complément, accepter, refuser ou proposer une autre date/modalité.
7. Après validation, le système crée ou affecte une cohorte, inscrit les participants et envoie les convocations.
8. Les apprenants suivent les activités ; progression, notes et présences sont enregistrées.
9. Le coordinateur clôture la session, génère les certificats/attestations et le rapport d’organisation.
10. Demande, décisions, pièces, participants, résultats, certificats et paiements restent archivés et recherchables.

## 15. Identité, SSO et autorisations

- Le SSO doit utiliser OIDC/OAuth2. Les deux applications sont des clients du même fournisseur d’identité.
- Le profil applicatif est indexé par le sub OIDC ; ne pas dupliquer les mots de passe en base FETRAG.
- MFA obligatoire pour super-administrateurs, administrateurs LMS, finance et autres rôles privilégiés définis au cadrage.
- RBAC + scopes : global, organisation, cours, cohorte/session. Un rôle peut être limité dans le temps pour un expert invité.
- Chaque requête API sensible vérifie l’identité, le rôle et la portée ; aucune confiance dans un simple état React côté client.
- Les actions d’administration, notes, certificats et finance sont auditées.

## 16. Modèle de données - domaines

| Domaine | Entités principales |
|---|---|
| Identity | UserProfile, ExternalIdentityRef, RoleAssignment, Consent, NotificationPreference |
| Organizations | Organization, OrganizationMembership, OrganizationContact |
| CMS | Page, Article, Category, Partner, Service, ServiceRequest, Resource, MediaAsset, Menu, SEORecord |
| Training Catalog | Course, CourseVersion, CourseModule, Lesson, Activity, Prerequisite |
| Learning | Enrollment, Progress, ActivityCompletion, Quiz, Question, QuestionOption, Attempt, Answer, Assignment, Submission, Grade |
| Sessions | Cohort, CohortMember, TrainingSession, Attendance, LiveSession |
| Institutional Workflow | TrainingRequest, TrainingRequestModule, TrainingRequestParticipant, Attachment, DecisionHistory |
| Certification | CertificateTemplate, Certificate, CertificateVerificationEvent |
| Commerce | Offer, Order, OrderLine, Payment, Refund, Coupon, Sponsorship/Exemption, Receipt |
| Events | Event, EventRegistration, WaitingListEntry |
| Communication | Notification, EmailDelivery, Forum, ForumThread, ForumPost |
| Operations | AuditLog, WebhookEvent, BackgroundJob, SystemSetting |

### 16.1 Principes de modélisation

- Identifiants techniques stables (UUID/ULID) et slugs distincts pour les URL publiques.
- Dates en UTC ; affichage dans le fuseau utilisateur.
- Soft delete uniquement lorsque l’audit l’exige ; sinon suppression contrôlée selon politique de conservation.
- Historisation des statuts importants : demandes, paiements, certificats, inscriptions.
- Montants financiers stockés en unités entières de plus petite devise et accompagnés du code devise.
- Les accès organisationnels doivent toujours être filtrés par organization_id et couverts par tests d’autorisation.
- Les cours utilisent une entité de version afin de figer les règles suivies par une cohorte.

## 17. API et contrats

- Préfixe /v1; endpoints documentés OpenAPI.
- Schémas de requêtes/réponses et erreurs partagés dans packages/contracts.
- Pagination par curseur ou page selon ressource ; filtres explicites ; tri whitelisté.
- Idempotency-Key obligatoire pour création de paiement, webhook, certificat et opérations réessayables.
- Webhooks externes signés et journalisés avant traitement.
- Correlation ID propagé entre frontend, API, worker et logs.
- Événements internes typés : training.request.approved, enrollment.created, payment.succeeded, course.completed, certificate.issued, etc.

## 18. CMS et gouvernance éditoriale

- Back-office intégré à la vitrine : pages, actualités, services, ressources, partenaires, événements, menus, SEO et médias.
- Éditeur riche avec titres, listes, liens, tableaux, citations, images, fichiers et contenu structuré.
- Statuts : brouillon -> relecture -> publié -> archivé ; planification de publication souhaitée.
- Prévisualisation avant publication.
- Historique des versions au minimum pour les contenus sensibles.
- Modèles de contenu : page institutionnelle, actualité, service, ressource, événement, FAQ et partenaire.
- Les documents doivent porter catégorie, date, auteur/source, langue, niveau d’accès et mots-clés.

## 19. Paiements et modèle économique

Le domaine métier ne doit dépendre d’aucun PSP particulier. packages/payments expose une interface stable (createPayment, getStatus, refund, handleWebhook, reconcile) et chaque fournisseur dispose d’un adaptateur. Le PSP exact est décidé au cadrage selon disponibilité au Gabon, API, coûts, conformité et qualité de service.

- Paiements unitaires ; récurrence seulement si le PSP retenu la supporte et si la FETRAG la décide.
- Mobile money, cartes et autres portefeuilles selon PSP.
- Tarifs individuels, membres/non-membres, groupes, organisations, promotions.
- Coupons, bourses, exonérations, prises en charge et sponsoring.
- Reçus/factures numérotés selon règles validées.
- Rapprochement, échecs, annulations, remboursements et litiges.
- Traçabilité commande -> paiement -> bénéficiaire -> service délivré.

## 20. Notifications et communication

- Canaux MVP : email + notifications internes.
- SMS/WhatsApp sont des adaptateurs optionnels et ne doivent pas être requis pour faire fonctionner le cœur.
- Templates versionnés et variables contrôlées.
- Rappels : inscription, demande à compléter, validation, session imminente, devoir en retard, résultat, certificat.
- Respect strict des préférences et consentements pour les communications non essentielles.
- Envoi asynchrone avec retries ; état d’envoi visible pour le support.

## 21. UX, design system et accessibilité

- Design system inspiré du logo FETRAG : bleu, vert et or, avec usage sobre sur fonds clairs et contrastes conformes.
- Mobile-first réel : tous les écrans critiques conçus d’abord pour 360–430 px.
- Navigation commune visuellement entre vitrine et LMS ; changement de sous-domaine explicite mais non perturbant.
- Composants accessibles clavier, focus visible, labels explicites, messages d’erreur associés aux champs.
- Objectif WCAG 2.2 niveau AA sur les parcours essentiels.
- Pas de vidéo automatique ; images optimisées ; animations non essentielles désactivables.
- Les dashboards doivent privilégier l’action et non la densité d’information.

## 22. Bas débit, PWA et continuité d’apprentissage

- Pages publiques SSR/SSG et cache CDN pour limiter les transferts.
- Formats image AVIF/WebP si supportés et tailles responsives.
- Chargement paresseux des médias lourds.
- PWA installable au minimum pour le LMS si l’effort reste raisonnable.
- Cache des assets et ressources explicitement marquées téléchargeables.
- Les évaluations critiques nécessitant une validation serveur restent en ligne ; les brouillons peuvent être sauvegardés localement puis synchronisés.
- Reprise idempotente de progression après perte de réseau.
- Une alternative audio/transcription doit être prévue pour les vidéos pédagogiques principales lorsque possible.

## 23. Sécurité et confidentialité

| ID | Priorité | Exigence |
|---|---|---|
| SEC-01 | MUST | TLS partout, HSTS, CSP, cookies Secure/HttpOnly/SameSite adaptés, protections CSRF et clickjacking. |
| SEC-02 | MUST | MFA obligatoire pour administrateurs et rôles privilégiés via l’IdP. |
| SEC-03 | MUST | Validation stricte des entrées côté serveur, contrôle MIME/taille des uploads, antivirus recommandé pour pièces externes. |
| SEC-04 | MUST | Rate limiting pour authentification, formulaires, recherche, certificats, paiements et API sensibles. |
| SEC-05 | MUST | Secrets hors dépôt : variables chiffrées/secret manager ; rotation documentée. |
| SEC-06 | MUST | Dépendances auditées, SAST, scans de conteneur et correction des vulnérabilités critiques avant production. |
| SEC-07 | MUST | Sauvegardes automatiques de la base et des contenus, restauration testée. |
| SEC-08 | MUST | Principe du moindre privilège pour base, stockage, CI/CD et comptes d’exploitation. |
| SEC-09 | MUST | Aucune donnée personnelle sensible inutile dans les logs, traces ou analytics. |
| SEC-10 | SHOULD | Revue de sécurité indépendante avant go-live ou après changement majeur. |

Le projet devra faire valider par un conseil compétent les mentions légales, règles de conservation, droits des personnes, politique cookies et exigences spécifiques au droit gabonais. Le présent cahier des charges ne présume pas du texte juridique exact applicable.

## 24. Performance et qualité de service - cibles proposées

| Indicateur | Cible proposée V1 |
|---|---|
| Core Web Vitals pages publiques | LCP < 2,5 s ; INP < 200 ms ; CLS < 0,1 au p75 sur conditions mobiles réalistes. |
| API lectures courantes | p95 < 500 ms hors dépendance externe lente. |
| Disponibilité | 99,5 % mensuelle minimum proposée, hors maintenance planifiée ; cible contractuelle à valider. |
| RPO | ≤ 1 heure proposé pour la base de production. |
| RTO | ≤ 4 heures proposé pour incident majeur. |
| Erreur applicative | Alertes sur hausse d’erreurs 5xx, échec de jobs, file email, paiement/webhook. |
| Capacité | Test de charge sur pics d’inscription, publication et Master Class. |

## 25. SEO, recherche et découvrabilité

- Title/description éditables, canonical, Open Graph, robots et sitemap.
- URLs lisibles et stables ; redirections documentées lors d’une migration.
- Données structurées pour organisation, article, événement et cours lorsque pertinentes.
- Recherche MVP avec PostgreSQL full-text + trigramme ; index sur titres, résumés, contenus et métadonnées.
- Les contenus privés, brouillons et ressources non publiques ne doivent jamais être indexés par les moteurs externes.

## 26. Reporting et tableaux de bord

- Web : trafic, recherches, formulaires, demandes, inscriptions, ventes, conversions, contenus populaires.
- LMS : apprenants actifs, inscriptions, abandons, complétion, réussite, progression, temps passé, assiduité.
- Organisation : bénéficiaires, cours, progression agrégée, résultats, certificats et rapports.
- Formation : résultats par module/session/formateur/organisation.
- Finance : chiffre d’affaires, impayés, remboursements, panier moyen, canal et moyen de paiement.
- Qualité : satisfaction, NPS ou indicateur retenu, impact post-formation.
- Exports contrôlés et journalisés ; accès selon rôle.

## 27. Environnements, DevOps et déploiement

- Environnements séparés : local, test/CI, staging/recette, production.
- Conteneurs Docker reproductibles pour web, lms, api et worker.
- Reverse proxy/ingress gérant TLS, headers de sécurité, compression et routage des sous-domaines.
- Pipeline : install immuable -> lint -> typecheck -> tests -> build -> scan -> migration contrôlée -> déploiement -> smoke tests.
- Pas de secret dans Git ; .env.example documenté, validation des variables au démarrage.
- Les migrations destructives nécessitent plan de rollback ou migration en plusieurs étapes.
- Les déploiements de web et LMS doivent pouvoir être indépendants grâce au monorepo Turbo.
- Feature flags pour fonctions risquées ou incomplètes.

## 28. Sauvegarde, supervision et continuité

- Sauvegardes automatiques de PostgreSQL et du stockage objet selon politique de rétention validée.
- Test de restauration avant recette finale puis périodiquement.
- Supervision uptime des deux domaines et de l’API.
- Alertes sur erreurs 5xx, saturation, base indisponible, stockage, Redis, worker bloqué, webhooks et paiements.
- Runbooks documentés : restauration, panne email, PSP indisponible, rotation secret, révocation certificat, incident de sécurité.
- Journal d’incident et post-mortem pour incidents majeurs.

## 29. Tests et assurance qualité

- Unitaires : règles métier, calculs, permissions, certification, progression, paiements.
- Intégration : base réelle de test, API, stockage simulé, PSP sandbox/fake, jobs.
- E2E Playwright : inscription, SSO, demande institutionnelle, parcours de cours, quiz, devoir, certificat, paiement, administration.
- Tests d’autorisation négatifs systématiques pour rôles et organisations.
- Tests mobile sur viewport et appareils réels convenus.
- Tests de performance sur pages publiques et scénarios d’inscription.
- Accessibilité automatisée + revue manuelle des parcours essentiels.
- Scan de vulnérabilités et dépendances avant production.

## 30. Critères de recette globale

1. 100 % des exigences MUST sont livrées ou font l’objet d’une dérogation écrite signée.
2. Les deux domaines sont accessibles en HTTPS et utilisent la charte FETRAG commune.
3. SSO portail <-> LMS validé sans ressaisie de mot de passe.
4. Un administrateur non technique publie une page, une actualité, une ressource et une formation publique.
5. Une organisation soumet une demande de formation, désigne ses participants et suit la décision.
6. Une cohorte pilote suit un cours complet avec au moins trois types de ressources, une évaluation et une présence.
7. Un certificat est émis selon règle, contient un identifiant/QR et se vérifie publiquement.
8. Un paiement sandbox ou une prise en charge/exonération permet une inscription conditionnelle.
9. Rapports par organisation, session et finance sont exploitables.
10. Les sauvegardes et la restauration sont testées.
11. Aucune vulnérabilité critique connue n’est ouverte au go-live.
12. Les équipes FETRAG disposent des accès, guides, runbooks et du code source nécessaires à la réversibilité.

## 31. Phasage recommandé

| Phase | Contenu | Durée indicative | Sortie |
|---|---|---|---|
| 0 - Cadrage final | ADR, parcours, wireframes, backlog, PSP/IdP, données, politique de contenu | 1–2 sem. | Architecture et backlog signés |
| 1 - Fondation monorepo | Repo, CI/CD, design system, DB, API, auth OIDC, observabilité | 2 sem. | Socle déployable |
| 2 - Portail MVP | CMS, actualités, ressources, services, formulaires, SEO, recherche | 3–4 sem. | fetrag.ga en recette |
| 3 - LMS cœur | Catalogue, cours, lecteur, inscriptions, progression, dashboards | 4–5 sem. | LMS fonctionnel de base |
| 4 - Formation institutionnelle | Demandes, organisations, cohortes, présence, rapports | 3–4 sem. | Workflow FETRAG complet |
| 5 - Évaluation & certification | Quiz, devoirs, banque, critères, certificats/QR | 3–4 sem. | Parcours certifiant |
| 6 - Paiements & notifications | PSP, reçus, prise en charge, emails, jobs | 2–3 sem. | Monétisation testée |
| 7 - Hardening & pilote | Sécurité, performance, accessibilité, sauvegarde, cohorte pilote | 2–3 sem. | Go-live V1 |

Ordre de grandeur réaliste pour un développement neuf : MVP pilote en environ 14–16 semaines avec travaux parallélisés ; V1 complète en environ 20–24 semaines. Ces durées sont indicatives et doivent être ajustées à la taille de l’équipe et à la disponibilité des contenus.

## 32. Priorisation MVP / après MVP

| MVP V1 | Phase 2 / option |
|---|---|
| Vitrine, CMS, actualités, ressources, services, formulaires, SEO | Multilingue complet et workflows éditoriaux avancés |
| SSO, profils, organisations, rôles | Fédération d’identité supplémentaire / SAML |
| Catalogue, cours, leçons, progression | Application mobile native |
| Quiz principaux, devoirs, présence, certificats | Proctoring, LRS/xAPI avancé |
| Workflow demande de formation | CRM syndical/adhésion complète |
| Email + notifications internes | SMS/WhatsApp |
| Paiement PSP + prise en charge | Abonnements complexes / marketplace |
| PostgreSQL FTS | Meilisearch/Elastic si volumétrie l’exige |
| Lien de visio externe | Visio intégrée / streaming propriétaire |
| H5P embarqué ou import simple | Éditeur H5P avancé / SCORM complet si nécessaire |

## 33. Livrables

1. Monorepo Git complet avec historique et conventions de contribution.
2. Applications web, lms, api, worker configurées.
3. Design system FETRAG et bibliothèque UI partagée.
4. Schéma PostgreSQL, migrations et données seed du catalogue initial.
5. Intégration OIDC/SSO et matrice des rôles.
6. CMS vitrine et back-office.
7. Moteur LMS, évaluations, cohortes, workflow institutionnel, présence, certification.
8. Adaptateurs paiement, stockage, email et notifications.
9. Documentation OpenAPI et schémas de contrats.
10. Suite de tests unitaires/intégration/E2E.
11. CI/CD, Docker, fichiers d’infrastructure et procédures de déploiement.
12. Plan de sauvegarde/restauration et runbooks d’exploitation.
13. Documentation administrateur, éditeur, coordinateur, formateur et support.
14. Guide de prise en main de Claude Code / conventions du dépôt.
15. Procès-verbal de recette, rapport de sécurité, performance et accessibilité.
16. Plan de maintenance, SLA, réversibilité et transfert de compétences.

## 34. Éléments à chiffrer

- Cadrage fonctionnel/UX/architecture.
- Développement portail, CMS, LMS, API et worker.
- Identité/SSO et éventuel IdP managé ou auto-hébergé.
- Hébergement, PostgreSQL, Redis, S3, CDN, supervision et sauvegardes.
- Paiements : intégration + frais PSP distincts.
- Email/SMS/WhatsApp et stockage vidéo.
- Production pédagogique des dix modules, chiffrée séparément du logiciel.
- Formation des administrateurs, formateurs et support.
- Maintenance corrective, préventive et évolutive.
- Audit de sécurité, accessibilité et tests de charge.

## 35. Hors périmètre initial sauf décision explicite

- Application mobile native iOS/Android.
- Centre d’appels.
- Conseil juridique personnalisé automatisé.
- Rédaction complète des contenus pédagogiques des dix modules.
- Proctoring vidéo avancé.
- Marketplace multi-vendeurs.
- CRM d’adhésion syndicale complet et comptabilité générale.
- Visioconférence propriétaire auto-hébergée à grande échelle.

## 36. Décisions à verrouiller au cadrage

1. Fournisseur d’identité OIDC et politique MFA.
2. PSP et opérateurs mobile money à intégrer au Gabon.
3. Hébergement : cloud managé, dédié ou hybride ; localisation et politique de données.
4. Règles exactes de certification et d’expiration/révocation.
5. Politique de prix, membres/non-membres, organisations, exonérations et sponsoring.
6. Solution de classe virtuelle et stratégie de replay.
7. Limites fichiers, quotas stockage et politique vidéo.
8. Durées de conservation des données et pièces.
9. Niveau de multilingue au lancement.
10. Périmètre exact H5P/SCORM/xAPI de la V1.
11. Contenus existants à migrer vers la vitrine.
12. Objectifs contractuels SLA, RPO et RTO.

## 37. Règles de réalisation avec Claude Code

Le présent cahier des charges doit être placé dans `/docs/specs/FETRAG_CDC_UNIFIE.md` et traité comme source de vérité. Claude Code ne doit pas « improviser » des fonctions métier : toute évolution non décrite doit être ajoutée au backlog et, si elle modifie l’architecture, faire l’objet d’un ADR.

- Commencer par le socle monorepo et les conventions, jamais par une page isolée.
- Créer une branche/PR par epic ou fonctionnalité significative.
- Avant code : écrire les critères d’acceptation et les tests attendus.
- TypeScript strict ; pas de any sans justification locale.
- Validation des entrées au bord du système ; jamais faire confiance au payload client.
- Pas d’accès direct base depuis le navigateur ; toutes les actions sensibles passent côté serveur/API.
- Pas de duplication des types métier entre web, LMS et API : utiliser packages/contracts.
- Pas de logique métier dans les composants UI.
- Une migration DB accompagne toute modification de schéma.
- Chaque endpoint protégé possède au moins un test d’autorisation positif et négatif.
- Les jobs sont idempotents ; les webhooks sont vérifiés, journalisés et rejouables.
- Chaque secret est lu via config validée ; aucun secret dans Git ou les logs.
- Une fonctionnalité n’est « Done » que si lint, typecheck, tests et build passent dans Turbo.
- Mettre à jour documentation, changelog et ADR lors des changements structurants.
- Refuser les dépendances inutiles ; préférer les API standard et les adaptateurs.

### 37.1 Definition of Done par ticket

- Critères d’acceptation couverts.
- UI responsive et accessible.
- Permissions testées.
- Cas d’erreur et états de chargement traités.
- Logs utiles sans données sensibles.
- Tests unitaires/intégration/E2E appropriés.
- Migration/seed si nécessaire.
- Documentation mise à jour.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` réussissent.

## 38. Routes minimales

### 38.1 fetrag.ga

| Route | Objet |
|---|---|
| `/` | Accueil institutionnel |
| `/la-fetrag` | Historique, missions, valeurs, gouvernance, triptyque |
| `/organisations` | Affiliés et partenaires |
| `/actualites` | Actualités et communiqués |
| `/actualites/[slug]` | Détail d’actualité |
| `/ressources` | Bibliothèque documentaire |
| `/formations` | Catalogue public synchronisé |
| `/services` | Catalogue des services |
| `/evenements` | Agenda et inscriptions |
| `/adhesion` | Intérêt/adhésion/orientation |
| `/contact` | Contact |
| `/recherche` | Recherche transverse |
| `/connexion` | Entrée SSO |
| `/espace` | Espace personnel |
| `/certificats/verifier/[code]` | Vérification publique |
| `/admin` | Back-office vitrine |

### 38.2 formation.fetrag.ga

| Route | Objet |
|---|---|
| `/` | Accueil formation |
| `/catalogue` | Catalogue LMS |
| `/cours/[slug]` | Fiche de cours |
| `/dashboard` | Tableau de bord contextualisé |
| `/mes-formations` | Inscriptions et progression |
| `/apprendre/[courseId]/[lessonId]` | Lecteur pédagogique |
| `/evaluations/[activityId]` | Évaluations |
| `/devoirs` | Dépôts et corrections |
| `/forums` | Discussions |
| `/calendrier` | Sessions et échéances |
| `/certificats` | Attestations/certificats |
| `/demande-formation` | Workflow institutionnel |
| `/organisation` | Dashboard responsable d’organisation |
| `/formateur` | Dashboard formateur |
| `/coordination` | Pilotage FETRAG |
| `/admin` | Administration LMS |

## 39. Variables d’environnement - familles attendues

Les noms exacts seront figés dans packages/config. Aucune valeur secrète n’est stockée dans le dépôt.

- `DATABASE_URL`, `DIRECT_URL` le cas échéant.
- `REDIS_URL`.
- `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET_*`, identifiants d’accès.
- `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, URLs de callback.
- `APP_WEB_URL`, `APP_LMS_URL`, `API_URL`.
- `SMTP_*` ou paramètres du fournisseur email.
- `PAYMENT_PROVIDER`, clés sandbox/production et secret webhook.
- `OTEL_*`, DSN APM/erreurs.
- CRON/WORKER et paramètres de jobs.
- `FEATURE_*` pour fonctionnalités optionnelles.

## 40. Seed de démonstration et recette

- Les 10 modules de formation FETRAG.
- Une organisation syndicale de démonstration et un responsable.
- Au moins 10 apprenants de test.
- Un formateur, un coordinateur, un éditeur, un finance et un support.
- Un cours pilote complet avec texte, document, vidéo/audio, quiz, devoir, présence et certificat.
- Un événement/Master Class de démonstration.
- Un service gratuit et un service payant.
- Un paiement sandbox réussi, un échoué et un remboursé.
- Une demande institutionnelle dans chaque statut majeur.

## 41. Réversibilité

- Le code source, scripts de build, migrations, documentation et configurations non secrètes appartiennent au périmètre livré.
- Export des utilisateurs/profils, organisations, cours, inscriptions, résultats, certificats, paiements et contenus dans des formats exploitables.
- Export des médias et documents avec leurs métadonnées.
- Procédure documentée pour reconstruire l’environnement à partir d’un dépôt propre et d’une sauvegarde.
- Aucune dépendance à un service SaaS ne doit empêcher la récupération des données essentielles.

## 42. Conclusion

Le choix du monorepo est cohérent avec la vision FETRAG : deux expériences distinctes, mais un produit numérique unifié. La réussite dépend moins du simple choix de Next.js que de la discipline d’architecture : identité standardisée, contrats communs, permissions centralisées, séparation des domaines, tests d’autorisation, services externes derrière des adaptateurs et attention forte au mobile/bas débit. Ce cahier des charges peut être utilisé directement comme document maître pour piloter Claude Code, les revues de développement et la recette FETRAG.
