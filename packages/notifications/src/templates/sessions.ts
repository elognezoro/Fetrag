import { compose, defineTemplate, greeting, p, summary } from './helpers'
import type { RenderContext } from './types'

function sessionSummary(ctx: RenderContext): ReturnType<typeof summary> {
  return summary([
    ['Formation', ctx.esc.courseTitle ?? ''],
    ['Session', ctx.esc.sessionTitle ?? ''],
    ['Début', ctx.esc.startsAt ?? ''],
    ['Fin', ctx.esc.endsAt ?? ''],
    ['Modalité', ctx.esc.mode ?? ''],
    ['Lieu', ctx.esc.location ?? ''],
    ['Formateur', ctx.esc.trainerName ?? ''],
  ])
}

/** Convocation à une session. Variables : firstName, sessionTitle, courseTitle, startsAt, endsAt?, mode, location?, trainerName?, meetingUrl?, calendarUrl. */
export const sessionConvocation = defineTemplate({
  key: 'session-convocation',
  description: 'Convocation à une session de formation',
  category: 'sessions',
  essential: true,
  requiredVars: ['sessionTitle', 'startsAt', 'calendarUrl'],
  render: (ctx) =>
    compose({
      subject: `Convocation : ${ctx.raw.sessionTitle ?? ''} - ${ctx.raw.startsAt ?? ''}`,
      title: 'Convocation à votre session de formation',
      preheader: `${ctx.raw.sessionTitle ?? ''} le ${ctx.raw.startsAt ?? ''}`,
      blocks: [
        p(greeting(ctx)),
        p('Vous êtes convoqué à la session suivante. Votre présence sera enregistrée par le formateur et prise en compte dans votre assiduité.'),
        sessionSummary(ctx),
        ...(ctx.has('meetingUrl')
          ? [p(`Lien de connexion : <a href="${ctx.esc.meetingUrl ?? ''}">${ctx.esc.meetingUrl ?? ''}</a>`, `Lien de connexion : ${ctx.raw.meetingUrl ?? ''}`)]
          : []),
      ],
      cta: { label: 'Voir mon calendrier', url: ctx.raw.calendarUrl ?? '' },
      note: 'En cas d’empêchement, prévenez votre formateur ou la coordination formation au plus tôt.',
    }),
})

/** Rappel 24 h avant une session. Mêmes variables que la convocation. */
export const sessionReminder = defineTemplate({
  key: 'session-reminder',
  description: 'Rappel : session dans 24 heures',
  category: 'sessions',
  essential: false,
  requiredVars: ['sessionTitle', 'startsAt', 'calendarUrl'],
  render: (ctx) =>
    compose({
      subject: `Rappel : ${ctx.raw.sessionTitle ?? ''} demain`,
      title: 'Votre session a lieu dans 24 heures',
      preheader: `${ctx.raw.sessionTitle ?? ''} - ${ctx.raw.startsAt ?? ''}`,
      blocks: [
        p(greeting(ctx)),
        p('Petit rappel : votre session de formation approche. Vérifiez le lieu ou le lien de connexion et préparez les documents demandés par votre formateur.'),
        sessionSummary(ctx),
        ...(ctx.has('meetingUrl')
          ? [p(`Lien de connexion : <a href="${ctx.esc.meetingUrl ?? ''}">${ctx.esc.meetingUrl ?? ''}</a>`, `Lien de connexion : ${ctx.raw.meetingUrl ?? ''}`)]
          : []),
      ],
      cta: { label: 'Voir mon calendrier', url: ctx.raw.calendarUrl ?? '' },
      unsubscribeUrl: `${ctx.webUrl}/espace/notifications`,
    }),
})
