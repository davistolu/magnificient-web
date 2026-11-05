# MagnifiScent Backend API

> **High-Integrity REST API & Persistence Engine for MagnifiScent Luxury Atelier**  
> Target Production Domain: `https://api.magnifiscent.site` | Storefront: `https://magnifiscent.site`

---

## 1. Overview

The MagnifiScent Backend is an enterprise-grade RESTful API built on Node.js, Express, and TypeScript. It powers the luxury storefront and the administrative operations cockpit, ensuring atomic transactions for high-ticket orders, secure proof-of-payment receipt ingestion, and role-based access control.

### Core Capabilities
- **100% PostgreSQL Persistence**: Seamless integration with [Neon Serverless PostgreSQL](https://neon.tech) utilizing connection pooling (`pg.Pool`) and SSL encryption.
- **Atomic Order Reservation**: Race-condition-free inventory allocation and server-authoritative price verification during checkout.
- **Wire Receipt Upload & Verification**: Encrypted multi-format proof-of-payment submission with automated magic-byte MIME validation.
- **Flexible Domain Aliasing**: Auth controller automatically handles canonical `admin@magnifiscent.site` alongside administrative aliases.
- **Auditable Inventory Movements**: Every addition, reduction, sale, and return is permanently recorded in the `inventory_movements` ledger.
- **Zero Raw Secrets Policy**: All sensitive strings (database URIs, JWT secrets, storage keys) are strictly parsed from environment variables.

---

## 2. Directory Layout

```
backend/
├── src/
│   ├── app.ts                  # Express application setup, security middleware, sitemap & routes
│   ├── index.ts                # HTTP server bootstrap & graceful shutdown handler
│   ├── config/                 # Typed environment validation with Zod
│   ├── database/
│   │   ├── index.ts            # PostgreSQL pool configuration & DataStore abstraction
│   │   ├── schema.ts           # Drizzle relational schema definition
│   │   ├── migrate.ts          # Automated schema DDL migration script
│   │   ├── seed.ts             # Primary database seeding script
│   │   ├── seed-neon.ts        # Standalone Neon database verification & admin seeder
│   │   └── seed-data.ts        # Initial categories, luxury specifications & admin blueprint
│   ├── middleware/
│   │   ├── auth.middleware.ts  # JWT bearer & cookie authentication guard
│   │   ├── rbac.middleware.ts  # Role authorization (admin, staff, customer)
│   │   └── upload.middleware.ts# Multer file upload filter with magic byte checks
│   ├── modules/
│   │   ├── admin/              # Personnel management, system metrics, audit logs
│   │   ├── auth/               # Customer & staff authentication, password updates
│   │   ├── categories/         # Luxury category listings & metadata
│   │   ├── inventory/          # Stock adjustments, low-stock alarms & movement ledger
│   │   ├── orders/             # Order creation, guest token tracking, state machine
│   │   ├── payments/           # Wire transfer submissions & admin verification queue
│   │   ├── products/           # Catalog search, filtering, instant deletion & CMS
│   │   └── settings/           # Store settings, corporate bank info, shipping fees
│   └── shared/                 # Shared TypeScript types, schemas, and brand constants
├── uploads/                    # Local storage fallback for receipts and product media
├── package.json
└── tsconfig.json
```

---

## 3. Database Architecture & Setup

### Database Schema
The database runs on PostgreSQL with the `uuid-ossp` extension enabled. Core tables include:
- `users`: Administrator, concierge personnel, and private client accounts with BCrypt-hashed passwords.
- `categories`: High-level collections (`watches`, `jewellery`, `perfumes`, `gift-sets`).
- `products`: Catalog items with pricing, SKU, stock quantity, brand, specifications, and luxury tags.
- `product_images`: Associated gallery photos with display ordering.
- `orders`: Transaction headers with unique references (e.g. `MAG-2026-XXXX`), shipping addresses, and guest access tokens.
- `order_items`: Line items capturing historical unit prices at time of purchase.
- `payment_submissions`: Encrypted receipt images, transfer narration notes, review timestamps, and approval/rejection reasons.
- `inventory_movements`: Immutable log of every quantity adjustment with actor attribution.
- `store_settings`: Key-value store for corporate bank details, WhatsApp hotline, delivery fees, and hero banners.
- `audit_logs`: Administrative action tracking for complete operational accountability.

### Running Migrations & Seeding
Ensure `DATABASE_URL` is configured in your `backend/.env` file:

```bash
# Apply table schema to remote PostgreSQL / Neon instance
npm run db:migrate

# Seed categories, initial catalog items, and lead concierge admin
npm run db:seed
```

To run the dedicated, secure Neon seeder:
```bash
npx tsx src/database/seed-neon.ts
```

---

## 4. Environment Variables Reference

Create a `backend/.env` file based on `.env.example`. **Never commit `.env` to version control.**

| Variable | Required | Description | Example / Default |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | Port for the HTTP server to listen on | `5000` |
| `NODE_ENV` | Optional | Application runtime environment | `production` / `development` |
| `DATABASE_URL` | **Yes** | Neon Serverless PostgreSQL connection string | `postgresql://neondb_owner:***@ep-***.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | **Yes** | Cryptographic key used to sign JWT session tokens (min 32 chars) | `your-secure-random-32-char-secret-key` |
| `JWT_EXPIRES_IN`| Optional | Token expiration lifespan | `7d` |
| `ALLOWED_ORIGINS`| Optional | Comma-separated list of CORS origins | `https://magnifiscent.site,http://localhost:5173` |
| `FRONTEND_URL` | Optional | Canonical URL of the storefront application | `https://magnifiscent.site` |
| `PUBLIC_API_URL`| Optional | Publicly accessible base URL for this API | `https://api.magnifiscent.site` |
| `INITIAL_ADMIN_EMAIL` | Optional | Email for initial administrator during database seeding | `admin@magnifiscent.site` |
| `INITIAL_ADMIN_PASSWORD` | Optional | Password for initial administrator during database seeding | `YourSecurePassword2026!` |
| `S3_BUCKET_NAME`| Optional | Cloud object storage bucket name (Tigris / S3 / R2) | `magnifiscent-media` |
| `S3_ENDPOINT` | Optional | Custom endpoint for Tigris / S3-compatible storage | `https://fly.storage.tigris.dev` |
| `S3_ACCESS_KEY_ID` | Optional | Storage access key ID | `your-access-key-id` |
| `S3_SECRET_ACCESS_KEY` | Optional | Storage secret access key | `your-secret-access-key` |
| `S3_PUBLIC_URL`| Optional | Public CDN URL for serving uploaded assets | `https://cdn.magnifiscent.site` |
| `SUPPORT_EMAIL`| Optional | Store concierge support email address | `concierge@magnifiscent.site` |
| `WHATSAPP_NUMBER`| Optional | Business phone number for encrypted concierge chat | `+2348000000000` |
| `MAX_RECEIPT_SIZE_MB` | Optional | Maximum allowed upload size for bank transfer receipts | `10` |

---

## 5. Security & Protection Measures

1. **Authentication Guards**: Admin and personnel endpoints require a valid JWT passed either via the `Authorization: Bearer <token>` header or an `httpOnly`, `SameSite=Lax` cookie.
2. **Password Integrity**: Client and administrator passwords are encrypted using BCrypt with 10 salt rounds.
3. **MIME & Magic-Byte Validation**: File uploads are scanned using binary signatures to prevent executable file masking.
4. **Rate Limiting**: Public authentication and order submission routes are throttled to mitigate brute-force attacks.
5. **CORS Isolation**: Dynamic CORS verification matches configured production origins (`magnifiscent.site`) while automatically accepting authorized Vercel preview URLs.

---

## 6. Build & Scripts

```bash
# Start backend in watch mode for development
npm run dev

# Compile TypeScript to production JavaScript in dist/
npm run build

# Start production server from dist/
npm run start

# Execute unit and integration tests (Vitest)
npm run test
```
