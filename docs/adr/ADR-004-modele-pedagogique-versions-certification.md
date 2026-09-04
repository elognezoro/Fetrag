# ADR-004 - Modèle pédagogique, versionnement des cours, règles d'achèvement et certification

- Statut : accepté (septembre 2026)
- Contexte : chapitres 12-13, LMS-07, LMS-17, LMS-18, LMS-22.

## Décision

- Hiérarchie : `Course → CourseVersion → CourseModule → Lesson → Activity`. Une inscription (`Enrollment`) et une cohorte (`Cohort`) pointent vers une **version** précise ; publier une nouvelle version ne modifie jamais le contenu suivi par une cohorte en cours ou terminée.
- `CourseVersion.completionRules` (JSON validé par Zod) : `{ requireAllActivities, requiredActivityIds, passScore, minAttendanceRate }`. `Activity.completionRule` : `VIEW | TIME_SPENT | PASS_SCORE | SUBMIT | ATTEND | MANUAL`. La progression (`Enrollment.progressPercent`) est recalculée côté serveur par `@fetrag/lms-core` à chaque complétion (opération idempotente : `ActivityCompletion` unique par inscription + activité).
- Banque de questions : `Question` (versionnée, catégorisée, taguée) réutilisée dans plusieurs quiz via `QuizQuestion` ; la correction automatique couvre QCU, QCM, vrai/faux, texte à trous, appariement, ordre et réponse courte ; composition et devoirs sont corrigés par le formateur (`Grade`).
- Certification : `CertificateTemplate.criteria` `{ minScore, minAttendanceRate, requireCompletion }` ; l'émission (`lms-core/certification.ts`) vérifie les critères, génère un numéro `FETRAG-AAAA-NNNNNN` et un `verifyCode` aléatoire, puis un job `certificate.render` produit le PDF (pdf-lib + QR) dans le stockage privé. Vérification publique sur `fetrag.ga/certificats/verifier/[code]` sans exposer d'autres données que nom, intitulé, date, statut.
- Le catalogue initial (10 modules du Programme de formation des Leaders Syndicaux 2026) est chargé par le seed, chaque module étant un `Course` rattaché à un pilier du triptyque fondateur.
