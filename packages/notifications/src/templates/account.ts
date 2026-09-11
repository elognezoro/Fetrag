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

/**
 * Invitation d'un compte créé par la coordination ou l'administration : le destinataire définit lui-même son mot de passe
 * (aucun mot de passe ne transite par email). Variables : firstName, setPasswordUrl, expiresDays ; courseTitle, organizationName (optionnelles).
 */
export const accountInvitation = defineTemplate({
  key: 'account-invitation',
  description: 'Invitation à définir son mot de passe (compte créé par la coordination ou l’administration)',
  category: 'account',
  essential: true,
  requiredVars: ['setPasswordUrl'],
  render: (ctx) => {
    const expiresDays = ctx.raw.expiresDays ?? '7'
    const intro = ctx.has('organizationName')
      ? `Un compte a été créé pour vous sur la plateforme de la Fédération des Travailleurs du Gabon à la demande de ${ctx.esc.organizationName}.`
      : 'Un compte a été créé pour vous sur la plateforme de la Fédération des Travailleurs du Gabon.'
    return compose({
      subject: 'Votre compte de formation FETRAG est prêt : définissez votre mot de passe',
      title: 'Votre compte de formation est prêt',
      preheader: 'Définissez votre mot de passe pour accéder à formation.fetrag.ga.',
      blocks: [
        p(greeting(ctx)),
        p(intro),
        ...(ctx.has('courseTitle') || ctx.has('organizationName')
          ? [
              summary([
                ['Formation', ctx.esc.courseTitle ?? ''],
                ['Organisation', ctx.esc.organizationName ?? ''],
              ]),
            ]
          : []),
        p(
          'Il vous reste une étape : choisissez votre mot de passe en cliquant sur le bouton ci-dessous. Vous pourrez ensuite vous connecter sur fetrag.ga et sur la plateforme de formation avec la même adresse email.',
        ),
      ],
      cta: { label: 'Définir mon mot de passe', url: ctx.raw.setPasswordUrl ?? '' },
      note: `Ce lien est valable ${expiresDays} jour${expiresDays === '1' ? '' : 's'}. Passé ce délai, utilisez « Mot de passe oublié » sur la page de connexion pour recevoir un nouveau lien. Si vous n’attendiez pas cette invitation, contactez la coordination formation de la FETRAG.`,
    })
  },
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

/** Validation de l'adresse email après inscription. Variables : firstName, verifyUrl, expiresHours. */
export const emailVerification = defineTemplate({
  key: 'email-verification',
  description: 'Lien de validation de l’adresse email après création de compte',
  category: 'security',
  essential: true,
  requiredVars: ['verifyUrl'],
  render: (ctx) =>
    compose({
      subject: 'Confirmez votre adresse email - FETRAG',
      title: 'Confirmez votre adresse email',
      preheader: 'Une dernière étape pour activer votre compte FETRAG.',
      blocks: [
        p(greeting(ctx)),
        p(
          'Merci de votre inscription sur la plateforme de la Fédération des Travailleurs du Gabon. Pour activer votre compte et vous connecter, confirmez votre adresse email en cliquant sur le bouton ci-dessous.',
        ),
      ],
      cta: { label: 'Confirmer mon adresse email', url: ctx.raw.verifyUrl ?? '' },
      note: `Ce lien expire dans ${ctx.raw.expiresHours ?? '24'} heures. Si vous n’êtes pas à l’origine de cette inscription, ignorez ce message : aucun compte ne sera activé.`,
    }),
})

/** Confirmation après changement de mot de passe. Variables : firstName, loginUrl, changedAt. */
export const passwordChanged = defineTemplate({
  key: 'password-changed',
  description: 'Confirmation de modification du mot de passe',
  category: 'security',
  essential: true,
  requiredVars: ['loginUrl'],
  render: (ctx) =>
    compose({
      subject: 'Votre mot de passe FETRAG a été modifié',
      title: 'Mot de passe modifié',
      preheader: 'Le mot de passe de votre compte FETRAG vient d’être changé.',
      blocks: [
        p(greeting(ctx)),
        p(`Le mot de passe de votre compte vient d’être modifié${ctx.raw.changedAt ? ` le ${ctx.esc.changedAt}` : ''}. Vous pouvez dès maintenant vous connecter avec votre nouveau mot de passe.`),
      ],
      cta: { label: 'Me connecter', url: ctx.raw.loginUrl ?? '' },
      note: 'Si vous n’êtes pas à l’origine de cette modification, réinitialisez immédiatement votre mot de passe et prévenez le support de la FETRAG.',
    }),
})
