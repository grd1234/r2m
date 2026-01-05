import { Navigation } from '@/components/shared/Navigation'
import { Hero } from '@/components/landing/Hero'
import { CVSExplainer } from '@/components/landing/CVSExplainer'
import { PersonaRoles } from '@/components/landing/PersonaRoles'
import { MarketplaceBridge } from '@/components/landing/MarketplaceBridge'
import { WhyR2M } from '@/components/landing/WhyR2M'
import { Footer } from '@/components/shared/Footer'
import { HelpButton } from '@/components/shared/HelpButton'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800">
      <Navigation />
      <Hero />
      <PersonaRoles />
      <CVSExplainer />
      <MarketplaceBridge />
      <WhyR2M />
      <Footer />
      <HelpButton />
    </div>
  )
}
