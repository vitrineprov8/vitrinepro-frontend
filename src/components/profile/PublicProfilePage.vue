<template>
  <div>
    <!-- ── BANNER ─────────────────────────────────────────────────────── -->
    <div class="behance-banner" :style="bannerStyle"></div>

    <!-- ── PROFILE HEADER ─────────────────────────────────────────────── -->
    <div class="behance-profile-header">
      <!-- Avatar + mobile socials row -->
      <div class="behance-avatar-col">
        <div class="behance-avatar">
          <img v-if="profile.avatarUrl" :src="profile.avatarUrl" :alt="fullName" />
          <span v-else>{{ initials }}</span>
        </div>
        <!-- Social icons mobile: next to avatar (opposite side) -->
        <div v-if="activeSocials.length" class="behance-banner-socials-mobile">
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

      <!-- Info -->
      <div class="behance-profile-info">
        <!-- Name row: name + social icons + share on same line (desktop) -->
        <div class="behance-name-row">
          <h1 class="behance-name">{{ fullName }}</h1>
          <div v-if="activeSocials.length" class="behance-socials-inline">
            <a
              v-for="net in activeSocials"
              :key="net.key"
              :href="net.url"
              target="_blank"
              rel="noopener"
              :title="net.label"
              class="behance-social-btn-inline"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" v-html="net.icon" />
            </a>
          </div>
          <ShareButton :url="profileUrl" :title="`Perfil de ${fullName} no VitrinePro`" />
        </div>
        <p v-if="profile.profession" class="behance-profession">{{ profile.profession }}</p>
        <span v-if="profile.location" class="behance-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
          </svg>
          {{ profile.location }}
        </span>
        <!-- Actions -->
        <div v-if="profile.website" class="behance-profile-actions">
          <a :href="profile.website" target="_blank" rel="noopener" class="btn btn-primary btn-sm">
            Entrar em Contato
          </a>
        </div>
      </div>
    </div>

    <!-- ── CONTENT TABS ────────────────────────────────────────────────── -->
    <div class="behance-content">
      <nav class="behance-tabs-nav">
        <button
          class="behance-tab-btn"
          :class="{ active: activeTab === 'portfolio' && selectedTagId === null }"
          @click="activeTab = 'portfolio'; selectedTagId = null"
        >
          Todos
          <span class="behance-tab-count">{{ portfolioItems.length }}</span>
        </button>
        <button
          v-for="tag in uniqueTags"
          :key="tag.id"
          class="behance-tab-btn"
          :class="{ active: activeTab === 'portfolio' && selectedTagId === tag.id }"
          @click="activeTab = 'portfolio'; selectedTagId = tag.id"
        >
          {{ tag.name }}
        </button>
        <button
          class="behance-tab-btn"
          :class="{ active: activeTab === 'about' }"
          @click="activeTab = 'about'"
        >
          Sobre
        </button>
      </nav>

      <!-- Grid view: portfolio items -->
      <div v-if="activeTab !== 'about'">
        <div v-if="visibleItems.length === 0 && portfolioItems.length === 0" class="empty-state" style="padding:var(--spacing-4xl) 0">
          <p class="empty-state-title">Nenhum conteúdo publicado ainda</p>
        </div>
        <div v-else-if="visibleItems.length === 0" class="empty-state" style="padding:var(--spacing-4xl) 0">
          <p class="empty-state-title">Nenhum item com essa tag</p>
        </div>
        <div v-else class="behance-grid">
          <a
            v-for="item in visibleItems"
            :key="item.id"
            :href="`/portafolio/${item.slug}`"
            class="behance-card"
          >
            <div class="behance-card-image">
              <img v-if="item.coverImageUrl" :src="item.coverImageUrl" :alt="item.title" />
              <div v-else class="behance-card-placeholder">
                <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5A.75.75 0 0121 3.75v14.25a.75.75 0 01-.75.75H3.75A.75.75 0 013 18V3.75A.75.75 0 013.75 3z"/>
                </svg>
              </div>
              <div v-if="item.tags?.length" class="behance-card-overlay">
                <span class="behance-category-badge">{{ item.tags[0].name }}</span>
              </div>
            </div>
            <div class="behance-card-body">
              <div v-if="item.tags?.length" class="behance-card-tags">
                <span v-for="tag in item.tags.slice(0,3)" :key="tag.id" class="behance-tag">{{ tag.name }}</span>
              </div>
              <p class="behance-card-title">{{ item.title }}</p>
              <p v-if="item.subtitle" class="behance-card-subtitle">{{ item.subtitle }}</p>
              <p v-if="item.description" class="behance-card-description">{{ item.description }}</p>
              <div class="behance-card-meta">
                <span v-if="item.year">{{ item.year }}</span>
                <span v-if="item.year && item.projectStatus" style="color:var(--border)">•</span>
                <span v-if="item.projectStatus">{{ statusLabel(item.projectStatus) }}</span>
              </div>
            </div>
          </a>
        </div>
      </div>

      <!-- About tab -->
      <div v-if="activeTab === 'about'" class="about-section-v2">
        <!-- Two-column grid layout -->
        <div class="about-main-col">
          <!-- Bio -->
          <div v-if="profile.bio" class="about-card-v2">
            <div class="about-card-header">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/></svg>
              <h3 class="about-card-heading">Sobre</h3>
            </div>
            <p class="about-bio-text">{{ profile.bio }}</p>
          </div>

          <!-- Education -->
          <div v-if="education.length" class="about-card-v2">
            <div class="about-card-header">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"/></svg>
              <h3 class="about-card-heading">Formação</h3>
            </div>
            <div class="about-edu-list">
              <div v-for="edu in education" :key="edu.id" class="about-edu-item-v2">
                <div class="about-edu-dot"></div>
                <div class="about-edu-body">
                  <div class="about-edu-top">
                    <p class="about-edu-title">{{ edu.title }}</p>
                    <span class="about-edu-type-badge" :class="`about-edu-type-${edu.type}`">{{ eduTypeLabel(edu.type) }}</span>
                  </div>
                  <p class="about-edu-institution">{{ edu.institution }}<span v-if="edu.fieldOfStudy"> · {{ edu.fieldOfStudy }}</span></p>
                  <p class="about-edu-dates">{{ formatEduDate(edu.startDate, edu.endDate) }}</p>
                  <p v-if="edu.description" class="about-edu-desc">{{ edu.description }}</p>
                  <a v-if="edu.certificateUrl" :href="edu.certificateUrl" target="_blank" rel="noopener" class="about-edu-cert-link">
                    <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/></svg>
                    Ver certificado
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right column: contact, social, CV -->
        <div class="about-side-col">
          <!-- Contact & Location -->
          <div v-if="profile.location || profile.website || profile.phone" class="about-card-v2">
            <div class="about-card-header">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/></svg>
              <h3 class="about-card-heading">Contato</h3>
            </div>
            <div class="about-contact-list">
              <span v-if="profile.location" class="about-contact-row">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
                {{ profile.location }}
              </span>
              <a v-if="profile.website" :href="profile.website" target="_blank" rel="noopener" class="about-contact-row about-contact-link">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3"/></svg>
                {{ displayWebsite }}
              </a>
              <a v-if="profile.phone" :href="`tel:${profile.phone}`" class="about-contact-row about-contact-link">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/></svg>
                {{ profile.phone }}
              </a>
            </div>
          </div>

          <!-- Social networks -->
          <div v-if="activeSocials.length" class="about-card-v2">
            <div class="about-card-header">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"/></svg>
              <h3 class="about-card-heading">Redes Sociais</h3>
            </div>
            <div class="about-social-list">
              <a
                v-for="net in activeSocials"
                :key="net.key"
                :href="net.url"
                target="_blank"
                rel="noopener"
                class="about-social-row"
                :class="`social-${net.key}`"
              >
                <span class="about-social-icon-wrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" v-html="net.icon" />
                </span>
                <span class="about-social-name">{{ net.label }}</span>
                <svg class="about-social-arrow" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
              </a>
            </div>
          </div>

          <!-- CV downloads -->
          <div v-if="cvList.length" class="about-card-v2">
            <div class="about-card-header">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>
              <h3 class="about-card-heading">Currículos</h3>
            </div>
            <div class="about-cv-list">
              <a
                v-for="cv in cvList"
                :key="cv.id"
                :href="cv.fileUrl"
                target="_blank"
                rel="noopener"
                class="about-cv-card"
                download
              >
                <div class="about-cv-icon">
                  <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>
                </div>
                <div class="about-cv-info">
                  <span class="about-cv-name">{{ cv.label }}</span>
                  <span class="about-cv-type">PDF</span>
                </div>
                <div class="about-cv-btn">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
                  Baixar
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import ShareButton from '../ui/ShareButton.vue';

interface Tag { id: string; name: string; slug?: string; }
interface SocialLinks {
  linkedin?: string; github?: string; twitter?: string; instagram?: string;
  facebook?: string; youtube?: string; tiktok?: string;
}
interface FullProfile {
  id: string; firstName: string; lastName: string; username?: string;
  profession?: string; bio?: string; phone?: string; website?: string;
  location?: string; avatarUrl?: string; bannerUrl?: string; bannerColor?: string; email?: string;
  socialLinks?: SocialLinks; createdAt?: string;
}
interface PortfolioItem {
  id: string; slug: string; title: string; subtitle?: string; description?: string;
  coverImageUrl?: string; year?: string; projectStatus?: string;
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
  portfolioItems: PortfolioItem[];
  cvList: CV[];
  education: Education[];
}>();

const activeTab = ref<'portfolio' | 'about'>(
  props.portfolioItems.length === 0 ? 'about' : 'portfolio'
);
const selectedTagId = ref<string | null>(null);

const profileUrl = ref('');
onMounted(() => { profileUrl.value = window.location.href; });

// Banner background: use bannerColor if set, else logo gradient
const bannerStyle = computed(() => {
  if (props.profile.bannerColor) {
    return { background: props.profile.bannerColor };
  }
  return {}; // CSS class handles default gradient
});

// Collect unique tags from all portfolio items
const uniqueTags = computed((): Tag[] => {
  const seen = new Map<string, Tag>();
  for (const item of props.portfolioItems) {
    for (const tag of item.tags ?? []) {
      if (!seen.has(tag.id)) seen.set(tag.id, tag);
    }
  }
  return [...seen.values()];
});

const visibleItems = computed((): PortfolioItem[] => {
  if (selectedTagId.value === null) return props.portfolioItems;
  return props.portfolioItems.filter(item =>
    item.tags?.some(t => t.id === selectedTagId.value)
  );
});

const fullName = computed(() =>
  `${props.profile.firstName ?? ''} ${props.profile.lastName ?? ''}`.trim()
);

function formatDate(d?: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

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
