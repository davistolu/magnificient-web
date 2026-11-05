import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { store, pool } from '../../database/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_NAME = 'MagnifiScent';
const DEFAULT_TITLE = 'MagnifiScent | Haute Horlogerie, Fine Jewellery & Artisanal Fragrances';
const DEFAULT_DESC =
  'Discover exceptional Swiss horology, handcrafted fine jewellery, artisanal perfumes, and bespoke gift edits. MagnifiScent — Made to Be Remembered.';
const DEFAULT_IMAGE = 'https://magnifiscent.site/logo.png';

const CATEGORY_META: Record<string, { title: string; description: string; image: string }> = {
  watches: {
    title: 'Haute Horlogerie & Mechanical Watches | MagnifiScent',
    description: 'Explore exceptional mechanical timepieces, Swiss automatic calibres, tourbillons, and chronographs at MagnifiScent.',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1200&auto=format&fit=crop',
  },
  jewellery: {
    title: 'Fine Jewellery & Haute Joaillerie | MagnifiScent',
    description: 'Discover handcrafted gemstones, diamond suites, bespoke necklaces, bracelets, and rings at MagnifiScent.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop',
  },
  perfumes: {
    title: 'Artisanal Fragrances & Extraits de Parfum | MagnifiScent',
    description: 'Discover rare oud, amber, and bespoke luxury fragrance extraits crafted to be remembered at MagnifiScent.',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop',
  },
  'gift-sets': {
    title: 'Luxury Gift Sets & Presentation Suites | MagnifiScent',
    description: 'Curated celebratory edits and bespoke luxury presentation boxes at MagnifiScent.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1200&auto=format&fit=crop',
  },
  shop: {
    title: 'Complete Luxury Catalog | MagnifiScent Ateliers',
    description: 'Discover exceptional Swiss horology, handcrafted fine jewellery, artisanal perfumes, and bespoke gift edits.',
    image: 'https://magnifiscent.site/logo.png',
  },
};

function escapeHtml(str?: string | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function resolveFullUrl(urlStr: string, baseUrl: string): string {
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

let cachedTemplate: string | null = null;
function getHtmlTemplate(): string | null {
  if (cachedTemplate) return cachedTemplate;
  const candidatePaths = [
    path.resolve(process.cwd(), 'frontend/dist/index.html'),
    path.resolve(process.cwd(), '../frontend/dist/index.html'),
    path.resolve(process.cwd(), 'dist/index.html'),
    path.resolve(__dirname, '../../../../frontend/dist/index.html'),
  ];
  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        cachedTemplate = fs.readFileSync(p, 'utf-8');
        return cachedTemplate;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export async function renderOpenGraphPreview(req: Request, res: Response) {
  const baseUrl = (process.env.FRONTEND_URL || 'https://magnifiscent.site').replace(/\/+$/, '');

  let slug = (req.query.slug as string || req.params.slug || '').trim();
  let category = (req.query.category as string || req.params.category || '').trim();

  const pathParam = req.query.path as string;
  if (pathParam) {
    const clean = pathParam.replace(/^\/+|\/+$/g, '');
    if (clean.startsWith('products/')) {
      slug = clean.replace('products/', '');
    } else if (CATEGORY_META[clean.toLowerCase()]) {
      category = clean;
    }
  }

  if (slug) {
    slug = decodeURIComponent(slug).replace(/^\/+|\/+$/g, '');
  }
  if (category) {
    category = decodeURIComponent(category).replace(/^\/+|\/+$/g, '').toLowerCase();
  }

  // 1. PRODUCT PREVIEW
  if (slug) {
    await store.ensureInitialized();
    let product = store.products.find(
      (p) => p.slug.toLowerCase() === slug.toLowerCase() || p.id === slug
    );

    if (!product && pool) {
      try {
        const pRes = await pool.query(
          `SELECT id, category_id as "categoryId", name, slug, sku, short_description as "shortDescription",
                  description, price::float, compare_at_price::float as "compareAtPrice",
                  stock_quantity as "stockQuantity", status, brand, specifications
           FROM products WHERE slug = $1 OR id = $1 LIMIT 1`,
          [slug]
        );
        if (pRes.rows.length > 0) {
          product = pRes.rows[0];
        }
      } catch (err) {
        console.warn('[OG Preview] Product query error:', (err as Error).message);
      }
    }

    if (product) {
      const canonicalUrl = `${baseUrl}/products/${product.slug}`;
      const title = `${product.name} | ${SITE_NAME}`;
      const priceFormatted = `₦${Number(product.price).toLocaleString()}`;
      const shortDesc = product.shortDescription || product.description || 'Exclusive luxury creation by MagnifiScent.';
      const description = `${priceFormatted} — ${shortDesc}`;

      const productImages = store.productImages.filter((img) => img.productId === product.id);
      const stillImage = productImages.find((img) => !/\.(mp4|webm|mov|ogg)($|\?)/i.test(img.imageUrl));
      const rawImg = stillImage?.imageUrl || productImages[0]?.imageUrl || DEFAULT_IMAGE;
      const imageUrl = resolveFullUrl(rawImg, baseUrl);

      const videoMedia = productImages.find((img) => /\.(mp4|webm|mov|ogg)($|\?)/i.test(img.imageUrl));
      const videoUrl = videoMedia ? resolveFullUrl(videoMedia.imageUrl, baseUrl) : null;

      const html = buildProductHtml({
        title,
        description,
        canonicalUrl,
        imageUrl,
        videoUrl,
        product,
        priceFormatted,
        baseUrl,
      });

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400');
      return res.status(200).send(html);
    }
  }

  // 2. CATEGORY PREVIEW
  if (category && CATEGORY_META[category]) {
    const catData = CATEGORY_META[category];
    const canonicalUrl = `${baseUrl}/${category === 'shop' ? 'shop' : category}`;
    const title = catData.title;
    const description = catData.description;
    const imageUrl = resolveFullUrl(catData.image, baseUrl);

    const html = buildGenericHtml({
      title,
      description,
      canonicalUrl,
      imageUrl,
      baseUrl,
      type: 'website',
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400');
    return res.status(200).send(html);
  }

  // 3. DEFAULT STORE PREVIEW
  const defaultHtml = buildGenericHtml({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    canonicalUrl: baseUrl,
    imageUrl: `${baseUrl}/logo.png`,
    baseUrl,
    type: 'website',
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400');
  return res.status(200).send(defaultHtml);
}

interface ProductHtmlParams {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl: string;
  videoUrl: string | null;
  product: any;
  priceFormatted: string;
  baseUrl: string;
}

function buildProductHtml(params: ProductHtmlParams): string {
  const { title, description, canonicalUrl, imageUrl, videoUrl, product, priceFormatted } = params;

  const template = getHtmlTemplate();
  if (template) {
    let replaced = template
      .replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
      .replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${escapeHtml(description)}" />`)
      .replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i, `<link rel="canonical" href="${canonicalUrl}" />`)
      .replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`)
      .replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(description)}" />`)
      .replace(/<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i, `<meta property="og:image" content="${imageUrl}" />\n    <meta property="og:image:secure_url" content="${imageUrl}" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n    <meta property="og:image:alt" content="${escapeHtml(product.name)}" />`)
      .replace(/<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />\n    <meta property="og:type" content="product" />\n    <meta property="product:price:amount" content="${product.price}" />\n    <meta property="product:price:currency" content="NGN" />`)
      .replace(/<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
      .replace(/<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${escapeHtml(description)}" />`)
      .replace(/<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:image" content="${imageUrl}" />`);

    if (videoUrl) {
      replaced = replaced.replace(
        '</head>',
        `  <meta property="og:video" content="${videoUrl}" />\n    <meta property="og:video:type" content="video/mp4" />\n  </head>`
      );
    }
    return replaced;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta name="theme-color" content="#171412">

  <!-- Open Graph / WhatsApp / Facebook / iMessage / LinkedIn / Discord -->
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="product">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(product.name)}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:locale" content="en_US">
  <meta property="product:price:amount" content="${product.price}">
  <meta property="product:price:currency" content="NGN">
  <meta property="product:brand" content="${escapeHtml(product.brand || SITE_NAME)}">
  <meta property="product:availability" content="${product.stockQuantity > 0 ? 'in stock' : 'out of stock'}">
  ${videoUrl ? `<meta property="og:video" content="${videoUrl}">\n  <meta property="og:video:type" content="video/mp4">` : ''}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@magnifiscent">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="twitter:image:alt" content="${escapeHtml(product.name)}">

  <!-- Structured Data (JSON-LD) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": ${JSON.stringify(product.name)},
    "image": [${JSON.stringify(imageUrl)}],
    "description": ${JSON.stringify(product.shortDescription || product.description || '')},
    "sku": ${JSON.stringify(product.sku || '')},
    "brand": {
      "@type": "Brand",
      "name": ${JSON.stringify(product.brand || SITE_NAME)}
    },
    "offers": {
      "@type": "Offer",
      "url": ${JSON.stringify(canonicalUrl)},
      "priceCurrency": "NGN",
      "price": ${JSON.stringify(String(product.price))},
      "availability": ${JSON.stringify(product.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock')}
    }
  }
  </script>

  <!-- Auto-redirect to interactive SPA when opened by human in browser -->
  <script>
    if (typeof window !== 'undefined' && !/bot|crawl|spider|facebook|whatsapp|twitter|telegram|applebot|discord/i.test(navigator.userAgent)) {
      window.location.replace('${canonicalUrl}');
    }
  </script>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #171412; color: #fbf7ee; padding: 2.5rem 1rem; text-align: center;">
  <div style="max-width: 540px; margin: 0 auto; background: #211c19; padding: 2rem; border: 1px solid #3d352e; border-radius: 8px;">
    <p style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #c8a261; margin-bottom: 0.5rem;">${SITE_NAME} Luxury Atelier</p>
    <h1 style="font-size: 24px; font-weight: 500; margin: 0.5rem 0;">${escapeHtml(product.name)}</h1>
    <p style="font-size: 20px; color: #e5c378; margin: 0.75rem 0; font-weight: 600;">${priceFormatted}</p>
    <img src="${imageUrl}" alt="${escapeHtml(product.name)}" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 4px; margin: 1.25rem 0;" />
    <p style="font-size: 14px; line-height: 1.6; color: #c5b8a5; margin-bottom: 1.5rem;">${escapeHtml(product.shortDescription || product.description || '')}</p>
    <a href="${canonicalUrl}" style="display: inline-block; background: #e5c378; color: #171412; font-size: 12px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; padding: 0.9rem 2rem; border-radius: 4px;">View Creation on Storefront &rarr;</a>
  </div>
</body>
</html>`;
}

interface GenericHtmlParams {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl: string;
  baseUrl: string;
  type: string;
}

function buildGenericHtml(params: GenericHtmlParams): string {
  const { title, description, canonicalUrl, imageUrl } = params;

  const template = getHtmlTemplate();
  if (template) {
    return template
      .replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
      .replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${escapeHtml(description)}" />`)
      .replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i, `<link rel="canonical" href="${canonicalUrl}" />`)
      .replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`)
      .replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(description)}" />`)
      .replace(/<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i, `<meta property="og:image" content="${imageUrl}" />\n    <meta property="og:image:secure_url" content="${imageUrl}" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />`)
      .replace(/<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`)
      .replace(/<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
      .replace(/<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${escapeHtml(description)}" />`)
      .replace(/<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:image" content="${imageUrl}" />`);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta name="theme-color" content="#171412">

  <!-- Open Graph -->
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="en_US">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@magnifiscent">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${imageUrl}">

  <script>
    if (typeof window !== 'undefined' && !/bot|crawl|spider|facebook|whatsapp|twitter|telegram|applebot|discord/i.test(navigator.userAgent)) {
      window.location.replace('${canonicalUrl}');
    }
  </script>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #171412; color: #fbf7ee; padding: 2.5rem 1rem; text-align: center;">
  <div style="max-width: 540px; margin: 0 auto; background: #211c19; padding: 2rem; border: 1px solid #3d352e; border-radius: 8px;">
    <p style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #c8a261; margin-bottom: 0.5rem;">${SITE_NAME}</p>
    <h1 style="font-size: 24px; font-weight: 500; margin: 0.5rem 0;">${escapeHtml(title)}</h1>
    <p style="font-size: 14px; line-height: 1.6; color: #c5b8a5; margin-bottom: 1.5rem;">${escapeHtml(description)}</p>
    <a href="${canonicalUrl}" style="display: inline-block; background: #e5c378; color: #171412; font-size: 12px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; padding: 0.9rem 2rem; border-radius: 4px;">Enter Atelier &rarr;</a>
  </div>
</body>
</html>`;
}
