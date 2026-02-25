export const prerender = false;

import type { APIRoute } from 'astro';

const SITE = 'https://v8pro.com.br';
const BACKEND = import.meta.env.PUBLIC_BACKEND_URL || 'http://localhost:3000';

// Static pages with their SEO priorities
const staticPages = [
  { url: '/',            priority: '1.0', changefreq: 'weekly' },
  { url: '/faq',         priority: '0.7', changefreq: 'monthly' },
  { url: '/contato',     priority: '0.6', changefreq: 'yearly' },
  { url: '/ajuda',       priority: '0.6', changefreq: 'monthly' },
  { url: '/privacidade', priority: '0.3', changefreq: 'yearly' },
  { url: '/termos',      priority: '0.3', changefreq: 'yearly' },
  { url: '/cookies',     priority: '0.3', changefreq: 'yearly' },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc: string, lastmod?: string, changefreq?: string, priority?: string): string {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    ${lastmod ? `<lastmod>${lastmod.split('T')[0]}</lastmod>` : ''}
    ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}
    ${priority ? `<priority>${priority}</priority>` : ''}
  </url>`;
}

export const GET: APIRoute = async () => {
  const entries: string[] = [];

  // Static pages
  for (const page of staticPages) {
    entries.push(urlEntry(`${SITE}${page.url}`, undefined, page.changefreq, page.priority));
  }

  // Fetch published articles
  try {
    const res = await fetch(`${BACKEND}/articles?status=PUBLISHED&limit=500`);
    if (res.ok) {
      const data = await res.json();
      const articles = data?.data ?? data ?? [];
      for (const a of articles) {
        if (a.slug) {
          entries.push(urlEntry(
            `${SITE}/artigo/${a.slug}`,
            a.updatedAt || a.publishedAt || a.createdAt,
            'monthly',
            '0.8',
          ));
        }
      }
    }
  } catch { /* skip on error */ }

  // Fetch published projects
  try {
    const res = await fetch(`${BACKEND}/projects?status=PUBLISHED&limit=500`);
    if (res.ok) {
      const data = await res.json();
      const projects = data?.data ?? data ?? [];
      for (const p of projects) {
        if (p.slug) {
          entries.push(urlEntry(
            `${SITE}/projeto/${p.slug}`,
            p.updatedAt || p.createdAt,
            'monthly',
            '0.8',
          ));
        }
      }
    }
  } catch { /* skip on error */ }

  // Fetch public profiles (via users with published content)
  // Using the projects list to get unique usernames
  const seenUsers = new Set<string>();
  try {
    const res = await fetch(`${BACKEND}/projects?status=PUBLISHED&limit=500`);
    if (res.ok) {
      const data = await res.json();
      const projects = data?.data ?? data ?? [];
      for (const p of projects) {
        const username = p.user?.username;
        if (username && !seenUsers.has(username)) {
          seenUsers.add(username);
          entries.push(urlEntry(
            `${SITE}/perfil/${username}`,
            p.updatedAt || p.createdAt,
            'weekly',
            '0.9',
          ));
        }
      }
    }
  } catch { /* skip on error */ }

  // Also check articles for additional usernames
  try {
    const res = await fetch(`${BACKEND}/articles?status=PUBLISHED&limit=500`);
    if (res.ok) {
      const data = await res.json();
      const articles = data?.data ?? data ?? [];
      for (const a of articles) {
        const username = a.user?.username;
        if (username && !seenUsers.has(username)) {
          seenUsers.add(username);
          entries.push(urlEntry(
            `${SITE}/perfil/${username}`,
            a.updatedAt || a.createdAt,
            'weekly',
            '0.9',
          ));
        }
      }
    }
  } catch { /* skip on error */ }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // cache 1h
    },
  });
};
