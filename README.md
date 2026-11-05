# MagnifiScent Luxury Atelier & E-Commerce Platform

> **Haute Horlogerie, Fine Jewellery, Artisanal Perfumes & Bespoke Gift Suites**  
> Official Domain: [https://magnifiscent.site](https://magnifiscent.site) | Production Concierge: `concierge@magnifiscent.site`

---

## 1. Executive Summary

**MagnifiScent** is an editorial, high-performance luxury retail e-commerce platform engineered for discerning clientele in Nigeria and internationally. Designed with a tactile, editorial aesthetic inspired by private European salons and heritage horological ateliers, the platform couples immersive visual storytelling with a high-integrity, 100% PostgreSQL-backed transactional core.

### Highlights
- **Domain & Branding**: Official production deployment at **`magnifiscent.site`** with high-resolution transparent vector/PNG branding.
- **Search Engine Optimization (SEO)**: Pre-rendered and dynamic `schema.org` JSON-LD graphs, Google Sitelinks Searchbox, categorized deep-links (`/watches`, `/jewellery`, `/perfumes`, `/gift-sets`), Open Graph social cards, and live XML sitemaps.
- **Private Client Payment Pipeline**: Purpose-built for high-ticket luxury acquisitions using manual corporate bank wire transfers with cryptographic guest access tokens, instant client receipt uploads, and an administrative verification queue.
- **Instant Operations Cockpit**: Single-pane administrative dashboard featuring instant product catalog controls, staff/personnel access management, side-by-side wire receipt audits, and immutable inventory movement records.
- **Mobile-First Luxury Experience**: Responsive navigation with fluid gestures, slide-out drawer, password visibility toggles, and encrypted 1-click WhatsApp concierge purchasing.

---

## 2. System Architecture

MagnifiScent is organized as a clean, modular TypeScript monorepo:

```
mag-web/
├── frontend/                 # Client Storefront & Admin Operations Portal (React 18 + Vite)
│   ├── public/               # Static assets, robots.txt, sitemap.xml, transparent logo
│   └── src/
│       ├── components/       # UI elements, SEO head manager, responsive navbar, modals
│       ├── context/          # AuthContext, CartContext, Notification toasts
│       ├── layouts/          # StorefrontLayout, AdminLayout with concierge drawer
│       ├── pages/            # Editorial storefront & high-density admin views
│       └── lib/              # API clients, currency formatters, media URL resolvers
│
├── backend/                  # RESTful API & Persistence Engine (Node.js + Express)
│   ├── src/
│   │   ├── config/           # Validated environment configurations
│   │   ├── database/         # PostgreSQL connection pool, schema, migrations & seed scripts
│   │   ├── middleware/       # JWT auth guards, RBAC, receipt upload multer filters
│   │   ├── modules/          # Domain modules (auth, products, orders, payments, admin)
│   │   └── shared/           # Cross-tier TypeScript interfaces, schemas & constants
│   └── uploads/              # Local media storage fallback (receipts, catalog imagery)
│
├── .env.example              # Root environment configuration template
└── README.md                 # Master documentation
```

### Technology Stack
| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, React Router 6 |
| **Backend** | Node.js 20+, Express, TypeScript, Drizzle ORM, `pg` Connection Pool |
| **Database** | Neon Serverless PostgreSQL with connection pooling & SSL encryption |
| **Object Storage**| Tigris / AWS S3 / Cloudflare R2 / Local Disk Fallback |
| **Security** | BCrypt password hashing, JWT stateless authentication, Helmet, CORS whitelist |

---

## 3. Brand Identity & Design System

The visual language follows the understated warmth and timeless typography of legacy luxury publications:

- **Color Palette**:
  - `Espresso 900` (`#171412`): Foundation contrast for typography and primary action elements.
  - `Champagne Gold` (`#C5A880` / `#A38350`): Metallic accents, category highlights, and active states.
  - `Ivory` (`#F7F4EE` / `#FAF8F5`): Warm editorial canvas, avoiding sterile pure-white glare.
  - `Warm Stone` (`#E5DFD7` / `#D4CCC0`): Subtle borders, dividers, and card contours.
- **Typography**:
  - **Display / Editorial**: *Cormorant Garamond* / *Playfair Display* for headlines, collection titles, and quotes.
  - **Body / Interface**: *Plus Jakarta Sans* / *DM Sans* for forms, product specifications, and navigational badges.
- **Currency Standard**:
  - Nigerian Naira (`₦`) formatted to exact Central Bank and banking conventions (`₦1,250,000.00`).

---

## 4. Key Business & Operational Workflows

### A. Manual Bank Wire Transfer & Encrypted Receipt Upload
1. **Acquisition Selection**: The client selects curated wristwatches, jewellery, or perfumes and proceeds through checkout.
2. **Order Reservation**: An atomic transaction creates the order in PostgreSQL (`order_status: pending_payment`, `payment_status: unpaid`) and generates a unique tracking reference (e.g., `MAG-2026-XXXX`) and guest security token.
3. **Wire Instructions**: The client is directed to `/orders/:reference/payment`, presenting corporate bank account details (Bank Name, Account Name, Account Number with 1-click clipboard copy, and required reference narration).
4. **Receipt Submission**: The client transfers funds through their bank and uploads proof of payment (JPEG, PNG, WebP, or PDF up to 10MB).
5. **Instant Status Transition**: The order moves to `payment_review` and `payment_status: pending_verification`.
6. **Concierge Verification**: The store concierge inspects the receipt in the admin portal side-by-side with bank records and clicks **Approve** (transitions to `confirmed`/`paid`) or **Reject** with a mandatory explanation.

### B. WhatsApp Encrypted Concierge Desk
Clients seeking bespoke consultations, sizing guidance, or direct payment coordination can tap **Order via WhatsApp** on any piece. The system generates an encrypted message pre-populated with:
- Item name and SKU
- Current price in NGN
- Client delivery state/city
- Direct link to `https://magnifiscent.site/products/:slug`

### C. Search Engine Optimization & Google Sitelinks
Every route dynamically injects Google-compliant metadata and JSON-LD structured data:
- **`WebSite` Graph**: Injects `potentialAction` for the Google Sitelinks Searchbox.
- **`SiteNavigationElement` List**: Direct search-engine indexation of core collections:
  - `/watches` — Haute Horlogerie & Swiss Chronographs
  - `/jewellery` — Fine Jewellery & Bespoke Diamonds
  - `/perfumes` — Artisanal Perfumes & Extraits de Parfum
  - `/gift-sets` — Luxury Presentation Boxes & Suites
- **`Product` & `Offer` Schema**: Real-time NGN pricing, availability (`InStock`), and brand properties for rich Google shopping cards.

---

## 5. Administrative Operations Cockpit

Accessible at `/admin/login` with dedicated, role-based controls:

- **Executive KPI Dashboard**: Live sales revenue, pending wire receipts, fulfillment queue count, and low-inventory alerts.
- **Instant Catalog Management**: Real-time creation, editing, and immediate soft/hard deletion of products with custom luxury confirmation modals (no native browser popups).
- **Personnel & Staff Access Management**: Add, view, and revoke staff and concierge accounts securely.
- **Side-by-Side Wire Verification**: Inspect client payment slips with zoom and rotation tools; approve or reject with instant order state updates.
- **Inventory Audit Ledger**: Immutable audit log of all stock increases, adjustments, and order reservations.
- **Live Store Settings**: Dynamically update corporate bank details, WhatsApp hotline number, announcement banner, and delivery thresholds without restarting services.

---

## 6. Quick Start & Development Setup

### Prerequisites
- Node.js >= v20.x
- npm >= v10.x
- PostgreSQL instance or [Neon Serverless PostgreSQL](https://neon.tech) account

### 1. Installation
Clone the repository and install root and workspace dependencies:
```bash
git clone https://github.com/davistolu/magnificient-web.git
cd mag-web
npm install
```

### 2. Environment Configuration
Create environment files from the secure templates:
```bash
# In the repository root
cp .env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` with your secure credentials:
```env
PORT=5000
DATABASE_URL=postgresql://neondb_owner:<YOUR_PASSWORD>@<YOUR_NEON_HOST>.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=<YOUR_SECURE_32_CHAR_SECRET>
INITIAL_ADMIN_EMAIL=admin@magnifiscent.site
INITIAL_ADMIN_PASSWORD=<YOUR_SECURE_ADMIN_PASSWORD>
ALLOWED_ORIGINS=https://magnifiscent.site,http://localhost:5173
```

Edit `frontend/.env` with your API endpoint:
```env
VITE_API_URL=http://localhost:5000/api
VITE_STORE_URL=http://localhost:5173
VITE_WHATSAPP_NUMBER=+2348000000000
```

### 3. Database Initialization & Admin Seeding
Run schema migrations and initialize the primary administrator:
```bash
# Apply schema and seed admin user
npm run db:seed
```

### 4. Running Locally
Start both backend API and frontend Vite server concurrently or independently:
```bash
# Launch backend API (Port 5000)
npm run dev:backend

# In a second terminal, launch storefront (Port 5173)
npm run dev:frontend
```
Visit `http://localhost:5173` to explore the storefront, or `http://localhost:5173/admin/login` to access the operations cockpit.

---

## 7. Production Deployment & Verification

### Monorepo Build
```bash
npm run build
```
This builds both workspaces:
- Frontend compiles into `frontend/dist` ready for edge CDN hosting (Vercel, Cloudflare Pages, Netlify).
- Backend compiles TypeScript into `backend/dist` ready for Node runtime hosting (Render, Railway, Fly.io, Vercel Serverless).

### Deployment Checkpoints
1. **Frontend Hosting (e.g., Vercel)**:
   - Root directory: `frontend`
   - Output directory: `dist`
   - Environment variables: `VITE_API_URL=https://api.magnifiscent.site/api`, `VITE_STORE_URL=https://magnifiscent.site`
2. **Backend Hosting (e.g., Render / Railway)**:
   - Root directory: `backend`
   - Build command: `npm run build`
   - Start command: `npm run start`
   - Environment variables: `DATABASE_URL`, `JWT_SECRET`, `ALLOWED_ORIGINS=https://magnifiscent.site,https://www.magnifiscent.site`

---

## 8. Security & Privacy Safeguards

- **Zero Credential Exposure**: No raw passwords, Neon pooler tokens, or production JWT keys are hardcoded in the codebase or documentation. All secrets are read from runtime environment variables.
- **Encrypted Proofs**: Payment receipts uploaded by clients are stored with randomized UUID identifiers and served over authenticated endpoints.
- **SQL Injection Defense**: 100% parameterized queries via PostgreSQL `pg` client and Drizzle ORM.
- **XSS & Tamper Resistance**: Strict payload validation powered by Zod; client-tampered pricing submitted during checkout is discarded in favor of server-verified prices.

---

## 9. License & Ownership

Copyright © 2026 MagnifiScent Luxury Retail Ltd. All rights reserved. Private and confidential proprietary software.
