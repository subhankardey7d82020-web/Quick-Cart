import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';
import { Product, Category } from '../types';
import { api } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { ProductCard } from '../components/common/ProductCard';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';

export const HomePage: React.FC = () => {
  const { settings } = useSettings();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [catRes, featRes, newRes, bestRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({ isFeatured: true, limit: 4 }),
          api.getProducts({ isNewArrival: true, limit: 8 }),
          api.getProducts({ isBestSeller: true, limit: 4 }),
        ]);

        if (catRes?.categories) setCategories(catRes.categories);
        if (featRes?.products) setFeaturedProducts(featRes.products);
        if (newRes?.products) setNewArrivals(newRes.products);
        if (bestRes?.products) setBestSellers(bestRes.products);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-20 sm:space-y-28 pb-16">
      {/* 1. HERO CAMPAIGN SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-noir-900 overflow-hidden">
        {/* Background Image with Dark Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src={settings.heroImageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop'}
            alt="Atelier Campaign"
            className="w-full h-full object-cover object-center opacity-70 filter brightness-90 transform scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-noir-900/90 via-noir-900/40 to-noir-900/70" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center text-white space-y-6 pt-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs tracking-widest uppercase text-cream-100">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Spring / Summer 2026 Collection</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight leading-[1.1] text-white">
            {settings.heroHeadline || 'Timeless Elegance, Modern Silhouette'}
          </h1>

          <p className="max-w-xl mx-auto text-sm sm:text-base text-cream-200/90 font-light leading-relaxed">
            {settings.heroSubheadline || 'Explore our latest Atelier collection crafted from certified organic silks, Italian wool, and tailored silhouettes.'}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/shop"
              className="w-full sm:w-auto px-8 py-4 bg-cream-50 hover:bg-white text-noir-900 text-xs uppercase tracking-widest font-semibold transition-all shadow-xl flex items-center justify-center space-x-2 group"
            >
              <span>{settings.heroCtaText || 'Explore Collection'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/shop?isNewArrival=true"
              className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/10 text-white border border-white/40 text-xs uppercase tracking-widest font-semibold transition-all backdrop-blur-xs flex items-center justify-center"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* 2. VALUE PILLARS STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-sand-200 text-center">
          <div className="flex flex-col items-center space-y-1.5 p-2">
            <Award className="w-5 h-5 text-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-noir-900">Artisanal Tailoring</span>
            <span className="text-[11px] text-neutral-500">Meticulous European finishes</span>
          </div>
          <div className="flex flex-col items-center space-y-1.5 p-2">
            <Truck className="w-5 h-5 text-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-noir-900">Complimentary Shipping</span>
            <span className="text-[11px] text-neutral-500">On all orders above ₹1,499</span>
          </div>
          <div className="flex flex-col items-center space-y-1.5 p-2">
            <ShieldCheck className="w-5 h-5 text-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-noir-900">Doorstep COD</span>
            <span className="text-[11px] text-neutral-500">Inspect before payment</span>
          </div>
          <div className="flex flex-col items-center space-y-1.5 p-2">
            <RefreshCw className="w-5 h-5 text-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-noir-900">14-Day Returns</span>
            <span className="text-[11px] text-neutral-500">Hassle-free doorstep collection</span>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-baseline mb-10 pb-4 border-b border-sand-200">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-1">
              Curated Wardrobe
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-noir-900 font-normal">
              Explore by Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs uppercase tracking-widest text-noir-800 hover:text-accent font-semibold flex items-center space-x-1.5 mt-2 sm:mt-0"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group flex flex-col items-center text-center space-y-3"
            >
              <div className="relative aspect-square w-full rounded-full overflow-hidden bg-sand-200/60 p-1 border-2 border-transparent group-hover:border-accent transition-all duration-300">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800'}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-center rounded-full group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-noir-900 group-hover:text-accent transition-colors">
                  {cat.name}
                </h3>
                {cat.productCount !== undefined && (
                  <p className="text-[11px] text-neutral-400 font-light">
                    {cat.productCount} pieces
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED ATELIER PIECES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
            Signature Cuts
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-noir-900 font-normal">
            Featured Atelier Collection
          </h2>
          <p className="text-xs text-neutral-500 font-light leading-relaxed">
            Uncompromising investment pieces designed to withstand passing trends through exceptional materiality.
          </p>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {featuredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onQuickView={(prod) => setQuickViewProduct(prod)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. EDITORIAL CAMPAIGN BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-noir-900 text-white min-h-[460px] flex items-center">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1600&auto=format&fit=crop"
              alt="Editorial Atelier"
              className="w-full h-full object-cover object-center opacity-40 filter grayscale"
            />
          </div>

          <div className="relative z-10 max-w-xl p-8 sm:p-14 space-y-5">
            <span className="text-xs uppercase tracking-widest text-accent font-semibold">
              The Philosophy of Quiet Luxury
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-white">
              Conscious Tailoring, Masterful Restraint
            </h2>
            <p className="text-xs sm:text-sm text-cream-200/90 leading-relaxed font-light">
              Every garment in our Atelier begins with certified organic fibers woven by heritage European mills. Designed in Mumbai, tailored to transcend seasons.
            </p>
            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center space-x-2 px-6 py-3.5 bg-cream-50 hover:bg-white text-noir-900 text-xs uppercase tracking-widest font-semibold transition-all shadow-md"
              >
                <span>Read Our Heritage Story</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-baseline mb-10 pb-4 border-b border-sand-200">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-1">
              Fresh Off The Loom
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-noir-900 font-normal">
              New Seasonal Arrivals
            </h2>
          </div>
          <Link
            to="/shop?isNewArrival=true"
            className="text-xs uppercase tracking-widest text-noir-800 hover:text-accent font-semibold flex items-center space-x-1.5 mt-2 sm:mt-0"
          >
            <span>View All New Pieces</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {newArrivals.slice(0, 8).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onQuickView={(prod) => setQuickViewProduct(prod)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 7. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-baseline mb-10 pb-4 border-b border-sand-200">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-1">
              Most Adored
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-noir-900 font-normal">
              Best Sellers
            </h2>
          </div>
          <Link
            to="/shop?isBestSeller=true"
            className="text-xs uppercase tracking-widest text-noir-800 hover:text-accent font-semibold flex items-center space-x-1.5 mt-2 sm:mt-0"
          >
            <span>View All Best Sellers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {bestSellers.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onQuickView={(prod) => setQuickViewProduct(prod)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
