/** Libellés purs du back-office (importables par les pages et les composants). */

export interface MenuLocationMeta {
  label: string
  description: string
  pillar: 'protection' | 'prevention' | 'defense'
}

export const menuLocationLabels: Record<string, MenuLocationMeta> = {
  HEADER: { label: 'Navigation principale', description: 'Barre de navigation du site institutionnel (fetrag.ga).', pillar: 'protection' },
  FOOTER: { label: 'Pied de page', description: 'Colonnes de liens du pied de page.', pillar: 'prevention' },
  FOOTER_SECONDARY: { label: 'Pied de page secondaire', description: 'Liens légaux et utilitaires en bas de page.', pillar: 'defense' },
  LMS_HEADER: { label: 'Navigation de la plateforme de formation', description: 'Liens affichés dans l’en-tête de formation.fetrag.ga.', pillar: 'protection' },
}

export const refundStatusLabels: Record<string, string> = {
  REQUESTED: 'Demandé',
  APPROVED: 'Approuvé',
  PROCESSED: 'Traité',
  REJECTED: 'Refusé',
}

export const auditActionLabels: Record<string, string> = {
  'auth.login': 'Connexion',
  'auth.logout': 'Déconnexion',
  'auth.password_changed': 'Mot de passe modifié',
  'auth.mfa_enabled': 'MFA activée',
  'user.registered': 'Compte créé',
  'user.updated': 'Compte modifié',
  'role.granted': 'Rôle attribué',
  'role.revoked': 'Rôle révoqué',
  'content.created': 'Contenu créé',
  'content.updated': 'Contenu modifié',
  'content.published': 'Contenu publié',
  'content.archived': 'Contenu archivé ou supprimé',
  'order.created': 'Commande créée',
  'payment.succeeded': 'Paiement réussi',
  'payment.failed': 'Paiement échoué',
  'payment.refunded': 'Remboursement',
  'certificate.issued': 'Certificat émis',
  'certificate.revoked': 'Certificat révoqué',
  'export.generated': 'Export généré',
  'settings.updated': 'Paramètres modifiés',
  'attendance.recorded': 'Présence enregistrée',
}
