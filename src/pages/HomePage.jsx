import { useAuth } from '../context/useAuth'
import {
  Header,
  Hero,
  ProblemSection,
  FeaturesSection,
  StepsSection,
  AudienceSection,
  FinalCta,
  Footer
} from '../components/home/HomeSections'

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <main className="min-h-screen bg-[#f8f9ff] text-[#0b1c30]">
      <Header isAuthenticated={isAuthenticated} />
      <Hero />
      <ProblemSection />
      <FeaturesSection />
      <StepsSection />
      <AudienceSection />
      <FinalCta />
      <Footer />
    </main>
  )
}
