import { AuditForm } from '@/components/AuditForm';
import { Features } from '@/components/Features';
import { Testimonials } from '@/components/Testimonials';
import { Pricing } from '@/components/Pricing';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-4xl py-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Comprehensive Website Analysis Made Simple
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Get detailed insights about your website's SEO, performance, accessibility, and security.
              Make data-driven decisions to improve your online presence.
            </p>
            <div className="mt-10">
              <AuditForm />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <Features />

      {/* Testimonials Section */}
      {/* <Testimonials /> */}
      Testimonials
      {/* Pricing Section */}
      <Pricing />
    </div>
  );
}
