import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, cn } from '@fetrag/ui'

export interface EditorSectionProps {
  title: ReactNode
  description?: ReactNode
  pillar?: 'protection' | 'prevention' | 'defense'
  children: ReactNode
  className?: string
}

/** Bloc d'un formulaire d'édition (carte avec filet coloré). Composant serveur. */
export function EditorSection({ title, description, pillar, children, className }: EditorSectionProps) {
  return (
    <Card pillar={pillar} className={cn('h-auto', className)}>
      <CardHeader>
        <CardTitle as="h2">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-5">{children}</CardContent>
    </Card>
  )
}

export interface EditorLayoutProps {
  main: ReactNode
  aside: ReactNode
}

/** Disposition deux colonnes des éditeurs : contenu principal et panneau latéral collant (publication, métadonnées). */
export function EditorLayout({ main, aside }: EditorLayoutProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex min-w-0 flex-col gap-6">{main}</div>
      <div className="flex flex-col gap-6 xl:sticky xl:top-[calc(var(--header-height)+1.5rem)] xl:self-start">{aside}</div>
    </div>
  )
}
