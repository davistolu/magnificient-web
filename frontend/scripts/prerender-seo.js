import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_NAME = 'MagnifiScent';
const BASE_URL = (process.env.VITE_STORE_URL || 'https://magnifiscent.site').replace(/\/+$/, '');
const API_URL = (process.env.VITE_API_URL || process.env.PUBLIC_API_URL || 'https://backend-seven-delta-62.vercel.app/api').replace(/\/+$/, '');

const DIST_DIR = path.resolve(__dirname, '../dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function resolveFullUrl(urlStr, baseUrl = BASE_URL) {
  if (!urlStr) return `${baseUrl}/logo.png`;
  if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
    if (!urlStr.includes('localhost')) {
      return urlStr.replace(/^http:\/\//i, 'https://');
    }
    return urlStr;
  }
  const cleanPath = urlStr.startsWith('/') ? urlStr : `/${urlStr}`;
  return `${baseUrl}${cleanPath}`;
}

const CATEGORY_PAGES = [
  {
    slug: 'watches',
    title: 'Haute Horlogerie & Mechanical Watches | MagnifiScent',
    description: 'Explore exceptional Swiss mechanical timepieces, automatic chronographs, and tourbillons at MagnifiScent. Masterpieces of precision horology.',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1200&auto=format&fit=crop',
  },
  {
    slug: 'jewellery',
    title: 'Fine Jewellery & Haute Joaillerie | MagnifiScent',
    description: 'Discover handcrafted natural diamond solitaire pendants, Colombian emerald eternity bands, and bespoke precious gemstone jewellery at MagnifiScent.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop',
  },
  {
    slug: 'perfumes',
    title: 'Artisanal Fragrances & Extraits de Parfum | MagnifiScent',
    description: 'Niche luxury perfumes composed with rare wild Cambodian oud, Taif rose, Mysore sandalwood, and bourbon vanilla. Crafted to be remembered.',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1200&auto=format&fit=crop',
  },
  {
    slug: 'gift-sets',
    title: 'Luxury Gift Sets & Bespoke Presentation Suites | MagnifiScent',
    description: 'Curated celebratory gift edits encased in MagnifiScent signature keepsake chests with personalized handwritten wax-sealed calligraphy cards.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1200&auto=format&fit=crop',
  },
  {
    slug: 'shop',
    title: 'Complete Luxury Catalog | MagnifiScent Ateliers',
    description: 'Explore the complete MagnifiScent catalog of Swiss watches, handcrafted fine jewellery, artisanal extraits de parfum, and curated gift suites.',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1200&auto=format&fit=crop',
  },
  {
    slug: 'about',
    title: 'Heritage, Craftsmanship & Philosophy | MagnifiScent',
    description: 'Learn about the timeless artistry, master watchmakers, goldsmiths, and master perfumers behind MagnifiScent — Made to Be Remembered.',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1200&auto=format&fit=crop',
  },
  {
    slug: 'contact',
    title: 'Private Concierge & Client Advisory | MagnifiScent',
    description: 'Connect with our luxury concierge for private appointments, custom jewellery commissions, and white-glove advisory.',
    image: 'https://magnifiscent.site/logo.png',
  },
  {
    slug: 'track',
    title: 'Track Your Luxury Commission | MagnifiScent Concierge',
    description: 'Real-time status tracking for your MagnifiScent orders, artisanal preparation, and insured white-glove dispatch.',
    image: 'https://magnifiscent.site/logo.png',
  },
  {
    slug: 'faq',
    title: 'Frequently Asked Questions & Client Services | MagnifiScent',
    description: 'Find answers on authenticity certificates, Swiss calibre warranties, worldwide insured delivery, and bespoke commissions.',
    image: 'https://magnifiscent.site/logo.png',
  },
];

const BUILTIN_PRODUCTS = [
  {
    id: 'prod-watch-1',
    categoryId: 'cat-watches',
    name: 'The Sovereign Automatique 40mm',
    slug: 'the-sovereign-automatique-40mm',
    sku: 'MAG-WAT-001',
    shortDescription: 'Classic dress watch featuring sunburst dial and Swiss automatic movement.',
    description: 'The Sovereign Automatique embodies timeless restraint. Featuring a hand-polished 316L stainless steel case, an anti-reflective sapphire crystal, and an in-house adjusted automatic calibre with a 42-hour power reserve. Completed with a supple Italian alligator-grain leather strap.',
    price: 1850000,
    compareAtPrice: 2100000,
    stockQuantity: 8,
    brand: 'Magnificent Horlogerie',
    images: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000&auto=format&fit=crop',
        altText: 'The Sovereign Automatique front view',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'prod-watch-2',
    categoryId: 'cat-watches',
    name: 'The Grand Chronograph Heritage',
    slug: 'the-grand-chronograph-heritage',
    sku: 'MAG-WAT-002',
    shortDescription: 'Rose gold precision chronograph with column wheel complication.',
    description: 'A tribute to classical stopwatch instruments. Encased in 18k rose gold PVD steel with dual recessed registers, tachymeter scale, and an exhibition sapphire caseback revealing the decorated movement.',
    price: 2450000,
    compareAtPrice: null,
    stockQuantity: 5,
    brand: 'Magnificent Horlogerie',
    images: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
        altText: 'The Grand Chronograph Heritage',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'prod-watch-3',
    categoryId: 'cat-watches',
    name: 'The Obsidian Horizon Minimalist',
    slug: 'the-obsidian-horizon-minimalist',
    sku: 'MAG-WAT-003',
    shortDescription: 'Ultra-thin architectural timepiece with matte black dial.',
    description: 'Understated contemporary horology. Only 7.2mm slim, engineered from matte blasted steel with an integrated Milanese mesh bracelet. Built for the modern aesthete.',
    price: 980000,
    compareAtPrice: 1100000,
    stockQuantity: 12,
    brand: 'Magnificent Studio',
    images: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=1000&auto=format&fit=crop',
        altText: 'The Obsidian Horizon Minimalist watch',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'prod-jewel-1',
    categoryId: 'cat-jewellery',
    name: 'The Celestial Solitaire Diamond Pendant',
    slug: 'the-celestial-solitaire-diamond-pendant',
    sku: 'MAG-JWL-001',
    shortDescription: '0.75 carat round brilliant diamond in 18k solid yellow gold.',
    description: 'Suspended like a drop of starlight. Features a conflict-free 0.75ct brilliant-cut diamond of exceptional F colour and VVS1 clarity, set into an artisanal four-prong basket on a diamond-cut 18k gold chain.',
    price: 1450000,
    compareAtPrice: null,
    stockQuantity: 6,
    brand: 'Magnificent Atelier',
    images: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000&auto=format&fit=crop',
        altText: 'Celestial Solitaire Diamond Pendant',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'prod-jewel-2',
    categoryId: 'cat-jewellery',
    name: 'The Riviera Emerald & Diamond Eternity Band',
    slug: 'the-riviera-emerald-diamond-eternity-band',
    sku: 'MAG-JWL-002',
    shortDescription: 'Colombian emeralds and brilliant diamonds alternating in 18k white gold.',
    description: 'An unbroken loop of verdant beauty. Hand-selected cushion Colombian emeralds paired harmoniously with pavé natural diamonds, creating an enchanting play of light.',
    price: 1680000,
    compareAtPrice: 1950000,
    stockQuantity: 4,
    brand: 'Magnificent Atelier',
    images: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop',
        altText: 'Riviera Emerald and Diamond Band',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'prod-jewel-3',
    categoryId: 'cat-jewellery',
    name: 'The Sovereign Onyx Signet Ring',
    slug: 'the-sovereign-onyx-signet-ring',
    sku: 'MAG-JWL-003',
    shortDescription: 'Hand-cut black onyx cabochon in heavy brushed 18k gold vermeil.',
    description: 'A statement of heritage and conviction. The Sovereign Signet features a mirror-polished natural black onyx stone set flush into a substantial brushed golden bezel.',
    price: 580000,
    compareAtPrice: null,
    stockQuantity: 9,
    brand: 'Magnificent Atelier',
    images: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=1000&auto=format&fit=crop',
        altText: 'Sovereign Onyx Signet Ring',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'prod-perf-1',
    categoryId: 'cat-perfumes',
    name: 'Oud Royal Impérial (100ml Extrait)',
    slug: 'oud-royal-imperial-100ml',
    sku: 'MAG-PRF-001',
    shortDescription: 'Regal blend of aged Cambodian oud, damask rose, and ambergris.',
    description: 'An intoxicating masterwork of high perfumery. Aged wild Cambodian oud wood enriched by rare Taif rose petals, velvety saffron, labdanum, and precious white ambergris. Formulated at a concentrated 32% oil concentration for an indelible 18-hour trail.',
    price: 395000,
    compareAtPrice: null,
    stockQuantity: 15,
    brand: 'Magnificent Parfums',
    images: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop',
        altText: 'Oud Royal Impérial Flacon',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'prod-perf-2',
    categoryId: 'cat-perfumes',
    name: 'Velvet Santal & Cardamom (100ml EDP)',
    slug: 'velvet-santal-cardamom-100ml',
    sku: 'MAG-PRF-002',
    shortDescription: 'Creamy Mysore sandalwood, Guatemalan cardamom, and Florentine iris.',
    description: 'Warm, tactile, and endlessly sophisticated. The sensual creaminess of pure sandalwood balanced by aromatic crushed cardamom, powdery iris, and a subtle veil of musk.',
    price: 320000,
    compareAtPrice: 350000,
    stockQuantity: 11,
    brand: 'Magnificent Parfums',
    images: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1000&auto=format&fit=crop',
        altText: 'Velvet Santal and Cardamom perfume',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'prod-perf-3',
    categoryId: 'cat-perfumes',
    name: 'Fleur Blanche Nocturne (100ml EDP)',
    slug: 'fleur-blanche-nocturne-100ml',
    sku: 'MAG-PRF-003',
    shortDescription: 'Night-blooming tuberose, neroli, and Madagascar bourbon vanilla.',
    description: 'An evocative olfactory poem dedicated to twilight gardens. Intoxicating tuberose and white gardenia harmonised with golden citrus blossoms and warm bourbon vanilla pods.',
    price: 295000,
    compareAtPrice: null,
    stockQuantity: 14,
    brand: 'Magnificent Parfums',
    images: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop',
        altText: 'Fleur Blanche Nocturne perfume',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'prod-gift-1',
    categoryId: 'cat-gift-sets',
    name: 'The Sovereign Executive Gift Suite',
    slug: 'the-sovereign-executive-gift-suite',
    sku: 'MAG-GFT-001',
    shortDescription: 'The Sovereign Automatique Watch, Onyx Signet Ring & Travel Oud Coffret.',
    description: 'The pinnacle of masculine refinement. Presented in a bespoke Italian velvet and brass-trimmed presentation chest, complete with personalized handwritten wax-sealed calligraphy card.',
    price: 2750000,
    compareAtPrice: 3100000,
    stockQuantity: 3,
    brand: 'Magnificent Curations',
    images: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop',
        altText: 'The Sovereign Executive Gift Suite',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'prod-gift-2',
    categoryId: 'cat-gift-sets',
    name: 'The Celestial Bloom Luxury Hamper',
    slug: 'the-celestial-bloom-luxury-hamper',
    sku: 'MAG-GFT-002',
    shortDescription: 'Celestial Solitaire Diamond Pendant & Fleur Blanche Nocturne Perfume.',
    description: 'An unforgettable romantic gesture. Pairing our iconic 0.75ct diamond pendant with the Fleur Blanche Nocturne perfume, nestled amidst silk ribbon and gold-embossed bespoke gift packaging.',
    price: 1850000,
    compareAtPrice: 2050000,
    stockQuantity: 5,
    brand: 'Magnificent Curations',
    images: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000&auto=format&fit=crop',
        altText: 'Celestial Bloom Luxury Gift Set',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'prod-gift-3',
    categoryId: 'cat-gift-sets',
    name: 'The Grand Parfumerie Discovery Wardrobe',
    slug: 'the-grand-parfumerie-discovery-wardrobe',
    sku: 'MAG-GFT-003',
    shortDescription: 'Five 15ml artisanal extraits in a bespoke cedarwood travel chest.',
    description: 'An exquisite olfactory journey. Contains five numbered travel flacons of Magnificent signature extraits, accompanied by a genuine leather travel sleeve and brass atomizer.',
    price: 490000,
    compareAtPrice: null,
    stockQuantity: 10,
    brand: 'Magnificent Parfums',
    images: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=1000&auto=format&fit=crop',
        altText: 'Grand Parfumerie Discovery Wardrobe',
        isPrimary: true,
      },
    ],
  },
];

async function fetchLiveProducts() {
  const mergedMap = new Map();
  for (const p of BUILTIN_PRODUCTS) {
    mergedMap.set(p.slug.toLowerCase(), p);
  }

  const endpoint = `${API_URL}/products?limit=100`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(endpoint, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timer);

    if (res.ok) {
      const json = await res.json();
      const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
      if (list.length > 0) {
        console.log(`[SEO Prerender] Successfully fetched ${list.length} live products from ${API_URL}`);
        for (const item of list) {
          if (item?.slug) {
            mergedMap.set(item.slug.toLowerCase(), item);
          }
        }
      }
    }
  } catch (err) {
    console.log(`[SEO Prerender] Note: Live API fetch skipped (${err.message}). Using catalog seed data.`);
  }

  return Array.from(mergedMap.values());
}

function generatePageHtml(baseTemplate, { title, description, canonicalUrl, imageUrl, type = 'website', productData = null }) {
  let html = baseTemplate;

  // 1. Replace <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

  // 2. Replace meta description
  html = html.replace(
    /<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );

  // 3. Replace canonical link
  html = html.replace(
    /<link\s+rel=["']canonical["']\s+href=["'][\s\S]*?["']\s*\/?>/i,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );

  // 4. Construct Product or Page Open Graph & Twitter & Schema Block
  let productOgMeta = '';
  let structuredDataJson = '';

  if (productData) {
    productOgMeta = `
    <meta property="product:price:amount" content="${productData.price}" />
    <meta property="product:price:currency" content="NGN" />
    <meta property="product:brand" content="${escapeHtml(productData.brand || SITE_NAME)}" />
    <meta property="product:availability" content="${productData.stockQuantity > 0 ? 'in stock' : 'out of stock'}" />`;

    const schemaObj = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: productData.name,
      image: [imageUrl],
      description: productData.shortDescription || productData.description || '',
      sku: productData.sku || '',
      brand: {
        '@type': 'Brand',
        name: productData.brand || SITE_NAME,
      },
      offers: {
        '@type': 'Offer',
        url: canonicalUrl,
        priceCurrency: 'NGN',
        price: String(productData.price),
        availability: productData.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    };
    structuredDataJson = `
    <!-- Product Structured Data (Schema.org) -->
    <script type="application/ld+json">
    ${JSON.stringify(schemaObj, null, 2)}
    </script>`;
  } else {
    const webPageSchema = {
      '@context': 'https://schema.org/',
      '@type': 'WebPage',
      name: title,
      description,
      url: canonicalUrl,
    };
    structuredDataJson = `
    <!-- WebPage Structured Data (Schema.org) -->
    <script type="application/ld+json">
    ${JSON.stringify(webPageSchema, null, 2)}
    </script>`;
  }

  const metaReplacement = `<!-- Open Graph (Facebook / WhatsApp / LinkedIn / iMessage) -->
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:secure_url" content="${imageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(title)}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:locale" content="en_US" />${productOgMeta}

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@magnifiscent" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <meta name="twitter:image:alt" content="${escapeHtml(title)}" />
${structuredDataJson}\n\n    <!-- Google Fonts`;

  html = html.replace(/<!--\s*Open Graph[\s\S]*?<!--\s*Google Fonts/i, metaReplacement);

  return html;
}

function writeHtmlFiles(subPath, htmlContent) {
  const dirPath = path.join(DIST_DIR, subPath);
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(path.join(dirPath, 'index.html'), htmlContent, 'utf-8');

  const directFilePath = path.join(DIST_DIR, `${subPath}.html`);
  fs.mkdirSync(path.dirname(directFilePath), { recursive: true });
  fs.writeFileSync(directFilePath, htmlContent, 'utf-8');
}

async function main() {
  console.log('[SEO Prerender] Starting pre-render generation for MagnifiScent...');

  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error(`[SEO Prerender] Error: Base template not found at ${TEMPLATE_PATH}`);
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

  let count = 0;
  for (const cat of CATEGORY_PAGES) {
    const canonicalUrl = `${BASE_URL}/${cat.slug}`;
    const imageUrl = resolveFullUrl(cat.image);
    const pageHtml = generatePageHtml(baseHtml, {
      title: cat.title,
      description: cat.description,
      canonicalUrl,
      imageUrl,
      type: 'website',
    });
    writeHtmlFiles(cat.slug, pageHtml);
    count++;
  }
  console.log(`[SEO Prerender] Generated ${count} atelier & category routes`);

  const products = await fetchLiveProducts();
  let prodCount = 0;

  for (const prod of products) {
    if (!prod.slug) continue;
    const priceFormatted = `₦${Number(prod.price).toLocaleString()}`;
    const rawDesc = prod.shortDescription || prod.description || 'Exclusive luxury creation by MagnifiScent.';
    const description = `${priceFormatted} — ${rawDesc}`;
    const title = `${prod.name} | ${SITE_NAME}`;
    const canonicalUrl = `${BASE_URL}/products/${prod.slug}`;

    const primaryImg =
      prod.images?.find((img) => img.isPrimary)?.imageUrl ||
      prod.images?.[0]?.imageUrl ||
      prod.imageUrl ||
      `${BASE_URL}/logo.png`;
    const imageUrl = resolveFullUrl(primaryImg);

    const prodHtml = generatePageHtml(baseHtml, {
      title,
      description,
      canonicalUrl,
      imageUrl,
      type: 'product',
      productData: prod,
    });

    writeHtmlFiles(`products/${prod.slug}`, prodHtml);
    prodCount++;
  }
  console.log(`[SEO Prerender] Generated ${prodCount} product pre-rendered routes under /products/:slug`);

  const sitemapUrls = [
    `${BASE_URL}/`,
    ...CATEGORY_PAGES.map((c) => `${BASE_URL}/${c.slug}`),
    ...products.map((p) => `${BASE_URL}/products/${p.slug}`),
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    (u) => `  <url>
    <loc>${u}</loc>
    <changefreq>${u === `${BASE_URL}/` || u.includes('/products/') ? 'daily' : 'weekly'}</changefreq>
    <priority>${u === `${BASE_URL}/` ? '1.0' : u.includes('/products/') ? '0.85' : '0.90'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log(`[SEO Prerender] Wrote sitemap.xml with ${sitemapUrls.length} entries`);

  console.log('[SEO Prerender] Complete! All links now unfurl rich photos, prices, and titles on WhatsApp, iMessage, Twitter, etc.');
}

main().catch((err) => {
  console.error('[SEO Prerender Fatal Error]:', err);
  process.exit(1);
});
