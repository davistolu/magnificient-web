import { pool, store } from './index.js';
import { INITIAL_ADMIN, INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_DISCOUNTS } from './seed-data.js';
import { DEFAULT_STORE_SETTINGS } from '../shared/index.js';
import bcrypt from 'bcryptjs';

export async function seedDatabase(force = false) {
  console.log('[Seed] Seeding MagnifiScent luxury catalog & initial admin...');

  // Seed local store
  store.seed(force);

  if (!pool) {
    console.log('[Seed] No PostgreSQL connection available. Persistent SQLite engine active.');
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Seed Admin
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(INITIAL_ADMIN.password, salt);
    await client.query(`
      INSERT INTO users (full_name, email, phone, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        is_active = true
    `, [INITIAL_ADMIN.fullName, INITIAL_ADMIN.email, INITIAL_ADMIN.phone, passwordHash, INITIAL_ADMIN.role]);

    // 2. Seed Categories
    for (const cat of INITIAL_CATEGORIES) {
      await client.query(`
        INSERT INTO categories (name, slug, description, image_url, display_order)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          image_url = EXCLUDED.image_url,
          display_order = EXCLUDED.display_order
      `, [cat.name, cat.slug, cat.description, cat.imageUrl, cat.displayOrder]);
    }

    // 3. Seed Products
    for (const prod of INITIAL_PRODUCTS) {
      // Find category id
      const catRes = await client.query('SELECT id FROM categories WHERE slug = $1', [prod.categoryId.replace('cat-', '')]);
      const catId = catRes.rows[0]?.id || null;

      const prodRes = await client.query(`
        INSERT INTO products (
          category_id, name, slug, sku, short_description, description,
          price, compare_at_price, stock_quantity, low_stock_threshold,
          status, is_featured, brand, gender, specifications, tags, occasion
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          stock_quantity = EXCLUDED.stock_quantity,
          is_featured = EXCLUDED.is_featured
        RETURNING id
      `, [
        catId, prod.name, prod.slug, prod.sku, prod.shortDescription, prod.description,
        prod.price, prod.compareAtPrice, prod.stockQuantity, prod.lowStockThreshold,
        prod.status, prod.isFeatured, prod.brand, prod.gender,
        JSON.stringify(prod.specifications), JSON.stringify(prod.tags), JSON.stringify(prod.occasion)
      ]);

      const insertedId = prodRes.rows[0]?.id;
      if (insertedId && prod.images) {
        for (const img of prod.images) {
          await client.query(`
            INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
            VALUES ($1, $2, $3, $4, $5)
          `, [insertedId, img.imageUrl, img.altText, img.displayOrder, img.isPrimary]);
        }
      }
    }

    // 4. Seed Discounts
    for (const disc of INITIAL_DISCOUNTS) {
      await client.query(`
        INSERT INTO discounts (code, discount_type, discount_value, min_order_amount, usage_limit, usage_count, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (code) DO NOTHING
      `, [disc.code, disc.discountType, disc.discountValue, disc.minOrderAmount, disc.usageLimit, disc.usageCount, disc.isActive]);
    }

    // 5. Seed Store Settings
    await client.query(`
      INSERT INTO store_settings (key, value)
      VALUES ($1, $2)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `, ['general', JSON.stringify({
      storeName: DEFAULT_STORE_SETTINGS.store_name,
      tagline: DEFAULT_STORE_SETTINGS.tagline,
      supportEmail: DEFAULT_STORE_SETTINGS.support_email,
      whatsappNumber: DEFAULT_STORE_SETTINGS.whatsapp_number,
      whatsappEnabled: DEFAULT_STORE_SETTINGS.whatsapp_enabled,
      currency: DEFAULT_STORE_SETTINGS.currency,
      currencySymbol: DEFAULT_STORE_SETTINGS.currency_symbol,
      announcement: DEFAULT_STORE_SETTINGS.announcement,
      bankDetails: DEFAULT_STORE_SETTINGS.bank_details,
      shipping: DEFAULT_STORE_SETTINGS.shipping,
      hero: DEFAULT_STORE_SETTINGS.hero,
    })]);

    await client.query('COMMIT');
    console.log('[Seed] PostgreSQL database successfully populated with luxury inventory!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.warn('[Seed] Warning during database seed:', (err as Error).message);
  } finally {
    client.release();
  }
}

if (process.argv[1]?.includes('seed.ts')) {
  seedDatabase().then(() => process.exit(0)).catch((err) => {
    console.error('[Seed] Failed:', err);
    process.exit(1);
  });
}
