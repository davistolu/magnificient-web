import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  breadcrumbs?: BreadcrumbItem[];
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

const SITE_NAME = 'MagnifiScent';
const BASE_URL = 'https://magnifiscent.site';
const DEFAULT_TITLE = 'MagnifiScent | Haute Horlogerie, Fine Jewellery & Artisanal Fragrances';
const DEFAULT_DESC =
  'Discover exceptional Swiss horology, handcrafted fine jewellery, artisanal perfumes, and bespoke gift edits. MagnifiScent — Made to Be Remembered.';
const DEFAULT_OG_IMAGE = `${BASE_URL}/logo.png`;
const DEFAULT_KEYWORDS =
  'luxury watches, fine jewellery, artisanal perfumes, extraits de parfum, luxury gift sets, horology Nigeria, haute joaillerie, MagnifiScent, bespoke luxury fragrance, luxury concierge';

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESC,
  keywords = DEFAULT_KEYWORDS,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  breadcrumbs,
  jsonLd,
}) => {
  const location = useLocation();
  const currentUrl = `${BASE_URL}${location.pathname}${location.search}`;
  const canonicalUrl = canonical || `${BASE_URL}${location.pathname}`;
  const fullTitle = title ? (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`) : DEFAULT_TITLE;

  useEffect(() => {
    // 1. Title
    document.title = fullTitle;

    // Helper to set or create meta tag
    const setMetaTag = (attr: 'name' | 'property', key: string, content: string) => {
      let elem = document.querySelector(`meta[${attr}="${key}"]`);
      if (!elem) {
        elem = document.createElement('meta');
        elem.setAttribute(attr, key);
        document.head.appendChild(elem);
      }
      elem.setAttribute('content', content);
    };

    // 2. Standard Meta
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);

    // 3. Canonical URL
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // 4. Open Graph
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', currentUrl);
    const fullImageUrl = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;
    setMetaTag('property', 'og:image', fullImageUrl);
    setMetaTag('property', 'og:image:secure_url', fullImageUrl);
    setMetaTag('property', 'og:image:width', '1200');
    setMetaTag('property', 'og:image:height', '630');
    setMetaTag('property', 'og:image:type', 'image/jpeg');
    setMetaTag('property', 'og:image:alt', fullTitle);
    setMetaTag('property', 'og:site_name', SITE_NAME);
    setMetaTag('property', 'og:locale', 'en_US');

    // 5. Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:site', '@magnifiscent');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', fullImageUrl);
    setMetaTag('name', 'twitter:image:alt', fullTitle);

    // 6. JSON-LD Structured Data
    const scriptId = 'page-structured-data';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const schemas: any[] = [];

    // Add breadcrumb schema if supplied
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.name,
          item: b.url.startsWith('http') ? b.url : `${BASE_URL}${b.url}`,
        })),
      });
    }

    // Add custom page schemas if provided
    if (jsonLd) {
      if (Array.isArray(jsonLd)) {
        schemas.push(...jsonLd);
      } else {
        schemas.push(jsonLd);
      }
    }

    if (schemas.length > 0) {
      scriptTag.text = JSON.stringify(schemas.length === 1 ? schemas[0] : { '@context': 'https://schema.org', '@graph': schemas });
    } else {
      scriptTag.text = '';
    }

    return () => {
      if (scriptTag) {
        scriptTag.text = '';
      }
    };
  }, [fullTitle, description, keywords, canonicalUrl, currentUrl, ogImage, ogType, breadcrumbs, jsonLd]);

  return null;
};
