import dynamic from 'next/dynamic';
import HeroSection from '@/components/sections/HeroSection';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { MarqueeStrip } from '@/components/ui/MarqueeStrip';

const AboutSection = dynamic(() => import('@/components/sections/AboutSection'));
const ProductCategoriesSection = dynamic(
  () => import('@/components/sections/ProductCategoriesSection'),
);
const WhyUsSection = dynamic(() => import('@/components/sections/WhyUsSection'));
const TestimonialMarquee = dynamic(() =>
  import('@/components/sections/TestimonialMarquee').then((m) => ({
    default: m.TestimonialMarquee,
  })),
);
const ContactSection = dynamic(() => import('@/components/sections/ContactSection'));

export default function HomePage() {
  return (
    <LoadingScreen>
      <HeroSection />
      <MarqueeStrip />
      <AboutSection />
      <ProductCategoriesSection />
      <WhyUsSection />
      <TestimonialMarquee />
      <ContactSection />
    </LoadingScreen>
  );
}
