import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/features/hero-section';
import { CoursesSection } from '@/components/features/courses-section';
import { PartnersSection } from '@/components/features/partners-section';
import { WhySection } from '@/components/features/why-section';
import { CertificationSection } from '@/components/features/certification-section';
import { AudienceSection } from '@/components/features/audience-section';
import { FAQSection } from '@/components/features/faq-section';
import { TestimonialsSection } from '@/components/features/testimonials-section';
import { CommunitySection } from '@/components/features/community-section';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CoursesSection />
        <PartnersSection />
        <WhySection />
        <CertificationSection />
        <AudienceSection />
        <FAQSection />
        <TestimonialsSection />
        <CommunitySection />
      </main>
      <Footer />
    </div>
  );
}
