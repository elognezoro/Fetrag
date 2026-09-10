import type { LucideIcon } from 'lucide-react'
import { Stagger, StaggerItem, cn, padNumber, toneAt, toneClasses } from '@fetrag/ui'

export interface StepItem {
  title: string
  description: string
  icon?: LucideIcon
}

interface StepsListProps {
  steps: StepItem[]
  columns?: 2 | 3 | 4
  className?: string
}

/** Étapes numérotées (01, 02, 03…) reliées par un filet tricolore, chacune dans la couleur de son pilier. */
export function StepsList({ steps, columns = 4, className }: StepsListProps) {
  const cols = columns === 2 ? 'sm:grid-cols-2' : columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'
  return (
    <Stagger as="ol" className={cn('relative grid grid-cols-1 gap-5', cols, className)}>
      <span aria-hidden="true" className="absolute inset-x-8 top-9 hidden h-0.5 rounded-full bg-gradient-to-r from-blue-500 via-green-500 to-gold-500 lg:block" />
      {steps.map((step, index) => {
        const tone = toneAt(index)
        const classes = toneClasses[tone]
        const Icon = step.icon
        return (
          <StaggerItem key={step.title} as="li" className="relative h-full">
            <article className={cn('flex h-full flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft', classes.topRule)}>
              <div className="flex items-center justify-between">
                <span className={cn('relative z-10 inline-flex size-12 items-center justify-center rounded-full border-[3px] bg-white font-display text-xl font-semibold', classes.border, classes.text)}>
                  {padNumber(index + 1)}
                </span>
                {Icon ? (
                  <span className={cn('inline-flex size-10 items-center justify-center rounded-full', classes.soft, classes.softText)}>
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                ) : null}
              </div>
              <h3 className="font-display text-lg font-semibold leading-tight text-navy">
                <span className="sr-only">Étape {padNumber(index + 1)} : </span>
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-neutral-600">{step.description}</p>
            </article>
          </StaggerItem>
        )
      })}
    </Stagger>
  )
}
