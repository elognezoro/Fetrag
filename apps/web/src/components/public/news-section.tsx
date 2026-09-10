import { Newspaper } from 'lucide-react'
import type { ArticleCard as ArticleCardData } from '@fetrag/cms'
import { EmptyState, Reveal, Section, SectionHeading, Stagger, StaggerItem } from '@fetrag/ui'
import { ArticleCard } from './article-card'
import { SectionLink } from './section-link'

interface NewsSectionProps {
  articles: ArticleCardData[]
}

/** Section « Actualités » de l'accueil : trois dernières publications (la première mise en avant). */
export function NewsSection({ articles }: NewsSectionProps) {
  const [first, ...rest] = articles
  return (
    <Section variant="white" padding="lg" bordered aria-labelledby="news-title">
      <Reveal>
        <SectionHeading
          eyebrow="Actualités"
          tone="gold"
          title={
            <span id="news-title">
              La vie de la <span className="italic text-gold-700">Fédération</span>
            </span>
          }
          description="Communiqués, prises de position, comptes rendus de négociations et informations pratiques pour les travailleurs et leurs organisations."
          actions={<SectionLink href="/actualites">Toutes les actualités</SectionLink>}
          className="mb-10"
        />
      </Reveal>
      {!first ? (
        <EmptyState icon={Newspaper} title="Aucune actualité publiée pour le moment" description="Les prochaines publications de la Fédération apparaîtront ici." />
      ) : (
        <Stagger className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr]">
          <StaggerItem className="h-full">
            <ArticleCard article={first} featured priority />
          </StaggerItem>
          {rest.length > 0 ? (
            <div className="grid gap-5">
              {rest.map((article) => (
                <StaggerItem key={article.id} className="h-full">
                  <ArticleCard article={article} className="lg:flex-row lg:[&>a]:w-2/5 lg:[&>a>div]:h-full" />
                </StaggerItem>
              ))}
            </div>
          ) : null}
        </Stagger>
      )}
    </Section>
  )
}
