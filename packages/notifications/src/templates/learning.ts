import { nl2br } from './escape'
import { compose, defineTemplate, greeting, p, summary } from './helpers'

/** Inscription confirmée. Variables : firstName, courseTitle, courseUrl, cohortName?, startsAt?, durationHours?. */
export const enrollmentConfirmed = defineTemplate({
  key: 'enrollment-confirmed',
  description: 'Inscription à une formation confirmée',
  category: 'training',
  essential: true,
  requiredVars: ['courseTitle', 'courseUrl'],
  render: (ctx) =>
    compose({
      subject: `Inscription confirmée : ${ctx.raw.courseTitle ?? ''}`,
      title: 'Votre inscription est confirmée',
      preheader: `Vous êtes inscrit à la formation ${ctx.raw.courseTitle ?? ''}.`,
      blocks: [
        p(greeting(ctx)),
        p(`Votre inscription à la formation <strong>${ctx.esc.courseTitle ?? ''}</strong> est confirmée. Vous pouvez commencer dès maintenant ou consulter le programme et les prochaines sessions.`),
        summary([
          ['Cohorte', ctx.esc.cohortName ?? ''],
          ['Début', ctx.esc.startsAt ?? ''],
          ['Durée', ctx.has('durationHours') ? `${ctx.esc.durationHours ?? ''} heures` : ''],
        ]),
      ],
      cta: { label: 'Commencer la formation', url: ctx.raw.courseUrl ?? '' },
    }),
})

/** Devoir en retard. Variables : firstName, assignmentTitle, courseTitle, dueAt, assignmentUrl, lateAllowed? */
export const assignmentLate = defineTemplate({
  key: 'assignment-late',
  description: 'Rappel : devoir non remis après l’échéance',
  category: 'assignments',
  essential: false,
  requiredVars: ['assignmentTitle', 'dueAt', 'assignmentUrl'],
  render: (ctx) =>
    compose({
      subject: `Devoir en retard : ${ctx.raw.assignmentTitle ?? ''}`,
      title: 'Un devoir attend votre remise',
      preheader: `L’échéance du devoir ${ctx.raw.assignmentTitle ?? ''} est dépassée.`,
      blocks: [
        p(greeting(ctx)),
        p(`L’échéance du devoir <strong>${ctx.esc.assignmentTitle ?? ''}</strong> de la formation <strong>${ctx.esc.courseTitle ?? ''}</strong> est dépassée depuis le ${ctx.esc.dueAt ?? ''}.`),
        p(
          ctx.raw.lateAllowed === 'false'
            ? 'Les remises tardives ne sont pas acceptées pour ce devoir : contactez votre formateur pour convenir d’une solution.'
            : 'Les remises tardives restent possibles : déposez votre travail dès que possible pour qu’il soit corrigé et pris en compte dans votre progression.',
        ),
      ],
      cta: { label: 'Déposer mon devoir', url: ctx.raw.assignmentUrl ?? '' },
      unsubscribeUrl: `${ctx.webUrl}/espace/notifications`,
    }),
})

/** Résultat disponible. Variables : firstName, activityTitle, courseTitle, score, maxScore?, passed ('true'|'false'), feedback?, resultUrl. */
export const resultAvailable = defineTemplate({
  key: 'result-available',
  description: 'Résultat d’évaluation ou note de devoir disponible',
  category: 'results',
  essential: false,
  requiredVars: ['activityTitle', 'score', 'resultUrl'],
  render: (ctx) => {
    const passed = ctx.raw.passed === 'true'
    const scoreLabel = ctx.has('maxScore') ? `${ctx.esc.score ?? ''} / ${ctx.esc.maxScore ?? ''}` : (ctx.esc.score ?? '')
    return compose({
      subject: `Résultat disponible : ${ctx.raw.activityTitle ?? ''}`,
      title: passed ? 'Félicitations, évaluation réussie' : 'Votre résultat est disponible',
      preheader: `Résultat de ${ctx.raw.activityTitle ?? ''} : ${scoreLabel.replace(/<[^>]+>/g, '')}`,
      blocks: [
        p(greeting(ctx)),
        p(`Le résultat de <strong>${ctx.esc.activityTitle ?? ''}</strong> (${ctx.esc.courseTitle ?? ''}) est disponible.`),
        summary([
          ['Score', scoreLabel],
          ['Statut', ctx.has('passed') ? (passed ? 'Réussi' : 'Non validé') : ''],
          ['Commentaire du formateur', nl2br(ctx.raw.feedback ?? ''), ctx.raw.feedback],
        ]),
        p(passed ? 'Continuez sur cette lancée : la prochaine activité vous attend.' : 'Vous pouvez consulter la correction et, si le nombre de tentatives le permet, repasser l’évaluation.'),
      ],
      cta: { label: 'Voir le détail', url: ctx.raw.resultUrl ?? '' },
      unsubscribeUrl: `${ctx.webUrl}/espace/notifications`,
    })
  },
})

/** Certificat émis. Variables : firstName, courseTitle, certificateNumber, kindLabel?, certificateUrl, verifyUrl. */
export const certificateIssued = defineTemplate({
  key: 'certificate-issued',
  description: 'Attestation ou certificat émis',
  category: 'certificates',
  essential: true,
  requiredVars: ['courseTitle', 'certificateNumber', 'certificateUrl'],
  render: (ctx) => {
    const kind = ctx.esc.kindLabel || 'Attestation'
    return compose({
      subject: `${kind} disponible : ${ctx.raw.courseTitle ?? ''}`,
      title: `Votre ${kind.toLowerCase()} est disponible`,
      preheader: `Numéro ${ctx.raw.certificateNumber ?? ''} - vérifiable en ligne.`,
      blocks: [
        p(greeting(ctx)),
        p(`Félicitations : vous avez satisfait aux conditions de la formation <strong>${ctx.esc.courseTitle ?? ''}</strong>. Votre document officiel est prêt à être téléchargé.`),
        summary([
          ['Document', kind],
          ['Numéro', ctx.esc.certificateNumber ?? ''],
          ['Vérification publique', ctx.has('verifyUrl') ? `<a href="${ctx.esc.verifyUrl ?? ''}">${ctx.esc.verifyUrl ?? ''}</a>` : '', ctx.raw.verifyUrl],
        ]),
        p('Le code QR imprimé sur le document permet à tout tiers de vérifier son authenticité sans exposer vos données personnelles.'),
      ],
      cta: { label: 'Télécharger mon document', url: ctx.raw.certificateUrl ?? '' },
    })
  },
})
