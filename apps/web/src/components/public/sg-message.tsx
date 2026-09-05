import Image from 'next/image'
import { Quote, Star } from 'lucide-react'
import { GradientDivider, Reveal, Ribbon, Section } from '@fetrag/ui'
import { SG_MESSAGE, SG_NAME, SG_PHOTO, SG_TITLE } from '@/server/public/institution'

/** Portrait 2:3 du Secrétaire Général dans un cadre à anneau bleu et étoile or. */
export function SgPortrait({ priority = false, className }: { priority?: boolean; className?: string }) {
  return (
    <figure className={`relative mx-auto w-full max-w-xs sm:max-w-sm ${className ?? ''}`}>
      <span aria-hidden="true" className="absolute -inset-3 rounded-[2rem] border-[3px] border-blue-500/25" />
      <span aria-hidden="true" className="absolute -inset-6 rounded-[2.5rem] border border-dashed border-green-500/40" />
      <div className="relative aspect-[2/3] overflow-hidden rounded-[1.75rem] border-4 border-blue-500 bg-neutral-100 shadow-lift">
        <Image src={SG_PHOTO} alt={`Portrait de ${SG_NAME}, ${SG_TITLE} de la FETRAG`} fill sizes="(min-width: 640px) 384px, 80vw" priority={priority} className="object-cover object-top" />
      </div>
      <span
        aria-hidden="true"
        className="absolute -right-4 -top-4 flex size-14 items-center justify-center rounded-full border-4 border-white bg-gold-500 text-navy shadow-soft"
      >
        <Star className="size-7 fill-navy/90" strokeWidth={1.5} />
      </span>
      <figcaption className="mt-5 text-center">
        <span className="block font-display text-xl font-semibold text-navy">{SG_NAME}</span>
        <span className="eyebrow mt-1 block text-[11px] text-blue-700">{SG_TITLE}</span>
      </figcaption>
    </figure>
  )
}

/** Section « Mot du Secrétaire Général » : portrait encadré et message intégral, signé. */
export function SgMessage() {
  return (
    <Section variant="soft" padding="lg" rings={{ position: 'top-right', opacity: 0.06, rings: 4 }} aria-labelledby="sg-title">
      <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal y={24} className="order-2 lg:order-1">
          <SgPortrait />
        </Reveal>
        <Reveal delay={0.1} className="order-1 lg:order-2">
          <Ribbon tone="gold">Mot du Secrétaire Général</Ribbon>
          <h2 id="sg-title" className="mt-5 font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">
            « Bâtir un syndicalisme <span className="italic text-blue-600">nouveau</span>, moderne et crédible »
          </h2>
          <GradientDivider className="mt-6" width="md" />
          <blockquote className="relative mt-8">
            <Quote aria-hidden="true" className="absolute -left-2 -top-4 size-12 text-gold-300 opacity-70" strokeWidth={1.25} />
            <div className="relative space-y-5 text-base leading-relaxed text-neutral-700 sm:text-[1.0625rem]">
              {SG_MESSAGE.map((paragraph, index) => (
                <p key={index} className={index === 0 ? 'font-display text-xl text-navy sm:text-2xl' : undefined}>
                  {paragraph}
                </p>
              ))}
            </div>
            <footer className="mt-8 flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-12 bg-gold-500" />
              <div>
                <p className="font-display text-lg font-semibold text-navy">{SG_NAME}</p>
                <p className="text-sm text-neutral-600">{SG_TITLE}</p>
              </div>
            </footer>
          </blockquote>
        </Reveal>
      </div>
    </Section>
  )
}
