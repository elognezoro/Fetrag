import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { guideSchema, scoreSelfAssessment, toGuideMeta, type AssessmentResult, type Guide, type GuideAnswers } from '@fetrag/contracts'

import { GuideCard } from './guide-card'
import { GuideReader } from './guide-reader'
import { GuideSelfAssessment, masteryTones } from './guide-self-assessment'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

const baseUrls = { web: 'https://site.example', lms: 'https://formation.example' }

/** Guide de test : deux sections (dont une sous-section) et six questions couvrant les trois types. */
const guide: Guide = {
  id: 'web-test',
  platform: 'web',
  role: 'MEMBER',
  title: 'Guide de test',
  subtitle: 'Un guide pour tester le module d’autoévaluation',
  audience: 'Toute personne disposant d’un compte.',
  summary: 'Ce guide sert de support aux tests.',
  tone: 'blue',
  icon: 'user',
  readingMinutes: 5,
  updatedAt: '2026-09-01',
  version: '1.0',
  sections: [
    {
      id: 'connexion',
      title: 'Se connecter',
      icon: 'log-in',
      blocks: [{ type: 'paragraph', text: 'Connectez-vous avec votre adresse email.' }],
    },
    {
      id: 'profil',
      title: 'Mon profil',
      icon: 'user',
      blocks: [{ type: 'paragraph', text: 'Mettez à jour vos informations.' }],
      subsections: [{ id: 'profil-photo', title: 'Changer de photo', blocks: [{ type: 'paragraph', text: 'Formats JPG et PNG.' }] }],
    },
  ],
  selfAssessment: {
    intro: 'Six questions pour vérifier que vous savez vous connecter et gérer votre profil.',
    passPercent: 80,
    questions: [
      {
        id: 'q-connexion-1',
        sectionId: 'connexion',
        type: 'single',
        prompt: 'Avec quoi vous connectez-vous ?',
        options: [
          { id: 'a', text: 'Mon adresse **email**', correct: true },
          { id: 'b', text: 'Mon numéro de membre', correct: false, feedback: 'Le numéro de membre ne sert pas à la connexion.' },
          { id: 'c', text: 'Mon nom', correct: false },
        ],
        explanation: 'La connexion se fait toujours avec l’adresse email du compte.',
      },
      {
        id: 'q-connexion-2',
        sectionId: 'connexion',
        type: 'multiple',
        prompt: 'Que faut-il pour se connecter ? (plusieurs réponses)',
        options: [
          { id: 'a', text: 'Une adresse email', correct: true },
          { id: 'b', text: 'Un mot de passe', correct: true },
          { id: 'c', text: 'Une carte bancaire', correct: false },
        ],
        explanation: 'Email et mot de passe suffisent.',
      },
      {
        id: 'q-connexion-3',
        sectionId: 'connexion',
        type: 'true-false',
        prompt: 'Le mot de passe peut être réinitialisé par email.',
        options: [
          { id: 'a', text: 'Vrai', correct: true },
          { id: 'b', text: 'Faux', correct: false },
        ],
        explanation: 'Un lien de réinitialisation est envoyé par email.',
      },
      {
        id: 'q-profil-1',
        sectionId: 'profil',
        type: 'single',
        prompt: 'Où modifier vos informations ?',
        options: [
          { id: 'a', text: 'Dans **Profil**', correct: true },
          { id: 'b', text: 'Dans les paramètres du site', correct: false, feedback: 'Les paramètres du site sont réservés aux administrateurs.' },
        ],
        explanation: 'La rubrique Profil regroupe vos informations.',
      },
      {
        id: 'q-profil-2',
        sectionId: 'profil-photo',
        type: 'true-false',
        prompt: 'Une photo au format GIF est acceptée.',
        options: [
          { id: 'a', text: 'Vrai', correct: false, feedback: 'Seuls les formats JPG et PNG sont acceptés.' },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'Seuls les formats JPG et PNG sont acceptés.',
      },
      {
        id: 'q-profil-3',
        sectionId: 'profil',
        type: 'multiple',
        prompt: 'Quels champs sont facultatifs ?',
        options: [
          { id: 'a', text: 'Le téléphone', correct: true },
          { id: 'b', text: 'L’adresse email', correct: false },
          { id: 'c', text: 'La photo', correct: true },
        ],
        explanation: 'Seule l’adresse email est obligatoire.',
      },
    ],
  },
}

/** Réponses du parcours de test : tout juste sauf la question sur la photo (sous-section de « Mon profil »). */
const plannedAnswers: GuideAnswers = {
  'q-connexion-1': ['a'],
  'q-connexion-2': ['a', 'b'],
  'q-connexion-3': ['a'],
  'q-profil-1': ['a'],
  'q-profil-2': ['a'],
  'q-profil-3': ['a', 'c'],
}

function optionInput(letter: string): HTMLInputElement {
  const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="radio"], input[type="checkbox"]'))
  const input = inputs.find((element) => element.value === letter)
  if (!input) throw new Error(`Option ${letter} introuvable`)
  return input
}

/** Joue les six questions avec les réponses prévues et ouvre l'écran de résultat. */
function playThrough() {
  fireEvent.click(screen.getByRole('button', { name: /Commencer le test|Refaire le test/ }))
  const questions = guide.selfAssessment?.questions ?? []
  questions.forEach((question, index) => {
    expect(screen.getByRole('heading', { level: 3, name: `Question ${index + 1} sur ${questions.length}` })).toBeTruthy()
    for (const letter of plannedAnswers[question.id] ?? []) fireEvent.click(optionInput(letter))
    fireEvent.click(screen.getByRole('button', { name: 'Valider ma réponse' }))
    fireEvent.click(screen.getByRole('button', { name: index + 1 === questions.length ? 'Voir mon résultat' : 'Question suivante' }))
  })
}

afterEach(() => {
  cleanup()
})

describe('GuideSelfAssessment', () => {
  it('le guide de test respecte le schéma et couvre les trois types de questions', () => {
    expect(guideSchema.safeParse(guide).success).toBe(true)
    const types = new Set(guide.selfAssessment?.questions.map((question) => question.type))
    expect([...types].sort()).toEqual(['multiple', 'single', 'true-false'])
  })

  it('n’affiche rien pour un guide sans module d’autoévaluation', () => {
    const { container } = render(<GuideSelfAssessment guide={{ ...guide, selfAssessment: undefined }} baseUrls={baseUrls} onSubmit={vi.fn()} />)
    expect(container.innerHTML).toBe('')
  })

  it('présente le test : questions, durée, seuil et dernier résultat', () => {
    render(
      <GuideSelfAssessment
        guide={guide}
        baseUrls={baseUrls}
        onSubmit={vi.fn()}
        summary={{ count: 3, last: { percent: 80, passed: true, createdAt: '2026-09-12T10:00:00.000Z' }, best: { percent: 90, passed: true, createdAt: '2026-09-05T10:00:00.000Z' } }}
      />,
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Testez votre maîtrise' })).toBeTruthy()
    expect(screen.getByText('Autoévaluation')).toBeTruthy()
    expect(screen.getByText(/Six questions pour vérifier/)).toBeTruthy()
    expect(screen.getByText('6 questions')).toBeTruthy()
    expect(screen.getByText('Environ 3 min')).toBeTruthy()
    expect(screen.getByText('Maîtrisé à partir de 80 % de bonnes réponses')).toBeTruthy()
    expect(screen.getByText('80 % · Maîtrisé').className).toContain('text-green')
    expect(screen.getByText('12 septembre 2026')).toBeTruthy()
    expect(screen.getByText('90 %')).toBeTruthy()
    expect(screen.getByText(/3 tentatives/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Refaire le test' })).toBeTruthy()
  })

  it('parcours complet : retour immédiat, résultat, enregistrement et niveau de maîtrise', async () => {
    const onSubmit = vi.fn(async (answers: GuideAnswers): Promise<AssessmentResult> => {
      const result = scoreSelfAssessment(guide, answers)
      if (!result) throw new Error('Guide sans autoévaluation')
      return result
    })
    const onNavigateSection = vi.fn()
    const { container } = render(<GuideSelfAssessment guide={guide} baseUrls={baseUrls} onSubmit={onSubmit} onNavigateSection={onNavigateSection} />)

    fireEvent.click(screen.getByRole('button', { name: 'Commencer le test' }))

    // Question 1 : choix unique, boutons radio, validation désactivée sans sélection.
    expect(screen.getByRole('heading', { level: 3, name: 'Question 1 sur 6' })).toBeTruthy()
    expect(screen.getByText('Une seule réponse')).toBeTruthy()
    expect(screen.getByRole('radiogroup')).toBeTruthy()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
    expect(container.querySelector('label[for]')?.className).toContain('min-h-14')
    const validate = screen.getByRole('button', { name: 'Valider ma réponse' }) as HTMLButtonElement
    expect(validate.disabled).toBe(true)
    fireEvent.click(optionInput('b'))
    fireEvent.click(optionInput('a'))
    expect(optionInput('a').checked).toBe(true)
    expect(optionInput('b').checked).toBe(false)
    expect(validate.disabled).toBe(false)
    fireEvent.click(validate)
    expect(screen.getByText('Bonne réponse')).toBeTruthy()
    expect(screen.getByText(/La connexion se fait toujours/)).toBeTruthy()
    expect(optionInput('a').disabled).toBe(true)
    const relire = screen.getByRole('link', { name: 'Relire : Se connecter' })
    expect(relire.getAttribute('href')).toBe('#connexion')
    fireEvent.click(relire)
    expect(onNavigateSection).toHaveBeenCalledWith('connexion')
    fireEvent.click(screen.getByRole('button', { name: 'Question suivante' }))

    // Question 2 : choix multiples, cases à cocher.
    expect(screen.getByRole('heading', { level: 3, name: 'Question 2 sur 6' })).toBeTruthy()
    expect(screen.getByText('Plusieurs réponses possibles')).toBeTruthy()
    expect(screen.queryByRole('radiogroup')).toBeNull()
    expect(screen.getAllByRole('checkbox')).toHaveLength(3)
    fireEvent.click(optionInput('a'))
    fireEvent.click(optionInput('b'))
    expect(optionInput('a').checked).toBe(true)
    expect(optionInput('b').checked).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Valider ma réponse' }))
    expect(screen.getByText('Bonne réponse')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Question suivante' }))

    // Question 3 : vrai ou faux.
    expect(screen.getByText('Vrai ou faux')).toBeTruthy()
    expect(screen.getAllByRole('radio')).toHaveLength(2)
    fireEvent.click(optionInput('a'))
    fireEvent.click(screen.getByRole('button', { name: 'Valider ma réponse' }))
    fireEvent.click(screen.getByRole('button', { name: 'Question suivante' }))

    // Question 4.
    fireEvent.click(optionInput('a'))
    fireEvent.click(screen.getByRole('button', { name: 'Valider ma réponse' }))
    fireEvent.click(screen.getByRole('button', { name: 'Question suivante' }))

    // Question 5 : mauvaise réponse, retour de l'option choisie, bonne réponse signalée.
    expect(screen.getByRole('heading', { level: 3, name: 'Question 5 sur 6' })).toBeTruthy()
    fireEvent.click(optionInput('a'))
    fireEvent.click(screen.getByRole('button', { name: 'Valider ma réponse' }))
    expect(screen.getByText('Ce n’est pas la bonne réponse')).toBeTruthy()
    expect(screen.getAllByText('Seuls les formats JPG et PNG sont acceptés.').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('Réponse incorrecte')).toBeTruthy()
    expect(screen.getByText('Réponse attendue')).toBeTruthy()
    // La question vise une sous-section : le lien renvoie à la section de rattachement.
    expect(screen.getByRole('link', { name: 'Relire : Mon profil' }).getAttribute('href')).toBe('#profil')
    fireEvent.click(screen.getByRole('button', { name: 'Question suivante' }))

    // Question 6 : dernière question, bouton « Voir mon résultat ».
    fireEvent.click(optionInput('a'))
    fireEvent.click(optionInput('c'))
    fireEvent.click(screen.getByRole('button', { name: 'Valider ma réponse' }))
    expect(screen.queryByRole('button', { name: 'Question suivante' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Voir mon résultat' }))

    // Résultat : enregistrement, score, niveau, sections à relire, détail, récapitulatif.
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith(plannedAnswers)
    expect(await screen.findByText('Résultat enregistré.')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: 'Votre résultat' })).toBeTruthy()
    const arc = screen.getByRole('progressbar', { name: '5 bonnes réponses sur 6' })
    expect(arc.getAttribute('aria-valuenow')).toBe('83')
    expect(screen.getByText('Maîtrisé').className).toContain('bg-green-500')
    expect(screen.getByText(/Vous maîtrisez ce guide/)).toBeTruthy()
    expect(screen.getByText('Seuil de maîtrise : 80 % de bonnes réponses.')).toBeTruthy()

    const review = screen.getByRole('heading', { level: 3, name: 'Sections à relire' }).parentElement as HTMLElement
    expect(within(review).getByText('Mon profil')).toBeTruthy()
    expect(within(review).getByText('2 sur 3 bonnes réponses')).toBeTruthy()
    expect(within(review).getByRole('link', { name: /Relire/ }).getAttribute('href')).toBe('#profil')
    expect(within(review).queryByText('Se connecter')).toBeNull()

    expect(screen.getByRole('progressbar', { name: 'Se connecter : 3 sur 3' })).toBeTruthy()
    expect(screen.getByRole('progressbar', { name: 'Mon profil : 2 sur 3' })).toBeTruthy()

    const recap = screen.getByRole('heading', { level: 3, name: 'Vos réponses en détail' }).parentElement as HTMLElement
    const triggers = within(recap).getAllByRole('button')
    expect(triggers).toHaveLength(6)
    expect(triggers[4]?.textContent).toContain('Réponse incorrecte.')
    fireEvent.click(triggers[4] as HTMLElement)
    const region = within(recap).getByRole('region')
    expect(within(region).getByText('Votre réponse')).toBeTruthy()
    expect(within(region).getByText('Vrai')).toBeTruthy()
    expect(within(region).getByText('Bonne réponse')).toBeTruthy()
    expect(within(region).getByText('Faux')).toBeTruthy()
    expect(within(region).getByText('Explication')).toBeTruthy()

    expect(screen.getByRole('button', { name: 'Revenir en haut du guide' })).toBeTruthy()

    // Refaire le test : retour à la première question, réponses remises à zéro.
    fireEvent.click(screen.getByRole('button', { name: 'Refaire le test' }))
    expect(screen.getByRole('heading', { level: 3, name: 'Question 1 sur 6' })).toBeTruthy()
    expect(optionInput('a').checked).toBe(false)
    expect((screen.getByRole('button', { name: 'Valider ma réponse' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('affiche le résultat local avec « Résultat non enregistré » si l’enregistrement échoue, puis permet de réessayer', async () => {
    const onSubmit = vi.fn<(answers: GuideAnswers) => Promise<AssessmentResult>>().mockRejectedValueOnce(new Error('réseau'))
    render(<GuideSelfAssessment guide={guide} baseUrls={baseUrls} onSubmit={onSubmit} />)

    playThrough()

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('Résultat non enregistré')).toBeTruthy()
    // Le score calculé sur l'appareil reste affiché.
    expect(screen.getByRole('progressbar', { name: '5 bonnes réponses sur 6' }).getAttribute('aria-valuenow')).toBe('83')
    expect(screen.getByText('Maîtrisé')).toBeTruthy()

    onSubmit.mockImplementationOnce(async (answers) => {
      const result = scoreSelfAssessment(guide, answers)
      if (!result) throw new Error('Guide sans autoévaluation')
      return result
    })
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }))
    expect(onSubmit).toHaveBeenCalledTimes(2)
    expect(onSubmit).toHaveBeenLastCalledWith(plannedAnswers)
    expect(await screen.findByText('Résultat enregistré.')).toBeTruthy()
    expect(screen.queryByText('Résultat non enregistré')).toBeNull()
  })

  it('associe chaque niveau de maîtrise à une tonalité de la charte', () => {
    expect(masteryTones).toEqual({ 'a-consolider': 'gold', 'en-bonne-voie': 'blue', maitrise: 'green' })
  })
})

describe('GuideReader avec autoévaluation', () => {
  it('ajoute la section, l’entrée de sommaire et la métadonnée quand le module et l’action sont fournis', () => {
    const onSubmit = vi.fn()
    const { container } = render(<GuideReader guide={guide} baseUrls={baseUrls} assessment={{ onSubmit }} />)

    expect(screen.getByText('6 questions d’autoévaluation')).toBeTruthy()
    const section = container.querySelector('section#autoevaluation')
    expect(section).not.toBeNull()
    expect(section?.hasAttribute('data-print-hide')).toBe(true)
    expect(section?.getAttribute('aria-labelledby')).toBe('autoevaluation-titre')
    expect(container.querySelector('h2#autoevaluation-titre')?.textContent).toBe('Testez votre maîtrise')

    const tocLinks = screen.getAllByRole('link', { name: 'Testez votre maîtrise' })
    expect(tocLinks.length).toBeGreaterThan(0)
    expect(tocLinks[0]?.getAttribute('href')).toBe('#autoevaluation')

    // La recherche masque les sections mais jamais l'entrée du test.
    const input = screen.getAllByLabelText('Rechercher dans le guide')[0] as HTMLInputElement
    fireEvent.change(input, { target: { value: 'introuvable-xyz' } })
    expect(container.querySelector('#connexion')?.hasAttribute('hidden')).toBe(true)
    expect(screen.getAllByRole('link', { name: 'Testez votre maîtrise' }).length).toBeGreaterThan(0)
    expect(container.querySelector('section#autoevaluation')?.hasAttribute('hidden')).toBe(false)

    // Un lien « Relire » depuis le test efface la recherche pour rendre la section visible.
    fireEvent.click(screen.getByRole('button', { name: 'Commencer le test' }))
    fireEvent.click(optionInput('a'))
    fireEvent.click(screen.getByRole('button', { name: 'Valider ma réponse' }))
    fireEvent.click(screen.getByRole('link', { name: 'Relire : Se connecter' }))
    expect(input.value).toBe('')
    expect(container.querySelector('#connexion')?.hasAttribute('hidden')).toBe(false)
  })

  it('n’affiche ni la section ni l’entrée de sommaire sans action d’enregistrement', () => {
    const { container } = render(<GuideReader guide={guide} baseUrls={baseUrls} />)
    expect(container.querySelector('#autoevaluation')).toBeNull()
    expect(screen.queryByRole('link', { name: 'Testez votre maîtrise' })).toBeNull()
    expect(screen.queryByText(/questions d’autoévaluation/)).toBeNull()
  })
})

describe('GuideCard avec maîtrise', () => {
  it('affiche le badge « Maîtrise » avec la date en libellé accessible', () => {
    render(<GuideCard meta={toGuideMeta(guide)} href="/espace/guide/web-test" mastery={{ percent: 80, passed: true, date: '2026-09-12T10:00:00.000Z' }} />)
    const badge = screen.getByText('Maîtrise : 80 %')
    expect(badge.className).toContain('text-green')
    expect(badge.getAttribute('aria-label')).toBe('Maîtrise : 80 %, évaluée le 12 septembre 2026')
    expect(badge.getAttribute('title')).toBe('Maîtrise : 80 %, évaluée le 12 septembre 2026')
  })

  it('utilise la variante d’avertissement quand le seuil n’est pas atteint', () => {
    render(<GuideCard meta={toGuideMeta(guide)} href="/espace/guide/web-test" mastery={{ percent: 50, passed: false, date: '2026-09-01' }} />)
    const badge = screen.getByText('Maîtrise : 50 %')
    expect(badge.className).toContain('text-gold')
    expect(badge.getAttribute('aria-label')).toBe('Maîtrise : 50 % (à consolider), évaluée le 1er septembre 2026')
  })
})
