import { nl2br } from './escape'
import { compose, defineTemplate, greeting, p, summary } from './helpers'
import type { RenderContext } from './types'

/** Bloc récapitulatif commun aux messages du workflow institutionnel. */
function requestSummary(ctx: RenderContext): ReturnType<typeof summary> {
  return summary([
    ['Référence', ctx.esc.reference ?? ''],
    ['Organisation', ctx.esc.organizationName ?? ''],
    ['Modules demandés', ctx.esc.modules ?? ''],
    ['Date souhaitée', ctx.esc.preferredStart ?? ''],
  ])
}

/** Demande de formation soumise. Variables : contactName, reference, organizationName, modules, preferredStart?, dashboardUrl. */
export const trainingRequestSubmitted = defineTemplate({
  key: 'training-request-submitted',
  description: 'Accusé de réception d’une demande de formation institutionnelle',
  category: 'training',
  essential: true,
  requiredVars: ['reference', 'dashboardUrl'],
  render: (ctx) =>
    compose({
      subject: `Demande de formation ${ctx.raw.reference ?? ''} bien reçue`,
      title: 'Votre demande de formation est enregistrée',
      preheader: 'La coordination formation de la FETRAG l’examine sous 5 jours ouvrés.',
      blocks: [
        p(greeting(ctx, 'contactName')),
        p('Nous avons bien reçu la demande de formation de votre organisation. La coordination formation de la FETRAG l’examine et vous répondra dans un délai de cinq jours ouvrés.'),
        requestSummary(ctx),
        p('Vous pouvez suivre l’avancement de la demande, ajouter des pièces et compléter la liste des participants depuis votre espace organisation.'),
      ],
      cta: { label: 'Suivre ma demande', url: ctx.raw.dashboardUrl ?? '' },
    }),
})

/** Complément demandé. Variables : contactName, reference, comment, dashboardUrl. */
export const trainingRequestInfoRequested = defineTemplate({
  key: 'training-request-info-requested',
  description: 'La coordination demande un complément d’information',
  category: 'training',
  essential: true,
  requiredVars: ['reference', 'dashboardUrl'],
  render: (ctx) =>
    compose({
      subject: `Demande ${ctx.raw.reference ?? ''} : complément d’information attendu`,
      title: 'Un complément est nécessaire pour votre demande',
      preheader: 'La coordination formation a besoin de précisions pour instruire votre demande.',
      blocks: [
        p(greeting(ctx, 'contactName')),
        p(`La coordination formation a examiné la demande <strong>${ctx.esc.reference ?? ''}</strong> et souhaite obtenir les précisions suivantes :`),
        summary([['Message de la coordination', nl2br(ctx.raw.comment ?? ''), ctx.raw.comment]]),
        p('Une fois les éléments ajoutés, soumettez à nouveau la demande depuis votre espace : elle reprendra son instruction sans perte de priorité.'),
      ],
      cta: { label: 'Compléter ma demande', url: ctx.raw.dashboardUrl ?? '' },
    }),
})

/** Demande acceptée. Variables : contactName, reference, comment?, proposedStart?, proposedMode?, dashboardUrl. */
export const trainingRequestAccepted = defineTemplate({
  key: 'training-request-accepted',
  description: 'Demande de formation acceptée',
  category: 'training',
  essential: true,
  requiredVars: ['reference', 'dashboardUrl'],
  render: (ctx) =>
    compose({
      subject: `Demande ${ctx.raw.reference ?? ''} acceptée`,
      title: 'Votre demande de formation est acceptée',
      preheader: 'La planification de la session va vous être proposée.',
      blocks: [
        p(greeting(ctx, 'contactName')),
        p(`Bonne nouvelle : la demande <strong>${ctx.esc.reference ?? ''}</strong> a été acceptée par la coordination formation de la FETRAG.`),
        summary([
          ['Date proposée', ctx.esc.proposedStart ?? ''],
          ['Modalité', ctx.esc.proposedMode ?? ''],
          ['Commentaire', nl2br(ctx.raw.comment ?? ''), ctx.raw.comment],
        ]),
        p('La cohorte, le calendrier des sessions et les convocations des participants seront communiqués dès la planification définitive.'),
      ],
      cta: { label: 'Voir la demande', url: ctx.raw.dashboardUrl ?? '' },
    }),
})

/** Demande refusée. Variables : contactName, reference, comment?, dashboardUrl. */
export const trainingRequestRejected = defineTemplate({
  key: 'training-request-rejected',
  description: 'Demande de formation refusée',
  category: 'training',
  essential: true,
  requiredVars: ['reference', 'dashboardUrl'],
  render: (ctx) =>
    compose({
      subject: `Demande ${ctx.raw.reference ?? ''} : réponse de la coordination`,
      title: 'Votre demande n’a pas pu être retenue',
      preheader: 'La coordination formation vous explique sa décision.',
      blocks: [
        p(greeting(ctx, 'contactName')),
        p(`Après examen, la coordination formation n’a pas pu donner suite à la demande <strong>${ctx.esc.reference ?? ''}</strong>.`),
        summary([['Motif', nl2br(ctx.raw.comment ?? ''), ctx.raw.comment]]),
        p('Vous pouvez déposer une nouvelle demande en tenant compte de ces éléments ou contacter la coordination pour en discuter.'),
      ],
      cta: { label: 'Consulter la décision', url: ctx.raw.dashboardUrl ?? '' },
    }),
})

/** Formation planifiée. Variables : contactName, reference, cohortName, startsAt, mode, location?, participantCount?, dashboardUrl. */
export const trainingRequestScheduled = defineTemplate({
  key: 'training-request-scheduled',
  description: 'Formation planifiée : cohorte créée',
  category: 'training',
  essential: true,
  requiredVars: ['reference', 'cohortName', 'dashboardUrl'],
  render: (ctx) =>
    compose({
      subject: `Formation planifiée : ${ctx.raw.cohortName ?? ''}`,
      title: 'Votre formation est planifiée',
      preheader: 'La cohorte est créée et les participants vont recevoir leurs accès.',
      blocks: [
        p(greeting(ctx, 'contactName')),
        p(`La formation liée à la demande <strong>${ctx.esc.reference ?? ''}</strong> est désormais planifiée.`),
        summary([
          ['Cohorte', ctx.esc.cohortName ?? ''],
          ['Début', ctx.esc.startsAt ?? ''],
          ['Modalité', ctx.esc.mode ?? ''],
          ['Lieu', ctx.esc.location ?? ''],
          ['Participants inscrits', ctx.esc.participantCount ?? ''],
        ]),
        p('Chaque participant reçoit un accès personnel à la plateforme de formation ainsi que les convocations aux sessions.'),
      ],
      cta: { label: 'Voir la cohorte', url: ctx.raw.dashboardUrl ?? '' },
    }),
})
