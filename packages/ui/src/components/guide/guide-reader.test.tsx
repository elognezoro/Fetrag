import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { guideIconKeys, guideSchema, toGuideMeta, type Guide } from '@fetrag/contracts'

import { GuideCard } from './guide-card'
import { guideIcons } from './guide-icons'
import { renderGuideInline } from './guide-inline'
import { GuideReader } from './guide-reader'
import { formatGuideDate, normalizeSearchText } from './guide-text'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

const baseUrls = { web: 'https://site.example', lms: 'https://formation.example' }

const guide: Guide = {
  id: 'web-exemple',
  platform: 'web',
  role: 'MEMBER',
  title: 'Guide du membre',
  subtitle: 'Votre compte et votre espace personnel',
  audience: 'Toute personne disposant d’un compte.',
  summary: 'Avec votre compte, vous gérez vos informations et suivez vos demandes.',
  tone: 'blue',
  icon: 'user',
  readingMinutes: 12,
  updatedAt: '2026-09-01',
  version: '1.0',
  prerequisites: ['Une adresse email à laquelle vous avez accès.', 'Un téléphone ou un ordinateur connecté.'],
  quickStart: [
    { text: 'Créez votre compte depuis la page **Inscription**.', ui: 'Créer mon compte', where: 'en bas du formulaire', result: 'Un message vous demande de consulter votre boîte email.' },
    { text: 'Connectez-vous avec votre email.', ui: 'Se connecter', result: 'Votre espace personnel s’ouvre.' },
  ],
  sections: [
    {
      id: 'votre-role',
      title: 'Votre rôle en bref',
      icon: 'user',
      summary: 'Ce que votre compte vous permet de faire.',
      blocks: [
        { type: 'paragraph', text: 'Votre compte est votre identité auprès de la Fédération. Consultez le [catalogue]({{lms}}/catalogue).' },
        { type: 'list', style: 'check', items: ['Mettre à jour vos informations', 'Suivre vos demandes de service'] },
        { type: 'list', style: 'bullet', title: 'Ce que vous ne pouvez pas faire', items: ['Modifier les pages du site'] },
        { type: 'callout', tone: 'tip', title: 'Conseil', text: 'Vérifiez votre adresse email.' },
        { type: 'callout', tone: 'warning', text: 'Cette action est **irréversible**.' },
        { type: 'callout', tone: 'danger', text: 'Ne partagez jamais votre mot de passe.' },
        { type: 'callout', tone: 'info', text: 'À savoir.' },
        { type: 'callout', tone: 'success', text: 'Bravo.' },
      ],
    },
    {
      id: 'se-reperer',
      title: 'Se repérer dans votre espace',
      icon: 'compass',
      blocks: [
        {
          type: 'screen',
          title: 'La page « Espace personnel »',
          description: 'Ce que vous voyez après la connexion.',
          areas: [
            { name: 'Menu de gauche', purpose: 'Accès aux rubriques.', icon: 'menu' },
            { name: 'Bandeau du haut', purpose: 'Votre nom et votre rôle.', icon: 'user' },
          ],
        },
        { type: 'path', label: 'Chemin', items: ['Menu de gauche', 'Mon compte', 'Profil'], href: '/espace/profil' },
        { type: 'table', caption: 'Rubriques', columns: ['Rubrique', 'Utilité'], rows: [['Profil', 'Vos informations'], ['Demandes', 'Vos demandes de service']] },
      ],
    },
    {
      id: 'modifier-mon-profil',
      title: 'Comment mettre à jour mon profil',
      icon: 'pen',
      blocks: [
        {
          type: 'steps',
          title: 'Étapes',
          intro: 'Trois actions suffisent.',
          items: [
            { text: 'Ouvrez **Profil** dans le menu de gauche.', where: 'rubrique « Mon compte »', result: 'Le formulaire s’affiche.' },
            { text: 'Modifiez les champs souhaités.', note: 'Le numéro de téléphone est facultatif.', icon: 'pen' },
            { text: 'Cliquez sur `Enregistrer`.', ui: 'Enregistrer', where: 'en bas du formulaire', result: 'Un message vert apparaît.' },
          ],
        },
        {
          type: 'statuses',
          items: [
            { label: 'Brouillon', tone: 'neutral', meaning: 'Non envoyé.', next: 'Vous pouvez encore modifier.' },
            { label: 'En cours', tone: 'info', meaning: 'En traitement.' },
            { label: 'Acceptée', tone: 'success', meaning: 'Validée.' },
            { label: 'En attente', tone: 'warning', meaning: 'Complément demandé.' },
            { label: 'Refusée', tone: 'danger', meaning: 'Refus motivé.' },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            { problem: 'Le bouton `Enregistrer` reste grisé.', cause: 'Un champ obligatoire est vide.', solution: 'Repérez le message rouge sous le champ concerné.' },
            { problem: 'La page ne répond plus.', solution: 'Rechargez la page.' },
          ],
        },
      ],
      subsections: [
        {
          id: 'changer-de-photo',
          title: 'Changer de photo',
          blocks: [{ type: 'paragraph', text: 'Formats acceptés : JPG et PNG, 2 Mo maximum.' }],
        },
      ],
    },
    {
      id: 'questions-frequentes',
      title: 'Questions fréquentes',
      icon: 'help-circle',
      blocks: [
        {
          type: 'faq',
          items: [
            { question: 'Puis-je changer d’adresse email ?', answer: 'Oui, depuis **Profil**.' },
            { question: 'Comment supprimer mon compte ?', answer: 'Écrivez au support.' },
          ],
        },
      ],
    },
    {
      id: 'lexique',
      title: 'Lexique',
      icon: 'book-open',
      blocks: [
        {
          type: 'definitions',
          items: [
            { term: 'Vérification en deux étapes', definition: 'Un code temporaire demandé en plus du mot de passe.' },
            { term: 'Cohorte', definition: 'Groupe de personnes suivant une formation ensemble.' },
          ],
        },
      ],
    },
    {
      id: 'besoin-d-aide',
      title: 'Besoin d’aide ?',
      icon: 'life-buoy',
      blocks: [
        {
          type: 'links',
          items: [
            { label: 'Écrire au support', href: '/contact', description: 'Formulaire de contact.', icon: 'mail' },
            { label: 'Plateforme de formation', href: '{{lms}}/guide', external: true, icon: 'graduation-cap' },
          ],
        },
      ],
    },
  ],
  related: [{ label: 'Guide de l’apprenant', href: '{{lms}}/guide', description: 'Suivre une formation.', external: true }],
}

afterEach(() => {
  cleanup()
})

describe('guideIcons', () => {
  it('couvre toutes les clés d’icônes des contrats', () => {
    for (const key of guideIconKeys) {
      expect(guideIcons[key], key).toBeTypeOf('object')
    }
    expect(Object.keys(guideIcons).sort()).toEqual([...guideIconKeys].sort())
  })
})

describe('renderGuideInline', () => {
  it('rend le gras, les pastilles et les liens', () => {
    const { container } = render(<p>{renderGuideInline('Cliquez sur **Se connecter** puis `Valider` et lisez [l’aide]({{lms}}/aide) ou [le profil](/espace/profil).', { baseUrls })}</p>)
    expect(container.querySelector('strong')?.textContent).toBe('Se connecter')
    expect(container.querySelector('kbd')?.textContent).toBe('Valider')
    const links = container.querySelectorAll('a')
    expect(links[0]?.getAttribute('href')).toBe('https://formation.example/aide')
    expect(links[0]?.getAttribute('target')).toBe('_blank')
    expect(links[0]?.getAttribute('rel')).toBe('noopener noreferrer')
    expect(links[1]?.getAttribute('href')).toBe('/espace/profil')
    expect(links[1]?.hasAttribute('target')).toBe(false)
  })

  it('résiste aux textes sans marqueur et aux marqueurs imbriqués simples', () => {
    expect(renderGuideInline('Texte simple')).toBe('Texte simple')
    const { container } = render(<p>{renderGuideInline('**[Lien](/x)** et [**Gras**](/y) et **`Bouton`**')}</p>)
    expect(container.querySelectorAll('strong')).toHaveLength(3)
    expect(container.querySelectorAll('a')).toHaveLength(2)
    expect(container.querySelector('strong a')?.textContent).toBe('Lien')
    expect(container.querySelector('a strong')?.textContent).toBe('Gras')
    expect(container.querySelector('strong kbd')?.textContent).toBe('Bouton')
    expect(container.querySelector('script')).toBeNull()
  })

  it('n’interprète pas le HTML', () => {
    const { container } = render(<p>{renderGuideInline('<b>x</b> **y**')}</p>)
    expect(container.querySelector('b')).toBeNull()
    expect(container.textContent).toBe('<b>x</b> y')
  })
})

describe('outils texte', () => {
  it('formate les dates en français et normalise la recherche', () => {
    expect(formatGuideDate('2026-09-01')).toBe('1er septembre 2026')
    expect(formatGuideDate('2026-01-12')).toBe('12 janvier 2026')
    expect(normalizeSearchText('  Réinitialiser le **mot** de passe ')).toBe('reinitialiser le mot de passe')
  })
})

describe('GuideReader', () => {
  it('le guide exemple respecte le schéma et couvre tous les types de blocs', () => {
    expect(guideSchema.safeParse(guide).success).toBe(true)
    const types = new Set(guide.sections.flatMap((s) => [...s.blocks, ...(s.subsections ?? []).flatMap((x) => x.blocks)]).map((b) => b.type))
    expect([...types].sort()).toEqual(['callout', 'definitions', 'faq', 'links', 'list', 'paragraph', 'path', 'screen', 'statuses', 'steps', 'table', 'troubleshooting'])
  })

  it('rend le guide complet sans planter, avec les en-têtes et les blocs', () => {
    const { container } = render(
      <GuideReader
        guide={guide}
        baseUrls={baseUrls}
        viewerRoleLabel="Membre"
        breadcrumbs={[{ label: 'Espace', href: '/espace' }, { label: 'Guide' }]}
        otherGuides={[
          { meta: toGuideMeta(guide), href: '/espace/guide/web-exemple' },
          { meta: { ...toGuideMeta(guide), id: 'lms-exemple', platform: 'lms', title: 'Guide de l’apprenant', tone: 'green' }, href: '{{lms}}/guide', external: true },
        ]}
        contact={{ email: 'contact@example.org', phones: ['+241 01 02 03 04'], address: 'Libreville' }}
      />,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Guide du membre' })).toBeTruthy()
    expect(screen.getByText(/Vous consultez ce guide en tant que/).textContent).toContain('Membre')
    expect(screen.getByText('1er septembre 2026')).toBeTruthy()
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(
      expect.arrayContaining(['Avant de commencer', 'Prise en main en cinq minutes', 'Votre rôle en bref', 'Guides liés', 'Vos autres guides', 'Besoin d’aide ?']),
    )
    expect(screen.getByRole('heading', { level: 3, name: 'Changer de photo' })).toBeTruthy()

    // Gras → <strong>, pastille → <kbd>, {{lms}} substitué.
    const section = container.querySelector('#modifier-mon-profil')
    expect(section).not.toBeNull()
    expect(within(section as HTMLElement).getAllByText('Profil', { selector: 'strong' }).length).toBeGreaterThan(0)
    expect(within(section as HTMLElement).getAllByText('Enregistrer', { selector: 'kbd' }).length).toBeGreaterThan(0)
    const catalogue = container.querySelector('a[href="https://formation.example/catalogue"]')
    expect(catalogue?.textContent).toContain('catalogue')
    expect(container.querySelector('a[href="https://formation.example/guide"]')).not.toBeNull()
    expect(container.innerHTML).not.toContain('{{lms}}')

    // Tableau dans un conteneur à défilement horizontal.
    expect(container.querySelector('table')?.closest('.overflow-x-auto')).not.toBeNull()
    // Statuts : badges.
    expect(screen.getByText('Refusée').className).toContain('text-danger')
    // Contact.
    expect(container.querySelector('a[href="mailto:contact@example.org"]')).not.toBeNull()
    expect(container.querySelector('a[href="tel:+24101020304"]')).not.toBeNull()
    // Bouton d'impression accessible.
    expect(screen.getByRole('button', { name: 'Imprimer ou enregistrer en PDF' })).toBeTruthy()
    // « Haut de page » : masqué aux technologies d'assistance tant que la page n'est pas défilée.
    expect(screen.queryByRole('button', { name: 'Haut de page' })).toBeNull()
    const toTop = container.querySelector('button[aria-label="Haut de page"]')
    expect(toTop).not.toBeNull()
    expect(toTop?.getAttribute('aria-hidden')).toBe('true')
  })

  it('la recherche filtre les sections (accent-insensible) et le bouton Effacer la réinitialise', () => {
    const { container } = render(<GuideReader guide={guide} baseUrls={baseUrls} />)
    const inputs = screen.getAllByLabelText('Rechercher dans le guide')
    expect(inputs.length).toBeGreaterThan(0)
    const input = inputs[0] as HTMLInputElement

    fireEvent.change(input, { target: { value: 'cohorte' } })
    expect(screen.getAllByText('1 section correspond').length).toBeGreaterThan(0)
    expect(container.querySelector('#lexique')?.hasAttribute('hidden')).toBe(false)
    expect(container.querySelector('#votre-role')?.hasAttribute('hidden')).toBe(true)

    fireEvent.change(input, { target: { value: 'FEDERATION' } })
    expect(screen.getAllByText('1 section correspond').length).toBeGreaterThan(0)
    expect(container.querySelector('#votre-role')?.hasAttribute('hidden')).toBe(false)

    fireEvent.change(input, { target: { value: 'introuvable-xyz' } })
    expect(screen.getAllByText('Aucune section ne correspond').length).toBeGreaterThan(0)

    fireEvent.click(screen.getAllByRole('button', { name: 'Effacer' })[0] as HTMLElement)
    expect(input.value).toBe('')
    expect(container.querySelector('#votre-role')?.hasAttribute('hidden')).toBe(false)
    expect(screen.getAllByText('6 sections').length).toBeGreaterThan(0)
  })

  it('l’impression ouvre les questions et pose l’attribut data-print', () => {
    const print = vi.fn()
    Object.defineProperty(window, 'print', { writable: true, configurable: true, value: print })
    vi.useFakeTimers()
    try {
      const { container } = render(<GuideReader guide={guide} baseUrls={baseUrls} />)
      fireEvent.click(screen.getByRole('button', { name: 'Imprimer ou enregistrer en PDF' }))
      expect(document.documentElement.dataset.print).toBe('guide')
      expect(container.querySelectorAll('[data-state="open"][role="region"]').length).toBe(2)
      vi.runAllTimers()
      expect(print).toHaveBeenCalledTimes(1)
      fireEvent(window, new Event('afterprint'))
      expect(document.documentElement.dataset.print).toBeUndefined()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('GuideCard', () => {
  it('rend une carte avec lien couvrant et état courant', () => {
    const { container } = render(<GuideCard meta={toGuideMeta(guide)} href="/espace/guide/web-exemple" roleLabel="Membre" current />)
    expect(screen.getByRole('link', { name: 'Guide du membre' }).getAttribute('href')).toBe('/espace/guide/web-exemple')
    expect(screen.getByText('Guide affiché')).toBeTruthy()
    expect(screen.getByText('Membre')).toBeTruthy()
    expect(container.querySelector('article')?.getAttribute('aria-current')).toBe('page')
  })

  it('ouvre un lien externe dans un nouvel onglet', () => {
    render(<GuideCard meta={toGuideMeta(guide)} href="https://formation.example/guide" external />)
    const link = screen.getByRole('link', { name: /Guide du membre/ })
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })
})
