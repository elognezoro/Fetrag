import Link from 'next/link'
import { ArrowRight, Handshake, UserPlus } from 'lucide-react'
import { ArcRing, Button, Emblem, MottoStrip, Reveal, Ribbon, Section } from '@fetrag/ui'

interface MembershipCtaProps {
  /** Ruban d'introduction. */
  eyebrow?: string
  title?: React.ReactNode
  description?: string
}

/** Appel à l'adhésion sur fond marine : arc vert animé autour de l'emblème, devise, deux actions. */
export function MembershipCta({
  eyebrow = 'Rejoindre la FETRAG',
  title = (
    <>
      Ensemble, construisons l&apos;avenir du <span className="italic text-gold-400">mouvement syndical</span>
    </>
  ),
  description = "Organisation syndicale ou travailleur, rejoignez une fédération qui forme ses responsables, défend les droits et privilégie le dialogue social. L'affiliation ouvre l'accès à l'appui juridique, au programme de formation et aux services aux adhérents.",
}: MembershipCtaProps) {
  return (
    <Section variant="dark" padding="lg" aria-labelledby="membership-title" rings={{ scheme: 'light', opacity: 0.12, position: 'top-right', rings: 5 }}>
      <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <Reveal>
          <Ribbon tone="gold" size="lg" tilt>
            {eyebrow}
          </Ribbon>
          <h2 id="membership-title" className="mt-6 font-display text-3xl font-semibold leading-tight text-white text-balance sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">{description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="gold" size="xl">
              <Link href="/adhesion">
                <UserPlus aria-hidden="true" />
                Demander l&apos;adhésion
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="border-white/60 text-white hover:bg-white/10">
              <Link href="/partenariat">
                <Handshake aria-hidden="true" />
                Proposer un partenariat
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <MottoStrip variant="inline" inverted className="mt-8" />
        </Reveal>
        <Reveal delay={0.15} y={24} className="mx-auto">
          <ArcRing size={260} stroke={18} tone="green" progress={100} track={false} duration={2}>
            <span className="flex size-40 items-center justify-center rounded-full bg-white shadow-lift">
              <Emblem size={112} decorative />
            </span>
          </ArcRing>
        </Reveal>
      </div>
    </Section>
  )
}
