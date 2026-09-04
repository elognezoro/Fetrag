import { compose, defineTemplate, greeting, list, p, summary } from './helpers'

/** Bienvenue après création de compte. Variables : firstName, loginUrl. */
export const welcome = defineTemplate({
  key: 'welcome',
  description: 'Bienvenue après création de compte',
  category: 'account',
  essential: true,
  requiredVars: ['loginUrl'],
  render: (ctx) =>
    compose({
      subject: 'Bienvenue à la FETRAG',
      title: 'Bienvenue dans votre espace FETRAG',
      preheader: 'Votre compte est prêt : formations, services et ressources vous attendent.',
      blocks: [
        p(greeting(ctx)),
        p(
          'Votre compte vient d’être créé. Il vous donne accès au site institutionnel de la Fédération des Travailleurs du Gabon et à la plateforme de formation formation.fetrag.ga avec un seul identifiant.',
        ),
        list([
          'Consulter le catalogue et vous inscrire aux formations',
          'Suivre vos demandes, inscriptions et paiements dans votre espace personnel',
          'Télécharger les ressources et attestations qui vous concernent',
        ]),
      ],
      cta: { label: 'Accéder à mon espace', url: ctx.raw.loginUrl ?? '' },
    }),
})

/** Compte créé par la coordination (participant d’une formation institutionnelle). Variables : firstName, email, temporaryPassword, loginUrl. */
export const accountCreated = defineTemplate({
  key: 'account-created',
  description: 'Compte créé par la coordination avec mot de passe provisoire',
  category: 'account',
  essential: true,
  requiredVars: ['email', 'temporaryPassword', 'loginUrl'],
  render: (ctx) =>
    compose({
      subject: 'Votre accès à la plateforme de formation FETRAG',
      title: 'Votre compte de formation a été créé',
      preheader: 'Identifiants d’accès à formation.fetrag.ga',
      blocks: [
        p(greeting(ctx)),
        p(
          'Votre organisation vous a inscrit à une formation de la FETRAG. Un compte a été créé pour vous sur la plateforme de formation.',
        ),
        summary([
          ['Identifiant', ctx.esc.email ?? ''],
          ['Mot de passe provisoire', `<code>${ctx.esc.temporaryPassword ?? ''}</code>`, ctx.raw.temporaryPassword],
        ]),
        p('Pour votre sécurité, modifiez ce mot de passe dès votre première connexion.'),
      ],
      cta: { label: 'Me connecter', url: ctx.raw.loginUrl ?? '' },
      note: 'Si vous n’êtes pas à l’origine de cette inscription, contactez la coordination formation de la FETRAG.',
    }),
})

/** Réinitialisation de mot de passe. Variables : firstName, resetUrl, expiresMinutes. */
export const passwordReset = defineTemplate({
  key: 'password-reset',
  description: 'Lien de réinitialisation du mot de passe',
  category: 'security',
  essential: true,
  requiredVars: ['resetUrl'],
  render: (ctx) =>
    compose({
      subject: 'Réinitialisation de votre mot de passe FETRAG',
      title: 'Réinitialiser votre mot de passe',
      preheader: 'Un lien de réinitialisation vous a été demandé.',
      blocks: [
        p(greeting(ctx)),
        p('Une demande de réinitialisation de mot de passe a été effectuée pour votre compte. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.'),
      ],
      cta: { label: 'Choisir un nouveau mot de passe', url: ctx.raw.resetUrl ?? '' },
      note: `Ce lien expire dans ${ctx.raw.expiresMinutes ?? '30'} minutes. Si vous n’êtes pas à l’origine de cette demande, ignorez ce message : votre mot de passe reste inchangé.`,
    }),
})
