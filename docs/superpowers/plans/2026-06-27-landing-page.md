# Türkan Abla Marketing Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a modern, elegant, sleek public-facing marketing landing page for Türkan Abla platform with hero, services, about, pricing, testimonials, and CTA sections.

**Architecture:** 
Single-page landing page served at root (`/`) with smooth scrolling sections, modern gradient backgrounds, card-based layouts, and high-quality imagery placeholders. Built as a server component with no database dependencies. Uses Tailwind CSS for styling with a warm/elegant color palette (browns, golds, creams). Responsive design mobile-first with desktop enhancements.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, React components, shadcn/ui, date-fns for scheduling

## Global Constraints

- Landing page served at root `/` route (public, no auth required)
- Main app remains under `/app/` and `/api/` routes (authenticated, existing functionality)
- Color palette: Warm earth tones (browns #8B6F47, golds #D4A574, creams #F5F1E8, accents #E8D4C4)
- Typography: Modern sans-serif (Geist), elegant serif for headings (optional)
- All images are placeholders using gradient backgrounds or Unsplash images
- Responsive: Mobile-first, tablet 768px, desktop 1024px breakpoints
- Performance: <3s load time, <90KB JS bundle for landing page
- CTA buttons link to `/app/auth/signup/customer` (customer onboarding)
- Contact form submits to `/api/contact` (email notification)
- No authentication required for landing page

---

## Task 1: Create Landing Page Layout & Hero Section

**Files:**
- Create: `src/app/(landing)/layout.tsx` — Root landing page layout
- Create: `src/app/(landing)/page.tsx` — Hero section & page structure
- Create: `src/components/landing/HeroSection.tsx` — Hero component with CTA
- Create: `src/components/landing/Navigation.tsx` — Top navigation bar
- Modify: `src/app/layout.tsx` — Add route group for landing page

**Interfaces:**
- Consumes: None
- Produces: Hero component with `title`, `subtitle`, `ctaText`, `ctaLink` props

**Context:**
Navigation should include: Logo, Services link, About link, Contact link, Pricing link, Book Now button. Hero should have full-width background gradient, centered text, and prominent CTA button.

- [ ] **Step 1: Create landing page route group layout**

```bash
mkdir -p src/app/\(landing\)
```

Create `src/app/(landing)/layout.tsx`:

```typescript
import { ReactNode } from 'react';

export const metadata = {
  title: 'Türkan Abla - Beauty Services Platform',
  description: 'Book professional beauty and wellness services in the UK',
};

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create Navigation component**

Create `src/components/landing/Navigation.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navigation() {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
              Türkan Abla
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#services" className="text-gray-700 hover:text-amber-700 transition">
              Services
            </Link>
            <Link href="#about" className="text-gray-700 hover:text-amber-700 transition">
              About
            </Link>
            <Link href="#pricing" className="text-gray-700 hover:text-amber-700 transition">
              Pricing
            </Link>
            <Link href="#contact" className="text-gray-700 hover:text-amber-700 transition">
              Contact
            </Link>
          </div>

          {/* CTA Button */}
          <Button
            asChild
            className="bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700"
          >
            <Link href="/app/auth/signup/customer">Book Now</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Create Hero Section component**

Create `src/components/landing/HeroSection.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50" />

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-amber-900 via-orange-700 to-rose-700 bg-clip-text text-transparent">
            Transform Your Look
          </span>
          <br />
          <span className="text-gray-800">with Expert Services</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
          Discover professional beauty, wellness, and personal care services from trusted vendors across the UK. Book instantly, pay securely.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            className="bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 text-white text-lg h-12 px-8 rounded-lg"
          >
            <Link href="/app/auth/signup/customer">Browse Services</Link>
          </Button>
          <Button
            variant="outline"
            className="border-amber-700 text-amber-700 hover:bg-amber-50 text-lg h-12 px-8 rounded-lg"
          >
            Learn More
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 pt-16 border-t border-gray-200">
          <div>
            <div className="text-3xl font-bold text-amber-700">500+</div>
            <p className="text-gray-600">Professional Vendors</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-amber-700">10K+</div>
            <p className="text-gray-600">Happy Customers</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-amber-700">50K+</div>
            <p className="text-gray-600">Bookings Completed</p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create main landing page**

Create `src/app/(landing)/page.tsx`:

```typescript
import { Navigation } from '@/components/landing/Navigation';
import { HeroSection } from '@/components/landing/HeroSection';

export default function LandingPage() {
  return (
    <>
      <Navigation />
      <HeroSection />
      {/* Placeholder for other sections */}
      <div className="h-96 bg-gray-100 flex items-center justify-center text-gray-500">
        Services section coming next
      </div>
    </>
  );
}
```

- [ ] **Step 5: Test locally**

```bash
npm run dev
```

Navigate to `http://localhost:3000` and verify:
- Navigation bar displays with logo and links
- Hero section renders with gradient background
- CTA buttons are clickable
- Stats display correctly
- Page is responsive on mobile (375px) and desktop (1440px)

- [ ] **Step 6: Commit**

```bash
git add src/app/\(landing\)/ src/components/landing/
git commit -m "feat: add landing page layout with hero section and navigation"
```

---

## Task 2: Create Features/Services Section

**Files:**
- Create: `src/components/landing/ServicesSection.tsx` — Grid of service categories
- Create: `src/components/landing/ServiceCard.tsx` — Individual service card component

**Interfaces:**
- Consumes: None
- Produces: ServiceCard component with `icon`, `title`, `description`, `features` props

**Context:**
Show 8 service categories matching the app: Nail Salon, Hair Salon, Beauty, Massage, Spa, Personal Trainer, Pet Grooming, Tattoo. Use emoji icons and gradient backgrounds. Each card links to `/app/home?category=<category>`.

- [ ] **Step 1: Create ServiceCard component**

Create `src/components/landing/ServiceCard.tsx`:

```typescript
'use client';

import Link from 'next/link';

interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
  category: string;
  features: string[];
  color: string;
}

export function ServiceCard({
  icon,
  title,
  description,
  category,
  features,
  color,
}: ServiceCardProps) {
  return (
    <Link href={`/app/home?category=${category}`}>
      <div
        className={`group relative h-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2`}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 ${color}`} />

        {/* Content */}
        <div className="relative h-full p-8 flex flex-col justify-between text-white">
          {/* Icon & Title */}
          <div>
            <div className="text-5xl mb-4">{icon}</div>
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <p className="text-sm opacity-90 mb-4">{description}</p>
          </div>

          {/* Features */}
          <div className="space-y-2">
            {features.map((feature, i) => (
              <div key={i} className="text-sm flex items-center gap-2">
                <span className="text-lg">✓</span>
                {feature}
              </div>
            ))}
          </div>

          {/* Hover effect */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create ServicesSection component**

Create `src/components/landing/ServicesSection.tsx`:

```typescript
import { ServiceCard } from './ServiceCard';

const SERVICES = [
  {
    icon: '💅',
    title: 'Nail Salon',
    description: 'Professional nail care and art',
    category: 'Nail Salon',
    features: ['Manicure', 'Pedicure', 'Nail Art'],
    color: 'bg-gradient-to-br from-pink-400 to-rose-500',
  },
  {
    icon: '✂️',
    title: 'Hair Salon',
    description: 'Expert hair styling and coloring',
    category: 'Hair Salon',
    features: ['Haircut', 'Coloring', 'Styling'],
    color: 'bg-gradient-to-br from-amber-400 to-orange-500',
  },
  {
    icon: '💄',
    title: 'Beauty',
    description: 'Makeup and beauty treatments',
    category: 'Beauty',
    features: ['Makeup', 'Threading', 'Waxing'],
    color: 'bg-gradient-to-br from-purple-400 to-pink-500',
  },
  {
    icon: '💆',
    title: 'Massage',
    description: 'Therapeutic massage services',
    category: 'Massage',
    features: ['Swedish', 'Deep Tissue', 'Hot Stone'],
    color: 'bg-gradient-to-br from-cyan-400 to-blue-500',
  },
  {
    icon: '🧖',
    title: 'Spa',
    description: 'Relaxing spa treatments',
    category: 'Spa',
    features: ['Facials', 'Body Wraps', 'Sauna'],
    color: 'bg-gradient-to-br from-green-400 to-emerald-500',
  },
  {
    icon: '💪',
    title: 'Personal Trainer',
    description: 'Professional fitness training',
    category: 'Personal Trainer',
    features: ['1-on-1 Sessions', 'Group Classes', 'Coaching'],
    color: 'bg-gradient-to-br from-red-400 to-orange-500',
  },
  {
    icon: '🐕',
    title: 'Pet Grooming',
    description: 'Professional pet care',
    category: 'Pet Grooming',
    features: ['Bathing', 'Grooming', 'Styling'],
    color: 'bg-gradient-to-br from-yellow-400 to-amber-500',
  },
  {
    icon: '🎨',
    title: 'Tattoo',
    description: 'Custom tattoo artwork',
    category: 'Tattoo',
    features: ['Custom Design', 'Touch-ups', 'Removal Info'],
    color: 'bg-gradient-to-br from-gray-600 to-slate-700',
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
              Services We Offer
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore a wide range of professional beauty, wellness, and personal care services
          </p>
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service) => (
            <ServiceCard
              key={service.category}
              {...service}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Update landing page to include services**

Modify `src/app/(landing)/page.tsx`:

```typescript
import { Navigation } from '@/components/landing/Navigation';
import { HeroSection } from '@/components/landing/HeroSection';
import { ServicesSection } from '@/components/landing/ServicesSection';

export default function LandingPage() {
  return (
    <>
      <Navigation />
      <HeroSection />
      <ServicesSection />
      {/* Placeholder for other sections */}
      <div className="h-96 bg-gray-100 flex items-center justify-center text-gray-500">
        About section coming next
      </div>
    </>
  );
}
```

- [ ] **Step 4: Test services section**

```bash
npm run dev
```

Verify:
- Services section displays 8 cards in responsive grid
- Cards show icon, title, description, features
- Cards have hover effects (shadow, translate)
- Links navigate to `/app/home?category=<category>`

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/ServicesSection.tsx src/components/landing/ServiceCard.tsx src/app/\(landing\)/page.tsx
git commit -m "feat: add services section with 8 service category cards"
```

---

## Task 3: Create About Section

**Files:**
- Create: `src/components/landing/AboutSection.tsx` — About company info and values

**Interfaces:**
- Consumes: None
- Produces: About section with company story, mission, values

- [ ] **Step 1: Create AboutSection component**

Create `src/components/landing/AboutSection.tsx`:

```typescript
export function AboutSection() {
  const values = [
    {
      title: 'Quality',
      description: 'All our vendors are verified professionals with years of experience',
      icon: '⭐',
    },
    {
      title: 'Trust',
      description: 'Secure payments, transparent pricing, and customer protection',
      icon: '🔒',
    },
    {
      title: 'Convenience',
      description: 'Book instantly, pay online, and manage bookings from anywhere',
      icon: '📱',
    },
    {
      title: 'Community',
      description: 'Supporting small businesses and connecting them with customers',
      icon: '🤝',
    },
  ];

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
              About Türkan Abla
            </span>
          </h2>
        </div>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h3 className="text-3xl font-bold mb-6 text-gray-900">
              Connecting Beauty Professionals with Customers
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Türkan Abla is a modern beauty and wellness services marketplace connecting
              professional vendors with customers across the UK. We believe in making quality
              personal care services accessible, convenient, and affordable for everyone.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Founded with a mission to support small beauty businesses and entrepreneurs, we've
              grown to become a trusted platform with hundreds of vendors and thousands of happy
              customers.
            </p>
          </div>
          <div className="relative h-96 bg-gradient-to-br from-amber-200 to-orange-300 rounded-2xl shadow-xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-6xl">
              ✨
            </div>
          </div>
        </div>

        {/* Values */}
        <div>
          <h3 className="text-3xl font-bold mb-12 text-center text-gray-900">Our Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h4 className="text-xl font-bold mb-2 text-gray-900">{value.title}</h4>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Update landing page to include about section**

Modify `src/app/(landing)/page.tsx` to add `<AboutSection />` before the placeholder.

- [ ] **Step 3: Test**

```bash
npm run dev
```

Verify About section displays story and values with proper styling.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/AboutSection.tsx src/app/\(landing\)/page.tsx
git commit -m "feat: add about section with company story and values"
```

---

## Task 4: Create Pricing Section

**Files:**
- Create: `src/components/landing/PricingSection.tsx` — Pricing tiers or service pricing info

**Interfaces:**
- Consumes: None
- Produces: Pricing cards with features and CTA

- [ ] **Step 1: Create PricingSection component**

Create `src/components/landing/PricingSection.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function PricingSection() {
  const tiers = [
    {
      name: 'Pay Per Service',
      price: 'Varies',
      description: 'Book and pay for individual services',
      features: [
        'No subscription required',
        'Transparent pricing',
        'Secure payment',
        'Instant confirmation',
        'Cancel anytime',
      ],
      cta: 'Browse Services',
      highlighted: false,
    },
    {
      name: 'Monthly Membership',
      price: '$9.99/mo',
      description: 'Save on regular beauty services with exclusive member perks',
      features: [
        '10% discount on all services',
        'Priority booking',
        'Exclusive member deals',
        'Flexible scheduling',
        'Cancel anytime',
      ],
      cta: 'Coming Soon',
      highlighted: true,
    },
    {
      name: 'Pro Package',
      price: 'Custom',
      description: 'Tailored packages for frequent customers',
      features: [
        'Up to 20% discount',
        'Dedicated support',
        'Custom scheduling',
        'Package deals',
        'VIP treatment',
      ],
      cta: 'Contact Us',
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the option that works best for you
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                tier.highlighted
                  ? 'ring-2 ring-amber-700 shadow-2xl scale-105'
                  : 'shadow-lg hover:shadow-xl'
              }`}
            >
              {/* Badge */}
              {tier.highlighted && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-700 to-orange-600 text-white text-center py-2 font-bold">
                  Most Popular
                </div>
              )}

              <div className={`p-8 ${tier.highlighted ? 'pt-16 bg-white' : 'bg-gray-50'}`}>
                {/* Title & Price */}
                <h3 className="text-2xl font-bold mb-2 text-gray-900">{tier.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{tier.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-gray-700">
                      <span className="text-lg text-amber-700">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  asChild
                  className={`w-full h-10 rounded-lg font-semibold transition-all ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  <Link href="/app/auth/signup/customer">{tier.cta}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Hint */}
        <div className="mt-16 text-center">
          <p className="text-gray-700">
            Questions about pricing?{' '}
            <Link href="#contact" className="text-amber-700 font-semibold hover:underline">
              Get in touch with us
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Update landing page**

Modify `src/app/(landing)/page.tsx` to add `<PricingSection />`.

- [ ] **Step 3: Test**

```bash
npm run dev
```

Verify pricing cards display with proper styling and highlighting.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/PricingSection.tsx src/app/\(landing\)/page.tsx
git commit -m "feat: add pricing section with three pricing tiers"
```

---

## Task 5: Create Testimonials/Reviews Section

**Files:**
- Create: `src/components/landing/TestimonialsSection.tsx` — Reviews grid (structure only, no real testimonials)

**Interfaces:**
- Consumes: None
- Produces: Testimonials section with placeholder review cards

- [ ] **Step 1: Create TestimonialsSection component**

Create `src/components/landing/TestimonialsSection.tsx`:

```typescript
export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-orange-50 to-rose-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
              What Our Customers Say
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Join thousands of satisfied customers enjoying quality beauty services
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className="text-xl text-yellow-400">
                    ★
                  </span>
                ))}
              </div>

              {/* Review */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Placeholder review. Real testimonials will be added from actual customer reviews."
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full flex items-center justify-center text-xl">
                  👤
                </div>
                <div>
                  <div className="font-bold text-gray-900">Customer Name</div>
                  <div className="text-sm text-gray-600">Service Category</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Booking CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-700 mb-6">
            Ready to experience quality beauty services?
          </p>
          <a
            href="/app/auth/signup/customer"
            className="inline-block bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Book Your First Service
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Update landing page**

Modify `src/app/(landing)/page.tsx` to add `<TestimonialsSection />`.

- [ ] **Step 3: Test**

```bash
npm run dev
```

Verify testimonials section displays with 3 placeholder review cards and CTA.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/TestimonialsSection.tsx src/app/\(landing\)/page.tsx
git commit -m "feat: add testimonials section with placeholder review structure"
```

---

## Task 6: Create Contact Section

**Files:**
- Create: `src/components/landing/ContactSection.tsx` — Contact form
- Create: `src/app/api/contact/route.ts` — Contact form API endpoint
- Test: Contact form submission

**Interfaces:**
- Consumes: Form submission data (name, email, message)
- Produces: POST endpoint returning success/error response

- [ ] **Step 1: Create API endpoint for contact form**

Create `src/app/api/contact/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      );
    }

    const { name, email, message, phone } = parsed.data;

    // TODO: Send email notification to admin
    // For now, just log and return success
    console.log('Contact form submission:', {
      name,
      email,
      phone,
      message,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { success: true, message: 'Thank you for contacting us. We will get back to you soon.' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Create ContactSection component**

Create `src/components/landing/ContactSection.tsx`:

```typescript
'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
              Get In Touch
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Have questions? We'd love to hear from you. Send us a message and we'll get back to you as soon as possible.
          </p>
        </div>

        {/* Form */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 lg:p-12">
          {submitted && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              ✓ Thank you for contacting us. We'll get back to you soon!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-transparent outline-none transition"
                  placeholder="Your name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-transparent outline-none transition"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-transparent outline-none transition"
                placeholder="+44 123 456 7890"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-transparent outline-none transition resize-none"
                placeholder="Tell us how we can help..."
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 text-white font-bold py-3 h-auto rounded-lg transition-all"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl mb-2">📧</div>
            <h4 className="font-bold text-gray-900 mb-2">Email</h4>
            <p className="text-gray-600">support@turkanabla.uk</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">📱</div>
            <h4 className="font-bold text-gray-900 mb-2">Phone</h4>
            <p className="text-gray-600">+44 (0) 123 456 7890</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">📍</div>
            <h4 className="font-bold text-gray-900 mb-2">Location</h4>
            <p className="text-gray-600">United Kingdom</p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Update landing page**

Modify `src/app/(landing)/page.tsx` to add `<ContactSection />`.

- [ ] **Step 4: Test contact form**

```bash
npm run dev
```

Test:
- Fill form and submit
- Verify API receives data correctly
- Check success message appears
- Form clears after submission

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/ContactSection.tsx src/app/api/contact/route.ts src/app/\(landing\)/page.tsx
git commit -m "feat: add contact form and contact section with API endpoint"
```

---

## Task 7: Create CTA Sections & Footer

**Files:**
- Create: `src/components/landing/CTASection.tsx` — Call-to-action banner sections
- Create: `src/components/landing/Footer.tsx` — Footer with links

**Interfaces:**
- Consumes: None
- Produces: CTA and footer components

- [ ] **Step 1: Create CTASection component**

Create `src/components/landing/CTASection.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-700 to-orange-600">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Look?
        </h2>
        <p className="text-lg text-amber-50 mb-8 max-w-2xl mx-auto">
          Join thousands of satisfied customers and book your first service today. Secure payment, instant confirmation, and professional services.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            className="bg-white text-amber-700 hover:bg-amber-50 font-bold h-12 px-8 rounded-lg text-lg"
          >
            <Link href="/app/auth/signup/customer">Book Now</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white text-white hover:bg-white/10 font-bold h-12 px-8 rounded-lg text-lg"
          >
            <Link href="#contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create Footer component**

Create `src/components/landing/Footer.tsx`:

```typescript
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-4">
              Türkan Abla
            </h3>
            <p className="text-gray-400 text-sm">
              Professional beauty and wellness services at your fingertips.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold mb-4 text-white">Services</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="#services" className="hover:text-amber-400 transition">
                  All Services
                </Link>
              </li>
              <li>
                <Link href="#services" className="hover:text-amber-400 transition">
                  Hair Salon
                </Link>
              </li>
              <li>
                <Link href="#services" className="hover:text-amber-400 transition">
                  Spa & Massage
                </Link>
              </li>
              <li>
                <Link href="#services" className="hover:text-amber-400 transition">
                  Fitness
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold mb-4 text-white">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="#about" className="hover:text-amber-400 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-amber-400 transition">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-amber-400 transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-amber-400 transition">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4 text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-amber-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-amber-400 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-amber-400 transition">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-gray-500 text-sm">
            © 2026 Türkan Abla. All rights reserved. | Secure Payments | Professional Vendors | Happy Customers
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Update landing page with CTA and footer**

Modify `src/app/(landing)/page.tsx`:

```typescript
import { Navigation } from '@/components/landing/Navigation';
import { HeroSection } from '@/components/landing/HeroSection';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <>
      <Navigation />
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <PricingSection />
      <TestimonialsSection />
      <ContactSection />
      <CTASection />
      <Footer />
    </>
  );
}
```

- [ ] **Step 4: Test full landing page**

```bash
npm run dev
```

Verify:
- All sections render and scroll smoothly
- Navigation links jump to correct sections
- CTAs link to correct URLs
- Footer displays with proper links
- Page is responsive on mobile and desktop

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/CTASection.tsx src/components/landing/Footer.tsx src/app/\(landing\)/page.tsx
git commit -m "feat: add CTA sections and footer to complete landing page"
```

---

## Task 8: Polish & Deploy Landing Page

**Files:**
- Modify: `next.config.js` — Ensure landing page optimizations
- Test: Full landing page testing

**Interfaces:**
- Consumes: All landing page sections
- Produces: Optimized, production-ready landing page

- [ ] **Step 1: Verify landing page performance**

```bash
npm run build
```

Expected: Build completes successfully with landing page included.

- [ ] **Step 2: Test on mobile (375px)**

```bash
npm run dev
```

Open DevTools, test responsive design at 375px, 768px, 1440px breakpoints.

- [ ] **Step 3: Test all CTAs**

Verify all buttons navigate correctly:
- "Book Now" → `/app/auth/signup/customer`
- "Learn More" → scrolls to services
- Service cards → `/app/home?category=<category>`
- Contact form → submits to `/api/contact`

- [ ] **Step 4: Commit final polish**

```bash
git add .
git commit -m "feat: complete and optimize landing page for production"
```

---

## Success Criteria

✅ Landing page renders at `/` route
✅ All 7 sections present: Hero, Services, About, Pricing, Testimonials, Contact, CTA
✅ Modern, elegant design with warm color palette
✅ Responsive on mobile (375px), tablet (768px), desktop (1440px)
✅ All navigation links work (scroll to sections)
✅ All CTAs link to correct URLs
✅ Contact form submits to API
✅ Navigation sticky header with logo
✅ Footer with company links
✅ Page loads in <3 seconds
✅ No TypeScript errors
✅ No console errors

---

Plan complete and saved to `docs/superpowers/plans/2026-06-27-landing-page.md`.

## Execution Options

**1. Subagent-Driven (recommended)** — Fresh subagent per task with quality gates between tasks

**2. Inline Execution** — Execute tasks here in this session

**Which approach would you prefer?**