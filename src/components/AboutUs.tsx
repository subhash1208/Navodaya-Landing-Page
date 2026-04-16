import { Award, MapPin, TrendingUp } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { useTypewriter } from '../hooks/useTypewriter';
import { cn } from '../utils/cn';
import { SECTION_IDS } from '../constants';

const ROTATING_WORDS = ['Industries & Care Kits', 'Quality Products', 'Innovation', 'Excellence'] as const;

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  inView: boolean;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, inView, delay }) => (
  <div
    className={cn(
      'text-center group transition-all duration-700',
      inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    )}
    style={{ transitionDelay: `${delay}ms` }}
  >
    <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary rounded-full mb-4 shadow-md group-hover:shadow-glow group-hover:bg-brand-primary/90 transition-all duration-300">
      {icon}
    </div>
    <h3 className="text-subheading text-slate-800 mb-2">{title}</h3>
    <p className="text-body text-slate-500 text-sm leading-relaxed">{description}</p>
  </div>
);

const AboutUs: React.FC = () => {
  const { ref, inView } = useInView();
  const { displayText } = useTypewriter({ words: ROTATING_WORDS });

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id={SECTION_IDS.ABOUT}
      className="py-section px-4 bg-gradient-to-br from-brand-light via-white to-surface-subtle"
      aria-labelledby="about-heading"
    >
      <div className="max-w-content mx-auto">

        {/* Heading */}
        <div className="text-center mb-16">
          <h2
            id="about-heading"
            className={cn(
              'text-heading text-brand-dark mb-4 transition-all duration-700',
              inView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
            )}
          >
            About Navodaya
          </h2>
          <p className="text-subheading text-slate-500 h-8">
            <span className="text-brand-primary font-semibold">
              {displayText}
              <span className="animate-pulse ml-0.5">|</span>
            </span>
          </p>
        </div>

        {/* Main card */}
        <div
          className={cn(
            'bg-white border border-slate-100 rounded-card p-8 md:p-12 mb-8 shadow-card hover:shadow-card-hover transition-all duration-500',
            inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          )}
          style={{ transitionDelay: '200ms' }}
        >
          <div className="text-center mb-12">
            <h3 className="text-heading text-brand-primary mb-4">
              Your Trusted Partner in Progress &amp; Care
            </h3>
            <p className="text-body text-slate-600 max-w-3xl mx-auto">
              We are a leading manufacturer and global supplier of disposable hygiene &amp; safety products,
              hotel amenities, and spa &amp; salon essentials. Through strategic manufacturing and
              import-export operations, we deliver comprehensive solutions to meet diverse industry needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 mt-4">
            <FeatureCard
              icon={<Award className="w-8 h-8 text-white" aria-hidden="true" />}
              title="Quality Assured"
              description="Manufactured and sourced products meeting international quality and safety standards."
              inView={inView}
              delay={300}
            />
            <FeatureCard
              icon={<MapPin className="w-8 h-8 text-white" aria-hidden="true" />}
              title="Global Reach"
              description="Seamless import-export operations ensuring timely delivery across markets."
              inView={inView}
              delay={400}
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8 text-white" aria-hidden="true" />}
              title="Comprehensive Solutions"
              description="Extensive product portfolio serving hotels, hospitals, spas, and industries."
              inView={inView}
              delay={500}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
