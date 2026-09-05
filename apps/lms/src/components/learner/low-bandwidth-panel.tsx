import { Download, FileText, Headphones, WifiLow } from 'lucide-react'
import { Prose, cn } from '@fetrag/ui'
import type { LowBandwidth } from '@/server/learner/content'

interface LowBandwidthPanelProps {
  alternative: LowBandwidth | null
  /** Transcription de secours issue du contenu principal (si l'alternative n'en fournit pas). */
  fallbackTranscript?: string | null
  /** Ouvre le panneau par défaut (média indisponible en ligne). */
  defaultOpen?: boolean
  className?: string
}

/** Paragraphes HTML échappés à partir d'un texte brut (transcription). */
function transcriptToHtml(text: string): string {
  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return text
    .split(/\n{2,}/)
    .map((p) => `<p>${escape(p.trim()).replace(/\n/g, '<br />')}</p>`)
    .join('')
}

/**
 * « Version bas débit » d'un média : transcription intégrale, capsule audio ou document
 * de remplacement. Repliable (`details`), sans JavaScript.
 */
export function LowBandwidthPanel({ alternative, fallbackTranscript, defaultOpen = false, className }: LowBandwidthPanelProps) {
  const transcript = alternative?.transcript ?? fallbackTranscript ?? null
  const audioUrl = alternative?.audioUrl ?? null
  const documentUrl = alternative?.documentUrl ?? null
  if (!transcript && !audioUrl && !documentUrl) return null

  return (
    <details open={defaultOpen} className={cn('group rounded-2xl border border-green-200 bg-green-50/60', className)}>
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-5 py-3 text-sm font-semibold text-green-900 marker:hidden [&::-webkit-details-marker]:hidden">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-green-500 text-navy">
          <WifiLow className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="flex-1">
          Version bas débit
          <span className="block text-xs font-normal text-green-800">
            {[transcript ? 'transcription' : null, audioUrl ? 'audio' : null, documentUrl ? 'document' : null].filter(Boolean).join(' · ')}
          </span>
        </span>
        <span className="text-xs text-green-800 group-open:hidden">Afficher</span>
        <span className="hidden text-xs text-green-800 group-open:inline">Masquer</span>
      </summary>
      <div className="flex flex-col gap-5 border-t border-green-200 px-5 py-5">
        {audioUrl ? (
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-navy">
              <Headphones className="size-4 text-green-700" aria-hidden="true" />
              {alternative?.label ?? 'Capsule audio (version légère)'}
            </p>
            <audio controls preload="none" src={audioUrl} className="w-full">
              Votre navigateur ne prend pas en charge la lecture audio.
            </audio>
          </div>
        ) : null}
        {documentUrl ? (
          <a href={documentUrl} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
            <FileText className="size-4" aria-hidden="true" />
            {alternative?.label ?? 'Télécharger le document de remplacement'}
            <Download className="size-3.5" aria-hidden="true" />
          </a>
        ) : null}
        {transcript ? (
          <div>
            <p className="mb-2 text-sm font-semibold text-navy">Transcription intégrale</p>
            <Prose html={transcriptToHtml(transcript)} className="text-base" />
          </div>
        ) : null}
      </div>
    </details>
  )
}
