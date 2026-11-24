# Quick Cart — Luxury Fashion E-Commerce Atelier

An editorial, full-stack, free & open-source fashion boutique e-commerce web application with a complete shopping experience and an administrative command portal.

Built for modern luxury: minimal aesthetic, bespoke typography, warm cream and gold accents, fluid image zoom, full shopping bag & coupon engine, live order tracking timeline, doorstep Cash on Delivery (COD) fulfillment, and an admin suite.

---

## ✨ Features Overview

### 🛍️ Client Experience & Storefront
- **Luxury Editorial Design**: Cormorant/Playfair typography, warm cream tones (`#FAF7F0`), deep obsidian black, and brass accents (`#9A7B38`).
- **Dynamic Announcement Marquee**: Editable directly from the Admin Panel; alerts shoppers of seasonal promotions and complimentary shipping thresholds.
- **Hero Campaign Banner**: Large editorial imagery, responsive typography, and call-to-action buttons.
- **Curated Category Grid**: Circular vignettes with category piece counts.
- **Comprehensive Product Catalog (`/shop`)**:
  - Live full-text search with instantaneous filtering.
  - Category selector.
  - Min/Max price range filters.
  - Size filtering (`XS`, `S`, `M`, `L`, `XL`, `XXL`, `One Size`).
  - Color palette swatch filtering with visual hex check indicators.
  - In-stock availability toggle.
  - Sorting: *Newest, Price: Low to High, Price: High to Low, Popularity, Featured*.
  - Desktop sidebar and mobile filter slide-out drawer.
- **Product Details & Bespoke Experience (`/product/:slug`)**:
  - Multi-image zoom gallery with thumbnails.
  - Variant requirement validation (prevents adding without selecting required size/color).
  - Live stock availability indicator (with low stock warnings).
  - Add to Shopping Bag & Instant "Buy Now" flow.
  - Customer review submission & 5-star rating system.
  - Tabbed specs: *Description & Cut*, *Materials & Sustainability*, *Delivery & COD*, *Client Reviews*.
  - Related product recommendations.
- **Slide-out Shopping Bag & Full Cart (`/cart`)**:
  - Live free shipping progress bar showing exact remaining spend needed to unlock complimentary delivery.
  - Quantity controls, variant labels, and item removal.
  - Interactive coupon engine (try `LUXE10` or `FIRST500`).
  - Persistent storage in browser `localStorage`.
- **Doorstep COD & Demo Checkout (`/checkout`)**:
  - Full shipping address form (Name, Phone, Email, Street, City, State, PIN code, Landmark, Instructions).
  - **Payment Modes**:
    1. **Cash on Delivery (COD)**: Real doorstep payment mode with zero gateway fees.
    2. **Demo Instant Payment**: Zero-cost payment simulation for testing order workflows.
  - Generates unique reference codes (e.g., `QC-202611-1042`).
  - Automatically updates database inventory and coupon redemption counters.
- **Live Logistics Tracking (`/order-tracking`)**:
  - Multi-step timeline: *Pending → Confirmed → Processing → Shipped → Out for Delivery → Delivered*.
  - Track by Order Reference and Phone number verification.
  - Real-time sync when Admin modifies status.
- **Customer Account Portal (`/account`)**:
  - Personal profile management.
  - Multiple saved shipping addresses with default address flag.
  - Order history with full modal receipt inspection.
  - Order cancellation option while in Pending/Confirmed status.
  - Saved Wishlist.
  - Security & password update.

---

### 🛡️ Administrative Command Portal (`/admin`)
- **Protected Access (`/admin/login`)**:
  - Secure bcrypt password hashing and signed JWT authentication.
  - One-click **Auto-Fill** button for effortless evaluation.
- **Telemetry Dashboard**:
  - Total Revenue, Total Orders, Active Catalog Count, Registered Clients.
  - Interactive 7-Day Revenue bar chart.
  - Low stock alerts (items with ≤ 5 units remaining).
  - Recent orders feed with quick status badges.
  - Top-selling articles by units disbursed.
- **Product Management (`/admin/products`)**:
  - Add, edit, and delete products.
  - Local image upload (via Multer) or external direct CDN links.
  - Sizing, color hex palettes, regular and sale pricing.
  - SKU assignment and inventory stock counters.
  - Badges: Featured, Best Seller, New Arrival.
  - Live active/inactive visibility toggle.
- **Category Management (`/admin/categories`)**:
  - Create, modify, delete categories with imagery and slug generation.
  - Featured homepage display toggle.
- **Order Management & Logistics (`/admin/orders`)**:
  - Filter orders by status (*Pending, Confirmed, Processing, Shipped, Out for Delivery, Delivered, Cancelled*).
  - Search by Order ID, Customer Name, Phone, or Email.
  - Live status updater (syncs automatically to the client tracking page).
  - Payment status toggle (*Pending / Paid*).
  - Printable invoice layout.
  - One-click **Export Orders to CSV**.
- **Customer Directory (`/admin/customers`)**:
  - Search client profiles, view lifetime order count and lifetime value.
  - Inspect client purchase history.
  - Deactivate / reactivate accounts.
- **Coupon Management (`/admin/coupons`)**:
  - Create percentage-off or fixed ₹ discount codes.
  - Set minimum spend thresholds, usage caps, and expiration dates.
  - Toggle coupon status.
- **Boutique Settings (`/admin/settings`)**:
  - Store Name, Tagline, Currency Symbol (`₹`), Currency Code (`INR`).
  - Base Shipping Charge and Free Shipping Threshold.
  - Live Announcement Bar text and active toggle.
  - Homepage Hero Banner headline, subtext, and image.
  - Concierge contact coordinates and address.

---

## 🛠️ Technology Stack (100% Free & Open Source)

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons, React Router v6.
- **Backend**: Node.js, Express.js, REST API, Multer (local image storage), JWT, bcryptjs.
- **Database & ORM**: SQLite (`dev.db`), Prisma ORM.
- **No Paid APIs**: No Stripe/Razorpay mandatory keys, no paid cloud storage, runs 100% locally out-of-the-box.

---

## 🚀 Quick Start Guide (Windows / Mac / Linux)

### 1. Prerequisites
- **Node.js** v18+ (tested and verified on Node v24)
- **npm** v9+

### 2. Installation
Open your terminal in the project directory:

```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

*(Alternatively, install individually: `npm install`, then `cd server && npm install`, then `cd ../client && npm install`)*

### 3. Database Initialization & Demo Seeding
The database is pre-configured with SQLite. Generate the Prisma client and seed it with 24 sample luxury articles, categories, reviews, coupons, and orders:

```bash
cd server
npm run prisma:push
npm run seed
cd ..
```

### 4. Run Development Environment
From the root directory, start both the Express backend (`http://localhost:5000`) and the Vite React frontend (`http://localhost:5173`) concurrently:

```bash
npm run dev
```

Visit **`http://localhost:5173`** in your browser!

---

## 🔑 Demo Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Administrator** | `admin@quickcart.com` | `admin123` | `/admin/login` or click "Admin Portal" in footer/menu |
| **Customer Demo** | `customer@quickcart.com` | `customer123` | `/login` (contains pre-seeded orders & addresses) |

*(Both login pages feature an **Auto-Fill** button for instant evaluation!)*

### Sample Promotional Coupons to Test:
- **`LUXE10`**: 10% off (Min. spend ₹999)
- **`ATELIER20`**: 20% off (Min. spend ₹2,999)
- **`FIRST500`**: ₹500 flat discount (Min. spend ₹1,999)

---

## ☁️ Free Deployment Guide

This project is architected with zero proprietary lock-in. You can deploy it for free using several modern cloud providers:

### Option A: Render (Free Web Service + Static Site)
1. **Frontend**:
   - Connect your GitHub repository to **Render** or **Cloudflare Pages**.
   - Build Command: `cd client && npm install && npm run build`
   - Publish Directory: `client/dist`
   - Set Environment Variable: `VITE_API_URL` pointing to your backend URL.
2. **Backend**:
   - Create a Free Web Service on **Render**.
   - Root Directory: `server`
   - Build Command: `npm install && npx prisma db push && node prisma/seed.js`
   - Start Command: `node src/index.js`
   - Set Environment Variables: `PORT=10000`, `JWT_SECRET=your_secret_key`, `CLIENT_URL=https://your-frontend.vercel.app`.

### Option B: Vercel Services (Frontend + Backend)
- Import this repository as a Vercel project; the root `vercel.json` configures the Vite frontend and Express backend as separate services.
- Set `DATABASE_URL` to a PostgreSQL connection string and `JWT_SECRET` in the Vercel environment variables. Set `CLIENT_URL` to your Vercel frontend origin if using a custom domain.
- The `/api/*` and `/uploads/*` paths route to the backend; all other paths route to the frontend. Leave `VITE_API_URL` unset so the frontend uses these same-origin rewrites.
- The backend build command runs Prisma migrations. Use an appropriately isolated database for Preview deployments to avoid applying preview builds to production data.

### Option C: Railway (Free Trial / Starter)
- Add a Node.js service pointing to `server/` with an attached persistent volume mapped to `server/prisma` and `server/uploads` to persist uploaded images and the SQLite `dev.db`.

### Option D: Free Serverless SQLite (Turso / LibSQL)
- To eliminate file system storage for SQLite, migrate `datasource db` in `schema.prisma` to Turso's free distributed SQLite cloud with 9GB free storage.

#### Free Tier Notes:
- Free services on Render spin down after 15 minutes of inactivity; allow 30-40 seconds for cold boot upon the first request.
- Local storage for uploaded images is stored in `server/uploads/` during local development without needing AWS S3 or Cloudinary.

---

## 📂 Project Directory Structure

```
Quick Cart/
├── package.json               # Monorepo root orchestration (concurrent dev runners)
├── server/                    # Node.js + Express.js REST API
│   ├── .env                   # Server environment variables
│   ├── .env.example
│   ├── uploads/               # Local image uploads directory
│   ├── prisma/
│   │   ├── schema.prisma      # SQLite schema models
│   │   ├── dev.db             # SQLite database file
│   │   └── seed.js            # Rich seed script (24 products, reviews, orders)
│   └── src/
│       ├── index.js           # Server entry point
│       ├── config/            # Prisma connection singleton
│       ├── middleware/        # JWT auth, admin authorization, Multer uploader
│       ├── controllers/       # Auth, products, categories, orders, coupons, reviews
│       └── routes/            # REST endpoint routers
└── client/                    # React 18 + Vite + TypeScript Frontend
    ├── index.html             # Luxury font imports and meta tags
    ├── tailwind.config.js     # Custom palette (cream, noir, accent, sand)
    ├── vite.config.ts         # Reverse proxy for /api and /uploads
    └── src/
        ├── types/             # TypeScript interfaces
        ├── services/          # Centralized typed API service
        ├── context/           # Auth, Cart, Wishlist, Settings, Toast contexts
        ├── components/
        │   ├── common/        # Navbar, AnnouncementBar, Footer, ProductCard, QuickViewModal, CartDrawer
        │   └── admin/         # AdminLayout, sidebar navigation
        └── pages/
            ├── HomePage.tsx
            ├── ShopPage.tsx
            ├── ProductDetailPage.tsx
            ├── CartPage.tsx
            ├── CheckoutPage.tsx
            ├── OrderConfirmationPage.tsx
            ├── OrderTrackingPage.tsx
            ├── WishlistPage.tsx
            ├── AboutPage.tsx
            ├── ContactPage.tsx
            ├── LoginPage.tsx
            ├── RegisterPage.tsx
            ├── AccountPage.tsx
            └── admin/         # AdminDashboard, Products, Categories, Orders, Customers, Coupons, Settings
```

---

## ⚖️ License
MIT License. Free for personal, commercial, and educational use.
