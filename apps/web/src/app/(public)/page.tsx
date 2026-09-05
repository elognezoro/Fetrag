import type { Metadata } from 'next'
import { seo } from '@fetrag/cms'
import { Container, MottoStrip, TriptychStrip } from '@fetrag/ui'
import { EventsSection } from '@/components/public/events-section'
import { HeroHome } from '@/components/public/hero-home'
import { JsonLd } from '@/components/public/json-ld'
import { MembershipCta } from '@/components/public/membership-cta'
import { MissionSection } from '@/components/public/mission-section'
import { NewsSection } from '@/components/public/news-section'
import { NewsletterSection } from '@/components/public/newsletter-section'
import { PartnersMarquee } from '@/components/public/partners-marquee'
import { ProgrammeSection } from '@/components/public/programme-section'
import { ServicesSection } from '@/components/public/services-section'
import { SgMessage } from '@/components/public/sg-message'
import { siteConfig } from '@/lib/site'
import { getHomeData } from '@/server/public/home'

export const revalidate = 300

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} - ${siteConfig.fullName}` },
  description: siteConfig.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    title: `${siteConfig.name} - ${siteConfig.fullName}`,
    description: siteConfig.description,
  },
}

/** Bande de la devise et du triptyque fondateur, entre le hero et la mission. */
function MottoBand() {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <Container className="flex flex-col items-center gap-5 py-6 lg:flex-row lg:justify-between">
        <div className="flex flex-col items-center gap-2 lg:items-start">
          <p className="eyebrow text-[11px] text-neutral-500">Notre devise</p>
          <MottoStrip variant="ribbon" size="md" tilt />
        </div>
        <div className="w-full max-w-2xl">
          <TriptychStrip variant="bar" />
        </div>
      </Container>
    </div>
  )
}

/** Accueil de fetrag.ga : hero, devise, mission, mot du SG, programme, actualités, services, agenda, partenaires, adhésion, newsletter. */
export default async function HomePage() {
  const data = await getHomeData()
  return (
    <>
      <JsonLd data={seo.organizationJsonLd()} />
      <HeroHome stats={data.stats} />
      <MottoBand />
      <MissionSection />
      <SgMessage />
      <ProgrammeSection modules={data.modules} fromCatalog={data.modulesFromCatalog} />
      <NewsSection articles={data.articles} />
      <ServicesSection services={data.services} />
      <EventsSection events={data.events} />
      <PartnersMarquee affiliates={data.affiliates} partners={data.partners} />
      <MembershipCta />
      <NewsletterSection />
    </>
  )
}
