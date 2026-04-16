import { ArrowRight, Sparkles } from 'lucide-react';
import { BRAND } from '../constants';

interface PopupCardProps {
  onContactClick: () => void;
  onExploreClick: () => void;
}

const PopupCard: React.FC<PopupCardProps> = ({ onContactClick, onExploreClick }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center p-4 animate-fade-in">
    <div className="relative bg-white rounded-card p-8 md:p-12 max-w-2xl w-full shadow-card-hover border border-slate-100 animate-scale-in">

      {/* Decorative blobs */}
      <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-brand-secondary/20 animate-float" aria-hidden="true" />
      <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-brand-accent/30 animate-float" style={{ animationDelay: '1s' }} aria-hidden="true" />
      <div className="absolute top-1/2 -right-8 w-5 h-5 rounded-full bg-brand-primary/20 animate-float" style={{ animationDelay: '2s' }} aria-hidden="true" />

      <div className="relative text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-brand-light text-brand-primary text-caption font-semibold px-4 py-1.5 rounded-pill mb-6 border border-brand-primary/20">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          Coming Soon
        </div>

        <h2 className="text-heading text-brand-dark mb-4">
          We're building something{' '}
          <span className="text-brand-primary">extraordinary</span>
        </h2>

        <p className="text-body text-slate-500 mb-2">
          {BRAND.FULL_NAME} — your trusted partner in progress and care.
        </p>
        <p className="text-caption text-slate-400 italic mb-8">
          "{BRAND.TAGLINE}"
        </p>

        <p className="text-body text-slate-600 mb-8">
          Explore our manufacturing capabilities or reach out directly — we'd love to hear from you.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onExploreClick}
            className="px-8 py-3.5 rounded-card font-semibold text-sm bg-surface-subtle text-slate-700 border border-slate-200 hover:bg-surface-muted hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-card transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary min-h-[44px]"
          >
            Explore Manufacturing
          </button>

          <button
            onClick={onContactClick}
            className="group px-8 py-3.5 rounded-card font-semibold text-sm bg-brand-primary text-white hover:bg-brand-primary/90 hover:-translate-y-0.5 hover:shadow-glow transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 min-h-[44px] flex items-center justify-center gap-2"
          >
            Contact Us
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default PopupCard;
