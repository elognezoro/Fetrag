/**
 * Petit lecteur / écrivain XML dédié aux fichiers de questions Moodle.
 *
 * Volontairement minimal (pas de dépendance externe) : il couvre ce que produit et attend
 * l'export de questions Moodle — éléments, attributs, texte, sections CDATA, commentaires,
 * balises auto-fermantes et entités usuelles. Il n'est pas un parseur XML général.
 */

export interface XmlNode {
  name: string
  attrs: Record<string, string>
  children: XmlNode[]
  /** Texte direct (hors éléments enfants), CDATA compris, entités décodées. */
  text: string
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

/** Décode les entités XML/HTML usuelles et numériques. */
export function decodeEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (whole, body: string) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X' ? Number.parseInt(body.slice(2), 16) : Number.parseInt(body.slice(1), 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole
    }
    return NAMED_ENTITIES[body] ?? whole
  })
}

/** Échappe le texte pour un contenu XML (`&`, `<`, `>`). */
export function escapeXml(input: string): string {
  return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Échappe la valeur d'un attribut XML (guillemets doubles). */
export function escapeAttr(input: string): string {
  return escapeXml(input).replace(/"/g, '&quot;')
}

/**
 * Analyse un document XML en un arbre. Lève une erreur si la structure est manifestement invalide
 * (balise fermante inattendue, document tronqué).
 */
export function parseXml(source: string): XmlNode {
  let i = 0
  const root: XmlNode = { name: '#document', attrs: {}, children: [], text: '' }
  const stack: XmlNode[] = [root]
  const len = source.length

  const top = (): XmlNode => stack[stack.length - 1]!

  while (i < len) {
    if (source[i] === '<') {
      // Déclaration XML, instruction de traitement.
      if (source.startsWith('<?', i)) {
        const end = source.indexOf('?>', i)
        if (end === -1) throw new Error('Déclaration XML non terminée')
        i = end + 2
        continue
      }
      // Commentaire.
      if (source.startsWith('<!--', i)) {
        const end = source.indexOf('-->', i)
        if (end === -1) throw new Error('Commentaire XML non terminé')
        i = end + 3
        continue
      }
      // Section CDATA (contenu littéral).
      if (source.startsWith('<![CDATA[', i)) {
        const end = source.indexOf(']]>', i)
        if (end === -1) throw new Error('Section CDATA non terminée')
        top().text += source.slice(i + 9, end)
        i = end + 3
        continue
      }
      // Doctype ou autre déclaration.
      if (source.startsWith('<!', i)) {
        const end = source.indexOf('>', i)
        if (end === -1) throw new Error('Déclaration XML non terminée')
        i = end + 1
        continue
      }
      // Balise fermante.
      if (source.startsWith('</', i)) {
        const end = source.indexOf('>', i)
        if (end === -1) throw new Error('Balise fermante non terminée')
        const name = source.slice(i + 2, end).trim()
        const node = stack.pop()
        if (!node || node.name !== name) throw new Error(`Balise fermante inattendue : </${name}>`)
        i = end + 1
        continue
      }
      // Balise ouvrante (ou auto-fermante).
      const end = source.indexOf('>', i)
      if (end === -1) throw new Error('Balise ouvrante non terminée')
      const selfClosing = source[end - 1] === '/'
      const inner = source.slice(i + 1, selfClosing ? end - 1 : end).trim()
      const spaceIdx = inner.search(/\s/)
      const name = spaceIdx === -1 ? inner : inner.slice(0, spaceIdx)
      const attrs = spaceIdx === -1 ? {} : parseAttrs(inner.slice(spaceIdx + 1))
      const node: XmlNode = { name, attrs, children: [], text: '' }
      top().children.push(node)
      if (!selfClosing) stack.push(node)
      i = end + 1
      continue
    }
    // Texte entre balises.
    const next = source.indexOf('<', i)
    const chunk = next === -1 ? source.slice(i) : source.slice(i, next)
    if (chunk.trim().length > 0) top().text += decodeEntities(chunk)
    if (next === -1) break
    i = next
  }

  if (stack.length !== 1) throw new Error('Document XML incomplet (balise non fermée)')
  return root
}

function parseAttrs(input: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const re = /([^\s=]+)\s*=\s*"([^"]*)"|([^\s=]+)\s*=\s*'([^']*)'/g
  let m: RegExpExecArray | null
  while ((m = re.exec(input))) {
    const key = m[1] ?? m[3]
    const value = m[2] ?? m[4] ?? ''
    if (key) attrs[key] = decodeEntities(value)
  }
  return attrs
}

/** Premier enfant portant ce nom, ou `undefined`. */
export function child(node: XmlNode, name: string): XmlNode | undefined {
  return node.children.find((c) => c.name === name)
}

/** Tous les enfants portant ce nom. */
export function children(node: XmlNode, name: string): XmlNode[] {
  return node.children.filter((c) => c.name === name)
}

/**
 * Texte d'un élément Moodle : Moodle enveloppe le texte dans un `<text>` enfant.
 * On lit le `<text>` s'il existe, sinon le texte direct du nœud.
 */
export function elementText(node: XmlNode | undefined): string {
  if (!node) return ''
  const textNode = child(node, 'text')
  return (textNode ? textNode.text : node.text).trim()
}

// --------------------------------------------------------------------------
// Écriture
// --------------------------------------------------------------------------

/** Enveloppe une valeur dans une section CDATA (contenu HTML des questions). */
export function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`
}

/** Élément `<text>` Moodle : CDATA si le contenu ressemble à du HTML, texte échappé sinon. */
export function textEl(value: string): string {
  const looksHtml = /[<&]/.test(value)
  return `<text>${looksHtml ? cdata(value) : escapeXml(value)}</text>`
}
