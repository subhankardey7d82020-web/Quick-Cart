const prisma = require('../config/prisma');

const defaultSettings = {
  storeName: 'QUICK CART',
  storeTagline: 'Luxury Minimalist Fashion Boutique',
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
  heroSubheadline: 'Discover our Spring/Summer Atelier Collection curated with sustainable Italian linen, organic silks, and tailored outerwear.',
  heroCtaText: 'Explore Collection',
  heroImageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
  socialInstagram: 'https://instagram.com',
  socialFacebook: 'https://facebook.com',
  socialPinterest: 'https://pinterest.com',
};

// Public: Get all store settings
const getSettings = async (req, res, next) => {
  try {
    const dbSettings = await prisma.storeSetting.findMany();
    const settings = { ...defaultSettings };

    dbSettings.forEach((item) => {
      settings[item.key] = item.value;
    });

    res.json({ settings });
  } catch (error) {
    next(error);
  }
};

// Admin: Update store settings (bulk key-value pairs)
const updateSettings = async (req, res, next) => {
  try {
    const newSettings = req.body;

    for (const [key, val] of Object.entries(newSettings)) {
      const stringValue = typeof val === 'object' ? JSON.stringify(val) : String(val);
      await prisma.storeSetting.upsert({
        where: { key },
        update: { value: stringValue },
        create: { key, value: stringValue },
      });
    }

    const allSettings = await prisma.storeSetting.findMany();
    const settings = { ...defaultSettings };
    allSettings.forEach((item) => {
      settings[item.key] = item.value;
    });

    res.json({ message: 'Settings updated successfully.', settings });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
