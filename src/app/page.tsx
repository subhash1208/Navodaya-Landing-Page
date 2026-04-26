import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import ProductCategoriesSection from '@/components/sections/ProductCategoriesSection';
import WhyUsSection from '@/components/sections/WhyUsSection';
import ContactSection from '@/components/sections/ContactSection';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { MarqueeStrip } from '@/components/ui/MarqueeStrip';

export default function HomePage() {
  return (
    <LoadingScreen>
      <HeroSection />
      <MarqueeStrip />
      <AboutSection />
      <ProductCategoriesSection />
      <WhyUsSection />
      <ContactSection />
    </LoadingScreen>
  );
}
