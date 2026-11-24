import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StoreSettings } from '../types';
import { api } from '../services/api';

const defaultSettings: StoreSettings = {
  storeName: 'QUICK CART',
  storeTagline: 'Modern Luxury Atelier & Boutique',
  logoUrl: '',
  contactPhone: '+91 98765 43210',
  contactEmail: 'concierge@quickcart.luxury',
  contactAddress: '42 Heritage Boulevard, Fashion District, Mumbai, MH 400001',
  currencySymbol: '₹',
  currencyCode: 'INR',
  shippingCharges: '99',
  freeShippingThreshold: '1499',
  announcementActive: 'true',
  announcementText: '✨ Complimentary Express Shipping on Orders Above ₹1,499 | Use Code LUXE10 for 10% Off',
  heroHeadline: 'Timeless Elegance, Modern Silhouette',
  heroSubheadline: 'Explore our latest Atelier collection crafted from certified organic silks, Italian wool, and tailored silhouettes.',
  heroCtaText: 'Explore Collection',
  heroImageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
};

interface SettingsContextType {
  settings: StoreSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  formatPrice: (amount: number) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await api.getSettings();
      if (data && data.settings) {
        setSettings({ ...defaultSettings, ...data.settings });
      }
    } catch (err) {
      console.warn('Failed to fetch settings from server, using defaults.', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const formatPrice = useCallback(
    (amount: number) => {
      const symbol = settings.currencySymbol || '₹';
      return `${symbol}${Math.round(amount).toLocaleString('en-IN')}`;
    },
    [settings.currencySymbol]
  );

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        formatPrice,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
