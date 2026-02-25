export const prerender = false;

import type { APIRoute } from 'astro';

const SITE = 'https://v8pro.com.br';
const BACKEND = import.meta.env.PUBLIC_BACKEND_URL || 'http://localhost:3000';
const PAGE_LIMIT = 20; // backend max is 20

// Static pages
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

  // Fetch all published articles (paginated)
  // Note: list endpoint uses `author` field (not `user`) with `username`
  const articles = await fetchAllPages('/articles?status=PUBLISHED');
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

  // Fetch all published projects (paginated)
  const projects = await fetchAllPages('/projects?status=PUBLISHED');
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

  // Collect unique profile usernames from both articles and projects
  // List endpoint returns `author` object with `username` field
  const seenUsers = new Set<string>();
  const profileDates = new Map<string, string>();

  for (const a of articles) {
    const username = a.author?.username;
    if (username && !seenUsers.has(username)) {
      seenUsers.add(username);
      profileDates.set(username, a.updatedAt || a.createdAt);
    }
  }
  for (const p of projects) {
    const username = p.author?.username;
    if (username) {
      if (!seenUsers.has(username)) {
        seenUsers.add(username);
        profileDates.set(username, p.updatedAt || p.createdAt);
      } else {
        // Update date if project is more recent
        const existing = profileDates.get(username) ?? '';
        const candidate = p.updatedAt || p.createdAt;
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
