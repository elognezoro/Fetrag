# Format des contenus pédagogiques (seed FETRAG)

Ce document décrit la structure des champs JSON utilisés par le seed pour les activités,
les questions et les réponses. Les lots LMS core, UI et apps doivent lire et écrire ces
formats à l'identique. Les schémas Zod de référence pour les réponses sont dans
`packages/contracts/src/index.ts` (`answerResponseSchema`, `completionRulesSchema`,
`certificateCriteriaSchema`).

## 1. `Activity.content` selon `Activity.type`

| Type | Contenu (`content`) | Notes |
| --- | --- | --- |
| `TEXT` | `{ html: string }` | HTML riche (TipTap), assaini avant rendu. Complétion `VIEW`. |
| `VIDEO` | `{ url: string, provider: 'youtube' \| 'file', transcript: string }` | `url` = URL d'intégration (`https://www.youtube.com/embed/<id>`) ou URL de fichier. Une `url` vide signifie « pas de média disponible » : afficher la transcription. `lowBandwidthAlternative` = `{ transcript: string, audioUrl: string \| null }`. |
| `AUDIO` | `{ url: string, transcript: string }` | Même règle : `url` vide = lire la transcription. `lowBandwidthAlternative` identique à VIDEO. |
| `LINK` | `{ url: string, label: string }` | Lien externe ouvert dans un nouvel onglet. |
| `FILE` | `{ resourceId?: string, fileUrl?: string, label: string }` | Soit une `Resource` de la bibliothèque (`Activity.resourceId` est aussi renseigné), soit une URL de fichier directe. La ressource peut pointer vers `externalUrl` (PDF officiel) ou `fileUrl` (stockage). |
| `PRESENTATION` | `{ url: string }` | Fichier ou lien d'intégration (PDF, diaporama). |
| `QUIZ` | `{ kind: 'quiz' }` | La configuration réelle est dans `Quiz` (relation 1-1 par `activityId`) et `QuizQuestion`. Complétion `PASS_SCORE` avec `Activity.passScore`. |
| `SURVEY` | `{ kind: 'survey' }` | `Quiz.isSurvey = true`, `passScore = 0`, aucune option correcte, `points = 0`. Complétion `SUBMIT`. |
| `ASSIGNMENT` | `{ caseStudy?: string }` | Le cadre du devoir est dans `Assignment` (relation 1-1) : dépôt fichier et/ou texte, `dueAt`, `maxScore`, `rubric`. Complétion `SUBMIT`. |
| `FORUM` | `{ prompt: string }` | Le `Forum` lié porte `activityId`. Complétion `MANUAL` (ou non obligatoire). |
| `LIVE_SESSION` | `{ format: 'in_person' \| 'virtual' \| 'hybrid', agenda: string[] }` | La séance est décrite par `LiveSession` (`activityId`, `trainingSessionId`). Complétion `ATTEND` : achevée lorsque `Attendance.status` est `PRESENT` ou `LATE` pour la `TrainingSession` liée. |

`Activity.lowBandwidthAlternative` (VIDEO, AUDIO, PRESENTATION lourdes) :

```json
{ "transcript": "texte intégral", "audioUrl": null }
```

## 2. `Assignment.rubric`

```json
[
  { "criterion": "Compréhension du cadre juridique", "maxPoints": 6 },
  { "criterion": "Analyse du cas selon les trois piliers", "maxPoints": 8 },
  { "criterion": "Qualité de la rédaction et de l’argumentation", "maxPoints": 6 }
]
```

`Grade.rubricScores` est un objet `{ [criterion]: points }` dont la somme vaut `Grade.score`.

## 3. `Question.config` et `QuestionOption` selon `Question.type`

| Type | `config` | Options (`QuestionOption`) |
| --- | --- | --- |
| `SINGLE_CHOICE` | absent | `isCorrect = true` sur une seule option. |
| `MULTIPLE_CHOICE` | `{ partialCredit: boolean }` | `isCorrect = true` sur plusieurs options. Avec `partialCredit`, score = points × (bonnes cochées − mauvaises cochées) / bonnes attendues, borné à 0. |
| `TRUE_FALSE` | `{ answer: boolean }` | Deux options `Vrai` / `Faux` (clés stables `true` / `false`), `isCorrect` cohérent avec `answer`. |
| `FILL_BLANK` | `{ text: 'Le ___ du travail…', answers: [['Code', 'code']], caseSensitive: false }` | Aucune option. `answers[i]` = valeurs acceptées pour le i-ème `___`. |
| `MATCHING` | `{ shuffle: boolean }` | Chaque option est un élément de gauche (`label`) avec sa cible attendue dans `matchValue`. Le client présente les `matchValue` mélangés. |
| `ORDERING` | `{ shuffle: boolean }` | `matchValue` = rang attendu (`'1'`, `'2'`, …) ; `position` = ordre d'affichage initial. |
| `SHORT_ANSWER` | `{ accepted: string[], caseSensitive: boolean }` | Aucune option. Comparaison après trim (et normalisation de casse si `caseSensitive = false`). |
| `ESSAY` | `{ minWords, maxWords, rubric: [{ criterion, maxPoints }], optional?: boolean }` | Aucune option. Corrigé manuellement (`quizzes.gradeEssay`). |

`Question.points` est la valeur par défaut ; `QuizQuestion.points` peut la surcharger dans un quiz donné.

## 4. `Answer.response` (cf. `answerResponseSchema`)

| Type de question | `response` |
| --- | --- |
| `SINGLE_CHOICE`, `MULTIPLE_CHOICE` | `{ type: 'choice', optionIds: string[] }` |
| `TRUE_FALSE` | `{ type: 'boolean', value: boolean }` |
| `FILL_BLANK` | `{ type: 'blanks', values: string[] }` (une valeur par trou, dans l'ordre) |
| `MATCHING` | `{ type: 'matching', pairs: [{ optionId, value }] }` (`value` = `matchValue` choisi pour l'option) |
| `ORDERING` | `{ type: 'ordering', optionIds: string[] }` (ordre proposé par l'apprenant) |
| `SHORT_ANSWER`, `ESSAY` | `{ type: 'text', value: string }` |

`Answer.isCorrect`, `Answer.score` et `Answer.feedback` sont renseignés par la correction ;
`Attempt.score / maxScore / percent / passed` agrègent les réponses.

## 5. Règles d'achèvement et critères de certificat

`CourseVersion.completionRules` (`completionRulesSchema`) :

```json
{ "requireAllActivities": true, "requiredActivityIds": [], "passScore": 60, "minAttendanceRate": 0 }
```

`Enrollment.progressPercent` = activités obligatoires achevées / activités obligatoires (`isRequired = true`)
de la version suivie, arrondi. L'inscription passe en `COMPLETED` quand toutes les activités obligatoires
sont achevées (ou celles de `requiredActivityIds` si `requireAllActivities = false`).

`CertificateTemplate.criteria` (`certificateCriteriaSchema`) :

```json
{ "minScore": 60, "minAttendanceRate": 50, "requireCompletion": true }
```

## 6. Autres JSON du seed

- `Page.blocks` (page `la-fetrag`) : tableau de blocs typés `hero`, `section` (`html`), `list` (`items`),
  `values` (`items: { title, text }`), `governance` (`html`, `members: { name, role }`),
  `triptych` (`pillars: { key, title, text }` avec `key` ∈ `protection | prevention | defense`).
- `Service.formSchema` : `{ fields: [{ name, label, type: 'text' | 'textarea' | 'number' | 'select' | 'checkboxes', required, options? }] }`.
- `ServiceRequest.payload`, `FormSubmission.payload` : valeurs saisies, clés = `fields[].name`.
- `Certificate.metadata` : `{ courseCode, cohortCode, sequence, issuedBy }`.
- `SystemSetting` : `site.motto` (string[]), `training.participantLimit` (number), `certificates.sequence` (number), `api.keys` (array).

## 7. Identifiants et idempotence

Les entités sans clé naturelle (modules, leçons, activités, questions, options, sessions, événements de statut…)
reçoivent un identifiant déterministe `stableId(...)` (UUID de forme v5 dérivé d'une clé métier, voir `helpers.ts`).
Les entités à clé naturelle sont upsertées par `email`, `slug`, `code`, `key`, `reference`, `number` ou contrainte
composée. Relancer `pnpm db:seed` met à jour les données sans doublon ; les dates relatives (cohorte, sessions,
échéances) sont recalculées à partir de la date d'exécution.
