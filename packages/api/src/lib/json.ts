// Valeurs JSON opaques : utilisées pour les rapports, tableaux de bord et contenus dont la structure
// appartient aux packages métier (le schéma OpenAPI les documente comme objets libres).
//
// Les types restent volontairement non récursifs (`object` couvre tableaux et objets) : le typage
// des réponses Hono (`JSONParsed`) ne supporte pas les unions récursives profondes.
import { z } from '@hono/zod-openapi'

export type JsonValue = string | number | boolean | null | object
export type JsonObject = { [key: string]: JsonValue }

/** Sérialise n'importe quelle valeur en JSON pur (dates -> ISO, undefined retiré). */
export function toJsonValue(value: unknown): JsonValue {
  if (value === undefined) return null
  return JSON.parse(JSON.stringify(value)) as JsonValue
}

/** Variante objet : renvoie `{}` si la valeur n'est pas un objet JSON. */
export function toJsonObject(value: unknown): JsonObject {
  const json = toJsonValue(value)
  return json !== null && typeof json === 'object' && !Array.isArray(json) ? (json as JsonObject) : {}
}

export const jsonValueSchema = z
  .custom<JsonValue>((value) => value === null || ['string', 'number', 'boolean', 'object'].includes(typeof value))
  .openapi({ description: 'Valeur JSON libre' })

export const jsonObjectSchema = z
  .custom<JsonObject>((value) => typeof value === 'object' && value !== null && !Array.isArray(value))
  .openapi({ type: 'object', additionalProperties: true, description: 'Objet JSON libre (structure définie par le service métier)' })
