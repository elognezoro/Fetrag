# Options d'hébergement, coûts indicatifs et engagements de service

Ce document éclaire la décision de cadrage n° 3 du CDC (chapitre 36 : « hébergement cloud managé, dédié ou hybride ; localisation et politique de données ») et propose les engagements SLA / RPO / RTO (décision n° 12). Les montants sont des ordres de grandeur publics constatés en 2026, hors taxes, à confirmer par devis ; ils excluent les frais du PSP (pourcentage par transaction) et la production pédagogique.

Fichiers associés : `infra/docker/*` (images et compose de référence), `infra/proxy/Caddyfile`, `docs/deployment/VERCEL.md`, `docs/runbooks/deploiement.md`, `docs/runbooks/restauration-base.md`, `docs/runbooks/supervision.md`.

## 1. Composants à héberger

| Composant | Rôle | Besoin |
| --- | --- | --- |
| `apps/web` | fetrag.ga (Next.js) | Node 22, sortie `standalone` ou plateforme Next.js |
| `apps/lms` | formation.fetrag.ga (Next.js) | idem |
| API `/api/v1` | montée dans les apps ; `apps/api` autonome en option | Node 22 |
| File de jobs | cron HTTP (Vercel) ou `apps/worker` (processus long) | accès base |
| PostgreSQL 16 | source de vérité, extensions `unaccent`, `pg_trgm` | sauvegardes, PITR souhaité |
| Stockage objet | médias, pièces jointes, PDF (certificats, reçus) | S3-compatible ou Vercel Blob, buckets public / privé |
| Email sortant | SMTP transactionnel | domaine `fetrag.ga` authentifié (SPF, DKIM, DMARC) |
| Reverse proxy / CDN | TLS, en-têtes, compression, cache | fourni par Vercel, ou Caddy |
| Supervision | uptime, alertes, logs | service externe ou outils de la plateforme |

## 2. Option A - Vercel + Neon (référence actuelle, ADR-001)

Architecture retenue pour la recette : deux projets Vercel (`fetrag-web`, `fetrag-lms`), base Neon, stockage Vercel Blob (ou S3 externe), cron Vercel pour les jobs.

| Aspect | Détail |
| --- | --- |
| Avantages | Aucune administration serveur ; déploiement continu depuis GitHub avec prévisualisations par PR ; CDN mondial et TLS automatiques ; mise à l'échelle automatique ; PITR Neon ; coût nul à faible au démarrage |
| Limites | Fonctions serverless bornées (60 s pour le cron, 25 jobs par appel) ; latence de la file de jobs (5 min) ; données hébergées hors du Gabon (régions Vercel `cdg1` Paris / `iad1` Washington, Neon `eu-central-1` ou `us-east-1`) ; dépendance à deux SaaS (réversibilité assurée par Docker + `pg_dump`, chapitre 41) |
| Coût mensuel indicatif | **Découverte** : Vercel Hobby (0 €, usage non commercial - inadapté à la production) + Neon Free (0 €, 0,5 Go, historique 1 jour). **Production recommandée** : Vercel Pro 20 $/membre + Neon Launch 19 $ (10 Go, historique 7 jours, autoscaling) + Blob ~5 $ (50 Go) + SMTP transactionnel 15-35 $ (Brevo, Postmark, Resend selon volume) + uptime 0-20 $ ≈ **80 à 120 $ / mois** pour un membre Vercel ; ajouter 20 $ par membre supplémentaire de l'équipe technique. **Croissance** (pics de trafic, vidéo) : Vercel Pro avec dépassements de bande passante (~0,15 $/Go au-delà de 1 To) + Neon Scale 69 $ ≈ 150 à 300 $ / mois |
| Réversibilité | Code et Docker fournis ; `pg_dump` quotidien hors Neon ; copie du stockage Blob vers S3 (`scripts/backup.md`) ; migration vers l'option B en une journée d'exploitation |

## 3. Option B - Docker sur VPS ou serveur dédié (auto-hébergé)

Compose de référence : `infra/docker/docker-compose.yml` (PostgreSQL 16, MinIO, web, lms, api, worker, Caddy). Convient à un hébergeur en Afrique centrale ou en Europe, ou à un serveur au siège de la FETRAG si la connectivité et l'alimentation le permettent (déconseillé pour la production sans onduleur et double liaison).

| Aspect | Détail |
| --- | --- |
| Avantages | Maîtrise complète ; localisation des données au choix (hébergeur gabonais ou régional si disponible) ; coût fixe ; worker de jobs en continu (latence de quelques secondes) ; aucune dépendance SaaS |
| Limites | Exige un exploitant compétent (mises à jour du système, Docker, sauvegardes, supervision, sécurité) ; pas de PITR natif (sauvegardes `pg_dump` + WAL archiving à mettre en place, ou base managée séparée) ; haute disponibilité = second serveur + réplication ; CDN à ajouter (Cloudflare) pour les visiteurs éloignés |
| Coût mensuel indicatif | **VPS** 4 vCPU / 8 Go / 160 Go : 25 à 50 € (Hetzner, OVH, Scaleway) ; **dédié** entrée de gamme 60 à 120 € ; stockage objet externe optionnel (Scaleway / OVH ~0,01 €/Go) 5 à 15 € ; SMTP 15 à 35 € ; sauvegardes externalisées 5 à 10 € ; Cloudflare Free ou Pro 20 $. Total ≈ **60 à 150 € / mois** + **temps d'exploitation** (estimer 2 à 4 jours-personne par mois, soit le premier poste de coût) |
| Réversibilité | Totale : images reconstructibles depuis le dépôt ; base et objets sur disque |

Variante B' : Docker pour les applications + PostgreSQL managé (Neon, Scaleway, OVH) pour bénéficier des sauvegardes gérées : +15 à 70 € / mois, exploitation allégée.

## 4. Option C - Cloud managé (conteneurs)

Applications en conteneurs sur un service managé (AWS ECS/Fargate ou App Runner, Google Cloud Run, Azure Container Apps, Scaleway Serverless Containers), base PostgreSQL managée (RDS, Cloud SQL, Scaleway RDB), stockage S3, worker en service permanent.

| Aspect | Détail |
| --- | --- |
| Avantages | Mise à l'échelle, sauvegardes et PITR managés, choix de la région (Afrique du Sud pour AWS/Azure/Google : `af-south-1`, `southafricanorth`, `africa-south1` ; Europe sinon), conformité et SLA contractuels, IAM fin (SEC-08) |
| Limites | Complexité et coût supérieurs ; compétences cloud requises (infrastructure as code recommandée) ; facturation à l'usage difficile à prévoir ; latence depuis Libreville comparable aux options A/B selon la région |
| Coût mensuel indicatif | 2 services conteneurs (0,5 vCPU / 1 Go, toujours actifs) 40 à 80 $ + worker 15 à 25 $ + PostgreSQL managé (2 vCPU / 4 Go, multi-AZ optionnel) 60 à 180 $ + S3 5 à 15 $ + répartiteur de charge 20 à 30 $ + logs / supervision 10 à 30 $ + SMTP 15 à 35 $ ≈ **180 à 400 $ / mois** |
| Réversibilité | Bonne (conteneurs standards, `pg_dump`), dépendance aux services IAM / réseau du fournisseur |

## 5. Comparatif et recommandation

| Critère | A. Vercel + Neon | B. Docker / VPS | C. Cloud managé |
| --- | --- | --- | --- |
| Mise en service | Immédiate (déjà en place) | 1 à 2 jours | 3 à 5 jours (IaC) |
| Coût mensuel | 80-120 $ | 60-150 € + exploitation | 180-400 $ |
| Charge d'exploitation | Très faible | Élevée | Moyenne |
| Localisation des données | Europe / USA | Au choix | Région au choix (Afrique du Sud possible) |
| Disponibilité atteignable | 99,9 % (SLA Vercel Pro 99,99 % plateforme) | 99,5 % mono-serveur ; 99,9 % avec 2 nœuds | 99,9 % + |
| PITR / sauvegardes | Neon (7-30 j) + `pg_dump` | `pg_dump` + WAL à mettre en place | Managé |
| Jobs asynchrones | Cron 5 min | Worker continu | Worker continu |
| Réversibilité | Docker + dumps | Native | Conteneurs + dumps |

**Recommandation** : démarrer et lancer la V1 sur l'option A (déjà opérationnelle, coût maîtrisé, effort d'exploitation minimal, PITR), avec la sauvegarde logique quotidienne hors Neon et l'environnement Docker maintenu comme plan de secours et preuve de réversibilité. Réévaluer après 6 à 12 mois d'usage réel selon trois signaux : exigence de localisation des données (décision politique de la FETRAG), volume vidéo / bande passante (coût Vercel), latence de la file de jobs (passage au worker). Un passage vers B' (Docker + base managée) est alors la voie la plus économique ; C répond à une exigence de conformité ou de haute disponibilité contractuelle.

## 6. Engagements de service proposés (SLA, RPO, RTO)

Valeurs proposées pour la V1 (chapitre 24), à contractualiser au cadrage :

| Engagement | Proposition V1 | Mesure | Moyen |
| --- | --- | --- | --- |
| Disponibilité mensuelle (vitrine, LMS, API) | **99,5 %** (≤ 3 h 39 d'indisponibilité par mois) hors maintenance planifiée annoncée 48 h à l'avance, plafonnée à 4 h par mois | Sondes uptime externes toutes les minutes sur `/api/health` (`supervision.md`) | Option A : plateforme à 99,99 %, marge pour les incidents applicatifs |
| RPO (perte de données maximale) | **≤ 1 h** pour la base ; ≤ 24 h pour le stockage objet | Date de la dernière restauration possible | PITR Neon (secondes) + `pg_dump` quotidien ; versioning / copie du stockage |
| RTO (délai de rétablissement) | **≤ 4 h** pour un incident majeur (base, plateforme) ; ≤ 1 h pour un rollback applicatif | Chronologie du journal d'incident | Runbooks `restauration-base.md`, `deploiement.md` ; exercice trimestriel |
| Délai de prise en charge des incidents | P1 : 1 h (24 h/24) ; P2 : 4 h ouvrées ; P3 : 2 jours ouvrés | Journal d'incident | Astreinte à définir (`incident-securite.md`, section 5) |
| Performance | LCP < 2,5 s, INP < 200 ms, CLS < 0,1 au p75 mobile ; API p95 < 500 ms | Web Vitals, logs | Revue mensuelle |
| Sauvegardes | Quotidiennes, rétention 30 j + 12 mensuelles, chiffrées, hors site ; test de restauration trimestriel | Fichier daté, compte rendu d'exercice | `scripts/backup.md` |
| Sécurité | Correctif des vulnérabilités critiques sous 7 jours, majeures sous 30 jours ; rotation des secrets selon `rotation-secrets.md` | Registre | CI, revue trimestrielle |
| Support utilisateurs | Première réponse 1 jour ouvré, résolution 2 jours ouvrés (niveau 1) | Tickets | `guides/support.md` |

Ces engagements supposent : un exploitant identifié avec astreinte, la supervision active, les sauvegardes planifiées et un contrat de maintenance (corrective, préventive, évolutive) couvrant les mises à jour de Next.js, Prisma et des dépendances (SEC-06).

## 7. Liste de vérification pour un nouvel hébergement

1. Choisir l'option et la région ; documenter la décision (ADR).
2. Provisionner base (extensions `unaccent`, `pg_trgm`), stockage (buckets public / privé), SMTP (SPF / DKIM / DMARC), DNS.
3. Renseigner les variables (`.env.example`) ; générer les secrets (`rotation-secrets.md`).
4. Déployer (`deploiement.md`) ; appliquer les migrations ; restaurer la base depuis un dump si migration d'hébergeur (`restauration-base.md`, procédure B).
5. Vérifier : santé, SSO, paiement sandbox, email, stockage, cron / worker, recherche.
6. Activer la supervision et les sauvegardes ; réaliser un test de restauration.
7. Mettre à jour `docs/deployment/` et ce document avec les coûts réels constatés.
