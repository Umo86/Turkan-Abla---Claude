import type { Metadata } from 'next';
import { Navigation } from '@/components/landing/Navigation';
import { HeroSection } from '@/components/landing/HeroSection';

export const metadata: Metadata = {
  title: 'Türkan Abla - Beauty Services Platform',
  description: 'Book professional beauty and wellness services in the UK',
};

export default function LandingPage() {
  return (
    <>
      <Navigation />
      <HeroSection />
    </>
  );
}
