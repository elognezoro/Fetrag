import { nl2br } from './escape'
import { compose, defineTemplate, greeting, p, summary } from './helpers'

/** Paiement réussi. Variables : firstName, orderReference, amount (formaté), items, method?, receiptNumber?, orderUrl. */
export const paymentSucceeded = defineTemplate({
  key: 'payment-succeeded',
  description: 'Confirmation de paiement et accès au reçu',
  category: 'payments',
  essential: true,
  requiredVars: ['orderReference', 'amount', 'orderUrl'],
  render: (ctx) =>
    compose({
      subject: `Paiement confirmé - commande ${ctx.raw.orderReference ?? ''}`,
      title: 'Votre paiement est confirmé',
      preheader: `Commande ${ctx.raw.orderReference ?? ''} réglée : ${ctx.raw.amount ?? ''}.`,
      blocks: [
        p(greeting(ctx)),
        p('Nous avons bien reçu votre paiement. Votre commande est validée et le service associé est activé.'),
        summary([
          ['Commande', ctx.esc.orderReference ?? ''],
          ['Contenu', nl2br(ctx.raw.items ?? ''), ctx.raw.items],
          ['Montant', ctx.esc.amount ?? ''],
          ['Moyen de paiement', ctx.esc.method ?? ''],
          ['Reçu', ctx.esc.receiptNumber ?? ''],
        ]),
        p('Votre reçu numéroté est disponible dans votre espace personnel, rubrique Paiements.'),
      ],
      cta: { label: 'Voir ma commande et mon reçu', url: ctx.raw.orderUrl ?? '' },
    }),
})

/** Paiement échoué. Variables : firstName, orderReference, amount, reason?, retryUrl. */
export const paymentFailed = defineTemplate({
  key: 'payment-failed',
  description: 'Paiement refusé ou interrompu',
  category: 'payments',
  essential: true,
  requiredVars: ['orderReference', 'amount', 'retryUrl'],
  render: (ctx) =>
    compose({
      subject: `Paiement non abouti - commande ${ctx.raw.orderReference ?? ''}`,
      title: 'Votre paiement n’a pas abouti',
      preheader: `Le règlement de la commande ${ctx.raw.orderReference ?? ''} a échoué.`,
      blocks: [
        p(greeting(ctx)),
        p(`Le règlement de la commande <strong>${ctx.esc.orderReference ?? ''}</strong> (${ctx.esc.amount ?? ''}) n’a pas pu être confirmé par l’opérateur de paiement.`),
        summary([['Motif communiqué', nl2br(ctx.raw.reason ?? ''), ctx.raw.reason]]),
        p('Aucun montant n’a été prélevé. Vous pouvez relancer le paiement à tout moment ; votre commande reste réservée.'),
      ],
      cta: { label: 'Réessayer le paiement', url: ctx.raw.retryUrl ?? '' },
      note: 'Besoin d’aide ? Écrivez-nous en indiquant la référence de votre commande.',
    }),
})

/** Remboursement effectué. Variables : firstName, orderReference, amount, reason?, orderUrl. */
export const paymentRefunded = defineTemplate({
  key: 'payment-refunded',
  description: 'Remboursement total ou partiel effectué',
  category: 'payments',
  essential: true,
  requiredVars: ['orderReference', 'amount', 'orderUrl'],
  render: (ctx) =>
    compose({
      subject: `Remboursement effectué - commande ${ctx.raw.orderReference ?? ''}`,
      title: 'Votre remboursement a été traité',
      preheader: `${ctx.raw.amount ?? ''} remboursés sur la commande ${ctx.raw.orderReference ?? ''}.`,
      blocks: [
        p(greeting(ctx)),
        p(`Un remboursement de <strong>${ctx.esc.amount ?? ''}</strong> a été effectué sur la commande <strong>${ctx.esc.orderReference ?? ''}</strong>.`),
        summary([['Motif', nl2br(ctx.raw.reason ?? ''), ctx.raw.reason]]),
        p('Selon votre opérateur, le montant peut apparaître sous quelques jours ouvrés sur votre compte.'),
      ],
      cta: { label: 'Voir ma commande', url: ctx.raw.orderUrl ?? '' },
    }),
})
