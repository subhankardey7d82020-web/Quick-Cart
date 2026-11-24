const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Quick Cart database seeding...');

  // Clear existing data in correct order
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.storeSetting.deleteMany();

  // 1. Seed Store Settings
  console.log('⚙️ Seeding Store Settings...');
  const settingsData = [
    { key: 'storeName', value: 'QUICK CART' },
    { key: 'storeTagline', value: 'Modern Luxury Atelier & Boutique' },
    { key: 'contactPhone', value: '+91 98765 43210' },
    { key: 'contactEmail', value: 'concierge@quickcart.luxury' },
    { key: 'contactAddress', value: '42 Heritage Boulevard, Fashion District, Mumbai, MH 400001' },
    { key: 'currencySymbol', value: '₹' },
    { key: 'currencyCode', value: 'INR' },
    { key: 'shippingCharges', value: '99' },
    { key: 'freeShippingThreshold', value: '1499' },
    { key: 'announcementActive', value: 'true' },
    { key: 'announcementText', value: '✨ Complimentary Express Shipping on Orders Above ₹1,499 | Use Code LUXE10 for 10% Off' },
    { key: 'heroHeadline', value: 'Timeless Elegance, Modern Silhouette' },
    { key: 'heroSubheadline', value: 'Explore our latest Atelier collection crafted from certified organic silks, Italian wool, and tailored silhouettes.' },
    { key: 'heroCtaText', value: 'Explore Collection' },
    { key: 'heroImageUrl', value: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop' },
    { key: 'socialInstagram', value: 'https://instagram.com' },
    { key: 'socialFacebook', value: 'https://facebook.com' },
    { key: 'socialPinterest', value: 'https://pinterest.com' },
  ];

  for (const s of settingsData) {
    await prisma.storeSetting.create({ data: s });
  }

  // 2. Seed Users (Admin + Customers)
  console.log('👤 Seeding Users & Admins...');
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedCustomerPassword = await bcrypt.hash('customer123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Eleanor Vance (Admin)',
      email: 'admin@quickcart.com',
      password: hashedAdminPassword,
      phone: '+91 98765 00001',
      role: 'admin',
      isActive: true,
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: 'Aarav Mehta',
      email: 'customer@quickcart.com',
      password: hashedCustomerPassword,
      phone: '+91 98201 12345',
      role: 'customer',
      isActive: true,
      addresses: {
        create: [
          {
            fullName: 'Aarav Mehta',
            phone: '+91 98201 12345',
            street: 'Flat 402, Royale Crest, Pali Hill',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400050',
            landmark: 'Near Nargis Dutt Road',
            isDefault: true,
          },
        ],
      },
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: 'Ananya Sharma',
      email: 'ananya.sharma@example.com',
      password: hashedCustomerPassword,
      phone: '+91 99300 54321',
      role: 'customer',
      isActive: true,
      addresses: {
        create: [
          {
            fullName: 'Ananya Sharma',
            phone: '+91 99300 54321',
            street: 'Villa 14, Defence Colony',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110024',
            landmark: 'Near Flyover Market',
            isDefault: true,
          },
        ],
      },
    },
  });

  // 3. Seed Coupons
  console.log('🎟️ Seeding Coupons...');
  const couponsData = [
    {
      code: 'LUXE10',
      discountType: 'percentage',
      discountValue: 10,
      minSpend: 999,
      maxDiscount: 1500,
      usageLimit: 500,
      timesUsed: 24,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      code: 'ATELIER20',
      discountType: 'percentage',
      discountValue: 20,
      minSpend: 2999,
      maxDiscount: 3000,
      usageLimit: 200,
      timesUsed: 12,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      code: 'FIRST500',
      discountType: 'fixed',
      discountValue: 500,
      minSpend: 1999,
      maxDiscount: 500,
      usageLimit: 1000,
      timesUsed: 45,
      expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      code: 'SUMMERVIP',
      discountType: 'percentage',
      discountValue: 25,
      minSpend: 4999,
      maxDiscount: 4000,
      usageLimit: 50,
      timesUsed: 8,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  ];

  for (const c of couponsData) {
    await prisma.coupon.create({ data: c });
  }

  // 4. Seed Categories
  console.log('🏷️ Seeding Categories...');
  const categoriesData = [
    {
      name: "Women's Couture",
      slug: 'womens-couture',
      description: 'Sophisticated silhouettes, fluid evening dresses, and structured contemporary tailoring.',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
      isFeatured: true,
    },
    {
      name: "Men's Tailoring",
      slug: 'mens-tailoring',
      description: 'Sharp suits, organic Italian linen button-downs, and refined formal wear.',
      image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=800&auto=format&fit=crop',
      isFeatured: true,
    },
    {
      name: 'Luxury Knitwear',
      slug: 'luxury-knitwear',
      description: 'Pure Mongolian cashmere sweaters, merino cardigans, and relaxed elevated hoodies.',
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop',
      isFeatured: true,
    },
    {
      name: 'Leather Goods & Bags',
      slug: 'leather-goods-bags',
      description: 'Handcrafted full-grain leather totes, crossbody clutches, and weekend duffels.',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
      isFeatured: true,
    },
    {
      name: 'Designer Footwear',
      slug: 'designer-footwear',
      description: 'Artisanal leather loafers, minimalist monochrome sneakers, and sleek Chelsea boots.',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop',
      isFeatured: true,
    },
    {
      name: 'Fine Accessories',
      slug: 'fine-accessories',
      description: 'Architectural jewelry, silk scarves, polarized sunglasses, and refined brass accents.',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
      isFeatured: true,
    },
  ];

  const createdCategories = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    createdCategories[cat.slug] = created.id;
  }

  // 5. Seed 24 Premium Fashion Products
  console.log('👗 Seeding 24 Luxury Fashion Products...');
  const products = [
    // Women's Couture
    {
      name: 'The Céline Oversized Double-Breasted Trench',
      slug: 'celine-oversized-double-breasted-trench',
      description: 'Tailored from water-resistant bonded cotton gabardine, this trench coat features a relaxed silhouette, storm flap, horn buttons, and an adjustable waist belt. An enduring piece for timeless sophistication.',
      price: 8499,
      salePrice: 6999,
      sku: 'QC-TR-001',
      stock: 14,
      categoryId: createdCategories['womens-couture'],
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      sizes: ['XS', 'S', 'M', 'L'],
      colors: [
        { name: 'Warm Camel', hex: '#C19A6B' },
        { name: 'Onyx Black', hex: '#1C1C1C' },
        { name: 'Stone Grey', hex: '#9E9E9E' },
      ],
      images: [
        'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
      ],
    },
    {
      name: 'Aurelia Silk Bias-Cut Evening Slip Dress',
      slug: 'aurelia-silk-bias-cut-evening-slip-dress',
      description: 'Crafted from 100% 22-momme Mulberry silk with a subtle cowl neckline, delicate spaghetti straps, and an open back detail. Drapes effortlessly along the body with an ethereal luminous sheen.',
      price: 6299,
      salePrice: 5499,
      sku: 'QC-DR-002',
      stock: 9,
      categoryId: createdCategories['womens-couture'],
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      sizes: ['XS', 'S', 'M', 'L'],
      colors: [
        { name: 'Champagne Gold', hex: '#F7E7CE' },
        { name: 'Emerald', hex: '#004B23' },
        { name: 'Midnight', hex: '#0B132B' },
      ],
      images: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop',
      ],
    },
    {
      name: 'Palazzo High-Waist Pleated Trousers',
      slug: 'palazzo-high-waist-pleated-trousers',
      description: 'Modern relaxed-leg trousers featuring deep front pleats, high-rise waistband, concealed zip fly, and back welt pockets. Woven from breathable tropical wool blend for seasonless versatility.',
      price: 4299,
      salePrice: null,
      sku: 'QC-TR-003',
      stock: 22,
      categoryId: createdCategories['womens-couture'],
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Ivory Cream', hex: '#FFFFF0' },
        { name: 'Slate Taupe', hex: '#877F7D' },
        { name: 'Jet Black', hex: '#111111' },
      ],
      images: [
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?q=80&w=1000&auto=format&fit=crop',
      ],
    },
    {
      name: 'Structured Hourglass Wool Blazer',
      slug: 'structured-hourglass-wool-blazer',
      description: 'Sculptural blazer defined by peak lapels, nipped waistline, and padded shoulders. Lined in pure cupro jacquard for uncompromised drape and luxurious comfort.',
      price: 7999,
      salePrice: 6799,
      sku: 'QC-BL-004',
      stock: 6,
      categoryId: createdCategories['womens-couture'],
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      sizes: ['XS', 'S', 'M', 'L'],
      colors: [
        { name: 'Oatmeal Heather', hex: '#D6CFC7' },
        { name: 'Charcoal', hex: '#36454F' },
      ],
      images: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?q=80&w=1000&auto=format&fit=crop',
      ],
    },

    // Men's Tailoring
    {
      name: 'Milano Unstructured Italian Linen Suit Jacket',
      slug: 'milano-unstructured-italian-linen-suit-jacket',
      description: 'Hand-tailored in an unstructured profile with notched lapels, patch pockets, and twin vents. Made from 100% Normandy flax linen offering effortless breathability and relaxed poise.',
      price: 8999,
      salePrice: 7499,
      sku: 'QC-MJ-005',
      stock: 12,
      categoryId: createdCategories['mens-tailoring'],
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      sizes: ['38R', '40R', '42R', '44R'],
      colors: [
        { name: 'Desert Sand', hex: '#EDC9AF' },
        { name: 'French Navy', hex: '#000080' },
        { name: 'Olive Drab', hex: '#6B8E23' },
      ],
      images: [
        'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop',
      ],
    },
    {
      name: 'The Sartorial Oxford Band-Collar Shirt',
      slug: 'the-sartorial-oxford-band-collar-shirt',
      description: 'Cut from premium 80s two-ply organic Giza cotton, finished with mother-of-pearl buttons, curved hem, and clean mandarin band collar.',
      price: 2999,
      salePrice: 2499,
      sku: 'QC-MS-006',
      stock: 28,
      categoryId: createdCategories['mens-tailoring'],
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: true,
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: [
        { name: 'Crisp White', hex: '#FFFFFF' },
        { name: 'Sky Chambray', hex: '#87CEEB' },
        { name: 'Sage Green', hex: '#9CAF88' },
      ],
      images: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop',
      ],
    },
    {
      name: 'Verona Pleated Tapered Chinos',
      slug: 'verona-pleated-tapered-chinos',
      description: 'Tailored trousers with single front pleats, adjustable side tabs, and a gentle taper toward the ankle. Woven in a durable cotton-twill with just the right touch of stretch.',
      price: 3699,
      salePrice: null,
      sku: 'QC-MC-007',
      stock: 18,
      categoryId: createdCategories['mens-tailoring'],
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
      sizes: ['30', '32', '34', '36'],
      colors: [
        { name: 'British Khaki', hex: '#C3B091' },
        { name: 'Espresso', hex: '#4B3621' },
        { name: 'Deep Navy', hex: '#1B263B' },
      ],
      images: [
        'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=1000&auto=format&fit=crop',
      ],
    },
    {
      name: 'Cashmere-Blend Epsom Overcoat',
      slug: 'cashmere-blend-epsom-overcoat',
      description: 'Single-breasted 3-button overcoat crafted from an opulent 480gsm wool-cashmere blend. Features fly front fastening, felt undercollar, and hand-stitched pick detailing.',
      price: 11999,
      salePrice: 9999,
      sku: 'QC-MO-008',
      stock: 4, // low stock test!
      categoryId: createdCategories['mens-tailoring'],
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      sizes: ['38R', '40R', '42R', '44R'],
      colors: [
        { name: 'Vicuna Camel', hex: '#B57842' },
        { name: 'Midnight Charcoal', hex: '#2C3539' },
      ],
      images: [
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1000&auto=format&fit=crop',
      ],
    },

    // Luxury Knitwear
    {
      name: 'Mongolian Pure Cashmere Turtleneck',
      slug: 'mongolian-pure-cashmere-turtleneck',
      description: 'Spun from Grade-A 2-ply long-staple Mongolian cashmere yarn. Incredibly soft, feather-light yet exceptionally insulating with ribbed neck, cuffs, and hem.',
      price: 6999,
      salePrice: 5899,
      sku: 'QC-KW-009',
      stock: 11,
      categoryId: createdCategories['luxury-knitwear'],
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Alabaster', hex: '#F2F0EB' },
        { name: 'Heather Grey', hex: '#9E9E9E' },
        { name: 'Forest Moss', hex: '#4A5D4E' },
      ],
      images: [
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1000&auto=format&fit=crop',
      ],
    },
    {
      name: 'Heavyweight Loopback French Terry Hoodie',
      slug: 'heavyweight-loopback-french-terry-hoodie',
      description: 'Constructed from dense 450gsm combed organic cotton with double-layered hood, flatlock seam construction, and kangaroo front pocket. The quintessential elevated leisure essential.',
      price: 3499,
      salePrice: 2999,
      sku: 'QC-KW-010',
      stock: 35,
      categoryId: createdCategories['luxury-knitwear'],
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: true,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Vintage Black', hex: '#232323' },
        { name: 'Bone White', hex: '#E3DAC9' },
        { name: 'Earthy Clay', hex: '#B66A50' },
      ],
      images: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop',
      ],
    },
    {
      name: 'Chunky Fisherman Ribbed Cardigan',
      slug: 'chunky-fisherman-ribbed-cardigan',
      description: 'Knit in a 5-gauge brioche stitch using undyed British Lambswool. Fastened with genuine dark walnut buttons and deep patch waist pockets.',
      price: 5499,
      salePrice: null,
      sku: 'QC-KW-011',
      stock: 8,
      categoryId: createdCategories['luxury-knitwear'],
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: false,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Cream Wool', hex: '#FFFDD0' },
        { name: 'Dark Navy', hex: '#0F1A2C' },
      ],
      images: [
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop',
      ],
    },
    {
      name: 'Supima Cotton Relaxed Crewneck T-Shirt',
      slug: 'supima-cotton-relaxed-crewneck-t-shirt',
      description: 'Crafted from extra-long staple American Supima cotton known for exceptional resilience, silk-like softness, and rich color retention. Pre-shrunk and finished with a reinforced rib collar.',
      price: 1499,
      salePrice: 1199,
      sku: 'QC-KW-012',
      stock: 50,
      categoryId: createdCategories['luxury-knitwear'],
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: true,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Optic White', hex: '#FFFFFF' },
        { name: 'Washed Black', hex: '#1C1C1C' },
        { name: 'Heather Sand', hex: '#D8C3A5' },
      ],
      images: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1000&auto=format&fit=crop',
      ],
    },

    // Leather Goods & Bags
    {
      name: 'The Sovereign Vegetable-Tanned Leather Tote',
      slug: 'sovereign-vegetable-tanned-leather-tote',
      description: 'Handcrafted in Tuscany from full-grain vegetable-tanned bridle leather. Unlined interior with hanging zip pouch, solid antique brass hardware, and reinforced top handles.',
      price: 9499,
      salePrice: 7999,
      sku: 'QC-BG-013',
      stock: 7,
      categoryId: createdCategories['leather-goods-bags'],
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      sizes: ['One Size'],
      colors: [
        { name: 'Cognac Saddle', hex: '#9A3821' },
        { name: 'Espresso Brown', hex: '#3B2F2F' },
        { name: 'Pitch Black', hex: '#111111' },
      ],
      images: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1000&auto=format&fit=crop',
      ],
    },
    {
      name: 'Marais Half-Moon Leather Crossbody',
      slug: 'marais-half-moon-leather-crossbody',
      description: 'Minimalist curved silhouette featuring magnetic flap closure, subtle debossed gold logo, adjustable leather strap, and microfiber suede lining.',
      price: 5299,
      salePrice: 4499,
      sku: 'QC-BG-014',
      stock: 15,
      categoryId: createdCategories['leather-goods-bags'],
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: true,
      sizes: ['One Size'],
      colors: [
        { name: 'Burgundy Merlot', hex: '#722F37' },
        { name: 'Olive Green', hex: '#556B2F' },
        { name: 'Noir', hex: '#000000' },
      ],
      images: [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1000&auto=format&fit=crop',
      ],
    },
    {
      name: 'Grand Voyageur Leather Weekender Duffel',
      slug: 'grand-voyageur-leather-weekender-duffel',
      description: 'Roomy cabin-sized travel bag crafted from water-repellent waxed canvas and vegetable-tanned leather trims. Includes dedicated shoe compartment, two-way brass zipper, and padded shoulder strap.',
      price: 11499,
      salePrice: 9499,
      sku: 'QC-BG-015',
      stock: 3, // low stock test!
      categoryId: createdCategories['leather-goods-bags'],
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      sizes: ['45L Carry-On'],
      colors: [
        { name: 'Olive / Saddle', hex: '#556B2F' },
        { name: 'Charcoal / Black', hex: '#2F4F4F' },
      ],
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop',
      ],
    },
    {
      name: 'Atelier Slim Bifold Cardholder',
      slug: 'atelier-slim-bifold-cardholder',
      description: 'Precision hand-stitched French calfskin cardholder with 6 card slots, central cash compartment, and RFID blocking lining. Ultra-slim profile slips seamlessly into any jacket pocket.',
      price: 1899,
      salePrice: 1499,
      sku: 'QC-BG-016',
      stock: 40,
      categoryId: createdCategories['leather-goods-bags'],
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: false,
      sizes: ['One Size'],
      colors: [
        { name: 'Whiskey Tan', hex: '#A75D27' },
        { name: 'Raven Black', hex: '#1C1C1C' },
      ],
      images: [
        'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1000&auto=format&fit=crop',
      ],
    },

    // Designer Footwear
    {
      name: 'Artisan Penny Loafers in Box Calf Leather',
      slug: 'artisan-penny-loafers-in-box-calf-leather',
      description: 'Goodyear-welted in Spain with supple full-grain box calf leather and oak bark tanned leather soles. Hand-burnished finish gives each pair a distinct luster that patinas magnificently.',
      price: 7999,
      salePrice: 6799,
      sku: 'QC-FT-017',
      stock: 12,
      categoryId: createdCategories['designer-footwear'],
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
      colors: [
        { name: 'Dark Oxblood', hex: '#4A0E17' },
        { name: 'Chestnut Brown', hex: '#6E260E' },
        { name: 'Classic Black', hex: '#000000' },
      ],
      images: [
        'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop',
      ],
    },
    {
      name: 'Monochrome Low-Top Minimalist Sneakers',
      slug: 'monochrome-low-top-minimalist-sneakers',
      description: 'Clean silhouette constructed from buttery Nappa leather sitting atop an Italian Margom rubber cupsole. Fully lined in calfskin with removable cushioned orthotic footbed.',
      price: 4999,
      salePrice: 4199,
      sku: 'QC-FT-018',
      stock: 25,
      categoryId: createdCategories['designer-footwear'],
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: true,
      sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
      colors: [
        { name: 'All White', hex: '#FFFFFF' },
        { name: 'Bone & Suede', hex: '#EDE8D0' },
        { name: 'Matte Black', hex: '#1A1A1A' },
      ],
      images: [
        'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1000&auto=format&fit=crop',
      ],
    },
    {
      name: 'Chelsea Boots in Water-Resistant Suede',
      slug: 'chelsea-boots-in-water-resistant-suede',
      description: 'Classic pull-on Chelsea boots featuring premium repello suede, tonal elastic side gussets, branded woven pull tabs, and lightweight studded Dainite rubber soles.',
      price: 7499,
      salePrice: null,
      sku: 'QC-FT-019',
      stock: 8,
      categoryId: createdCategories['designer-footwear'],
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
      sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
      colors: [
        { name: 'Snuff Suede', hex: '#704214' },
        { name: 'Charcoal Grey', hex: '#36454F' },
      ],
      images: [
        'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=1000&auto=format&fit=crop',
      ],
    },
    {
      name: 'Cap-Toe Oxford Formal Shoes',
      slug: 'cap-toe-oxford-formal-shoes',
      description: 'The definitive formal dress shoe. Crafted on a sculpted almond toe last using French full-grain calfskin with closed lacing and beveled waist leather soles.',
      price: 8299,
      salePrice: 6999,
      sku: 'QC-FT-020',
      stock: 10,
      categoryId: createdCategories['designer-footwear'],
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: false,
      sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
      colors: [
        { name: 'Mirror Gloss Black', hex: '#0B0B0B' },
        { name: 'Museum Brown Calf', hex: '#4A2E18' },
      ],
      images: [
        'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop',
      ],
    },

    // Fine Accessories
    {
      name: 'Solid Brass Architectural Cuff Bracelet',
      slug: 'solid-brass-architectural-cuff-bracelet',
      description: 'Hand-forged raw architectural brass cuff with chamfered edges and a brushed matte satin finish. Designed to subtly conform to the wearer’s wrist over time.',
      price: 2499,
      salePrice: 1999,
      sku: 'QC-AC-021',
      stock: 30,
      categoryId: createdCategories['fine-accessories'],
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: true,
      sizes: ['Standard', 'Large'],
      colors: [
        { name: 'Brushed Brass', hex: '#B5A642' },
        { name: 'Oxidized Gunmetal', hex: '#43464B' },
      ],
      images: [
        'https://images.unsplash.com/photo-1611591475870-76156a5dc1f8?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop',
      ],
    },
    {
      name: 'Milanese Polarized Japanese Acetate Sunglasses',
      slug: 'milanese-polarized-japanese-acetate-sunglasses',
      description: 'Handcrafted from 8mm Japanese Takiron cured acetate, fitted with scratch-resistant CR-39 polarized green lenses offering 100% UV400 protection and 7-barrel custom hinges.',
      price: 4499,
      salePrice: 3799,
      sku: 'QC-AC-022',
      stock: 16,
      categoryId: createdCategories['fine-accessories'],
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      sizes: ['One Size (49-21-145)'],
      colors: [
        { name: 'Tokyo Tortoise', hex: '#8B4513' },
        { name: 'Crystal Champagne', hex: '#F9E4B7' },
        { name: 'Deep Smoke Black', hex: '#232B2B' },
      ],
      images: [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=1000&auto=format&fit=crop',
      ],
    },
    {
      name: 'Pure Mulberry Silk Hand-Rolled Twill Scarf',
      slug: 'pure-mulberry-silk-hand-rolled-twill-scarf',
      description: 'Screen-printed 90x90cm twill silk scarf inspired by botanical archival drawings. Finished with hand-rolled and hand-sewn edges in Lyon, France.',
      price: 3299,
      salePrice: null,
      sku: 'QC-AC-023',
      stock: 20,
      categoryId: createdCategories['fine-accessories'],
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: false,
      sizes: ['90 x 90 cm'],
      colors: [
        { name: 'Ochre & Teal', hex: '#CC7722' },
        { name: 'Monochrome Slate', hex: '#708090' },
      ],
      images: [
        'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?q=80&w=1000&auto=format&fit=crop',
      ],
    },
    {
      name: 'Heritage Full-Grain Bridle Leather Belt',
      slug: 'heritage-full-grain-bridle-leather-belt',
      description: 'Solid 35mm wide English bridle leather belt with solid brass roller buckle, hand-burnished edges, and teardrop hole punches.',
      price: 2199,
      salePrice: 1799,
      sku: 'QC-AC-024',
      stock: 25,
      categoryId: createdCategories['fine-accessories'],
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: true,
      sizes: ['32', '34', '36', '38'],
      colors: [
        { name: 'Rich Tan', hex: '#D2B48C' },
        { name: 'Dark Oak', hex: '#4B3621' },
        { name: 'Nero Black', hex: '#000000' },
      ],
      images: [
        'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop',
      ],
    },
  ];

  const createdProductList = [];
  for (const p of products) {
    const { images, sizes, colors, ...productData } = p;
    const createdProduct = await prisma.product.create({
      data: {
        ...productData,
        sizes: JSON.stringify(sizes),
        colors: JSON.stringify(colors),
      },
    });

    // Create image entries
    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: createdProduct.id,
          url: images[i],
          isPrimary: i === 0,
          sortOrder: i,
        },
      });
    }

    createdProductList.push(createdProduct);
  }

  // 6. Seed Product Reviews
  console.log('⭐ Seeding Product Reviews...');
  const sampleReviews = [
    {
      productId: createdProductList[0].id,
      authorName: 'Kabir Singhania',
      rating: 5,
      comment: 'Incredible tailoring. The fabric weight and drape are comparable to coats three times this price. Fits true to size.',
    },
    {
      productId: createdProductList[0].id,
      authorName: 'Pooja Hegde',
      rating: 5,
      comment: 'Received compliments all week at work. The warm camel shade is so rich in person!',
    },
    {
      productId: createdProductList[1].id,
      authorName: 'Mira Rajput',
      rating: 5,
      comment: 'The Mulberry silk feels like a dream. Beautiful weight, not sheer at all. Perfect for summer soirees.',
    },
    {
      productId: createdProductList[4].id,
      authorName: 'Devansh Kothari',
      rating: 5,
      comment: 'Sublime linen jacket. Very light and unlined, ideal for warm climates while keeping that sharp, tailored look.',
    },
    {
      productId: createdProductList[8].id,
      authorName: 'Rhea Chakraborty',
      rating: 5,
      comment: 'Pure cashmere at this price is a steal. The Alabaster color looks so clean and luxurious.',
    },
    {
      productId: createdProductList[12].id,
      authorName: 'Tara Sutaria',
      rating: 5,
      comment: 'The leather smells heavenly and the brass hardware is sturdy and heavy. Fits my laptop and essentials comfortably.',
    },
  ];

  for (const r of sampleReviews) {
    await prisma.review.create({ data: r });
  }

  // 7. Seed Sample Orders with realistic statuses
  console.log('📦 Seeding Sample Orders...');
  const sampleOrders = [
    {
      orderNumber: 'QC-202611-1042',
      userId: customer1.id,
      customerName: 'Aarav Mehta',
      customerEmail: 'customer@quickcart.com',
      customerPhone: '+91 98201 12345',
      shippingStreet: 'Flat 402, Royale Crest, Pali Hill',
      shippingCity: 'Mumbai',
      shippingState: 'Maharashtra',
      shippingPincode: '400050',
      shippingLandmark: 'Near Nargis Dutt Road',
      paymentMethod: 'COD',
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      subtotal: 6999,
      shippingFee: 0,
      discount: 700,
      couponCode: 'LUXE10',
      total: 6299,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      items: [
        {
          productId: createdProductList[0].id,
          productName: createdProductList[0].name,
          productImage: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop',
          price: 6999,
          quantity: 1,
          selectedSize: 'M',
          selectedColor: 'Warm Camel',
          total: 6999,
        },
      ],
    },
    {
      orderNumber: 'QC-202611-2098',
      userId: customer2.id,
      customerName: 'Ananya Sharma',
      customerEmail: 'ananya.sharma@example.com',
      customerPhone: '+91 99300 54321',
      shippingStreet: 'Villa 14, Defence Colony',
      shippingCity: 'New Delhi',
      shippingState: 'Delhi',
      shippingPincode: '110024',
      shippingLandmark: 'Near Flyover Market',
      paymentMethod: 'DEMO_INSTANT',
      paymentStatus: 'Paid',
      orderStatus: 'Shipped',
      subtotal: 9499,
      shippingFee: 0,
      discount: 1500,
      couponCode: 'ATELIER20',
      total: 7999,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      items: [
        {
          productId: createdProductList[12].id,
          productName: createdProductList[12].name,
          productImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop',
          price: 7999,
          quantity: 1,
          selectedSize: 'One Size',
          selectedColor: 'Cognac Saddle',
          total: 7999,
        },
      ],
    },
    {
      orderNumber: 'QC-202611-3814',
      userId: customer1.id,
      customerName: 'Aarav Mehta',
      customerEmail: 'customer@quickcart.com',
      customerPhone: '+91 98201 12345',
      shippingStreet: 'Flat 402, Royale Crest, Pali Hill',
      shippingCity: 'Mumbai',
      shippingState: 'Maharashtra',
      shippingPincode: '400050',
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      orderStatus: 'Processing',
      subtotal: 4499,
      shippingFee: 0,
      discount: 0,
      couponCode: null,
      total: 4499,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      items: [
        {
          productId: createdProductList[21].id,
          productName: createdProductList[21].name,
          productImage: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop',
          price: 3799,
          quantity: 1,
          selectedSize: 'One Size (49-21-145)',
          selectedColor: 'Tokyo Tortoise',
          total: 3799,
        },
      ],
    },
    {
      orderNumber: 'QC-202611-4902',
      userId: null, // Guest checkout
      customerName: 'Rohit Roy',
      customerEmail: 'rohit.roy@test.com',
      customerPhone: '+91 98111 22334',
      shippingStreet: '704 Indiranagar 100ft Road',
      shippingCity: 'Bengaluru',
      shippingState: 'Karnataka',
      shippingPincode: '560038',
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      subtotal: 1499,
      shippingFee: 99,
      discount: 0,
      couponCode: null,
      total: 1598,
      createdAt: new Date(),
      items: [
        {
          productId: createdProductList[11].id,
          productName: createdProductList[11].name,
          productImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
          price: 1199,
          quantity: 1,
          selectedSize: 'L',
          selectedColor: 'Optic White',
          total: 1199,
        },
      ],
    },
  ];

  for (const o of sampleOrders) {
    const { items, ...orderData } = o;
    await prisma.order.create({
      data: {
        ...orderData,
        items: {
          create: items,
        },
      },
    });
  }

  console.log('✅ Seeding completed successfully!');
  console.log('🔑 Admin Credentials:  admin@quickcart.com / admin123');
  console.log('👤 Customer Demo:     customer@quickcart.com / customer123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
