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
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const mediaBase = ((import.meta.env.VITE_MEDIA_URL as string) || (import.meta.env.VITE_BACKEND_URL as string) || '').trim();
  if (mediaBase && cleanUrl.startsWith('/uploads')) {
    return `${mediaBase.replace(/\/+$/, '')}${cleanUrl}`;
  }
  const defaultOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://magnifiscent.site';
  return `${defaultOrigin}${cleanUrl}`;
}

