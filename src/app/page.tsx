import type { Metadata } from 'next';
import { Navigation } from '@/components/landing/Navigation';
import { HeroSection } from '@/components/landing/HeroSection';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';

export const metadata: Metadata = {
  title: 'Türkan Abla - Beauty Services Platform',
  description: 'Book professional beauty and wellness services in the UK',
};

export default function LandingPage() {
  return (
    <>
      <Navigation />
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <PricingSection />
      <TestimonialsSection />
    </>
  );
}
