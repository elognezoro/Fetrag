'use client'

import * as React from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Info,
  Lightbulb,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import {
  type GuideBlock,
  type GuideCalloutTone,
  type GuideIconKey,
  type GuideStatusTone,
  type GuideStep,
  type GuideTone,
} from '@fetrag/contracts'

import { cn } from '../../lib/cn'
import { toneClasses } from '../../lib/tones'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../accordion'
import { Alert, AlertDescription, AlertTitle, type AlertProps } from '../alert'
import { Badge, type BadgeProps } from '../badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card'
import { guideIcon } from './guide-icons'
import { GuideLink, renderGuideInline, type GuideBaseUrls } from './guide-inline'

/** Niveau de titre des blocs titrés : `3` dans une section, `4` dans une sous-section. */
export type GuideHeadingLevel = 3 | 4

export interface GuideBlockContext {
  baseUrls: GuideBaseUrls
  tone: GuideTone
  headingLevel: GuideHeadingLevel
  /** Ouvre toutes les questions fréquentes (impression). */
  expandAll?: boolean
}

function BlockTitle({ level, className, children }: { level: GuideHeadingLevel; className?: string; children: React.ReactNode }) {
  const Tag: 'h3' | 'h4' = level === 3 ? 'h3' : 'h4'
  return (
    <Tag className={cn('font-display text-lg font-semibold leading-snug tracking-tight text-navy sm:text-xl', level === 4 && 'text-base sm:text-lg', className)}>
      {children}
    </Tag>
  )
}

/* ---------------------------------------------------------------------------
   Paragraphe
   ------------------------------------------------------------------------- */

export function GuideParagraph({ text, baseUrls, className }: { text: string; baseUrls: GuideBaseUrls; className?: string }) {
  return <p className={cn('text-base leading-relaxed text-neutral-800', className)}>{renderGuideInline(text, { baseUrls })}</p>
}

/* ---------------------------------------------------------------------------
   Étapes numérotées
   ------------------------------------------------------------------------- */

export interface GuideStepsProps {
  items: GuideStep[]
  baseUrls: GuideBaseUrls
  tone: GuideTone
  title?: string
  intro?: string
  headingLevel?: GuideHeadingLevel
  className?: string
}

/** Liste ordonnée : gros numéro serif dans un disque de la tonalité, action, élément, résultat attendu. */
export function GuideSteps({ items, baseUrls, tone, title, intro, headingLevel = 3, className }: GuideStepsProps) {
  const t = toneClasses[tone]
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {title ? <BlockTitle level={headingLevel}>{title}</BlockTitle> : null}
      {intro ? <p className="text-base leading-relaxed text-neutral-700">{renderGuideInline(intro, { baseUrls })}</p> : null}
      <ol className="flex flex-col gap-3">
        {items.map((step, index) => {
          const StepIcon = step.icon ? guideIcon(step.icon) : null
          return (
            <li
              key={index}
              className="relative flex gap-3 rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-soft sm:gap-4 sm:p-4"
            >
              <span
                aria-hidden="true"
                className={cn('flex size-10 shrink-0 items-center justify-center rounded-full font-display text-lg font-semibold leading-none sm:size-11 sm:text-xl', t.bg, t.onTone)}
              >
                {index + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="text-base font-medium leading-relaxed text-ink">
                  <span className="sr-only">Étape {index + 1} : </span>
                  {renderGuideInline(step.text, { baseUrls })}
                </p>
                {step.ui || step.where ? (
                  <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-neutral-600">
                    {step.ui ? (
                      <>
                        <span className="font-semibold text-neutral-700">Élément :</span>
                        <span>{renderGuideInline(`\`${step.ui}\``, { baseUrls })}</span>
                      </>
                    ) : (
                      <span className="font-semibold text-neutral-700">Où :</span>
                    )}
                    {step.where ? <span className="text-neutral-500">{renderGuideInline(step.where, { baseUrls })}</span> : null}
                  </p>
                ) : null}
                {step.result ? (
                  <p className="flex gap-2 text-sm leading-relaxed text-neutral-700">
                    <CheckCircle2 aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-green-700" />
                    <span>
                      <span className="font-semibold text-green-800">Résultat attendu : </span>
                      {renderGuideInline(step.result, { baseUrls })}
                    </span>
                  </p>
                ) : null}
                {step.note ? (
                  <p className="flex gap-2 rounded-xl bg-blue-50/70 px-3 py-2 text-sm leading-relaxed text-blue-900">
                    <Info aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-blue-600" />
                    <span>{renderGuideInline(step.note, { baseUrls })}</span>
                  </p>
                ) : null}
              </div>
              {StepIcon ? (
                <StepIcon aria-hidden="true" strokeWidth={1.5} className={cn('hidden size-5 shrink-0 self-start sm:block', t.text)} />
              ) : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Liste
   ------------------------------------------------------------------------- */

export function GuideList({
  items,
  style = 'bullet',
  title,
  baseUrls,
  headingLevel = 3,
}: {
  items: string[]
  style?: 'bullet' | 'check'
  title?: string
  baseUrls: GuideBaseUrls
  headingLevel?: GuideHeadingLevel
}) {
  return (
    <div className="flex flex-col gap-3">
      {title ? <BlockTitle level={headingLevel}>{title}</BlockTitle> : null}
      <ul className={cn('flex flex-col gap-2', style === 'bullet' && 'list-disc pl-5 marker:text-green-600')}>
        {items.map((item, index) => (
          <li key={index} className={cn('text-base leading-relaxed text-neutral-800', style === 'check' && 'flex gap-3')}>
            {style === 'check' ? (
              <span aria-hidden="true" className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">
                <Check className="size-3.5" strokeWidth={2.5} />
              </span>
            ) : null}
            <span className={cn(style === 'bullet' && 'pl-1')}>{renderGuideInline(item, { baseUrls })}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Encadré
   ------------------------------------------------------------------------- */

const calloutVariant: Record<GuideCalloutTone, NonNullable<AlertProps['variant']>> = {
  info: 'info',
  tip: 'success',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
}

const calloutLabel: Record<GuideCalloutTone, string> = {
  info: 'À savoir',
  tip: 'Conseil',
  success: 'Bon à savoir',
  warning: 'Attention',
  danger: 'Important',
}

export function GuideCallout({ tone, title, text, baseUrls }: { tone: GuideCalloutTone; title?: string; text: string; baseUrls: GuideBaseUrls }) {
  return (
    <Alert variant={calloutVariant[tone]} icon={tone === 'tip' ? Lightbulb : undefined}>
      <AlertTitle>{title ?? calloutLabel[tone]}</AlertTitle>
      <AlertDescription className="text-[0.95rem] leading-relaxed">{renderGuideInline(text, { baseUrls })}</AlertDescription>
    </Alert>
  )
}

/* ---------------------------------------------------------------------------
   Tableau
   ------------------------------------------------------------------------- */

export function GuideTable({ columns, rows, caption, baseUrls }: { columns: string[]; rows: string[][]; caption?: string; baseUrls: GuideBaseUrls }) {
  return (
    <div className="prose-fetrag w-full overflow-x-auto overscroll-x-contain rounded-xl border border-neutral-200 bg-white text-sm shadow-soft">
      <table className="min-w-[32rem]">
        {caption ? <caption className="px-4 py-3 text-left text-sm text-neutral-500 [caption-side:bottom]">{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} scope="col" className="border-x-0! border-t-0!">
                {renderGuideInline(column, { baseUrls })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((_, cellIndex) => (
                <td key={cellIndex} className="border-x-0! align-top">
                  {row[cellIndex] ? renderGuideInline(row[cellIndex] ?? '', { baseUrls }) : <span className="text-neutral-400">-</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Lexique
   ------------------------------------------------------------------------- */

export function GuideDefinitions({
  items,
  title,
  baseUrls,
  tone,
  headingLevel = 3,
}: {
  items: Array<{ term: string; definition: string }>
  title?: string
  baseUrls: GuideBaseUrls
  tone: GuideTone
  headingLevel?: GuideHeadingLevel
}) {
  const t = toneClasses[tone]
  return (
    <div className="flex flex-col gap-3">
      {title ? <BlockTitle level={headingLevel}>{title}</BlockTitle> : null}
      <dl className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {items.map((item, index) => (
          <div key={index} className={cn('flex flex-col gap-1 rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft', 'border-l-4', t.border)}>
            <dt className="font-display text-base font-semibold text-navy">{renderGuideInline(item.term, { baseUrls })}</dt>
            <dd className="text-sm leading-relaxed text-neutral-700">{renderGuideInline(item.definition, { baseUrls })}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Questions fréquentes
   ------------------------------------------------------------------------- */

export function GuideFaq({
  items,
  title,
  baseUrls,
  headingLevel = 3,
  expandAll = false,
}: {
  items: Array<{ question: string; answer: string }>
  title?: string
  baseUrls: GuideBaseUrls
  headingLevel?: GuideHeadingLevel
  expandAll?: boolean
}) {
  const id = React.useId()
  const [open, setOpen] = React.useState<string[]>([])
  const all = React.useMemo(() => items.map((_, index) => `${id}-${index}`), [id, items])
  const value = expandAll ? all : open

  return (
    <div className="flex flex-col gap-3">
      {title ? <BlockTitle level={headingLevel}>{title}</BlockTitle> : null}
      <Accordion type="multiple" value={value} onValueChange={setOpen} className="flex flex-col gap-2">
        {items.map((item, index) => (
          <AccordionItem key={index} value={`${id}-${index}`}>
            <AccordionTrigger className="text-base">
              <span className="flex gap-3">
                <HelpCircle aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-5 shrink-0 text-blue-600" />
                <span>{renderGuideInline(item.question, { baseUrls })}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-[0.95rem]">
              <div className="sm:pl-8">{renderGuideInline(item.answer, { baseUrls })}</div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Chemin de navigation
   ------------------------------------------------------------------------- */

export function GuidePath({ items, label, href, baseUrls, tone }: { items: string[]; label?: string; href?: string; baseUrls: GuideBaseUrls; tone: GuideTone }) {
  const t = toneClasses[tone]
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/70 p-3.5 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
      <p className="flex min-w-0 flex-1 flex-wrap items-center gap-y-2">
        {label ? <span className="eyebrow mr-3 text-[11px] text-neutral-500">{label}</span> : <span className="sr-only">Chemin : </span>}
        {items.map((item, index) => (
          <span key={index} className="inline-flex items-center">
            {index > 0 ? <ChevronRight aria-hidden="true" strokeWidth={2} className="mx-1 size-4 shrink-0 text-neutral-400" /> : null}
            <span className={cn('rounded-full border bg-white px-3 py-1 text-sm font-semibold text-navy', index === items.length - 1 ? t.border : 'border-neutral-200')}>
              {renderGuideInline(item, { baseUrls })}
            </span>
          </span>
        ))}
      </p>
      {href ? (
        <GuideLink href={href} baseUrls={baseUrls} className="inline-flex min-h-11 items-center gap-1.5 self-start no-underline sm:self-auto">
          Ouvrir
          <ArrowUpRight aria-hidden="true" strokeWidth={2} className="size-4" />
        </GuideLink>
      ) : null}
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Écran (se repérer)
   ------------------------------------------------------------------------- */

export function GuideScreen({
  title,
  description,
  areas,
  baseUrls,
  tone,
  headingLevel = 3,
}: {
  title: string
  description?: string
  areas: Array<{ name: string; purpose: string; icon?: GuideIconKey }>
  baseUrls: GuideBaseUrls
  tone: GuideTone
  headingLevel?: GuideHeadingLevel
}) {
  const t = toneClasses[tone]
  return (
    <Card as="section" pillar={tone} className="overflow-hidden">
      <CardHeader className="gap-1 p-5 sm:p-6">
        <p className={cn('eyebrow text-[11px]', t.text)}>Se repérer</p>
        <CardTitle as={headingLevel === 3 ? 'h3' : 'h4'}>{renderGuideInline(title, { baseUrls })}</CardTitle>
        {description ? <CardDescription>{renderGuideInline(description, { baseUrls })}</CardDescription> : null}
      </CardHeader>
      <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
        <ul className="flex flex-col divide-y divide-neutral-100">
          {areas.map((area, index) => {
            const AreaIcon: LucideIcon = guideIcon(area.icon)
            return (
              <li key={index} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <span aria-hidden="true" className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', t.soft, t.softText)}>
                  <AreaIcon className="size-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-navy">{renderGuideInline(area.name, { baseUrls })}</p>
                  <p className="text-sm leading-relaxed text-neutral-600">{renderGuideInline(area.purpose, { baseUrls })}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

/* ---------------------------------------------------------------------------
   Liens
   ------------------------------------------------------------------------- */

export interface GuideLinkItem {
  label: string
  href: string
  description?: string
  external?: boolean
  icon?: GuideIconKey
}

export function GuideLinks({
  items,
  title,
  baseUrls,
  tone,
  headingLevel = 3,
}: {
  items: GuideLinkItem[]
  title?: string
  baseUrls: GuideBaseUrls
  tone: GuideTone
  headingLevel?: GuideHeadingLevel
}) {
  const t = toneClasses[tone]
  return (
    <div className="flex flex-col gap-3">
      {title ? <BlockTitle level={headingLevel}>{title}</BlockTitle> : null}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item, index) => {
          const ItemIcon = guideIcon(item.icon, item.external ? ExternalLink : ArrowUpRight)
          const Trailing = item.external ? ExternalLink : ArrowUpRight
          return (
            <li key={index} className="min-w-0">
              <GuideLink
                href={item.href}
                baseUrls={baseUrls}
                external={item.external}
                className={cn(
                  'group flex min-h-11 items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 no-underline shadow-soft',
                  'transition-[transform,box-shadow,border-color] duration-180 ease-out-expo hover:-translate-y-0.5 hover:shadow-lift hover:no-underline',
                  'hover:border-blue-300',
                )}
              >
                <span aria-hidden="true" className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', t.soft, t.softText)}>
                  <ItemIcon className="size-4" strokeWidth={1.75} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-semibold text-navy">{renderGuideInline(item.label, { baseUrls })}</span>
                  {item.description ? <span className="text-sm font-normal leading-relaxed text-neutral-600">{renderGuideInline(item.description, { baseUrls })}</span> : null}
                </span>
                <Trailing aria-hidden="true" strokeWidth={2} className="mt-1 size-4 shrink-0 text-neutral-400 transition-colors group-hover:text-blue-600" />
              </GuideLink>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Si ça ne marche pas
   ------------------------------------------------------------------------- */

export function GuideTroubleshooting({
  items,
  title,
  baseUrls,
  headingLevel = 3,
}: {
  items: Array<{ problem: string; cause?: string; solution: string }>
  title?: string
  baseUrls: GuideBaseUrls
  headingLevel?: GuideHeadingLevel
}) {
  return (
    <div className="flex flex-col gap-3">
      <BlockTitle level={headingLevel} className="flex items-center gap-2">
        <Wrench aria-hidden="true" strokeWidth={1.75} className="size-5 text-gold-700" />
        {title ?? 'Si ça ne marche pas'}
      </BlockTitle>
      <ul className="flex flex-col gap-3">
        {items.map((item, index) => (
          <li key={index} className="grid grid-cols-1 gap-2 rounded-2xl border border-gold-200 bg-gold-50/40 p-4 sm:grid-cols-3 sm:gap-4">
            <div className="flex gap-2">
              <AlertTriangle aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-gold-700" />
              <p className="text-sm leading-relaxed">
                <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-gold-800">Problème</span>
                <span className="font-semibold text-navy">{renderGuideInline(item.problem, { baseUrls })}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <HelpCircle aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-blue-600" />
              <p className="text-sm leading-relaxed text-neutral-700">
                <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-blue-700">Cause probable</span>
                {item.cause ? renderGuideInline(item.cause, { baseUrls }) : <span className="text-neutral-400">Non précisée</span>}
              </p>
            </div>
            <div className="flex gap-2">
              <Wrench aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-green-700" />
              <p className="text-sm leading-relaxed text-neutral-800">
                <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-green-800">Solution</span>
                {renderGuideInline(item.solution, { baseUrls })}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Statuts
   ------------------------------------------------------------------------- */

const statusVariant: Record<GuideStatusTone, NonNullable<BadgeProps['variant']>> = {
  neutral: 'neutral',
  info: 'blue',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
}

export function GuideStatuses({
  items,
  title,
  baseUrls,
  headingLevel = 3,
}: {
  items: Array<{ label: string; tone: GuideStatusTone; meaning: string; next?: string }>
  title?: string
  baseUrls: GuideBaseUrls
  headingLevel?: GuideHeadingLevel
}) {
  return (
    <div className="flex flex-col gap-3">
      <BlockTitle level={headingLevel}>{title ?? 'Lire les statuts'}</BlockTitle>
      <ul className="flex flex-col divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white shadow-soft">
        {items.map((item, index) => (
          <li key={index} className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
            <div>
              <Badge variant={statusVariant[item.tone]} dot size="lg" className="whitespace-normal text-left">
                {item.label}
              </Badge>
            </div>
            <div className="flex flex-col gap-1 text-sm leading-relaxed">
              <p className="text-neutral-800">{renderGuideInline(item.meaning, { baseUrls })}</p>
              {item.next ? (
                <p className="flex gap-2 text-neutral-600">
                  <ChevronRight aria-hidden="true" strokeWidth={2} className="mt-0.5 size-4 shrink-0 text-green-700" />
                  <span>
                    <span className="font-semibold text-neutral-700">Ce que vous pouvez faire : </span>
                    {renderGuideInline(item.next, { baseUrls })}
                  </span>
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Aiguillage
   ------------------------------------------------------------------------- */

export interface GuideBlockViewProps extends GuideBlockContext {
  block: GuideBlock
}

/** Rend un bloc de guide avec le composant correspondant à son type. */
export function GuideBlockView({ block, baseUrls, tone, headingLevel, expandAll }: GuideBlockViewProps) {
  switch (block.type) {
    case 'paragraph':
      return <GuideParagraph text={block.text} baseUrls={baseUrls} />
    case 'steps':
      return <GuideSteps items={block.items} title={block.title} intro={block.intro} baseUrls={baseUrls} tone={tone} headingLevel={headingLevel} />
    case 'list':
      return <GuideList items={block.items} style={block.style} title={block.title} baseUrls={baseUrls} headingLevel={headingLevel} />
    case 'callout':
      return <GuideCallout tone={block.tone} title={block.title} text={block.text} baseUrls={baseUrls} />
    case 'table':
      return <GuideTable columns={block.columns} rows={block.rows} caption={block.caption} baseUrls={baseUrls} />
    case 'definitions':
      return <GuideDefinitions items={block.items} title={block.title} baseUrls={baseUrls} tone={tone} headingLevel={headingLevel} />
    case 'faq':
      return <GuideFaq items={block.items} title={block.title} baseUrls={baseUrls} headingLevel={headingLevel} expandAll={expandAll} />
    case 'path':
      return <GuidePath items={block.items} label={block.label} href={block.href} baseUrls={baseUrls} tone={tone} />
    case 'screen':
      return <GuideScreen title={block.title} description={block.description} areas={block.areas} baseUrls={baseUrls} tone={tone} headingLevel={headingLevel} />
    case 'links':
      return <GuideLinks items={block.items} title={block.title} baseUrls={baseUrls} tone={tone} headingLevel={headingLevel} />
    case 'troubleshooting':
      return <GuideTroubleshooting items={block.items} title={block.title} baseUrls={baseUrls} headingLevel={headingLevel} />
    case 'statuses':
      return <GuideStatuses items={block.items} title={block.title} baseUrls={baseUrls} headingLevel={headingLevel} />
  }
}
