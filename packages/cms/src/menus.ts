// Menus de navigation (en-tête, pied de page, LMS) : arbre imbriqué par emplacement.
import { prisma, type MenuItem, type MenuLocation } from '@fetrag/db'
import { audit, NotFoundError, ValidationError, type Principal } from '@fetrag/domain'
import { assertCan, auditCtx, parseInput, type Maybe, type RequestContext } from './common'
import { menuInputSchema, menuItemInputSchema, menuLocationSchema, type MenuInput, type MenuItemInput } from './schemas'
import { z } from 'zod'

export interface MenuTreeItem {
  id: string
  label: string
  href: string
  icon: string | null
  isExternal: boolean
  position: number
  children: MenuTreeItem[]
}

export interface MenuTree {
  id: string | null
  location: MenuLocation
  name: string
  items: MenuTreeItem[]
}

export interface MenuSummary {
  id: string
  location: MenuLocation
  name: string
  itemCount: number
}

const MAX_DEPTH = 3

export const menuDefaultNames: Record<MenuLocation, string> = {
  HEADER: 'Navigation principale',
  FOOTER: 'Pied de page',
  FOOTER_SECONDARY: 'Pied de page - liens secondaires',
  LMS_HEADER: 'Navigation LMS',
}

/** Construit l'arbre à partir des lignes plates (parentId), trié par position à chaque niveau. */
export function buildTree(rows: MenuItem[]): MenuTreeItem[] {
  const byParent = new Map<string | null, MenuItem[]>()
  for (const row of rows) {
    const key = row.parentId ?? null
    const bucket = byParent.get(key)
    if (bucket) bucket.push(row)
    else byParent.set(key, [row])
  }
  const build = (parentId: string | null, depth: number): MenuTreeItem[] => {
    if (depth > MAX_DEPTH) return []
    const children = byParent.get(parentId) ?? []
    return children
      .sort((a, b) => a.position - b.position)
      .map((row) => ({
        id: row.id,
        label: row.label,
        href: row.href,
        icon: row.icon,
        isExternal: row.isExternal,
        position: row.position,
        children: build(row.id, depth + 1),
      }))
  }
  return build(null, 1)
}

function assertDepth(items: MenuItemInput[], depth = 1): void {
  if (depth > MAX_DEPTH) throw new ValidationError(`Un menu ne peut pas dépasser ${MAX_DEPTH} niveaux`)
  for (const item of items) if (item.children && item.children.length > 0) assertDepth(item.children, depth + 1)
}

function countItems(items: MenuItemInput[]): number {
  return items.reduce((sum, item) => sum + 1 + (item.children ? countItems(item.children) : 0), 0)
}

/** Menu d'un emplacement sous forme d'arbre (vide si non configuré). Lecture publique. */
export async function get(location: MenuLocation): Promise<MenuTree> {
  const loc = parseInput(menuLocationSchema, location)
  const menu = await prisma.menu.findUnique({ where: { location: loc }, include: { items: true } })
  if (!menu) return { id: null, location: loc, name: menuDefaultNames[loc], items: [] }
  return { id: menu.id, location: menu.location, name: menu.name, items: buildTree(menu.items) }
}

/** Tous les menus avec leur nombre d'entrées (lecture publique). */
export async function list(_query?: unknown, _principal?: Maybe<Principal>): Promise<MenuSummary[]> {
  const menus = await prisma.menu.findMany({ include: { _count: { select: { items: true } } }, orderBy: { location: 'asc' } })
  return menus.map((m) => ({ id: m.id, location: m.location, name: m.name, itemCount: m._count.items }))
}

/** Menu par identifiant (arbre complet). */
export async function getById(id: string): Promise<MenuTree> {
  const menu = await prisma.menu.findUnique({ where: { id }, include: { items: true } })
  if (!menu) throw new NotFoundError('Menu', id)
  return { id: menu.id, location: menu.location, name: menu.name, items: buildTree(menu.items) }
}

/**
 * Remplace intégralement l'arbre d'un emplacement (cms.manage_menus) dans une transaction :
 * le menu est créé s'il n'existe pas, les anciennes entrées sont supprimées, les nouvelles créées
 * récursivement avec parentId et position.
 */
export async function upsertTree(
  location: MenuLocation,
  items: MenuItemInput[],
  principal: Maybe<Principal>,
  options: { name?: string; ctx?: RequestContext } = {},
): Promise<MenuTree> {
  const p = assertCan(principal, 'cms.manage_menus')
  const data = parseInput(menuInputSchema, { location, items, name: options.name })
  assertDepth(data.items)
  if (countItems(data.items) > 120) throw new ValidationError('Un menu ne peut pas contenir plus de 120 entrées')

  const before = await prisma.menu.findUnique({ where: { location: data.location }, include: { _count: { select: { items: true } } } })
  await prisma.$transaction(async (tx) => {
    const menu = await tx.menu.upsert({
      where: { location: data.location },
      update: { name: data.name ?? undefined },
      create: { location: data.location, name: data.name ?? menuDefaultNames[data.location] },
    })
    await tx.menuItem.deleteMany({ where: { menuId: menu.id } })
    const createLevel = async (level: MenuItemInput[], parentId: string | null): Promise<void> => {
      for (const [position, item] of level.entries()) {
        const created = await tx.menuItem.create({
          data: {
            menuId: menu.id,
            parentId,
            label: item.label,
            href: item.href,
            icon: item.icon ?? null,
            isExternal: item.isExternal ?? /^https?:\/\//i.test(item.href),
            position,
          },
        })
        if (item.children && item.children.length > 0) await createLevel(item.children, created.id)
      }
    }
    await createLevel(data.items, null)
  })
  await audit('content.updated', { type: 'Menu', id: before?.id ?? null }, auditCtx(p, options.ctx), {
    before: { location: data.location, items: before?._count.items ?? 0 },
    after: { location: data.location, items: countItems(data.items) },
  })
  return get(data.location)
}

/** Crée (ou remplace) un menu à partir d'une entrée complète (cms.manage_menus). */
export async function create(input: MenuInput, principal: Maybe<Principal>, ctx?: RequestContext): Promise<MenuTree> {
  const data = parseInput(menuInputSchema, input)
  return upsertTree(data.location, data.items, principal, { name: data.name, ctx })
}

const menuUpdateSchema = z.object({ name: z.string().trim().max(80).optional(), items: z.array(menuItemInputSchema).max(40).optional() })

/** Met à jour un menu par identifiant (nom et/ou arbre) - cms.manage_menus. */
export async function update(id: string, input: z.input<typeof menuUpdateSchema>, principal: Maybe<Principal>, ctx?: RequestContext): Promise<MenuTree> {
  const p = assertCan(principal, 'cms.manage_menus')
  const data = parseInput(menuUpdateSchema, input)
  const menu = await prisma.menu.findUnique({ where: { id }, include: { items: true } })
  if (!menu) throw new NotFoundError('Menu', id)
  if (data.items) return upsertTree(menu.location, data.items, p, { name: data.name, ctx })
  if (data.name) {
    await prisma.menu.update({ where: { id }, data: { name: data.name } })
    await audit('content.updated', { type: 'Menu', id }, auditCtx(p, ctx), { before: { name: menu.name }, after: { name: data.name } })
  }
  return getById(id)
}

/** Supprime un menu et ses entrées (cms.manage_menus). */
export async function remove(id: string, principal: Maybe<Principal>, ctx?: RequestContext): Promise<void> {
  const p = assertCan(principal, 'cms.manage_menus')
  const menu = await prisma.menu.findUnique({ where: { id }, select: { id: true, location: true, name: true } })
  if (!menu) throw new NotFoundError('Menu', id)
  await prisma.menu.delete({ where: { id } })
  await audit('content.archived', { type: 'Menu', id }, auditCtx(p, ctx), { before: menu, after: { deleted: true } })
}

/** Convertit un arbre en entrée réutilisable par `upsertTree` (édition côté admin). */
export function toInput(items: MenuTreeItem[]): MenuItemInput[] {
  return items.map((item) => ({
    label: item.label,
    href: item.href,
    icon: item.icon,
    isExternal: item.isExternal,
    children: item.children.length > 0 ? toInput(item.children) : undefined,
  }))
}
