# Runbook - Révocation d'un certificat ou d'une attestation

| | |
| --- | --- |
| Exigences couvertes | LMS-07 (numéro unique, QR, statut, révocation), WEB-16 (vérification publique), SHR-07 (audit) |
| Rôles | Coordinateur formation (`certificate.revoke`), Super administrateur ; Support pour la communication ; Formateur pour l'instruction pédagogique |
| Composants | `@fetrag/lms-core` → `certification.revoke(principal, certificateId, reason)`, `certification.verify(code)`, `certification.issue`, job `certificate.render`, tables `Certificate`, `CertificateVerificationEvent`, `AuditLog` |
| Écrans | LMS : `/coordination` (onglet Certificats), `/certificats/[id]` (côté apprenant) ; vitrine : `/certificats/verifier/[code]` |

## 1. Motifs de révocation

| Motif | Exemples | Décideur |
| --- | --- | --- |
| Fraude ou usurpation | Quiz passé par un tiers, dépôt de devoir plagié, identité incorrecte | Coordination, après contradictoire avec l'apprenant et avis du formateur |
| Erreur d'émission | Critères non remplis (score, assiduité) à cause d'une note corrigée après coup, mauvais modèle, nom mal orthographié | Coordination |
| Décision administrative | Exclusion de l'organisation, non-paiement avéré d'une formation payante, demande de l'apprenant (droit de rectification) | Coordination sur instruction du Secrétariat général |
| Sécurité | Code de vérification exposé publiquement et réutilisé abusivement | Coordination + exploitant (`incident-securite.md`) |

Une révocation est **définitive et publique** : la page de vérification affiche « Révoqué ». Pour une erreur de nom ou de modèle, préférer « révoquer puis réémettre » (section 4) afin que l'apprenant conserve un document valide.

## 2. Ce que fait la révocation

`certification.revoke` :

1. Vérifie que l'acteur possède `certificate.revoke` (rôle global COORDINATOR ou SUPER_ADMIN).
2. Passe `Certificate.status` à `REVOKED`, renseigne `revokedAt` et `revokedReason` (motif obligatoire, conservé pour l'audit et affiché à l'apprenant, jamais au public).
3. Écrit une entrée `AuditLog` (`certificate.revoked`, acteur, avant/après) et émet l'événement `certificate.revoked` (notification interne à l'apprenant).
4. Ne supprime **ni** la ligne, **ni** le PDF : le numéro `FETRAG-AAAA-NNNNNN` reste réservé et ne sera jamais réattribué.

La vérification publique (`certification.verify(code)`) renvoie ensuite `valid: false`, `status: REVOKED`, avec le nom du titulaire, l'intitulé et la date d'émission (données minimales du CDC, WEB-16). Chaque vérification est journalisée dans `CertificateVerificationEvent` (IP hachée, agent utilisateur, résultat).

## 3. Procédure

1. **Constituer le dossier** : numéro du certificat, identité de l'apprenant, cohorte, motif détaillé, pièces (captures, avis du formateur, courrier). Conserver le dossier hors plateforme (archives de la coordination).
2. **Contradictoire** : sauf urgence de sécurité, informer l'apprenant par écrit et lui laisser un délai de réponse (5 jours ouvrés recommandés) - la plateforme n'automatise pas cette étape.
3. **Révoquer** dans le LMS : `/coordination` → Certificats → rechercher par numéro ou par apprenant → « Révoquer » → saisir le motif (obligatoire, 500 caractères max) → confirmer. Le bouton n'apparaît pas pour les rôles sans `certificate.revoke`.
4. **Contrôler** : `/certificats/verifier/<code>` sur la vitrine affiche le statut « Révoqué » ; dans l'espace de l'apprenant, `/certificats` montre le badge « Révoqué » et le PDF n'est plus proposé au téléchargement.
5. **Notifier** : l'apprenant reçoit une notification interne. Envoyer en complément un courrier officiel de la coordination (motif, voies de recours). Si une organisation avait demandé la formation, son responsable voit le statut mis à jour dans `/organisation/rapports`.
6. **Journaliser** : consigner la décision dans le registre de la coordination avec la référence de l'entrée `AuditLog` (visible dans `/admin` → Journal d'audit, action `certificate.revoked`).

## 4. Réémission après correction

Cas : nom mal orthographié, score corrigé, mauvais modèle (attestation au lieu de certificat).

1. Corriger la donnée source : profil de l'apprenant (`firstName`, `lastName`), note (`quizzes.gradeEssay`, `assignments.grade`), présence (`attendance.record`).
2. Révoquer le certificat erroné (section 3) avec le motif « Réémission - correction de ... ».
3. Réémettre : `/coordination` → Certificats → « Émettre » pour l'inscription concernée (ou « Émettre pour la cohorte » qui ignore les inscriptions déjà certifiées valides). `certification.issue` vérifie de nouveau l'éligibilité (`checkEligibility` : achèvement, score minimal, taux d'assiduité selon `CertificateTemplate.criteria`), attribue le **numéro suivant** de la séquence (`SystemSetting certificates.sequence`) et un nouveau `verifyCode`, puis met en file `certificate.render`.
4. Le PDF est disponible après le prochain cycle de jobs (5 minutes au plus sur Vercel). Vérifier `/certificats/verifier/<nouveau code>` → « Valide ».

Le certificat révoqué et le nouveau coexistent dans l'historique de l'apprenant ; seul le nouveau est valide.

## 5. Cas particuliers

- **Expiration** : si le modèle prévoit une durée de validité, `expiresAt` est renseigné à l'émission et la vérification renvoie `status: EXPIRED` passé cette date. Aucune action manuelle.
- **Révocation en masse** (fraude sur une cohorte entière) : traiter certificat par certificat depuis la liste filtrée par cohorte ; il n'existe pas de révocation groupée volontairement (chaque décision est individuelle et auditée). Pour plus de 50 certificats, un script utilisant `certification.revoke` en boucle avec le principal de la coordination est acceptable, à exécuter par l'exploitant et à documenter.
- **Contestation acceptée** : la révocation étant irréversible, la réponse est une réémission (section 4) ; le motif de la réémission mentionne l'issue du recours.
- **PDF déjà diffusé** : le document papier ou PDF continue de circuler ; c'est précisément le rôle du QR / code de vérification. Rappeler aux employeurs et partenaires de vérifier systématiquement sur `fetrag.ga/certificats/verifier`.
- **Code de vérification abusé** (vérifications massives depuis une même origine) : la route est limitée en débit (SEC-04) ; consulter `CertificateVerificationEvent` pour la volumétrie, et appliquer `incident-securite.md` si un scraping est suspecté.
