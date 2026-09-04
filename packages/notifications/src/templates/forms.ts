import { nl2br } from './escape'
import { compose, defineTemplate, greeting, p, summary } from './helpers'

/** Accusé de réception d’un formulaire. Variables : fullName, reference, kindLabel, subject?, message. */
export const formReceived = defineTemplate({
  key: 'form-received',
  description: 'Accusé de réception d’un formulaire (contact, adhésion, partenariat, assistance)',
  category: 'requests',
  essential: true,
  requiredVars: ['reference', 'kindLabel'],
  render: (ctx) =>
    compose({
      subject: `Nous avons bien reçu votre message (${ctx.raw.reference ?? ''})`,
      title: 'Votre message est bien arrivé',
      preheader: `Référence ${ctx.raw.reference ?? ''} - réponse sous 48 heures ouvrées.`,
      blocks: [
        p(greeting(ctx, 'fullName')),
        p('Merci de nous avoir écrit. Votre message a été transmis au service concerné de la FETRAG, qui vous répondra dans un délai de 48 heures ouvrées.'),
        summary([
          ['Référence', ctx.esc.reference ?? ''],
          ['Type', ctx.esc.kindLabel ?? ''],
          ['Objet', ctx.esc.subject ?? ''],
          ['Votre message', nl2br(ctx.raw.message ?? ''), ctx.raw.message],
        ]),
      ],
      note: 'Conservez cette référence pour tout échange ultérieur.',
    }),
})

/** Demande de service enregistrée. Variables : fullName, reference, serviceName, dashboardUrl?. */
export const serviceRequestReceived = defineTemplate({
  key: 'service-request-received',
  description: 'Demande de service enregistrée',
  category: 'requests',
  essential: true,
  requiredVars: ['reference', 'serviceName'],
  render: (ctx) =>
    compose({
      subject: `Demande de service ${ctx.raw.reference ?? ''} enregistrée`,
      title: 'Votre demande de service est enregistrée',
      preheader: `${ctx.raw.serviceName ?? ''} - référence ${ctx.raw.reference ?? ''}`,
      blocks: [
        p(greeting(ctx, 'fullName')),
        p(`Votre demande concernant le service <strong>${ctx.esc.serviceName ?? ''}</strong> a été enregistrée sous la référence <strong>${ctx.esc.reference ?? ''}</strong>. Le responsable des services vous tiendra informé de son traitement.`),
      ],
      cta: ctx.has('dashboardUrl') ? { label: 'Suivre ma demande', url: ctx.raw.dashboardUrl ?? '' } : undefined,
    }),
})

/** Changement de statut d’une demande de service. Variables : fullName, reference, serviceName, statusLabel, comment?, dashboardUrl?. */
export const serviceRequestStatus = defineTemplate({
  key: 'service-request-status',
  description: 'Mise à jour du statut d’une demande de service',
  category: 'requests',
  essential: true,
  requiredVars: ['reference', 'statusLabel'],
  render: (ctx) =>
    compose({
      subject: `Demande ${ctx.raw.reference ?? ''} : ${ctx.raw.statusLabel ?? ''}`,
      title: 'Votre demande de service a évolué',
      preheader: `Nouveau statut : ${ctx.raw.statusLabel ?? ''}`,
      blocks: [
        p(greeting(ctx, 'fullName')),
        summary([
          ['Référence', ctx.esc.reference ?? ''],
          ['Service', ctx.esc.serviceName ?? ''],
          ['Nouveau statut', ctx.esc.statusLabel ?? ''],
          ['Message', nl2br(ctx.raw.comment ?? ''), ctx.raw.comment],
        ]),
      ],
      cta: ctx.has('dashboardUrl') ? { label: 'Voir ma demande', url: ctx.raw.dashboardUrl ?? '' } : undefined,
    }),
})

/** Inscription à un événement. Variables : firstName, eventTitle, startsAt, location?, mode?, eventUrl. */
export const eventRegistered = defineTemplate({
  key: 'event-registered',
  description: 'Inscription à un événement ou une Master Class confirmée',
  category: 'general',
  essential: true,
  requiredVars: ['eventTitle', 'startsAt', 'eventUrl'],
  render: (ctx) =>
    compose({
      subject: `Inscription confirmée : ${ctx.raw.eventTitle ?? ''}`,
      title: 'Votre place est réservée',
      preheader: `${ctx.raw.eventTitle ?? ''} - ${ctx.raw.startsAt ?? ''}`,
      blocks: [
        p(greeting(ctx)),
        p(`Votre inscription à <strong>${ctx.esc.eventTitle ?? ''}</strong> est confirmée.`),
        summary([
          ['Date', ctx.esc.startsAt ?? ''],
          ['Lieu', ctx.esc.location ?? ''],
          ['Modalité', ctx.esc.mode ?? ''],
        ]),
      ],
      cta: { label: 'Voir l’événement', url: ctx.raw.eventUrl ?? '' },
    }),
})
