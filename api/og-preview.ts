// Deprecated: This root /api serverless function is not deployed to Vercel.
// The backend runs independently in the backend/ directory at https://api.magnifiscent.site.
// Pre-rendered SEO files for frontend/dist are generated via frontend/scripts/prerender-seo.js.
export default function handler(_req: any, res: any) {
  res.status(404).json({ error: 'Root /api is deprecated. Use https://api.magnifiscent.site/api' });
}
