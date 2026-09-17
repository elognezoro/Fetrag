'use client'

import { useEffect, useRef, useState } from 'react'
import { Square, Volume2 } from 'lucide-react'
import { Button, cn } from '@fetrag/ui'

/**
 * Lecture audio d'un texte par la synthèse vocale du navigateur (Web Speech API).
 * Voix française si disponible ; bouton masqué quand l'API n'est pas supportée.
 * Le texte est découpé en fragments courts : certains navigateurs interrompent
 * silencieusement les énoncés trop longs.
 */

/** Arrêt de la lecture en cours d'un autre bouton de la page (une seule lecture à la fois). */
let stopActive: (() => void) | null = null

/** Découpe en fragments prononçables : phrases regroupées, longues phrases scindées. */
function toChunks(text: string, max = 220): string[] {
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?…;:])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
  const chunks: string[] = []
  let current = ''
  for (const sentence of sentences) {
    if (sentence.length > max) {
      if (current) {
        chunks.push(current)
        current = ''
      }
      for (let i = 0; i < sentence.length; i += max) chunks.push(sentence.slice(i, i + max))
      continue
    }
    if ((current + ' ' + sentence).trim().length > max) {
      if (current) chunks.push(current)
      current = sentence
    } else {
      current = `${current} ${sentence}`.trim()
    }
  }
  if (current) chunks.push(current)
  return chunks
}

interface SpeakButtonProps {
  /** Texte brut à lire (sans balises HTML). */
  text: string
  /** Libellé du bouton au repos. */
  label?: string
  className?: string
  size?: 'sm' | 'md'
}

export function SpeakButton({ text, label = 'Écouter', className, size = 'sm' }: SpeakButtonProps) {
  const [supported, setSupported] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const speakingRef = useRef(false)

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window && text.trim().length > 0)
  }, [text])

  useEffect(() => {
    return () => {
      if (speakingRef.current) {
        window.speechSynthesis?.cancel()
        if (stopActive) stopActive = null
      }
    }
  }, [])

  function stop() {
    window.speechSynthesis.cancel()
    speakingRef.current = false
    setSpeaking(false)
    stopActive = null
  }

  function start() {
    const synth = window.speechSynthesis
    if (stopActive) stopActive()
    synth.cancel()
    const voice = synth.getVoices().find((v) => v.lang?.toLowerCase().startsWith('fr')) ?? null
    const chunks = toChunks(text)
    if (chunks.length === 0) return
    speakingRef.current = true
    setSpeaking(true)
    stopActive = () => {
      speakingRef.current = false
      setSpeaking(false)
    }
    chunks.forEach((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk)
      utterance.lang = 'fr-FR'
      if (voice) utterance.voice = voice
      if (index === chunks.length - 1) {
        utterance.onend = () => {
          if (speakingRef.current) stop()
        }
      }
      utterance.onerror = () => {
        if (speakingRef.current) stop()
      }
      synth.speak(utterance)
    })
  }

  if (!supported) return null

  return (
    <Button
      type="button"
      variant="outline"
      size={size === 'sm' ? 'sm' : 'md'}
      className={cn('shrink-0', className)}
      aria-pressed={speaking}
      onClick={() => (speaking ? stop() : start())}
      leftIcon={speaking ? <Square aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
    >
      {speaking ? 'Arrêter la lecture' : label}
    </Button>
  )
}
