# MagnifiScent Frontend & Operations Portal

> **Editorial Luxury Storefront & Operations Cockpit**  
> Official Domain: [https://magnifiscent.site](https://magnifiscent.site) | Built with React 18, Vite & Tailwind CSS

---

## 1. Overview

The MagnifiScent frontend is a modern web application uniting a high-touch editorial storefront for private luxury clients with a dense administrative operations portal. It delivers sub-second page transitions, tactile typography, seamless mobile responsiveness, and search engine optimization.

### Key Highlights
- **Official Domain**: Configured for `https://magnifiscent.site` with canonical URLs, dynamic XML sitemaps, and robots exclusion rules.
- **Search Engine Optimization**: Full `schema.org` JSON-LD graphs for Google Sitelinks Searchbox and category deep-links (`/watches`, `/jewellery`, `/perfumes`, `/gift-sets`).
- **Mobile-First Luxury Experience**: Hardware-accelerated slide-out drawer, touch-optimized category filters, and non-blocking sticky concierge ribbons.
- **Enhanced Form Usability**: Password visibility toggles across customer registration, customer login, and staff authentication forms.
- **High-Density Admin Cockpit**: Instant product catalog management (create, edit, and immediate deletion with custom luxury modals), personnel team management, side-by-side receipt audit viewer, and real-time inventory tracking.

---

## 2. Design System & Aesthetic Foundation

The visual identity embodies the discretion and tactile restraint of heritage luxury houses:

### Color Palette
- **Deep Espresso (`#171412` / `#241C18`)**: Primary contrast tone for headings, buttons, and dark accents.
- **Champagne Gold (`#C5A880` / `#A38350`)**: Metallic accent for badges, active states, borders, and decorative lines.
- **Warm Ivory (`#F7F4EE` / `#FAF8F5`)**: Soft, warm background providing high-end editorial paper feel.
- **Refined Stone (`#E5DFD7` / `#D4CCC0`)**: Subtle separation lines, inputs, and card borders.

### Typography
- **Serif / Editorial**: *Cormorant Garamond* / *Playfair Display* for headlines, item names, and atelier philosophy quotes.
- **Sans-Serif / Technical**: *Plus Jakarta Sans* / *DM Sans* for specifications, checkout fields, and administrative dashboards.

---

## 3. Directory Layout

```
frontend/
├── public/
│   ├── logo.png                # High-resolution transparent emblem
│   ├── robots.txt              # Search engine crawling rules
│   └── sitemap.xml             # Canonical XML sitemap for Google & Bing
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── SEO.tsx         # Reactive head & JSON-LD schema injector
│   │   │   ├── DeleteModal.tsx # Custom luxury deletion confirmation modal
│   │   │   └── Toast.tsx       # Concierge notification toasts
│   │   └── storefront/
│   │       ├── Header.tsx      # Responsive navigation & mobile drawer
│   │       ├── Footer.tsx      # Atelier links, trust badges, newsletter
│   │       └── ProductCard.tsx # Editorial card with hover zoom & quick actions
│   ├── context/
│   │   ├── AuthContext.tsx     # Session management, token persistence & RBAC
│   │   └── CartContext.tsx     # Client-side luxury bag with local storage sync
│   ├── layouts/
│   │   ├── StorefrontLayout.tsx# Public wrapper with announcement bar, header & footer
│   │   └── AdminLayout.tsx     # Operations layout with sidebar navigation & concierge drawer
│   ├── pages/
│   │   ├── storefront/         # Public customer views (Home, Shop, Detail, Checkout, Track, About, Contact)
│   │   └── admin/              # Operations views (Dashboard, Products, Orders, Payments, Inventory, Team, Settings)
│   ├── lib/
│   │   ├── api.ts              # Fetch client with token interceptors and error handling
│   │   └── utils.ts            # NGN currency formatters and media URL resolvers
│   ├── App.tsx                 # Route declarations & route guards
│   ├── main.tsx                # React root mount
│   └── index.css               # Tailwind directives & luxury keyframe animations
├── index.html                  # HTML entrypoint with pre-rendered Schema.org graphs
├── tailwind.config.ts          # Custom color palette, fonts & spacing
└── vite.config.ts              # Vite bundle configuration
```

---

## 4. Key Storefront & Administrative Features

### A. Responsive Navigation & Mobile Menu
- **Hardware-Accelerated Drawer**: Smooth slide-in navigation on mobile devices with touch backdrop dismissal.
- **Category Deep Links**: Instant access to Swiss wristwatches, fine jewellery, artisanal fragrances, and gift suites.
- **Cart Ribbon**: Slide-over bag showing line items, selected options, and direct wire checkout buttons.

### B. SEO & Google Sitelinks Integration
- Integrated [`SEO.tsx`](file:///src/components/common/SEO.tsx) dynamically synchronizes:
  - Page `<title>` and `<meta name="description">`
  - Canonical link tags mapped to `https://magnifiscent.site`
  - Open Graph tags (`og:title`, `og:image`, `og:description`, `og:url`) for WhatsApp, iMessage, and Twitter
  - Schema.org structured data (`WebSite`, `Product`, `Offer`, `BreadcrumbList`, `SiteNavigationElement`)

### C. Operations Portal & Personnel Management
- **Instant Product Deletion**: Administrators can immediately delete or archive products with custom luxury dialogs, eliminating browser-native `window.confirm` popups.
- **Operations Team Desk (`/admin/team`)**: Manage staff members, assign permissions, and revoke concierge accounts.
- **Payment Verification Desk (`/admin/payments`)**: Side-by-side view of client wire receipts, transaction details, and 1-click approval/rejection.
- **Order Tracking Portal (`/track`)**: Public order lookup allowing clients to verify real-time fulfillment and wire payment clearance using their order reference (e.g. `MAG-2026-XXXX`).

---

## 5. Environment Variables

Create a `frontend/.env` file or configure these variables in your hosting provider (e.g. Vercel, Netlify):

| Variable | Required | Description | Example / Default |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | **Yes** | Base endpoint for the backend API | `https://api.magnifiscent.site/api` |
| `VITE_STORE_URL` | Optional | Canonical storefront URL for sharing links | `https://magnifiscent.site` |
| `VITE_BACKEND_URL` | Optional | Base URL for resolving relative media files | `https://api.magnifiscent.site` |
| `VITE_WHATSAPP_NUMBER`| Optional | Luxury concierge WhatsApp hotline (E.164) | `+2348000000000` |

---

## 6. Build & Development

```bash
# Start Vite development server at http://localhost:5173
npm run dev

# Run TypeScript type check and compile production bundle to dist/
npm run build

# Preview production build locally
npm run preview
```
