export const prerender = false;

import type { APIRoute } from 'astro';

const SITE = 'https://v8pro.com.br';
const BACKEND = import.meta.env.PUBLIC_BACKEND_URL || 'http://localhost:3000';
const PAGE_LIMIT = 100; // /profile/public-list supports up to 100/page

// Static pages
const staticPages = [
  { url: '/',            priority: '1.0', changefreq: 'weekly' },
  { url: '/vitrine',     priority: '0.9', changefreq: 'daily' },
  { url: '/explorar',    priority: '0.8', changefreq: 'daily' },
  { url: '/vagas',       priority: '0.8', changefreq: 'daily' },
  { url: '/faq',         priority: '0.6', changefreq: 'monthly' },
  { url: '/contato',     priority: '0.5', changefreq: 'yearly' },
  { url: '/ajuda',       priority: '0.5', changefreq: 'monthly' },
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

  // Detect whether the endpoint already has query params to decide separator.
  const sep = endpoint.includes('?') ? '&' : '?';

  do {
    try {
      const res = await fetch(`${BACKEND}${endpoint}${sep}page=${page}&limit=${PAGE_LIMIT}`);
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

  // ── Public profiles ────────────────────────────────────────────────────────
  // Primary source: /profile/public-list — returns all visible individual
  // profiles that have bio or published portfolio, regardless of whether we
  // fetched their portfolio items above.  This covers profiles with only a bio
  // and no portfolio items (previously invisible to the sitemap).
  //
  // Fallback: if the endpoint fails (deploy lag, network error), we derive
  // profiles from portfolio authors as before so the sitemap never degrades
  // to zero profiles.
  let profilesFetched = false;
  try {
    const profileItems = await fetchAllPages('/profile/public-list');
    if (profileItems.length > 0) {
      profilesFetched = true;
      for (const p of profileItems) {
        if (p.username) {
          entries.push(urlEntry(
            `${SITE}/perfil/${p.username}`,
            p.updatedAt,
            'weekly',
            '0.9',
          ));
        }
      }
    }
  } catch {
    // Intentionally empty — fall through to portfolio-derived fallback below.
  }

  if (!profilesFetched) {
    // Fallback: derive unique profiles from portfolio authors.
    const seenUsers = new Set<string>();
    const profileDates = new Map<string, string>();

    for (const item of portfolioItems) {
      const author = item.author ?? item.user;
      const username = author?.username;
      if (!username) continue;
      if (author.isVisible === false) continue;
      const candidate = item.updatedAt || item.createdAt;
      if (!seenUsers.has(username)) {
        seenUsers.add(username);
        profileDates.set(username, candidate);
      } else {
        const existing = profileDates.get(username) ?? '';
        if (candidate > existing) profileDates.set(username, candidate);
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
  }

  // Fetch all published vagas (filter out drafts/expired)
  const now = new Date();
  const vagaItems = await fetchAllPages('/vagas?status=PUBLISHED');
  for (const v of vagaItems) {
    if (!v.slug) continue;
    if (v.deadline && new Date(v.deadline) < now) continue;
    entries.push(urlEntry(
      `${SITE}/vaga/${v.slug}`,
      v.updatedAt || v.createdAt,
      'daily',
      '0.7',
    ));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800',
    },
  });
};
