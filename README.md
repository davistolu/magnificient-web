# MAGNIFICENT
### Complete Luxury E-Commerce Platform: Wristwatches, Fine Jewellery, Niche Fragrances & Curated Gift Sets

Magnificent is a premier luxury retail platform meticulously engineered with an editorial, tactile aesthetic and end-to-end functionality.

---

## 1. System Architecture

Magnificent is organised as an integrated TypeScript monorepo:

- **`packages/shared`**: Shared domain models, constants, TypeScript types, and Zod validation schemas.
- **`apps/api`**: Node.js & Express REST API using Drizzle ORM, Neon Serverless PostgreSQL / PostgreSQL connection pool, JWT authentication, RBAC, atomic order creation, and private payment receipt storage.
- **`apps/web`**: React 18 with TypeScript, Vite, Tailwind CSS, Lucide React, and React Router. Features both an editorial storefront and a dedicated high-density operations administration portal.

---

## 2. Brand Identity & Visual System

- **Palette**:
  - Warm Ivory: `#F7F4EE`
  - Deep Espresso: `#241C18`
  - Muted Champagne: `#C4A779`
  - Soft Stone: `#E7E0D6`
  - Pure White: `#FFFFFF`
  - Muted Charcoal: `#514A45`
- **Typography**:
  - Headlines & Titles: *Cormorant Garamond* / *Playfair Display* (Editorial Serif)
  - UI, Forms & Technical Data: *Plus Jakarta Sans* / *DM Sans* (Refined Sans-serif)
- **Currency & Formatting**:
  - Full Nigerian Naira (`₦`) formatting conventions with localized thousand separators.

---

## 3. Critical Business Workflows (No Gateway at Launch)

### A. Manual Bank Wire Transfer & Encrypted Receipt Upload
1. Customer selects pieces and proceeds through checkout.
2. Order is created in an atomic transaction; unique reference generated (e.g. `MAG-2026-XXXX`) alongside a cryptographically secure `guestAccessToken`.
3. Initial state: `order_status: pending_payment`, `payment_status: unpaid`.
4. Dedicated Payment Instructions page presents corporate bank wire details (Bank Name, Account Name, NUBAN Account Number with 1-click copy, and Narration instruction).
5. Customer transfers funds and uploads proof of payment (JPEG, PNG, WebP, PDF up to 10MB).
6. File is verified using file magic bytes and saved into private object storage.
7. Status transitions to `payment_status: pending_verification` and `order_status: payment_review`.
8. Administrator inspects receipt in the dedicated **Payment Verification Queue** and independently checks the corporate bank statement.
9. Administrator clicks **Approve** (marks `paid` and `confirmed`) or **Reject** with a mandatory auditable reason.

### B. WhatsApp Luxury Concierge Ordering
1. Available directly from product detail pages, shopping bag, and checkout.
2. Generates an encrypted pre-filled message quoting product names, SKUs, current verified pricing, and delivery destination.
3. Automatically opens chat with the store's configured business telephone number.

---

## 4. Administrative Dashboard Overview

Access URL: `/admin/dashboard` (Sign in with `admin@magnificent.luxury` / `MagnificentAdmin2026!`).

Key features:
- **Operations Overview**: Confirmed sales, pending receipt queue, fulfillment backlog, low-stock warnings, and recent transaction feeds.
- **Payment Verification Queue**: Side-by-side receipt viewer, transaction amount verification, and 1-click approval or rejection with mandatory explanation.
- **Product & Content CMS**: Create, edit, publish, and archive products; upload imagery; manage technical specifications.
- **Inventory & Stock Audit**: Live stock levels, low-stock thresholds, and manual adjustments with mandatory reasons and immutable movement history.
- **Order Fulfillment Register**: Searchable and filterable orders, status lifecycle transitions, and client destination details.
- **Client Directory**: Track customer spend, registered accounts, and order history.
- **Store & Banking Configuration**: Update corporate bank details, WhatsApp business number, delivery fees, and announcement bar.
- **Audit Trail**: Security log recording every administrative action with actor names and timestamps.

---

## 5. Local Setup & Execution Guide

### Prerequisites
- Node.js >= v20.x
- npm >= v10.x
- (Optional) PostgreSQL or Neon Serverless database URL

### Installation
```bash
# Install all dependencies across the monorepo
npm install
```

### Environment Setup
Copy the example environment file:
```bash
cp .env.example apps/api/.env
```
Configure your `DATABASE_URL` (Neon or PostgreSQL). If left empty, the application automatically boots in resilient memory mode for instant local testing!

### Running the Application
```bash
# Run backend API (Port 5000)
npm run dev:api

# In a separate terminal, run frontend web application (Port 5173)
npm run dev:web
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Running Automated Business Logic Tests
```bash
npm run test:api
```
Executes comprehensive Vitest tests verifying price recalculation, tamper resistance, stock concurrency, manual receipt upload lifecycle, state transition protection, and guest order privacy.

### Production Build
```bash
npm run build
```
Creates optimized production bundles for all packages and applications.

---

## 6. Default Demo Credentials

- **Admin Email**: `admin@magnificent.luxury`
- **Admin Password**: `MagnificentAdmin2026!`
- **Sample Client Order Tracking**: `MAG-2026-001` or via guest access tokens generated at checkout.
