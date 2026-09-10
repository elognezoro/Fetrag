import Image from 'next/image'
import { Quote } from 'lucide-react'
import { GradientDivider, Reveal, Ribbon, RingBackdrop } from '@fetrag/ui'
import { siteConfig } from '@/lib/site'

/** Mot du Secrétaire Général (texte officiel, BUILD_BRIEF §6) avec portrait. */
export function SgQuote() {
  return (
    <section className="relative isolate overflow-hidden border-t border-neutral-200 bg-neutral-50 py-16 sm:py-20">
      <RingBackdrop position="bottom-left" opacity={0.05} rings={3} />
      <div className="container-fetrag grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-center">
        <Reveal className="mx-auto w-full max-w-xs lg:mx-0">
          <div className="relative overflow-hidden rounded-[2rem] border-4 border-white shadow-lift">
            <Image src="/brand/sg-ngoma-600.webp" alt={`Portrait de ${siteConfig.secretaryGeneral}, Secrétaire Général de la FETRAG`} width={600} height={900} className="h-auto w-full object-cover" sizes="(min-width: 1024px) 320px, 80vw" />
            <div aria-hidden="true" className="tricolor-band absolute inset-x-0 bottom-0 h-1.5" />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <Ribbon tone="blue">Le mot du Secrétaire Général</Ribbon>
          <blockquote className="mt-5">
            <Quote className="size-8 text-gold-500" aria-hidden="true" />
            <p className="mt-3 font-display text-xl leading-relaxed text-navy sm:text-2xl">
              Dans un monde du travail en pleine mutation, où les défis sociaux, économiques et professionnels deviennent chaque jour plus complexes, notre responsabilité est claire : bâtir un
              syndicalisme nouveau, moderne, crédible et profondément attaché à la défense de la dignité du travailleur gabonais.
            </p>
            <p className="mt-4 text-base leading-relaxed text-neutral-700">
              La FETRAG est née d’une conviction forte : le progrès social ne peut se construire sans des organisations syndicales responsables, compétentes, réformatrices et capables de
              dialoguer avec intelligence, fermeté et vision. Nous portons un syndicalisme de propositions, un syndicalisme de résultats, un syndicalisme qui refuse la résignation et qui
              croit en la capacité des travailleurs du Gabon à devenir des acteurs majeurs du développement national.
            </p>
            <GradientDivider className="mt-6" width="sm" />
            <footer className="mt-4">
              <p className="font-display text-lg font-semibold text-navy">{siteConfig.secretaryGeneral}</p>
              <p className="text-sm text-neutral-600">Secrétaire Général de la Fédération des Travailleurs du Gabon</p>
            </footer>
          </blockquote>
        </Reveal>
      </div>
    </section>
  )
}
