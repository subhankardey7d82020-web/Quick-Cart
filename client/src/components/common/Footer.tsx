import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Instagram,
  Facebook,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();
  const { success } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      success('Thank you for subscribing to the Atelier Gazette.');
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-noir-900 text-cream-100 pt-16 pb-12 border-t border-noir-800">
      {/* Guarantees & Value Props */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-b border-noir-800/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex items-center space-x-4 justify-center md:justify-start">
            <div className="p-3 bg-noir-800 rounded-full text-accent">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide uppercase text-white">Complimentary Delivery</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Free expedited shipping on orders over ₹1,499.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 justify-center md:justify-start">
            <div className="p-3 bg-noir-800 rounded-full text-accent">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide uppercase text-white">Effortless Returns</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Complimentary 14-day doorstep return pickup.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 justify-center md:justify-start">
            <div className="p-3 bg-noir-800 rounded-full text-accent">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide uppercase text-white">Cash On Delivery</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Verify your order at doorstep before payment.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <span className="font-serif text-2xl tracking-widest uppercase font-medium text-white">
              {settings.storeName}
            </span>
            <p className="text-sm text-neutral-400 max-w-sm leading-relaxed font-light">
              Crafting conscious modern luxury apparel with an uncompromising devotion to fabric integrity, timeless design, and impeccable tailoring.
            </p>
            <div className="pt-2 text-xs text-neutral-400 space-y-1">
              <p>{settings.contactAddress}</p>
              <p>Email: <a href={`mailto:${settings.contactEmail}`} className="text-cream-100 hover:text-accent underline">{settings.contactEmail}</a></p>
              <p>Concierge: {settings.contactPhone}</p>
            </div>
          </div>

          {/* Boutique Navigation */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-white mb-4">Shop Atelier</h4>
            <ul className="space-y-2.5 text-xs tracking-wider uppercase text-neutral-400">
              <li><Link to="/shop?category=womens-couture" className="hover:text-white transition-colors">Women's Couture</Link></li>
              <li><Link to="/shop?category=mens-tailoring" className="hover:text-white transition-colors">Men's Tailoring</Link></li>
              <li><Link to="/shop?category=luxury-knitwear" className="hover:text-white transition-colors">Luxury Knitwear</Link></li>
              <li><Link to="/shop?category=leather-goods-bags" className="hover:text-white transition-colors">Leather Goods</Link></li>
              <li><Link to="/shop?category=designer-footwear" className="hover:text-white transition-colors">Designer Footwear</Link></li>
              <li><Link to="/shop?category=fine-accessories" className="hover:text-white transition-colors">Fine Accessories</Link></li>
            </ul>
          </div>

          {/* Client Care */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-white mb-4">Client Care</h4>
            <ul className="space-y-2.5 text-xs tracking-wider uppercase text-neutral-400">
              <li><Link to="/order-tracking" className="hover:text-white transition-colors">Order Tracking</Link></li>
              <li><Link to="/account" className="hover:text-white transition-colors">Customer Account</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Our Heritage</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Boutique Concierge</Link></li>
              <li><Link to="/admin/login" className="hover:text-accent transition-colors font-medium">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-white mb-4">Atelier Gazette</h4>
            <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
              Subscribe for private preview access, seasonal campaign lookbooks, and invitation-only trunk shows.
            </p>
            {subscribed ? (
              <div className="flex items-center space-x-2 text-xs text-accent bg-noir-800 p-2.5 rounded">
                <CheckCircle2 className="w-4 h-4" />
                <span>You are subscribed.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full bg-noir-800 border border-noir-700 px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="absolute right-1 top-1 bottom-1 px-3 bg-accent text-noir-900 hover:bg-accent-hover transition-colors flex items-center justify-center"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-neutral-500">By subscribing you agree with our Privacy Terms.</p>
              </form>
            )}

            {/* Social Icons */}
            <div className="flex items-center space-x-4 mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="text-neutral-400 hover:text-accent transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="text-neutral-400 hover:text-accent transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Payment Security */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-noir-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 space-y-4 sm:space-y-0">
        <div>
          © {new Date().getFullYear()} {settings.storeName}. All rights reserved. Built with free, open-source tech.
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-[11px] uppercase tracking-wider text-neutral-400">Default Currency: {settings.currencyCode} ({settings.currencySymbol})</span>
          <span className="text-neutral-700">|</span>
          <span className="text-[11px] uppercase tracking-wider text-neutral-400">Doorstep COD & Instant Demo</span>
        </div>
      </div>
    </footer>
  );
};
