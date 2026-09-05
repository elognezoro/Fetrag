'use client'

import { useState } from 'react'
import { Check, Facebook, Link2, MessageCircle, Twitter } from 'lucide-react'
import { Button, cn, toast } from '@fetrag/ui'

interface ShareButtonsProps {
  /** URL absolue de la page à partager. */
  url: string
  title: string
  className?: string
}

/** Partage d'un contenu : copie du lien, WhatsApp, Facebook et X (liens simples, sans script tiers). */
export function ShareButtons({ url, title, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Lien copié dans le presse-papiers.')
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error("Impossible de copier le lien. Sélectionnez l'adresse dans la barre du navigateur.")
    }
  }


  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} role="group" aria-label="Partager cette page">
      <span className="eyebrow mr-1 text-[11px] text-neutral-500">Partager</span>
      <Button type="button" variant="outline" size="sm" onClick={copyLink} leftIcon={copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}>
        {copied ? 'Lien copié' : 'Copier le lien'}
      </Button>
      <Button asChild variant="ghost" size="sm">
        <a href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer">
          <MessageCircle aria-hidden="true" />
          WhatsApp
        </a>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer">
          <Facebook aria-hidden="true" />
          Facebook
        </a>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer">
          <Twitter aria-hidden="true" />
          X
        </a>
      </Button>
    </div>
  )
}
