import React from 'react';
import { Award, Compass, Feather, Globe } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const AboutPage: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Banner */}
      <section className="relative min-h-[50vh] flex items-center justify-center bg-noir-900 overflow-hidden text-center text-white px-4">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop"
            alt="Atelier Heritage"
            className="w-full h-full object-cover object-center opacity-30"
          />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">
            The Atelier Heritage
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal leading-tight">
            Quiet Luxury, Uncompromising Integrity
          </h1>
          <p className="text-xs sm:text-sm text-cream-200/90 font-light leading-relaxed">
            Founded with the conviction that true luxury whispers through yarn purity, impeccable fit, and seasonless longevity.
          </p>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-xs sm:text-sm text-noir-700 leading-relaxed font-light">
        <div className="space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl text-noir-900 font-normal">
            A Return to Intentional Craftsmanship
          </h2>
          <p>
            At {settings.storeName}, we reject the relentless churn of disposable fashion calendars. Every trench coat, silk evening gown, and cashmere knit is conceptualized as an heirloom — designed to endure in your wardrobe across decades, growing softer and more personal with each wear.
          </p>
          <p>
            Operating out of our Mumbai design house, our pattern-makers collaborate directly with certified organic weavers across Northern Italy, France, and Normandy to engineer bespoke fabric weights that balance architectural structure with feather-light breathability.
          </p>
        </div>

        {/* Four Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-sand-200">
          <div className="p-6 bg-white border border-sand-200 space-y-2 shadow-xs">
            <Feather className="w-5 h-5 text-accent" />
            <h3 className="text-xs uppercase tracking-widest font-bold text-noir-900">Purity of Material</h3>
            <p className="text-neutral-600">
              Grade-A Mongolian cashmere, 22-momme Mulberry silk, and Giza organic long-staple cotton with zero plastic blends.
            </p>
          </div>

          <div className="p-6 bg-white border border-sand-200 space-y-2 shadow-xs">
            <Compass className="w-5 h-5 text-accent" />
            <h3 className="text-xs uppercase tracking-widest font-bold text-noir-900">Anatomical Fit</h3>
            <p className="text-neutral-600">
              Sculptural cuts engineered to drape gracefully over real human forms without tension or discomfort.
            </p>
          </div>

          <div className="p-6 bg-white border border-sand-200 space-y-2 shadow-xs">
            <Globe className="w-5 h-5 text-accent" />
            <h3 className="text-xs uppercase tracking-widest font-bold text-noir-900">Zero Exploitation</h3>
            <p className="text-neutral-600">
              Fair-wage atelier craftsmanship and non-toxic dye baths that protect the local waterways.
            </p>
          </div>

          <div className="p-6 bg-white border border-sand-200 space-y-2 shadow-xs">
            <Award className="w-5 h-5 text-accent" />
            <h3 className="text-xs uppercase tracking-widest font-bold text-noir-900">Doorstep Verification</h3>
            <p className="text-neutral-600">
              Complimentary shipping above ₹1,499 and doorstep Cash on Delivery with no surprise fees.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
