import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { INITIAL_ADMIN, INITIAL_CATEGORIES } from './seed-data.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('[Neon Seed Error] DATABASE_URL environment variable is missing.');
  console.error('Please configure DATABASE_URL in your .env file or deployment environment.');
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function main() {
  console.log('[Neon Seed] Connecting to remote Neon database...');
  await client.connect();
  console.log('[Neon Seed] Connected successfully to Neon PostgreSQL.');

  console.log('[Neon Seed] Ensuring tables exist...');
  await client.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      image_url TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      sku TEXT NOT NULL UNIQUE,
      short_description TEXT NOT NULL,
      description TEXT NOT NULL,
      price NUMERIC(12, 2) NOT NULL,
      compare_at_price NUMERIC(12, 2),
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      low_stock_threshold INTEGER NOT NULL DEFAULT 3,
      status TEXT NOT NULL DEFAULT 'published',
      is_featured BOOLEAN NOT NULL DEFAULT false,
      brand TEXT,
      gender TEXT,
      specifications JSONB NOT NULL DEFAULT '{}',
      tags JSONB NOT NULL DEFAULT '[]',
      occasion JSONB NOT NULL DEFAULT '[]',
      seo_title TEXT,
      seo_description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      alt_text TEXT NOT NULL DEFAULT 'Product photograph',
      display_order INTEGER NOT NULL DEFAULT 0,
      is_primary BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      order_number TEXT NOT NULL UNIQUE,
      guest_access_token TEXT NOT NULL,
      customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      delivery_city TEXT NOT NULL,
      delivery_state TEXT NOT NULL,
      delivery_instructions TEXT,
      subtotal NUMERIC(12, 2) NOT NULL,
      discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
      shipping_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
      total_amount NUMERIC(12, 2) NOT NULL,
      currency TEXT NOT NULL DEFAULT 'NGN',
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'unpaid',
      order_status TEXT NOT NULL DEFAULT 'pending_payment',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id UUID REFERENCES products(id) ON DELETE SET NULL,
      product_name_snapshot TEXT NOT NULL,
      sku_snapshot TEXT NOT NULL,
      unit_price NUMERIC(12, 2) NOT NULL,
      quantity INTEGER NOT NULL,
      line_total NUMERIC(12, 2) NOT NULL,
      selected_options_snapshot JSONB,
      product_image_snapshot TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS payment_submissions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      receipt_storage_key TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      submitted_amount NUMERIC(12, 2),
      payment_reference TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      rejection_reason TEXT,
      reviewed_by TEXT,
      reviewed_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_status_history (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      previous_status TEXT,
      new_status TEXT NOT NULL,
      changed_by TEXT NOT NULL,
      note TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS inventory_movements (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity_change INTEGER NOT NULL,
      movement_type TEXT NOT NULL,
      reason TEXT,
      reference_id TEXT,
      created_by TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS store_settings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      key TEXT NOT NULL UNIQUE,
      value JSONB NOT NULL,
      updated_by TEXT,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS discounts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      code TEXT NOT NULL UNIQUE,
      discount_type TEXT NOT NULL,
      discount_value NUMERIC(12, 2) NOT NULL,
      min_order_amount NUMERIC(12, 2),
      usage_limit INTEGER,
      usage_count INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT true,
      expires_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      actor_id TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      recipient_role TEXT DEFAULT 'admin',
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT false,
      order_id TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
  console.log('[Neon Seed] Schema verified.');

  console.log('[Neon Seed] Seeding admin credentials only...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(INITIAL_ADMIN.password, salt);

  const adminResult = await client.query(`
    INSERT INTO users (full_name, email, phone, password_hash, role, is_active)
    VALUES ($1, $2, $3, $4, $5, true)
    ON CONFLICT (email) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone,
      role = EXCLUDED.role,
      is_active = true,
      updated_at = NOW()
    RETURNING id, full_name, email, phone, role, is_active, created_at;
  `, [INITIAL_ADMIN.fullName, INITIAL_ADMIN.email, INITIAL_ADMIN.phone, passwordHash, INITIAL_ADMIN.role]);

  // Also seed aliases so admin can sign in with either spelling or legacy domain
  for (const aliasEmail of ['admin@magnificent.site', 'admin@magnificent.luxury']) {
    await client.query(`
      INSERT INTO users (full_name, email, phone, password_hash, role, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        is_active = true,
        updated_at = NOW()
    `, [INITIAL_ADMIN.fullName, aliasEmail, INITIAL_ADMIN.phone, passwordHash, INITIAL_ADMIN.role]);
  }

  console.log('[Neon Seed] Ensuring core luxury taxonomy categories exist...');
  for (const cat of INITIAL_CATEGORIES) {
    await client.query(`
      INSERT INTO categories (name, slug, description, image_url, display_order, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        image_url = EXCLUDED.image_url,
        display_order = EXCLUDED.display_order
    `, [cat.name, cat.slug, cat.description, cat.imageUrl, cat.displayOrder]);
  }

  console.log('\n======================================================');
  console.log('✅ ADMIN CREDENTIALS & TAXONOMY CATEGORIES SEEDED:');
  const allAdmins = await client.query("SELECT id, full_name, email, role, is_active, created_at FROM users WHERE role = 'admin'");
  console.table(allAdmins.rows);
  const allCats = await client.query("SELECT id, name, slug, display_order FROM categories ORDER BY display_order ASC");
  console.table(allCats.rows);
  console.log('======================================================\n');
}

main()
  .catch((err) => {
    console.error('[Neon Seed Error]', err);
    process.exit(1);
  })
  .finally(() => {
    client.end();
  });
