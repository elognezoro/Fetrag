import { guideSchema, type Guide, type GuideBlock } from '@fetrag/contracts'

export interface GuideValidationIssue {
  guideId: string
  path: string
  message: string
}

/** Emoji et pictogrammes : interdits dans l'interface (icônes lucide uniquement). */
const emojiPattern = /\p{Extended_Pictographic}/u

function* textsOf(block: GuideBlock, path: string): Generator<[string, string]> {
  switch (block.type) {
    case 'paragraph':
      yield [`${path}.text`, block.text]
      break
    case 'steps':
      if (block.title) yield [`${path}.title`, block.title]
      if (block.intro) yield [`${path}.intro`, block.intro]
      for (const [i, step] of block.items.entries()) {
        yield [`${path}.items[${i}].text`, step.text]
        if (step.result) yield [`${path}.items[${i}].result`, step.result]
        if (step.note) yield [`${path}.items[${i}].note`, step.note]
        if (step.where) yield [`${path}.items[${i}].where`, step.where]
        if (step.ui) yield [`${path}.items[${i}].ui`, step.ui]
      }
      break
    case 'list':
      if (block.title) yield [`${path}.title`, block.title]
      for (const [i, item] of block.items.entries()) yield [`${path}.items[${i}]`, item]
      break
    case 'callout':
      if (block.title) yield [`${path}.title`, block.title]
      yield [`${path}.text`, block.text]
      break
    case 'table':
      if (block.caption) yield [`${path}.caption`, block.caption]
      for (const [i, column] of block.columns.entries()) yield [`${path}.columns[${i}]`, column]
      for (const [r, row] of block.rows.entries()) for (const [c, cell] of row.entries()) yield [`${path}.rows[${r}][${c}]`, cell]
      break
    case 'definitions':
      for (const [i, item] of block.items.entries()) {
        yield [`${path}.items[${i}].term`, item.term]
        yield [`${path}.items[${i}].definition`, item.definition]
      }
      break
    case 'faq':
      for (const [i, item] of block.items.entries()) {
        yield [`${path}.items[${i}].question`, item.question]
        yield [`${path}.items[${i}].answer`, item.answer]
      }
      break
    case 'path':
      if (block.label) yield [`${path}.label`, block.label]
      for (const [i, item] of block.items.entries()) yield [`${path}.items[${i}]`, item]
      break
    case 'screen':
      yield [`${path}.title`, block.title]
      if (block.description) yield [`${path}.description`, block.description]
      for (const [i, area] of block.areas.entries()) {
        yield [`${path}.areas[${i}].name`, area.name]
        yield [`${path}.areas[${i}].purpose`, area.purpose]
      }
      break
    case 'links':
      for (const [i, item] of block.items.entries()) {
        yield [`${path}.items[${i}].label`, item.label]
        if (item.description) yield [`${path}.items[${i}].description`, item.description]
      }
      break
    case 'troubleshooting':
      for (const [i, item] of block.items.entries()) {
        yield [`${path}.items[${i}].problem`, item.problem]
        if (item.cause) yield [`${path}.items[${i}].cause`, item.cause]
        yield [`${path}.items[${i}].solution`, item.solution]
      }
      break
    case 'statuses':
      for (const [i, item] of block.items.entries()) {
        yield [`${path}.items[${i}].label`, item.label]
        yield [`${path}.items[${i}].meaning`, item.meaning]
        if (item.next) yield [`${path}.items[${i}].next`, item.next]
      }
      break
  }
}

function checkText(guideId: string, path: string, value: string, issues: GuideValidationIssue[]): void {
  if (emojiPattern.test(value)) issues.push({ guideId, path, message: 'Emoji interdit (utiliser une icône)' })
  const bold = (value.match(/\*\*/g) ?? []).length
  if (bold % 2 !== 0) issues.push({ guideId, path, message: 'Marqueur de gras `**` non refermé' })
  const ticks = (value.match(/`/g) ?? []).length
  if (ticks % 2 !== 0) issues.push({ guideId, path, message: 'Marqueur de pastille ` non refermé' })
  if (/\[[^\]]+\]\((?![a-z]+:\/\/|\/|#|mailto:|tel:|\{\{(?:web|lms)\}\})/.test(value)) {
    issues.push({ guideId, path, message: 'Lien sans destination valide (URL absolue, chemin « /… », {{web}}/…, {{lms}}/…, ancre ou mailto:)' })
  }
}

/**
 * Vérifie la structure d'un guide (schéma Zod), l'unicité des ancres, l'absence d'emoji et
 * l'équilibre des marqueurs de mise en forme. Retourne la liste des problèmes (vide si tout est correct).
 */
export function validateGuide(guide: Guide): GuideValidationIssue[] {
  const issues: GuideValidationIssue[] = []
  const parsed = guideSchema.safeParse(guide)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) issues.push({ guideId: guide.id, path: issue.path.join('.'), message: issue.message })
    return issues
  }

  const anchors = new Set<string>()
  for (const [s, section] of guide.sections.entries()) {
    const sectionPath = `sections[${s}]`
    if (anchors.has(section.id)) issues.push({ guideId: guide.id, path: `${sectionPath}.id`, message: `Ancre en double : ${section.id}` })
    anchors.add(section.id)
    checkText(guide.id, `${sectionPath}.title`, section.title, issues)
    if (section.summary) checkText(guide.id, `${sectionPath}.summary`, section.summary, issues)
    for (const [b, block] of section.blocks.entries()) {
      for (const [path, value] of textsOf(block, `${sectionPath}.blocks[${b}]`)) checkText(guide.id, path, value, issues)
    }
    for (const [u, sub] of (section.subsections ?? []).entries()) {
      const subPath = `${sectionPath}.subsections[${u}]`
      if (anchors.has(sub.id)) issues.push({ guideId: guide.id, path: `${subPath}.id`, message: `Ancre en double : ${sub.id}` })
      anchors.add(sub.id)
      checkText(guide.id, `${subPath}.title`, sub.title, issues)
      for (const [b, block] of sub.blocks.entries()) {
        for (const [path, value] of textsOf(block, `${subPath}.blocks[${b}]`)) checkText(guide.id, path, value, issues)
      }
    }
  }
  for (const [i, step] of (guide.quickStart ?? []).entries()) {
    checkText(guide.id, `quickStart[${i}].text`, step.text, issues)
    if (step.result) checkText(guide.id, `quickStart[${i}].result`, step.result, issues)
    if (step.note) checkText(guide.id, `quickStart[${i}].note`, step.note, issues)
  }
  for (const [i, item] of (guide.prerequisites ?? []).entries()) checkText(guide.id, `prerequisites[${i}]`, item, issues)
  for (const field of ['title', 'subtitle', 'audience', 'summary'] as const) checkText(guide.id, field, guide[field], issues)

  if (guide.selfAssessment) {
    checkText(guide.id, 'selfAssessment.intro', guide.selfAssessment.intro, issues)
    const questionIds = new Set<string>()
    for (const [q, question] of guide.selfAssessment.questions.entries()) {
      const qPath = `selfAssessment.questions[${q}]`
      if (questionIds.has(question.id)) issues.push({ guideId: guide.id, path: `${qPath}.id`, message: `Question en double : ${question.id}` })
      questionIds.add(question.id)
      if (!anchors.has(question.sectionId)) {
        issues.push({ guideId: guide.id, path: `${qPath}.sectionId`, message: `Section inconnue : ${question.sectionId}` })
      }
      checkText(guide.id, `${qPath}.prompt`, question.prompt, issues)
      checkText(guide.id, `${qPath}.explanation`, question.explanation, issues)
      for (const [o, option] of question.options.entries()) {
        checkText(guide.id, `${qPath}.options[${o}].text`, option.text, issues)
        if (option.feedback) checkText(guide.id, `${qPath}.options[${o}].feedback`, option.feedback, issues)
      }
    }
  }
  return issues
}

/** Valide un ensemble de guides et vérifie l'unicité des identifiants et des couples plateforme / rôle. */
export function validateGuides(list: Guide[]): GuideValidationIssue[] {
  const issues = list.flatMap(validateGuide)
  const ids = new Set<string>()
  const pairs = new Set<string>()
  for (const guide of list) {
    if (ids.has(guide.id)) issues.push({ guideId: guide.id, path: 'id', message: 'Identifiant de guide en double' })
    ids.add(guide.id)
    const pair = `${guide.platform}:${guide.role}`
    if (pairs.has(pair)) issues.push({ guideId: guide.id, path: 'role', message: `Plusieurs guides pour ${pair}` })
    pairs.add(pair)
  }
  return issues
}
