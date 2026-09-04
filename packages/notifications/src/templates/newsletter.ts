import { compose, defineTemplate, p } from './helpers'

/** Confirmation d’inscription à la newsletter (double opt-in). Variables : confirmUrl, unsubscribeUrl?. */
export const newsletterConfirmation = defineTemplate({
  key: 'newsletter-confirmation',
  description: 'Confirmation d’abonnement à la lettre d’information (double opt-in)',
  category: 'marketing',
  essential: true,
  requiredVars: ['confirmUrl'],
  render: (ctx) =>
    compose({
      subject: 'Confirmez votre abonnement à la lettre de la FETRAG',
      title: 'Une dernière étape pour recevoir nos actualités',
      preheader: 'Confirmez votre adresse pour activer l’abonnement.',
      blocks: [
        p('Bonjour,'),
        p('Vous avez demandé à recevoir la lettre d’information de la Fédération des Travailleurs du Gabon : actualités, formations, événements et ressources. Pour activer l’abonnement, confirmez votre adresse email.'),
      ],
      cta: { label: 'Confirmer mon abonnement', url: ctx.raw.confirmUrl ?? '' },
      note: 'Si vous n’êtes pas à l’origine de cette demande, ignorez simplement ce message : aucun envoi ne sera effectué.',
      unsubscribeUrl: ctx.raw.unsubscribeUrl,
    }),
})

/** Lettre d’information. Variables : title, intro?, contentHtml (TrustedHtml assaini par le CMS), unsubscribeUrl. */
export const newsletter = defineTemplate({
  key: 'newsletter',
  description: 'Lettre d’information (marketing, consentement NEWSLETTER requis)',
  category: 'marketing',
  essential: false,
  requiredVars: ['title', 'contentHtml', 'unsubscribeUrl'],
  render: (ctx) =>
    compose({
      subject: ctx.raw.title ?? 'Lettre d’information FETRAG',
      title: ctx.raw.title ?? 'Lettre d’information FETRAG',
      preheader: ctx.raw.intro,
      blocks: [
        ...(ctx.has('intro') ? [p(ctx.esc.intro ?? '')] : []),
        { html: ctx.esc.contentHtml ?? '', text: ctx.raw.contentHtml ?? '' },
      ],
      cta: ctx.has('ctaUrl') && ctx.has('ctaLabel') ? { label: ctx.raw.ctaLabel ?? '', url: ctx.raw.ctaUrl ?? '' } : undefined,
      unsubscribeUrl: ctx.raw.unsubscribeUrl,
    }),
})
