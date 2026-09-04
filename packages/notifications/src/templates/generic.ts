import { nl2br } from './escape'
import { compose, defineTemplate, greeting, p, preferencesUrl } from './helpers'

/** Notification générique (miroir email d’une notification interne). Variables : firstName?, title, body, href?, ctaLabel?. */
export const notification = defineTemplate({
  key: 'notification',
  description: 'Notification interne relayée par email',
  category: 'general',
  essential: false,
  requiredVars: ['title', 'body'],
  render: (ctx) =>
    compose({
      subject: ctx.raw.title ?? 'Notification FETRAG',
      title: ctx.raw.title ?? 'Notification',
      preheader: (ctx.raw.body ?? '').slice(0, 120),
      blocks: [p(greeting(ctx)), p(nl2br(ctx.raw.body ?? ''), ctx.raw.body ?? '')],
      cta: ctx.has('href') ? { label: ctx.raw.ctaLabel || 'Voir le détail', url: ctx.raw.href ?? '' } : undefined,
      unsubscribeUrl: preferencesUrl(ctx),
    }),
})
