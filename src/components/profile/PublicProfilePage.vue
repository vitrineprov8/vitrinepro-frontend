<template>
  <div>
    <!-- ── BANNER ─────────────────────────────────────────────────────── -->
    <div class="behance-banner">
      <img v-if="profile.bannerUrl" :src="profile.bannerUrl" alt="Banner" class="behance-banner-img" />
      <div v-else class="behance-banner-gradient" />
      <div class="behance-banner-overlay" />
    </div>

    <!-- ── PROFILE HEADER ─────────────────────────────────────────────── -->
    <div class="behance-profile-header">
      <!-- Avatar -->
      <div class="behance-avatar">
        <img v-if="profile.avatarUrl" :src="profile.avatarUrl" :alt="fullName" />
        <span v-else>{{ initials }}</span>
      </div>

      <!-- Info -->
      <div class="behance-profile-info">
        <h1 class="behance-name">{{ fullName }}</h1>
        <p v-if="profile.profession" class="behance-profession">{{ profile.profession }}</p>
        <span v-if="profile.location" class="behance-location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
          </svg>
          {{ profile.location }}
        </span>
        <!-- Social icons row -->
        <div v-if="activeSocials.length" class="behance-socials">
          <a
            v-for="net in activeSocials"
            :key="net.key"
            :href="net.url"
            target="_blank"
            rel="noopener"
            :title="net.label"
            class="behance-social-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" v-html="net.icon" />
          </a>
        </div>
      </div>

      <!-- Actions -->
      <div v-if="profile.website" class="behance-profile-actions">
        <a :href="profile.website" target="_blank" rel="noopener" class="btn btn-primary">
          Entrar em Contato
        </a>
      </div>
    </div>

    <!-- ── CONTENT TABS ────────────────────────────────────────────────── -->
    <div class="behance-content">
      <nav class="behance-tabs-nav">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="behance-tab-btn"
          :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span v-if="tab.count != null" class="behance-tab-count">{{ tab.count }}</span>
        </button>
      </nav>

      <!-- Grid view: Todos / Artigos / Projetos -->
      <div v-if="activeTab !== 'about'">
        <div v-if="visibleItems.length === 0" class="empty-state" style="padding:var(--spacing-4xl) 0">
          <p class="empty-state-title">Nenhum conteúdo publicado ainda</p>
        </div>
        <div v-else class="behance-grid">
          <a
            v-for="item in visibleItems"
            :key="item.id"
            :href="item.href"
            class="behance-card"
          >
            <div class="behance-card-image">
              <img v-if="item.coverImageUrl" :src="item.coverImageUrl" :alt="item.title" />
              <div v-else class="behance-card-placeholder">
                <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5A.75.75 0 0121 3.75v14.25a.75.75 0 01-.75.75H3.75A.75.75 0 013 18V3.75A.75.75 0 013.75 3z"/>
                </svg>
              </div>
              <div class="behance-card-overlay">
                <span class="behance-category-badge">{{ item.type }}</span>
              </div>
            </div>
            <div class="behance-card-body">
              <div v-if="item.tags?.length" class="behance-card-tags">
                <span v-for="tag in item.tags.slice(0,3)" :key="tag.id" class="behance-tag">{{ tag.name }}</span>
              </div>
              <p class="behance-card-title">{{ item.title }}</p>
              <p v-if="item.subtitle" class="behance-card-subtitle">{{ item.subtitle }}</p>
              <div class="behance-card-meta">
                <span v-if="item.meta1">{{ item.meta1 }}</span>
                <span v-if="item.meta1 && item.meta2" style="color:var(--border)">•</span>
                <span v-if="item.meta2">{{ item.meta2 }}</span>
              </div>
            </div>
          </a>
        </div>
      </div>

      <!-- About tab -->
      <div v-if="activeTab === 'about'" class="about-section">
        <!-- Bio -->
        <div v-if="profile.bio" class="about-card">
          <p class="about-card-title">Sobre</p>
          <p class="about-bio-text">{{ profile.bio }}</p>
        </div>

        <!-- Contact -->
        <div class="about-card">
          <p class="about-card-title">Contato</p>
          <a v-if="profile.location" href="#" class="about-contact-item" style="cursor:default;pointer-events:none">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
            </svg>
            {{ profile.location }}
          </a>
          <a v-if="profile.website" :href="profile.website" target="_blank" rel="noopener" class="about-contact-item">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253"/>
            </svg>
            {{ displayWebsite }}
          </a>
        </div>

        <!-- Social links -->
        <div v-if="activeSocials.length" class="about-card">
          <p class="about-card-title">Redes Sociais</p>
          <div class="about-social-grid">
            <a
              v-for="net in activeSocials"
              :key="net.key"
              :href="net.url"
              target="_blank"
              rel="noopener"
              class="about-social-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" v-html="net.icon" />
              {{ net.label }}
            </a>
          </div>
        </div>

        <!-- CV list -->
        <div v-if="cvList.length" class="about-card">
          <p class="about-card-title">Currículos</p>
          <a
            v-for="cv in cvList"
            :key="cv.id"
            :href="cv.fileUrl"
            target="_blank"
            rel="noopener"
            class="about-cv-item"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="color:var(--primary);flex-shrink:0">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/>
            </svg>
            <span class="about-cv-label">{{ cv.label }}</span>
            <span class="about-cv-download">Baixar PDF</span>
          </a>
        </div>

        <!-- Education -->
        <div v-if="education.length" class="about-card">
          <p class="about-card-title">Formação</p>
          <div v-for="edu in education" :key="edu.id" class="about-edu-item">
            <span class="about-edu-type-badge" :class="`about-edu-type-${edu.type}`">
              {{ eduTypeLabel(edu.type) }}
            </span>
            <div>
              <p class="about-edu-title">{{ edu.title }}</p>
              <p class="about-edu-institution">{{ edu.institution }}<span v-if="edu.fieldOfStudy"> · {{ edu.fieldOfStudy }}</span></p>
              <p class="about-edu-dates">{{ formatEduDate(edu.startDate, edu.endDate) }}</p>
              <p v-if="edu.description" style="font-size:var(--text-xs);color:var(--text-secondary);margin:4px 0 0">{{ edu.description }}</p>
              <a v-if="edu.certificateUrl" :href="edu.certificateUrl" target="_blank" rel="noopener"
                 style="font-size:var(--text-xs);color:var(--primary);text-decoration:none;display:inline-block;margin-top:4px">
                Ver certificado →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Tag { id: string; name: string; }
interface SocialLinks {
  linkedin?: string; github?: string; twitter?: string; instagram?: string;
  facebook?: string; youtube?: string; tiktok?: string;
}
interface FullProfile {
  id: string; firstName: string; lastName: string; username?: string;
  profession?: string; bio?: string; phone?: string; website?: string;
  location?: string; avatarUrl?: string; bannerUrl?: string;
  socialLinks?: SocialLinks; createdAt?: string;
}
interface Article {
  id: string; slug: string; title: string; subtitle?: string;
  coverImageUrl?: string; readTime?: number; publishedAt?: string;
  createdAt?: string; tags: Tag[];
}
interface Project {
  id: string; slug: string; title: string; subtitle?: string;
  coverImageUrl?: string; year?: number; projectStatus?: string;
  clientName?: string; tags: Tag[];
}
interface CV { id: string; label: string; fileUrl: string; createdAt?: string; }
interface Education {
  id: string; type: string; institution: string; title: string;
  fieldOfStudy?: string; startDate: string; endDate?: string;
  description?: string; certificateUrl?: string; order?: number;
}

const props = defineProps<{
  profile: FullProfile;
  articles: Article[];
  projects: Project[];
  cvList: CV[];
  education: Education[];
}>();

const activeTab = ref<'all' | 'articles' | 'projects' | 'about'>('all');

const tabs = computed(() => [
  { label: 'Todos', value: 'all', count: null },
  { label: 'Artigos', value: 'articles', count: props.articles.length || null },
  { label: 'Projetos', value: 'projects', count: props.projects.length || null },
  { label: 'Sobre', value: 'about', count: null },
]);

// Merged grid items
interface GridItem {
  id: string; href: string; type: string; title: string; subtitle?: string;
  coverImageUrl?: string; tags: Tag[]; meta1?: string; meta2?: string;
}

const allItems = computed((): GridItem[] => {
  const arts: GridItem[] = props.articles.map(a => ({
    id: `a-${a.id}`, href: `/artigo/${a.slug}`, type: 'Artigo',
    title: a.title, subtitle: a.subtitle, coverImageUrl: a.coverImageUrl, tags: a.tags,
    meta1: formatDate(a.publishedAt || a.createdAt),
    meta2: a.readTime ? `${a.readTime} min` : undefined,
  }));
  const projs: GridItem[] = props.projects.map(p => ({
    id: `p-${p.id}`, href: `/projeto/${p.slug}`, type: 'Projeto',
    title: p.title, subtitle: p.subtitle, coverImageUrl: p.coverImageUrl, tags: p.tags,
    meta1: p.year ? String(p.year) : undefined,
    meta2: p.projectStatus ? statusLabel(p.projectStatus) : undefined,
  }));
  return [...arts, ...projs];
});

const visibleItems = computed((): GridItem[] => {
  if (activeTab.value === 'all') return allItems.value;
  if (activeTab.value === 'articles')
    return allItems.value.filter(i => i.type === 'Artigo');
  if (activeTab.value === 'projects')
    return allItems.value.filter(i => i.type === 'Projeto');
  return [];
});

const fullName = computed(() =>
  `${props.profile.firstName ?? ''} ${props.profile.lastName ?? ''}`.trim()
);

const initials = computed(() =>
  `${props.profile.firstName?.[0] ?? ''}${props.profile.lastName?.[0] ?? ''}`.toUpperCase()
);

const displayWebsite = computed(() =>
  props.profile.website?.replace(/^https?:\/\//, '').replace(/\/$/, '') ?? ''
);

const socialIconMap: Record<string, string> = {
  linkedin:  '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  github:    '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>',
  twitter:   '<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>',
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>',
  facebook:  '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  youtube:   '<path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>',
  tiktok:    '<path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>',
};

const socialPrefixes: Record<string, string> = {
  linkedin: 'https://linkedin.com/in/', github: 'https://github.com/',
  twitter: 'https://x.com/', instagram: 'https://instagram.com/',
  facebook: 'https://facebook.com/', youtube: 'https://youtube.com/@', tiktok: 'https://tiktok.com/@',
};

const activeSocials = computed(() => {
  const links = props.profile.socialLinks;
  if (!links) return [];
  return Object.entries(links)
    .filter(([, val]) => !!val)
    .map(([key, val]) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      url: (val as string).startsWith('http') ? (val as string) : `${socialPrefixes[key] ?? ''}${val}`,
      icon: socialIconMap[key] ?? '',
    }));
});

function formatDate(d?: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatEduDate(start: string, end?: string) {
  const fmt = (d: string) => {
    const [year, month] = d.split('-');
    return `${month}/${year}`;
  };
  return end ? `${fmt(start)} – ${fmt(end)}` : `${fmt(start)} – Atual`;
}

function statusLabel(s: string) {
  const m: Record<string, string> = {
    ONGOING: 'Em andamento', COMPLETED: 'Concluído',
    PAUSED: 'Pausado', CANCELLED: 'Cancelado',
  };
  return m[s] ?? s;
}

function eduTypeLabel(type: string) {
  const m: Record<string, string> = {
    UNIVERSITY: 'Universidade', COURSE: 'Curso',
    DIPLOMA: 'Diploma', CERTIFICATION: 'Certificação',
  };
  return m[type] ?? type;
}
</script>
