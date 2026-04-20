<template>
  <div class="pp-root">
    <!-- ── BANNER ─────────────────────────────────────────────────────────── -->
    <div class="behance-banner" :style="bannerStyle">
      <!-- WhatsApp CTA (desktop) — top-right del banner -->
      <a
        v-if="whatsappTarget.channel === 'whatsapp'"
        :href="whatsappTarget.href"
        :target="whatsappTarget.target"
        :rel="whatsappTarget.rel"
        class="pp-whatsapp-banner-btn"
        aria-label="Conversar no WhatsApp"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
        <span>Conversar no WhatsApp</span>
      </a>
    </div>

    <!-- ── PROFILE HEADER ─────────────────────────────────────────────────── -->
    <div class="behance-profile-header">
      <!-- Avatar col: avatar + sociais mobile -->
      <div class="behance-avatar-col">
        <div class="behance-avatar">
          <img v-if="profile.avatarUrl" :src="profile.avatarUrl" :alt="fullName" width="110" height="110" />
          <span v-else>{{ initials }}</span>
        </div>
        <!-- Sociais visíveis só no mobile (ao lado do avatar) -->
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
          <ShareButton :url="profileUrl" :title="`Perfil de ${fullName} no VitrinePro`" class="behance-social-btn behance-social-btn-share" />
        </div>
      </div>

      <!-- Info: nome + sociais desktop, profissão, localização, ações -->
      <div class="behance-profile-info">
        <div class="behance-name-row">
          <h1 class="behance-name">{{ fullName }}</h1>
          <!-- Sociais visíveis só no desktop (inline com o nome) -->
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" v-html="net.icon" />
            </a>
            <ShareButton :url="profileUrl" :title="`Perfil de ${fullName} no VitrinePro`" class="behance-social-btn-inline" />
          </div>
        </div>
        <p v-if="profile.profession" class="behance-profession">{{ profile.profession }}</p>
        <span v-if="profile.location" class="behance-location">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
          </svg>
          {{ profile.location }}
        </span>
      </div>
    </div>

    <!-- ── STATS STRIP ─────────────────────────────────────────────────────── -->
    <div
      v-if="serviceItems.length > 0 || portfolioOnlyItems.length > 0"
      class="pp-stats-strip"
    >
      <span class="pp-stats-text">
        <template v-if="serviceItems.length > 0">{{ serviceItems.length }} {{ serviceItems.length === 1 ? 'Serviço' : 'Serviços' }}</template>
        <template v-if="serviceItems.length > 0 && portfolioOnlyItems.length > 0"> · </template>
        <template v-if="portfolioOnlyItems.length > 0">{{ portfolioOnlyItems.length }} {{ portfolioOnlyItems.length === 1 ? 'Publicação' : 'Publicações' }}</template>
      </span>
    </div>

    <!-- ── TABS ──────────────────────────────────────────────────────────── -->
    <div class="pp-content">
      <nav
        ref="tabsNavRef"
        class="pp-tabs-nav"
        :class="{ 'is-dragging': isDragging }"
        @mousedown="onDragStart"
      >
        <button
          v-if="serviceItems.length > 0"
          class="pp-tab-btn"
          :class="{ active: activeTab === 'services' }"
          @click="activeTab = 'services'"
        >
          Serviços
          <span class="pp-tab-count">{{ serviceItems.length }}</span>
        </button>
        <button
          v-if="portfolioOnlyItems.length > 0"
          class="pp-tab-btn"
          :class="{ active: activeTab === 'portfolio' }"
          @click="activeTab = 'portfolio'; selectedTagId = null"
        >
          {{ serviceItems.length > 0 ? 'Portfólio' : 'Publicações' }}
          <span class="pp-tab-count">{{ portfolioOnlyItems.length }}</span>
        </button>
        <!-- Tag filters shown only in portfolio tab -->
        <template v-if="activeTab === 'portfolio'">
          <button
            v-for="tag in uniqueTags"
            :key="tag.id"
            class="pp-tab-btn pp-tab-tag"
            :class="{ active: selectedTagId === tag.id }"
            @click="selectedTagId = tag.id"
          >
            {{ tag.name }}
          </button>
        </template>
        <button
          class="pp-tab-btn"
          :class="{ active: activeTab === 'about' }"
          @click="activeTab = 'about'"
        >
          Sobre
        </button>
      </nav>

      <!-- ── TAB: SERVICOS ─────────────────────────────────────────────── -->
      <div v-if="activeTab === 'services'">
        <div class="pp-services-grid">
          <!-- Mini about card (first cell) -->
          <div class="pp-mini-about-card">
            <div class="pp-mini-about-top">
              <div class="pp-mini-avatar">
                <img v-if="profile.avatarUrl" :src="profile.avatarUrl" :alt="fullName" width="48" height="48" />
                <span v-else>{{ initials }}</span>
              </div>
              <div class="pp-mini-info">
                <p class="pp-mini-name">{{ fullName }}</p>
                <p v-if="profile.profession" class="pp-mini-profession">{{ profile.profession }}</p>
                <span v-if="profile.location" class="pp-mini-location">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
                  </svg>
                  {{ profile.location }}
                </span>
              </div>
            </div>
            <a
              :href="miniAboutTarget.href"
              :target="miniAboutTarget.target"
              :rel="miniAboutTarget.rel"
              class="pp-cta-btn"
              :style="ctaStyle"
            >
              SABER MAIS
            </a>
          </div>

          <!-- Service cards -->
          <div
            v-for="item in serviceItems"
            :key="item.id"
            class="pp-service-card"
            :class="{ 'pp-service-card--featured': item.id === featuredServiceId }"
          >
            <!-- Top badge -->
            <div class="pp-service-badge-wrap">
              <span class="pp-service-badge">Serviços</span>
              <span v-if="item.id === featuredServiceId" class="pp-service-hot-badge">🔥 MAIS CONTRATADO</span>
            </div>
            <!-- Cover image (link to detail) -->
            <a :href="`/portfolio/${item.slug}`" class="pp-service-img">
              <img v-if="item.coverImageUrl" :src="item.coverImageUrl" :alt="item.title" loading="lazy" />
              <div v-else class="pp-service-img-placeholder">
                <svg width="36" height="36" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5A.75.75 0 0121 3.75v14.25a.75.75 0 01-.75.75H3.75A.75.75 0 013 18V3.75A.75.75 0 013.75 3z"/>
                </svg>
              </div>
            </a>
            <!-- Card body -->
            <div class="pp-service-body">
              <a :href="`/portfolio/${item.slug}`" class="pp-service-link">
                <p class="pp-service-title">{{ item.title }}</p>
                <p v-if="item.subtitle || item.description" class="pp-service-desc">
                  {{ item.subtitle || item.description }}
                </p>
              </a>
              <p v-if="item.servicePrice" class="pp-service-price" :class="{ 'pp-service-price--featured': item.id === featuredServiceId }">
                {{ formatPrice(item.servicePrice) }}
                <span v-if="item.serviceType" class="pp-service-price-unit">/{{ item.serviceType }}</span>
              </p>
              <a
                :href="serviceTarget(item).href"
                :target="serviceTarget(item).target"
                :rel="serviceTarget(item).rel"
                class="pp-cta-btn"
                :style="ctaStyle"
                :class="{ 'pp-cta-btn--featured': item.id === featuredServiceId }"
              >
                {{ labelForAction(item.actionButton) }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- ── TAB: PORTFOLIO ─────────────────────────────────────────────── -->
      <div v-if="activeTab === 'portfolio'">
        <div v-if="visiblePortfolioItems.length === 0 && portfolioOnlyItems.length === 0" class="pp-empty">
          <p>Nenhum conteúdo publicado ainda</p>
        </div>
        <div v-else-if="visiblePortfolioItems.length === 0" class="pp-empty">
          <p>Nenhum item com essa tag</p>
        </div>
        <!-- Cards: behance grid em todos os tamanhos -->
        <div v-else class="behance-grid pp-portfolio-grid">
          <BehanceCard
            v-for="item in visiblePortfolioItems"
            :key="item.id"
            :item="item"
          />
        </div>
      </div>

      <!-- ── TAB: SOBRE ─────────────────────────────────────────────────── -->
      <div v-if="activeTab === 'about'" class="about-section-v2">
        <!-- Left column -->
        <div class="about-main-col">
          <!-- Bio -->
          <div v-if="profile.bio" class="about-card-v2 about-card-v2--bio">
            <div class="about-card-header">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>
              </svg>
              <h3 class="about-card-heading">Sobre</h3>
            </div>
            <p class="about-bio-text">{{ profile.bio }}</p>
          </div>

          <!-- Education -->
          <div v-if="education.length" class="about-card-v2">
            <div class="about-card-header">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"/>
              </svg>
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
                    <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/>
                    </svg>
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
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/>
              </svg>
              <h3 class="about-card-heading">Contato</h3>
            </div>
            <div class="about-contact-list">
              <span v-if="profile.location" class="about-contact-row">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
                </svg>
                {{ profile.location }}
              </span>
              <a v-if="profile.website" :href="profile.website" target="_blank" rel="noopener" class="about-contact-row about-contact-link">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3"/>
                </svg>
                {{ displayWebsite }}
              </a>
              <a v-if="profile.phone" :href="`tel:${profile.phone}`" class="about-contact-row about-contact-link">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/>
                </svg>
                {{ profile.phone }}
              </a>
            </div>
          </div>

          <!-- Social networks -->
          <div v-if="activeSocials.length" class="about-card-v2">
            <div class="about-card-header">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"/>
              </svg>
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
                <svg class="about-social-arrow" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- CV downloads -->
          <div v-if="cvList.length" class="about-card-v2">
            <div class="about-card-header">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/>
              </svg>
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
                  <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/>
                  </svg>
                </div>
                <div class="about-cv-info">
                  <span class="about-cv-name">{{ cv.label }}</span>
                  <span class="about-cv-type">PDF</span>
                </div>
                <div class="about-cv-btn">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/>
                  </svg>
                  Baixar
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── MOBILE WHATSAPP STICKY (barra full-width) ───────────────────────── -->
    <a
      v-if="whatsappTarget.channel === 'whatsapp'"
      :href="whatsappTarget.href"
      :target="whatsappTarget.target"
      :rel="whatsappTarget.rel"
      class="pp-whatsapp-sticky"
      aria-label="Conversar no WhatsApp"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
      </svg>
      Conversar no WhatsApp
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import ShareButton from '../ui/ShareButton.vue';
import BehanceCard from '../ui/BehanceCard.vue';
import { buildContactAction, labelForAction, type ContactTarget } from '../../utils/contactAction';

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
  coverImageUrl?: string; year?: string | number; projectStatus?: string;
  clientName?: string; tags: Tag[];
  isService?: boolean; serviceType?: string | null;
  actionButton?: string | null; servicePrice?: number | null;
  isFeatured?: boolean;
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

// ── Separate services from portfolio items ────────────────────────────────────
const serviceItems = computed((): PortfolioItem[] =>
  props.portfolioItems.filter(item => item.isService || item.serviceType != null)
);

const portfolioOnlyItems = computed((): PortfolioItem[] =>
  props.portfolioItems.filter(item => !item.isService && item.serviceType == null)
);

// ID do serviço em destaque: usa isFeatured do backend; fallback para o primeiro serviço
const featuredServiceId = computed((): string | null => {
  const services = serviceItems.value;
  if (services.length === 0) return null;
  const explicit = services.find(s => s.isFeatured === true);
  return explicit ? explicit.id : services[0].id;
});

// Default tab: services if available, then portfolio, then about
const defaultTab = computed((): 'services' | 'portfolio' | 'about' => {
  if (serviceItems.value.length > 0) return 'services';
  if (portfolioOnlyItems.value.length > 0) return 'portfolio';
  return 'about';
});

const activeTab = ref<'services' | 'portfolio' | 'about'>(defaultTab.value);
const selectedTagId = ref<string | null>(null);

const profileUrl = ref('');
onMounted(() => { profileUrl.value = window.location.href; });

// ── Drag-to-scroll on tabs nav ─────────────────────────────────────────────
const tabsNavRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
let dragStartX = 0;
let dragScrollLeft = 0;
let hasMoved = false;

function onDragStart(e: MouseEvent) {
  const el = tabsNavRef.value;
  if (!el) return;
  hasMoved = false;
  dragStartX = e.pageX - el.offsetLeft;
  dragScrollLeft = el.scrollLeft;
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup', onDragEnd);
}

function onDragMove(e: MouseEvent) {
  const el = tabsNavRef.value;
  if (!el) return;
  const x = e.pageX - el.offsetLeft;
  const walk = x - dragStartX;
  if (!hasMoved && Math.abs(walk) < 5) return;
  hasMoved = true;
  isDragging.value = true;
  el.scrollLeft = dragScrollLeft - walk;
}

function onDragEnd() {
  isDragging.value = false;
  hasMoved = false;
  window.removeEventListener('mousemove', onDragMove);
  window.removeEventListener('mouseup', onDragEnd);
}

onUnmounted(() => {
  window.removeEventListener('mousemove', onDragMove);
  window.removeEventListener('mouseup', onDragEnd);
});

// ── Computed styles ────────────────────────────────────────────────────────
const bannerStyle = computed(() => {
  if (props.profile.bannerColor) return { background: props.profile.bannerColor };
  return {};
});

const accentColor = computed(() => props.profile.bannerColor || 'var(--primary)');

// Profession badge usa accentColor para background
const professionBadgeStyle = computed(() => ({
  background: accentColor.value,
  color: 'white',
}));

// Estilo padrão dos CTAs (usa cor do banner/accent)
const ctaStyle = computed(() => ({
  background: accentColor.value,
}));

// ── Contact targets (util padronizado) ────────────────────────────────────
const whatsappTarget = computed<ContactTarget>(() =>
  buildContactAction('SAIBA_MAIS', props.profile)
);

const miniAboutTarget = computed<ContactTarget>(() =>
  buildContactAction('SAIBA_MAIS', props.profile)
);

function serviceTarget(item: PortfolioItem): ContactTarget {
  return buildContactAction(item.actionButton ?? 'SAIBA_MAIS', props.profile);
}

// ── Tags for portfolio filter ─────────────────────────────────────────────
const uniqueTags = computed((): Tag[] => {
  const seen = new Map<string, Tag>();
  for (const item of portfolioOnlyItems.value) {
    for (const tag of item.tags ?? []) {
      if (!seen.has(tag.id)) seen.set(tag.id, tag);
    }
  }
  return [...seen.values()];
});

const visiblePortfolioItems = computed((): PortfolioItem[] => {
  if (selectedTagId.value === null) return portfolioOnlyItems.value;
  return portfolioOnlyItems.value.filter(item =>
    item.tags?.some(t => t.id === selectedTagId.value)
  );
});

// ── Profile helpers ───────────────────────────────────────────────────────
const fullName = computed(() =>
  `${props.profile.firstName ?? ''} ${props.profile.lastName ?? ''}`.trim()
);

const initials = computed(() =>
  `${props.profile.firstName?.[0] ?? ''}${props.profile.lastName?.[0] ?? ''}`.toUpperCase()
);

const displayWebsite = computed(() =>
  props.profile.website?.replace(/^https?:\/\//, '').replace(/\/$/, '') ?? ''
);

// ── Social icons ──────────────────────────────────────────────────────────
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

// ── Format helpers ────────────────────────────────────────────────────────
function formatEduDate(start: string, end?: string) {
  const fmt = (d: string) => {
    const [year, month] = d.split('-');
    return `${month}/${year}`;
  };
  return end ? `${fmt(start)} – ${fmt(end)}` : `${fmt(start)} – Atual`;
}

function formatPrice(price: number) {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function eduTypeLabel(type: string) {
  const m: Record<string, string> = {
    GRADUATE: 'Graduação',
    POST_GRADUATE: 'Pós-Graduação',
    MASTER: 'Mestrado',
    DOCTORATE: 'Doutorado',
    CERTIFICATION: 'Certificação',
    COURSE: 'Curso',
  };
  return m[type] ?? type;
}
</script>

<style scoped>
/* Drag-to-scroll cursor feedback */
.pp-tabs-nav {
  cursor: grab;
  user-select: none;
}
.pp-tabs-nav.is-dragging {
  cursor: grabbing;
}
.pp-tabs-nav.is-dragging > * {
  pointer-events: none;
}
</style>
