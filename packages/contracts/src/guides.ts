import { z } from 'zod'
import { roles } from './roles'

/**
 * Guides d'utilisation par rôle (site institutionnel et plateforme de formation).
 *
 * Le contenu est décrit par des blocs typés (et non du HTML) afin d'être rendu avec les composants
 * du design system : étapes numérotées, encadrés, tableaux, lexique, questions fréquentes...
 *
 * Mise en forme à l'intérieur des textes (rendue par `renderGuideInline` dans @fetrag/ui) :
 *   - `**Libellé**`  : gras (nom d'un menu, d'un bouton, d'un champ, exactement tel qu'affiché à l'écran) ;
 *   - `` `Bouton` `` : pastille « élément d'interface » (touche, bouton, onglet) ;
 *   - `[texte](https://...)` ou `[texte](/chemin)` : lien.
 * Aucun emoji : les icônes sont référencées par clé (`GuideIconKey`) et instanciées par le rendu.
 */

export const guidePlatforms = ['web', 'lms'] as const
export const guidePlatformSchema = z.enum(guidePlatforms)
export type GuidePlatform = z.infer<typeof guidePlatformSchema>

/** Public d'un guide : un rôle applicatif, ou `MEMBER` (tout compte connecté, site institutionnel). */
export const guideRoleKeys = ['MEMBER', ...roles] as const
export const guideRoleKeySchema = z.enum(guideRoleKeys)
export type GuideRoleKey = z.infer<typeof guideRoleKeySchema>

export const guideTones = ['blue', 'green', 'gold', 'navy'] as const
export type GuideTone = (typeof guideTones)[number]

/** Clés d'icônes autorisées dans les guides (instanciées en icônes lucide par le rendu). */
export const guideIconKeys = [
  'alert-triangle',
  'archive',
  'arrow-right',
  'award',
  'badge-check',
  'ban',
  'bar-chart',
  'bell',
  'book-open',
  'bookmark',
  'building',
  'calendar',
  'check-circle',
  'chevron-right',
  'clipboard-list',
  'clock',
  'compass',
  'credit-card',
  'download',
  'external-link',
  'eye',
  'file-check',
  'file-text',
  'filter',
  'flag',
  'folder',
  'globe',
  'graduation-cap',
  'hand-coins',
  'handshake',
  'headphones',
  'help-circle',
  'history',
  'home',
  'image',
  'inbox',
  'info',
  'key-round',
  'languages',
  'layout-dashboard',
  'life-buoy',
  'lightbulb',
  'link',
  'list-checks',
  'list-tree',
  'lock',
  'log-in',
  'log-out',
  'mail',
  'mail-check',
  'map-pin',
  'megaphone',
  'menu',
  'message-square',
  'monitor',
  'newspaper',
  'notebook',
  'package',
  'pen',
  'phone',
  'pie-chart',
  'play',
  'plus',
  'printer',
  'qr-code',
  'receipt',
  'refresh',
  'rocket',
  'scroll-text',
  'search',
  'send',
  'settings',
  'shield',
  'shield-check',
  'shopping-cart',
  'sliders',
  'smartphone',
  'sparkles',
  'star',
  'table',
  'tag',
  'timer',
  'trash',
  'upload',
  'user',
  'user-plus',
  'users',
  'users-round',
  'video',
  'wallet',
  'wifi-off',
  'wrench',
  'x-circle',
  'zap',
] as const
export const guideIconKeySchema = z.enum(guideIconKeys)
export type GuideIconKey = z.infer<typeof guideIconKeySchema>

/** Texte court non vide (une phrase, un libellé). */
const text = z.string().trim().min(1)
/** Identifiant d'ancre : minuscules, chiffres, tirets. */
const anchor = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Identifiant de section invalide (minuscules, chiffres, tirets)')
  .max(80)

/** Une étape d'une procédure : action à faire, élément à utiliser, où le trouver, résultat attendu. */
export const guideStepSchema = z.object({
  /** L'action, à l'impératif de politesse : « Cliquez sur **Se connecter** ». */
  text: text,
  /** Élément d'interface concerné (bouton, menu, champ), tel qu'affiché : « Se connecter ». */
  ui: text.optional(),
  /** Où le trouver : « en haut à droite », « dans le menu de gauche ». */
  where: text.optional(),
  /** Ce que l'utilisateur doit voir après l'action. */
  result: text.optional(),
  /** Précision, cas particulier ou conseil. */
  note: text.optional(),
  icon: guideIconKeySchema.optional(),
})
export type GuideStep = z.infer<typeof guideStepSchema>

export const guideCalloutTones = ['info', 'tip', 'warning', 'danger', 'success'] as const
export type GuideCalloutTone = (typeof guideCalloutTones)[number]

export const guideStatusTones = ['neutral', 'info', 'success', 'warning', 'danger'] as const
export type GuideStatusTone = (typeof guideStatusTones)[number]

export const guideBlockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('paragraph'), text: text }),
  z.object({
    type: z.literal('steps'),
    title: text.optional(),
    intro: text.optional(),
    items: z.array(guideStepSchema).min(1),
  }),
  z.object({
    type: z.literal('list'),
    title: text.optional(),
    /** `check` : coches vertes (bonnes pratiques), `bullet` : puces. */
    style: z.enum(['bullet', 'check']).optional(),
    items: z.array(text).min(1),
  }),
  z.object({
    type: z.literal('callout'),
    tone: z.enum(guideCalloutTones),
    title: text.optional(),
    text: text,
  }),
  z.object({
    type: z.literal('table'),
    caption: text.optional(),
    columns: z.array(text).min(2),
    rows: z.array(z.array(z.string())).min(1),
  }),
  z.object({
    type: z.literal('definitions'),
    title: text.optional(),
    items: z.array(z.object({ term: text, definition: text })).min(1),
  }),
  z.object({
    type: z.literal('faq'),
    title: text.optional(),
    items: z.array(z.object({ question: text, answer: text })).min(1),
  }),
  z.object({
    /** Chemin de navigation : « Menu de gauche › Contenus › Pages › Nouvelle page ». */
    type: z.literal('path'),
    label: text.optional(),
    items: z.array(text).min(1),
    /** Lien direct vers l'écran (chemin relatif à l'application du guide ou URL absolue). */
    href: text.optional(),
  }),
  z.object({
    /** Description d'un écran zone par zone (« Se repérer »). */
    type: z.literal('screen'),
    title: text,
    description: text.optional(),
    areas: z.array(z.object({ name: text, purpose: text, icon: guideIconKeySchema.optional() })).min(1),
  }),
  z.object({
    type: z.literal('links'),
    title: text.optional(),
    items: z
      .array(
        z.object({
          label: text,
          href: text,
          description: text.optional(),
          external: z.boolean().optional(),
          icon: guideIconKeySchema.optional(),
        }),
      )
      .min(1),
  }),
  z.object({
    /** « Si ça ne marche pas » : problème, cause probable, solution. */
    type: z.literal('troubleshooting'),
    title: text.optional(),
    items: z.array(z.object({ problem: text, cause: text.optional(), solution: text })).min(1),
  }),
  z.object({
    /** Lecture des statuts affichés à l'écran (badges). */
    type: z.literal('statuses'),
    title: text.optional(),
    items: z
      .array(
        z.object({
          label: text,
          tone: z.enum(guideStatusTones),
          meaning: text,
          /** Ce que l'utilisateur peut ou doit faire à ce stade. */
          next: text.optional(),
        }),
      )
      .min(1),
  }),
])
export type GuideBlock = z.infer<typeof guideBlockSchema>

export const guideSubsectionSchema = z.object({
  id: anchor,
  title: text,
  blocks: z.array(guideBlockSchema).min(1),
})
export type GuideSubsection = z.infer<typeof guideSubsectionSchema>

export const guideSectionSchema = z.object({
  id: anchor,
  title: text,
  icon: guideIconKeySchema.optional(),
  /** Une phrase : ce que la section permet de faire. */
  summary: text.optional(),
  blocks: z.array(guideBlockSchema).min(1),
  subsections: z.array(guideSubsectionSchema).optional(),
})
export type GuideSection = z.infer<typeof guideSectionSchema>

// -----------------------------------------------------------------------------
// Autoévaluation : l'utilisateur teste sa maîtrise du guide (questions à choix, corrigé, score)
// -----------------------------------------------------------------------------

export const guideQuestionTypes = ['single', 'multiple', 'true-false'] as const
export type GuideQuestionType = (typeof guideQuestionTypes)[number]

export const guideAssessmentOptionSchema = z.object({
  /** Lettre de l'option : `a`, `b`, `c`... unique dans la question. */
  id: z.string().regex(/^[a-f]$/, 'Identifiant d’option : une lettre de a à f'),
  text: text,
  correct: z.boolean(),
  /** Retour spécifique affiché quand cette option est choisie (facultatif). */
  feedback: text.optional(),
})
export type GuideAssessmentOption = z.infer<typeof guideAssessmentOptionSchema>

export const guideAssessmentQuestionSchema = z
  .object({
    /** Identifiant unique dans le guide (`q-connexion-1`). */
    id: anchor,
    /** Section ou sous-section du guide que la question vérifie (ancre existante). */
    sectionId: anchor,
    type: z.enum(guideQuestionTypes),
    /** Question ou mise en situation, formulée simplement. */
    prompt: text,
    options: z.array(guideAssessmentOptionSchema).min(2).max(6),
    /** Explication affichée après la réponse, qui renvoie au guide. */
    explanation: text,
  })
  .superRefine((question, ctx) => {
    const ids = new Set<string>()
    for (const option of question.options) {
      if (ids.has(option.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['options'], message: `Option ${option.id} en double` })
      ids.add(option.id)
    }
    const correct = question.options.filter((option) => option.correct).length
    if (question.type === 'true-false' && (question.options.length !== 2 || correct !== 1)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['options'], message: 'Une question vrai / faux a deux options dont une seule est correcte' })
    }
    if (question.type === 'single' && correct !== 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['options'], message: 'Une question à choix unique a exactement une option correcte' })
    }
    if (question.type === 'multiple' && (correct < 1 || correct === question.options.length)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['options'], message: 'Une question à choix multiples a au moins une option correcte et une incorrecte' })
    }
  })
export type GuideAssessmentQuestion = z.infer<typeof guideAssessmentQuestionSchema>

export const guideSelfAssessmentSchema = z.object({
  /** Phrase d'introduction : à quoi sert le test, combien de temps. */
  intro: text,
  /** Pourcentage de bonnes réponses à partir duquel le guide est considéré comme maîtrisé. */
  passPercent: z.number().int().min(50).max(100),
  questions: z.array(guideAssessmentQuestionSchema).min(6),
})
export type GuideSelfAssessment = z.infer<typeof guideSelfAssessmentSchema>

export const guideRelatedLinkSchema = z.object({
  label: text,
  href: text,
  description: text.optional(),
  external: z.boolean().optional(),
})
export type GuideRelatedLink = z.infer<typeof guideRelatedLinkSchema>

export const guideSchema = z.object({
  /** Identifiant stable, utilisé dans les URL : `web-membre`, `lms-formateur`... */
  id: anchor,
  platform: guidePlatformSchema,
  role: guideRoleKeySchema,
  title: text,
  subtitle: text,
  /** « Ce guide s'adresse à... » */
  audience: text,
  /** Deux ou trois phrases : ce que le rôle permet de faire. */
  summary: text,
  tone: z.enum(guideTones),
  icon: guideIconKeySchema,
  readingMinutes: z.number().int().positive(),
  /** Date de mise à jour, `AAAA-MM-JJ`. */
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  version: text,
  /** Ce qu'il faut avoir avant de commencer (compte, rôle attribué, appareil...). */
  prerequisites: z.array(text).optional(),
  /** Les premières actions à faire, dans l'ordre (prise en main en cinq minutes). */
  quickStart: z.array(guideStepSchema).optional(),
  sections: z.array(guideSectionSchema).min(1),
  related: z.array(guideRelatedLinkSchema).optional(),
  /** Module d'autoévaluation de la maîtrise du guide (questions, corrigé, seuil de réussite). */
  selfAssessment: guideSelfAssessmentSchema.optional(),
})
export type Guide = z.infer<typeof guideSchema>

/** Métadonnées d'un guide (sans le contenu), pour les listes et les cartes. */
export type GuideMeta = Pick<
  Guide,
  'id' | 'platform' | 'role' | 'title' | 'subtitle' | 'audience' | 'summary' | 'tone' | 'icon' | 'readingMinutes' | 'updatedAt' | 'version'
>

/** Extrait les métadonnées d'un guide (sérialisables, sans les sections). */
export function toGuideMeta(guide: Guide): GuideMeta {
  const { id, platform, role, title, subtitle, audience, summary, tone, icon, readingMinutes, updatedAt, version } = guide
  return { id, platform, role, title, subtitle, audience, summary, tone, icon, readingMinutes, updatedAt, version }
}

/** Compte les sections, les étapes, les questions fréquentes et les questions d'autoévaluation d'un guide. */
export function guideStats(guide: Guide): { sections: number; steps: number; faq: number; questions: number } {
  let steps = guide.quickStart?.length ?? 0
  let faq = 0
  const visit = (blocks: GuideBlock[]) => {
    for (const block of blocks) {
      if (block.type === 'steps') steps += block.items.length
      if (block.type === 'faq') faq += block.items.length
    }
  }
  for (const section of guide.sections) {
    visit(section.blocks)
    for (const sub of section.subsections ?? []) visit(sub.blocks)
  }
  return { sections: guide.sections.length, steps, faq, questions: guide.selfAssessment?.questions.length ?? 0 }
}
