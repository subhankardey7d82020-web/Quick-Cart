export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductImage {
  id: number;
  productId: number;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Review {
  id: number;
  productId: number;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    name: string;
  };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isFeatured: boolean;
  isActive: boolean;
  productCount?: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  sku: string;
  stock: number;
  categoryId: number;
  category?: Category;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  sizes: string[];
  colors: ProductColor[];
  images: ProductImage[];
  reviews?: Review[];
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  maxStock: number;
}

export interface Address {
  id?: number;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault?: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  isActive: boolean;
  createdAt: string;
  addresses?: Address[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId?: number;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  total: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId?: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  shippingLandmark?: string;
  paymentMethod: 'COD' | 'DEMO_INSTANT';
  paymentStatus: 'Pending' | 'Paid';
  orderStatus: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  subtotal: number;
  shippingFee: number;
  discount: number;
  couponCode?: string | null;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface Coupon {
  id: number;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  timesUsed: number;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  logoUrl?: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  currencySymbol: string;
  currencyCode: string;
  shippingCharges: string;
  freeShippingThreshold: string;
  announcementActive: string;
  announcementText: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaText: string;
  heroImageUrl: string;
  socialInstagram?: string;
  socialFacebook?: string;
  socialPinterest?: string;
  [key: string]: string | undefined;
}

export interface FilterState {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  sort: string;
  page: number;
}
