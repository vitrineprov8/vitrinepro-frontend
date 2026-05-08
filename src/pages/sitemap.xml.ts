export const prerender = false;

import type { APIRoute } from 'astro';

const SITE = 'https://v8pro.com.br';
const BACKEND = import.meta.env.PUBLIC_BACKEND_URL || 'http://localhost:3000';
const PAGE_LIMIT = 20; // backend max is 20

// Static pages
const staticPages = [
  { url: '/',            priority: '1.0', changefreq: 'weekly' },
  { url: '/vagas',       priority: '0.8', changefreq: 'daily' },
  { url: '/privacidade', priority: '0.3', changefreq: 'yearly' },
  { url: '/termos',      priority: '0.3', changefreq: 'yearly' },
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

/** Fetch all pages of a paginated endpoint. Returns the accumulated items array. */
async function fetchAllPages(endpoint: string): Promise<any[]> {
  const items: any[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    try {
      const res = await fetch(`${BACKEND}${endpoint}&page=${page}&limit=${PAGE_LIMIT}`);
      if (!res.ok) break;
      const body = await res.json();
      // Response shape: { data: [...], total, page, lastPage }
      const pageItems: any[] = body?.data ?? [];
      items.push(...pageItems);
      lastPage = body?.lastPage ?? 1;
      page++;
    } catch {
      break;
    }
  } while (page <= lastPage);

  return items;
}

export const GET: APIRoute = async () => {
  const entries: string[] = [];

  // Static pages
  for (const p of staticPages) {
    entries.push(urlEntry(`${SITE}${p.url}`, undefined, p.changefreq, p.priority));
  }

  // Fetch all published portfolio items (paginated)
  const portfolioItems = await fetchAllPages('/portfolio?status=PUBLISHED');
  for (const item of portfolioItems) {
    if (item.slug) {
      entries.push(urlEntry(
        `${SITE}/portfolio/${item.slug}`,
        item.updatedAt || item.createdAt,
        'monthly',
        '0.8',
      ));
    }
  }

  // Collect unique profile usernames from portfolio items
  const seenUsers = new Set<string>();
  const profileDates = new Map<string, string>();

  for (const item of portfolioItems) {
    const username = item.author?.username ?? item.user?.username;
    if (username) {
      const candidate = item.updatedAt || item.createdAt;
      if (!seenUsers.has(username)) {
        seenUsers.add(username);
        profileDates.set(username, candidate);
      } else {
        const existing = profileDates.get(username) ?? '';
        if (candidate > existing) profileDates.set(username, candidate);
      }
    }
  }

  for (const [username, lastmod] of profileDates) {
    entries.push(urlEntry(
      `${SITE}/perfil/${username}`,
      lastmod,
      'weekly',
      '0.9',
    ));
  }

  // Fetch all published vagas
  const vagaItems = await fetchAllPages('/vagas?');
  for (const v of vagaItems) {
    if (v.slug) {
      entries.push(urlEntry(
        `${SITE}/vaga/${v.slug}`,
        v.updatedAt || v.createdAt,
        'daily',
        '0.7',
      ));
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
