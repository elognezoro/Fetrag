'use client'

import { useReducedMotion } from 'motion/react'

/**
 * Indique si l'utilisateur préfère réduire les animations.
 * Retourne `false` tant que la préférence n'est pas connue (rendu serveur),
 * ce qui évite un décalage d'hydratation.
 */
export function useReducedMotionSafe(): boolean {
  const reduced = useReducedMotion()
  return reduced === true
}

/** Courbe « ease-out-expo » partagée par toutes les animations FETRAG. */
export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]
