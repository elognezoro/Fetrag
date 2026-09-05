'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Prose } from '@fetrag/ui'

export interface FaqAccordionItem {
  id: string
  question: string
  /** HTML déjà assaini par le CMS (`faq.listActive`). */
  answer: string
}

interface FaqAccordionProps {
  items: FaqAccordionItem[]
  /** Identifiant de l'élément ouvert par défaut. */
  defaultOpen?: string
  className?: string
}

/** Liste de questions / réponses en accordéon accessible (une réponse ouverte à la fois). */
export function FaqAccordion({ items, defaultOpen, className }: FaqAccordionProps) {
  return (
    <Accordion type="single" collapsible defaultValue={defaultOpen} className={className ?? 'flex flex-col gap-3'}>
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger>
            <span className="font-display text-base leading-snug sm:text-lg">{item.question}</span>
          </AccordionTrigger>
          <AccordionContent>
            <Prose html={item.answer} className="text-[0.95rem]" />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
