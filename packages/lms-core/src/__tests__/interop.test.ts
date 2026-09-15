import { describe, expect, it } from 'vitest'
import { questionInputSchema } from '../questionBank'
import { parseGift, parseMoodleXml, serializeQuestions, toGift, toMoodleXml, type InteropQuestion } from '../interop'

/** Un exemplaire de chaque type de question, conforme à `questionInputSchema`. */
const SAMPLES: Record<string, InteropQuestion> = {
  SINGLE_CHOICE: {
    type: 'SINGLE_CHOICE',
    prompt: 'Quel bouton ouvre la session ?',
    explanation: 'Le bouton Se connecter ouvre la session.',
    category: 'Prise en main',
    points: 2,
    options: [
      { label: 'Se connecter', isCorrect: true, feedback: 'Exact.' },
      { label: 'Publier', isCorrect: false },
      { label: 'Fermer', isCorrect: false },
    ],
    config: {},
  },
  MULTIPLE_CHOICE: {
    type: 'MULTIPLE_CHOICE',
    prompt: 'Que pouvez-vous modifier dans votre profil ?',
    category: 'Profil',
    points: 3,
    options: [
      { label: 'Votre téléphone', isCorrect: true },
      { label: 'Votre nom', isCorrect: true },
      { label: 'Le rôle des autres', isCorrect: false },
    ],
    config: {},
  },
  TRUE_FALSE: {
    type: 'TRUE_FALSE',
    prompt: 'Le code de vérification est demandé à chaque connexion.',
    points: 1,
    options: [],
    config: { answer: true },
  },
  SHORT_ANSWER: {
    type: 'SHORT_ANSWER',
    prompt: 'Quelle est la devise de la FETRAG ?',
    points: 1,
    options: [],
    config: { accepted: ['Travail Efficacité Solidarité', 'Travail, Efficacité, Solidarité'], caseSensitive: false },
  },
  MATCHING: {
    type: 'MATCHING',
    prompt: 'Associez chaque rôle à sa mission.',
    points: 2,
    options: [
      { label: 'Formateur', isCorrect: true, matchValue: 'Anime les cohortes' },
      { label: 'Coordination', isCorrect: true, matchValue: 'Instruit les demandes' },
    ],
    config: { distractors: ['Gère la paie'] },
  },
  ORDERING: {
    type: 'ORDERING',
    prompt: 'Classez les étapes de la demande de formation.',
    points: 2,
    options: [
      { label: 'Déposer la demande', isCorrect: true, position: 0 },
      { label: 'Décision de la coordination', isCorrect: true, position: 1 },
      { label: 'Création de la cohorte', isCorrect: true, position: 2 },
    ],
    config: {},
  },
  FILL_BLANK: {
    type: 'FILL_BLANK',
    prompt: 'Complétez la devise.',
    points: 1,
    options: [],
    config: { text: 'Travail, {{1}} et {{2}}.', answers: [['Efficacité'], ['Solidarité']] },
  },
  ESSAY: {
    type: 'ESSAY',
    prompt: 'Expliquez le rôle du dialogue social.',
    points: 5,
    options: [],
    config: {},
  },
}

/** Vérifie qu'une question importée est acceptée par le schéma de la banque de questions. */
function assertValid(q: InteropQuestion) {
  const parsed = questionInputSchema.safeParse(q)
  expect(parsed.success, parsed.success ? '' : JSON.stringify(parsed.error?.issues)).toBe(true)
}

describe('interopérabilité Moodle XML', () => {
  it('exporte puis réimporte chaque type sans perte de sens', () => {
    for (const [type, sample] of Object.entries(SAMPLES)) {
      const xml = toMoodleXml([sample])
      const { questions, warnings } = parseMoodleXml(xml)
      expect(warnings.filter((w) => !w.message.includes('non pris en charge')), `${type}: ${JSON.stringify(warnings)}`).toEqual([])
      expect(questions, `${type} manquant`).toHaveLength(1)
      const q = questions[0]!
      expect(q.type, `${type} type`).toBe(type)
      assertValid(q)
    }
  })

  it('préserve les bonnes réponses des choix', () => {
    const xml = toMoodleXml([SAMPLES.SINGLE_CHOICE!, SAMPLES.MULTIPLE_CHOICE!])
    const { questions } = parseMoodleXml(xml)
    const single = questions.find((q) => q.type === 'SINGLE_CHOICE')!
    expect(single.options?.filter((o) => o.isCorrect).map((o) => o.label)).toEqual(['Se connecter'])
    const multi = questions.find((q) => q.type === 'MULTIPLE_CHOICE')!
    expect(multi.options?.filter((o) => o.isCorrect).map((o) => o.label).sort()).toEqual(['Votre nom', 'Votre téléphone'])
  })

  it('préserve la réponse vrai / faux', () => {
    const xml = toMoodleXml([{ ...SAMPLES.TRUE_FALSE!, config: { answer: false } }])
    const { questions } = parseMoodleXml(xml)
    expect((questions[0]!.config as { answer: boolean }).answer).toBe(false)
  })

  it('préserve les paires et l’ordre', () => {
    const matchXml = toMoodleXml([SAMPLES.MATCHING!])
    const match = parseMoodleXml(matchXml).questions[0]!
    expect(match.options?.map((o) => `${o.label}=${o.matchValue}`)).toContain('Formateur=Anime les cohortes')
    const orderXml = toMoodleXml([SAMPLES.ORDERING!])
    const order = parseMoodleXml(orderXml).questions[0]!
    expect(order.options?.map((o) => o.label)).toEqual(['Déposer la demande', 'Décision de la coordination', 'Création de la cohorte'])
  })

  it('préserve les trous et leurs réponses (cloze)', () => {
    const xml = toMoodleXml([SAMPLES.FILL_BLANK!])
    const q = parseMoodleXml(xml).questions[0]!
    expect(q.type).toBe('FILL_BLANK')
    const config = q.config as { answers: string[][] }
    expect(config.answers).toEqual([['Efficacité'], ['Solidarité']])
  })

  it('regroupe les questions par catégorie', () => {
    const xml = toMoodleXml([SAMPLES.SINGLE_CHOICE!])
    expect(xml).toContain('$course$/top/Prise en main')
    const q = parseMoodleXml(xml).questions[0]!
    expect(q.category).toBe('Prise en main')
  })

  it('importe un fichier Moodle rédigé à la main', () => {
    const xml = `<?xml version="1.0"?>
      <quiz>
        <question type="category"><category><text>$course$/top/Droit</text></category></question>
        <question type="multichoice">
          <name><text>Q1</text></name>
          <questiontext format="html"><text><![CDATA[<p>Le Code du travail encadre-t-il le licenciement&nbsp;?</p>]]></text></questiontext>
          <single>true</single>
          <answer fraction="100"><text>Oui</text><feedback><text>Exact</text></feedback></answer>
          <answer fraction="0"><text>Non</text></answer>
        </question>
        <question type="essay"><name><text>Q2</text></name><questiontext format="html"><text>Expliquez.</text></questiontext></question>
      </quiz>`
    const { questions, warnings } = parseMoodleXml(xml)
    expect(warnings).toEqual([])
    expect(questions).toHaveLength(2)
    expect(questions[0]!.type).toBe('SINGLE_CHOICE')
    expect(questions[0]!.category).toBe('Droit')
    expect(questions[0]!.prompt).toContain('licenciement')
    expect(questions[0]!.options?.find((o) => o.isCorrect)?.label).toBe('Oui')
    expect(questions[1]!.type).toBe('ESSAY')
  })

  it('signale les types non pris en charge sans planter', () => {
    const xml = `<quiz><question type="calculated"><name><text>X</text></name><questiontext><text>?</text></questiontext></question></quiz>`
    const { questions, warnings } = parseMoodleXml(xml)
    expect(questions).toHaveLength(0)
    expect(warnings.some((w) => w.message.includes('non pris en charge'))).toBe(true)
  })

  it('renvoie un avertissement sur un XML illisible', () => {
    const { questions, warnings } = parseMoodleXml('<quiz><question>')
    expect(questions).toHaveLength(0)
    expect(warnings.length).toBeGreaterThan(0)
  })
})

describe('interopérabilité GIFT', () => {
  it('exporte puis réimporte chaque type pris en charge', () => {
    for (const [type, sample] of Object.entries(SAMPLES)) {
      if (type === 'ORDERING') continue
      const { content } = toGift([sample])
      const { questions, warnings } = parseGift(content)
      expect(warnings, `${type}: ${JSON.stringify(warnings)}`).toEqual([])
      expect(questions, `${type} manquant`).toHaveLength(1)
      expect(questions[0]!.type, `${type}`).toBe(type)
      assertValid(questions[0]!)
    }
  })

  it('ignore le classement à l’export et le signale', () => {
    const { skipped, content } = toGift([SAMPLES.ORDERING!])
    expect(skipped).toHaveLength(1)
    expect(skipped[0]!.type).toBe('ORDERING')
    expect(content).not.toContain('Déposer la demande')
  })

  it('préserve les bonnes réponses (choix unique et multiple)', () => {
    const single = parseGift(toGift([SAMPLES.SINGLE_CHOICE!]).content).questions[0]!
    expect(single.type).toBe('SINGLE_CHOICE')
    expect(single.options?.filter((o) => o.isCorrect).map((o) => o.label)).toEqual(['Se connecter'])
    const multi = parseGift(toGift([SAMPLES.MULTIPLE_CHOICE!]).content).questions[0]!
    expect(multi.type).toBe('MULTIPLE_CHOICE')
    expect(multi.options?.filter((o) => o.isCorrect).map((o) => o.label).sort()).toEqual(['Votre nom', 'Votre téléphone'])
  })

  it('importe un fichier GIFT rédigé à la main', () => {
    const gift = `// commentaire
$CATEGORY: Formation

::Devise:: Quelle est la devise de la FETRAG ? {
=Travail Efficacité Solidarité
}

Le Gabon est en Afrique centrale. {TRUE}

Associez : {
=Formateur -> Anime
=Coordination -> Instruit
}`
    const { questions, warnings } = parseGift(gift)
    expect(warnings).toEqual([])
    expect(questions).toHaveLength(3)
    expect(questions[0]!.type).toBe('SHORT_ANSWER')
    expect(questions[0]!.category).toBe('Formation')
    expect(questions[1]!.type).toBe('TRUE_FALSE')
    expect((questions[1]!.config as { answer: boolean }).answer).toBe(true)
    expect(questions[2]!.type).toBe('MATCHING')
  })

  it('gère l’échappement des caractères spéciaux', () => {
    const q: InteropQuestion = {
      type: 'SINGLE_CHOICE',
      prompt: 'Combien font 50% de 200 = ? {calcul}',
      points: 1,
      options: [
        { label: '100', isCorrect: true },
        { label: '~50', isCorrect: false },
      ],
      config: {},
    }
    const round = parseGift(toGift([q]).content).questions[0]!
    expect(round.prompt).toContain('50%')
    expect(round.prompt).toContain('{calcul}')
    expect(round.options?.map((o) => o.label)).toEqual(['100', '~50'])
  })
})

describe('serializeQuestions', () => {
  it('choisit le bon format', () => {
    expect(serializeQuestions([SAMPLES.ESSAY!], 'moodle-xml').content).toContain('<quiz>')
    expect(serializeQuestions([SAMPLES.ESSAY!], 'gift').content).toContain('::')
  })

  it('écarte les questions à choix sans bonne réponse (questions d’enquête)', () => {
    const survey: InteropQuestion = {
      type: 'SINGLE_CHOICE',
      prompt: 'Le contenu du module répond à mes attentes.',
      points: 1,
      options: [
        { label: 'Tout à fait', isCorrect: false },
        { label: 'Plutôt oui', isCorrect: false },
        { label: 'Plutôt non', isCorrect: false },
      ],
      config: {},
    }
    for (const format of ['moodle-xml', 'gift'] as const) {
      const result = serializeQuestions([survey, SAMPLES.ESSAY!], format)
      expect(result.skipped.map((s) => s.type)).toContain('SINGLE_CHOICE')
      expect(result.content).not.toContain('répond à mes attentes')
      // La composition (gradable) reste exportée.
      expect(result.content).toContain('Expliquez le rôle du dialogue social')
    }
  })
})
