import { describe, expect, it } from 'vitest'
import { renderExcerpt, sanitizeHtml, stripHtml } from '../sanitize'

describe('sanitizeHtml', () => {
  it('supprime les balises script et leur contenu', () => {
    const out = sanitizeHtml('<p>Bonjour</p><script>alert("x")</script><p>Suite</p>')
    expect(out).toBe('<p>Bonjour</p><p>Suite</p>')
    expect(out).not.toContain('alert')
  })

  it('retire les attributs événementiels (onclick, onerror) et les styles', () => {
    const out = sanitizeHtml('<p onclick="steal()" style="color:red">Texte</p><img src="https://cdn.fetrag.ga/a.png" onerror="x()" alt="Logo">')
    expect(out).not.toContain('onclick')
    expect(out).not.toContain('onerror')
    expect(out).not.toContain('style=')
    expect(out).toContain('<p>Texte</p>')
    expect(out).toContain('src="https://cdn.fetrag.ga/a.png"')
    expect(out).toContain('alt="Logo"')
  })

  it('conserve les iframes YouTube, YouTube nocookie et Vimeo', () => {
    const yt = sanitizeHtml('<iframe src="https://www.youtube.com/embed/abc123" title="Vidéo" allowfullscreen></iframe>')
    expect(yt).toContain('<iframe')
    expect(yt).toContain('https://www.youtube.com/embed/abc123')
    const nocookie = sanitizeHtml('<iframe src="https://www.youtube-nocookie.com/embed/abc123"></iframe>')
    expect(nocookie).toContain('youtube-nocookie.com')
    const vimeo = sanitizeHtml('<iframe src="https://player.vimeo.com/video/123"></iframe>')
    expect(vimeo).toContain('player.vimeo.com')
  })

  it('rejette les iframes d’hôtes non autorisés ou en http', () => {
    expect(sanitizeHtml('<iframe src="https://evil.example.com/x"></iframe>')).toBe('')
    expect(sanitizeHtml('<iframe src="http://www.youtube.com/embed/abc"></iframe>')).toBe('')
  })

  it('ajoute rel="noopener noreferrer" sur les liens target=_blank', () => {
    const out = sanitizeHtml('<a href="https://fetrag.ga" target="_blank">Site</a>')
    expect(out).toContain('target="_blank"')
    expect(out).toContain('rel="noopener noreferrer"')
  })

  it('retire les cibles autres que _blank', () => {
    const out = sanitizeHtml('<a href="/ressources" target="_top">Ressources</a>')
    expect(out).not.toContain('target=')
    expect(out).toContain('href="/ressources"')
  })

  it('supprime les href javascript: et data: mais garde mailto:, tel: et les chemins relatifs', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).toBe('<a>x</a>')
    expect(sanitizeHtml('<a href="data:text/html;base64,AAAA">x</a>')).toBe('<a>x</a>')
    expect(sanitizeHtml('<a href="mailto:contact@fetrag.ga">Écrire</a>')).toContain('href="mailto:contact@fetrag.ga"')
    expect(sanitizeHtml('<a href="tel:+24166230033">Appeler</a>')).toContain('href="tel:+24166230033"')
    expect(sanitizeHtml('<a href="/actualites">Actualités</a>')).toContain('href="/actualites"')
  })

  it('conserve les structures riches autorisées (titres, listes, tableaux, citations, code)', () => {
    const html =
      '<h2>Titre</h2><ul><li>Un</li><li>Deux</li></ul><table><thead><tr><th scope="col">A</th></tr></thead><tbody><tr><td colspan="2">B</td></tr></tbody></table><blockquote>Citation</blockquote><pre><code>x = 1</code></pre><hr><figure><img src="/img.png" alt="Image"><figcaption>Légende</figcaption></figure>'
    const out = sanitizeHtml(html)
    for (const tag of ['<h2>', '<ul>', '<li>', '<table>', '<thead>', '<th scope="col">', '<td colspan="2">', '<blockquote>', '<pre>', '<code>', '<hr />', '<figure>', '<figcaption>']) {
      expect(out).toContain(tag)
    }
  })

  it('conserve les blocs dépliables (details/summary) sans attribut', () => {
    const out = sanitizeHtml('<details open onclick="x()"><summary class="lab">Voir la réponse juridique</summary><p>Corrigé.</p></details>')
    expect(out).toBe('<details><summary>Voir la réponse juridique</summary><p>Corrigé.</p></details>')
  })

  it('retire les balises non listées (h1, div, span, form, input) en conservant leur texte', () => {
    const out = sanitizeHtml('<h1>Grand titre</h1><div><span>Texte</span></div><form><input value="x"></form>')
    expect(out).toBe('Grand titreTexte')
  })

  it('renvoie une chaîne vide pour une entrée absente', () => {
    expect(sanitizeHtml(null)).toBe('')
    expect(sanitizeHtml(undefined)).toBe('')
    expect(sanitizeHtml('')).toBe('')
  })
})

describe('renderExcerpt et stripHtml', () => {
  it('produit un extrait sans balise, entités décodées, tronqué au mot', () => {
    const html = '<p>La F&eacute;d&eacute;ration des Travailleurs du Gabon &amp; ses partenaires</p><p>agissent pour la protection de l&#39;outil de production.</p>'
    const out = renderExcerpt(html, 60)
    expect(out).not.toContain('<')
    expect(out).toContain('Fédération des Travailleurs du Gabon & ses partenaires')
    expect(out.length).toBeLessThanOrEqual(61)
    expect(out.endsWith('…')).toBe(true)
  })

  it('sépare les paragraphes par un espace et garde le texte court intact', () => {
    expect(renderExcerpt('<p>Un.</p><p>Deux.</p>')).toBe('Un. Deux.')
    expect(renderExcerpt('<details><summary>Voir la réponse</summary><p>Corrigé.</p></details>')).toBe('Voir la réponse Corrigé.')
    expect(renderExcerpt('')).toBe('')
  })

  it('stripHtml retire toutes les balises et normalise les espaces', () => {
    expect(stripHtml('<p>Bonjour&nbsp;<strong>monde</strong></p>\n<script>x()</script>')).toBe('Bonjour monde')
  })
})
