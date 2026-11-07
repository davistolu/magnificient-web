export function formatPrice(amount: number | string | null | undefined, currency = 'NGN'): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '₦0';
  }

  const num = Number(amount);
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency === 'NGN' ? 'NGN' : currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function isVideoMedia(url: string | null | undefined): boolean {
  if (!url) return false;
  const clean = url.split('?')[0].toLowerCase();
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.ogg') ||
    clean.endsWith('.m4v')
  );
}

export function getMediaUrl(url: string | null | undefined): string {
  if (!url) return '';

  const configuredBackend = (
    (import.meta.env.VITE_BACKEND_URL as string) ||
    (import.meta.env.VITE_API_URL as string)?.replace(/\/api\/?$/, '') ||
    'https://backend-seven-delta-62.vercel.app'
  ).replace(/\/+$/, '');

  // 1. Data URIs and Blob URLs pass through unmodified
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // 2. Sanitize any legacy or accidental localhost:5000 / 127.0.0.1 URLs
  if (url.includes('localhost:') || url.includes('127.0.0.1:')) {
    const isRunningLocally = typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    // If client is running on production (magnifiscent.site or mobile) OR target backend is deployed Vercel
    if (!isRunningLocally || configuredBackend.includes('vercel.app')) {
      return url.replace(/^https?:\/\/[^\/]+/, configuredBackend);
    }
    return url;
  }

  // 3. Absolute HTTP/HTTPS URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // If the browser is on HTTPS, upgrade http:// to https:// to avoid mixed-content blocking
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://')) {
      return url.replace(/^http:\/\//i, 'https://');
    }
    return url;
  }

  // 4. Relative paths: route /api/media and /uploads through backend
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  if (cleanUrl.startsWith('/api/media/') || cleanUrl.startsWith('/uploads/')) {
    return `${configuredBackend}${cleanUrl}`;
  }

  const defaultOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://magnifiscent.site';
  return `${defaultOrigin}${cleanUrl}`;
}

