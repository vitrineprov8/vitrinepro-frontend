<template>
  <section :class="$style.showcase" ref="sectionRef">
    <!-- Background decorations -->
    <div :class="$style.bgBlob1" aria-hidden="true" />
    <div :class="$style.bgBlob2" aria-hidden="true" />

    <div class="container" style="position:relative">
      <div :class="$style.header">
        <h2 :class="$style.title">RESULTADOS DA VITRINE</h2>
      </div>

      <div :class="$style.grid">

        <!-- Profissionais -->
        <div
          :class="[$style.card, $style.cardBlue, visible ? $style.visible : '']"
          style="--delay: 0s"
        >
          <div :class="[$style.glow, $style.glowBlue]" aria-hidden="true" />
          <div :class="[$style.iconWrap, $style.floatA]">
            <svg width="110" height="110" viewBox="0 0 110 110" fill="none" aria-hidden="true">
              <!-- Shadow -->
              <ellipse cx="55" cy="100" rx="28" ry="6" fill="rgba(37,99,235,0.15)"/>
              <!-- Maleta corpo -->
              <rect x="14" y="44" width="72" height="48" rx="10" fill="url(#sc-blueGrad)"/>
              <!-- Maleta alça -->
              <path d="M37 44 V32 Q37 24 45 24 H65 Q73 24 73 32 V44" fill="none" stroke="#93c5fd" stroke-width="5" stroke-linejoin="round"/>
              <!-- Fecho central -->
              <rect x="44" y="60" width="22" height="14" rx="5" fill="white" opacity="0.9"/>
              <rect x="50" y="64" width="10" height="6" rx="3" fill="#2563eb"/>
              <!-- Barras do gráfico -->
              <rect x="20" y="74" width="10" height="14" rx="3" fill="white" opacity="0.4"/>
              <rect x="34" y="66" width="10" height="22" rx="3" fill="white" opacity="0.6"/>
              <rect x="48" y="58" width="10" height="30" rx="3" fill="white" opacity="0.8"/>
              <!-- Seta crescente -->
              <polyline points="22,73 36,65 51,57 67,44" stroke="#fbbf24" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
              <polygon points="67,44 74,50 60,52" fill="#fbbf24"/>
              <defs>
                <linearGradient id="sc-blueGrad" x1="14" y1="44" x2="86" y2="92" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#2563eb"/>
                  <stop offset="100%" stop-color="#1e40af"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div :class="$style.pill">
            <span :class="$style.labelBlue">Profissionais</span>
          </div>
          <p :class="$style.cardDesc">Talentos verificados prontos para sua empresa</p>
        </div>

        <!-- Serviços (destaque) -->
        <div
          :class="[$style.card, $style.cardOrange, $style.cardFeatured, visible ? $style.visible : '']"
          style="--delay: 0.15s"
        >
          <!-- <div :class="[$style.featuredBadge]">⭐ Destaque</div> -->
          <div :class="[$style.glow, $style.glowOrange]" aria-hidden="true" />
          <div :class="[$style.iconWrap, $style.floatB]">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
              <!-- Shadow -->
              <ellipse cx="60" cy="112" rx="32" ry="7" fill="rgba(245,158,11,0.18)"/>
              <!-- Prancheta fundo -->
              <rect x="18" y="18" width="68" height="84" rx="10" fill="#f3f4f6"/>
              <rect x="18" y="18" width="68" height="84" rx="10" stroke="#e5e7eb" stroke-width="1.5"/>
              <!-- Clip de cima -->
              <rect x="42" y="10" width="36" height="18" rx="7" fill="#9ca3af"/>
              <rect x="48" y="13" width="24" height="12" rx="5" fill="#d1d5db"/>
              <!-- Linhas de task -->
              <circle cx="32" cy="40" r="5" fill="#10b981"/>
              <polyline points="29,40 31,43 35,37" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="45" y1="40" x2="78" y2="40" stroke="#d1d5db" stroke-width="2.5" stroke-linecap="round"/>

              <circle cx="32" cy="58" r="5" fill="#10b981"/>
              <polyline points="29,58 31,61 35,55" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="45" y1="58" x2="78" y2="58" stroke="#d1d5db" stroke-width="2.5" stroke-linecap="round"/>

              <circle cx="32" cy="76" r="5" fill="#d1d5db"/>
              <line x1="45" y1="76" x2="78" y2="76" stroke="#d1d5db" stroke-width="2.5" stroke-linecap="round"/>
              <!-- Engrenagem grande -->
              <circle cx="82" cy="82" r="20" fill="url(#sc-amberGrad)"/>
              <circle cx="82" cy="82" r="10" fill="white"/>
              <circle cx="82" cy="82" r="5" fill="url(#sc-amberGrad)"/>
              <!-- Dentes engrenagem -->
              <rect x="80" y="60" width="4" height="7" rx="2" fill="#f59e0b"/>
              <rect x="80" y="95" width="4" height="7" rx="2" fill="#f59e0b"/>
              <rect x="60" y="80" width="7" height="4" rx="2" fill="#f59e0b"/>
              <rect x="95" y="80" width="7" height="4" rx="2" fill="#f59e0b"/>
              <rect x="65" y="65" width="5" height="5" rx="2" fill="#f59e0b" transform="rotate(45 67 67)"/>
              <rect x="94" y="65" width="5" height="5" rx="2" fill="#f59e0b" transform="rotate(45 96 67)"/>
              <rect x="65" y="92" width="5" height="5" rx="2" fill="#f59e0b" transform="rotate(45 67 94)"/>
              <rect x="94" y="92" width="5" height="5" rx="2" fill="#f59e0b" transform="rotate(45 96 94)"/>
              <defs>
                <linearGradient id="sc-amberGrad" x1="62" y1="62" x2="102" y2="102" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#fbbf24"/>
                  <stop offset="100%" stop-color="#d97706"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div :class="[$style.pill, $style.pillOrange]">
            <span :class="$style.labelOrange">Serviços</span>
          </div>
          <p :class="$style.cardDesc">Serviços especializados para cada necessidade</p>
        </div>

        <!-- Publicações -->
        <div
          :class="[$style.card, $style.cardPurple, visible ? $style.visible : '']"
          style="--delay: 0.3s"
        >
          <div :class="[$style.glow, $style.glowPurple]" aria-hidden="true" />
          <div :class="[$style.iconWrap, $style.floatC]">
            <svg width="110" height="110" viewBox="0 0 110 110" fill="none" aria-hidden="true">
              <!-- Shadow -->
              <ellipse cx="52" cy="102" rx="28" ry="6" fill="rgba(124,58,237,0.15)"/>
              <!-- Folha de trás -->
              <rect x="30" y="8" width="52" height="66" rx="8" fill="#ddd6fe" transform="rotate(10 30 8)"/>
              <!-- Folha do meio -->
              <rect x="22" y="14" width="52" height="66" rx="8" fill="#ede9fe" transform="rotate(3 22 14)"/>
              <!-- Folha da frente -->
              <rect x="14" y="18" width="56" height="70" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>
              <!-- Linhas de conteúdo -->
              <line x1="24" y1="34" x2="60" y2="34" stroke="#c4b5fd" stroke-width="3" stroke-linecap="round"/>
              <line x1="24" y1="44" x2="64" y2="44" stroke="#ddd6fe" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="24" y1="53" x2="58" y2="53" stroke="#ddd6fe" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="24" y1="62" x2="52" y2="62" stroke="#ddd6fe" stroke-width="2.5" stroke-linecap="round"/>
              <!-- Avatar autor -->
              <circle cx="30" cy="25" r="7" fill="url(#sc-purpleGrad)"/>
              <circle cx="30" cy="22" r="3" fill="white" opacity="0.7"/>
              <!-- Megafone -->
              <rect x="64" y="56" width="10" height="24" rx="5" fill="url(#sc-purpleGrad)"/>
              <path d="M74 52 L98 40 L98 84 L74 72 Z" fill="url(#sc-purpleGrad)"/>
              <!-- Ondas saindo -->
              <path d="M100 52 Q108 60 100 68" stroke="#a78bfa" stroke-width="3" fill="none" stroke-linecap="round"/>
              <path d="M103 46 Q114 60 103 74" stroke="#a78bfa" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.6"/>
              <!-- Estrela no megafone -->
              <circle cx="84" cy="62" r="8" fill="#fbbf24"/>
              <text x="80" y="66" font-size="9" fill="white" font-weight="bold">★</text>
              <defs>
                <linearGradient id="sc-purpleGrad" x1="0" y1="0" x2="110" y2="110" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#8b5cf6"/>
                  <stop offset="100%" stop-color="#6d28d9"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div :class="[$style.pill, $style.pillPurple]">
            <span :class="$style.labelPurple">Publicações</span>
          </div>
          <p :class="$style.cardDesc">Artigos e projetos de quem domina o assunto</p>
        </div>

      </div>

      <div :class="$style.ctaWrap">
        <div :class="$style.ctaPulse" aria-hidden="true" />
        <a href="/vitrine" :class="$style.ctaBtn">
          <span>VEJA QUEM JÁ ESTÁ NA VITRINE</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const visible = ref(false)
const sectionRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const observer = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) { visible.value = true; observer.disconnect() } },
    { threshold: 0.2 }
  )
  if (sectionRef.value) observer.observe(sectionRef.value)
})
</script>

<style module>
/* ══════════════════════════════════════════════════════════════════
   ShowcaseSection
   ══════════════════════════════════════════════════════════════════ */

.showcase {
  position: relative;
  overflow: hidden;
  padding: var(--spacing-4xl) 0;
  background-color: var(--bg-secondary);
}

/* ── Background blobs ──────────────────────────────────────────── */
.bgBlob1 {
  position: absolute;
  top: -120px;
  left: -120px;
  width: 480px;
  height: 480px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%);
  pointer-events: none;
}

.bgBlob2 {
  position: absolute;
  bottom: -100px;
  right: -100px;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 70%);
  pointer-events: none;
}

/* ── Header ────────────────────────────────────────────────────── */
.header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.title {
  font-size: clamp(1.75rem, 3.5vw, 2.5rem);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  margin: 0;
}

/* ── Grid ──────────────────────────────────────────────────────── */
.grid {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 3rem;
  margin-bottom: 3.5rem;
}

/* ── Card ──────────────────────────────────────────────────────── */
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  position: relative;
  opacity: 0;
  transform: translateY(40px);
  transition:
    opacity 0.6s ease var(--delay, 0s),
    transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) var(--delay, 0s);
  cursor: pointer;
}

.card.visible {
  opacity: 1;
  transform: translateY(0);
}

.cardFeatured {
  transform: translateY(40px);
}

.cardFeatured.visible {
  transform: translateY(-20px);
}

/* Hover lift */
.card:hover .iconWrap {
  transform: scale(1.08) translateY(-6px);
}

/* ── Glow under icon ───────────────────────────────────────────── */
.glow {
  position: absolute;
  top: 40px;
  width: 100px;
  height: 40px;
  border-radius: 50%;
  filter: blur(18px);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.card:hover .glow {
  opacity: 1;
}

.glowBlue   { background: rgba(37,99,235,0.4); }
.glowOrange { background: rgba(245,158,11,0.45); }
.glowPurple { background: rgba(124,58,237,0.4); }

/* ── Icon wrap ─────────────────────────────────────────────────── */
.iconWrap {
  position: relative;
  z-index: 2;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ── Float animations ──────────────────────────────────────────── */
@keyframes floatA {
  0%, 100% { transform: translateY(0px) rotate(-2deg); }
  50%       { transform: translateY(-12px) rotate(1deg); }
}
@keyframes floatB {
  0%, 100% { transform: translateY(-4px) rotate(1deg); }
  50%       { transform: translateY(-18px) rotate(-1deg); }
}
@keyframes floatC {
  0%, 100% { transform: translateY(-2px) rotate(2deg); }
  50%       { transform: translateY(-14px) rotate(-1deg); }
}

.floatA { animation: floatA 4s ease-in-out infinite; }
.floatB { animation: floatB 3.5s ease-in-out infinite; }
.floatC { animation: floatC 4.5s ease-in-out infinite; }

.card:hover .floatA,
.card:hover .floatB,
.card:hover .floatC {
  animation-play-state: paused;
}

/* ── Featured badge ────────────────────────────────────────────── */
.featuredBadge {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 4px 14px;
  border-radius: var(--radius-full);
  box-shadow: 0 4px 12px rgba(245,158,11,0.4);
  white-space: nowrap;
  z-index: 3;
}

/* ── Pill ──────────────────────────────────────────────────────── */
.pill {
  background: white;
  border: 2.5px solid var(--primary);
  border-radius: var(--radius-full);
  padding: 12px 36px;
  margin-top: -14px;
  box-shadow: 0 8px 24px rgba(37,99,235,0.15);
  min-width: 180px;
  text-align: center;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  position: relative;
  z-index: 2;
}

.card:hover .pill {
  transform: translateY(2px);
  box-shadow: 0 12px 32px rgba(37,99,235,0.2);
}

.pillOrange {
  border-color: var(--accent);
  box-shadow: 0 8px 24px rgba(245,158,11,0.2);
}

.card:hover .pillOrange {
  box-shadow: 0 12px 32px rgba(245,158,11,0.3);
}

.pillPurple {
  border-color: #7c3aed;
  box-shadow: 0 8px 24px rgba(124,58,237,0.15);
}

.card:hover .pillPurple {
  box-shadow: 0 12px 32px rgba(124,58,237,0.25);
}

/* ── Pill labels ───────────────────────────────────────────────── */
.labelBlue {
  font-size: var(--text-lg);
  font-weight: 800;
  color: var(--primary);
}

.labelOrange {
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--accent-dark);
}

.labelPurple {
  font-size: var(--text-lg);
  font-weight: 800;
  color: #7c3aed;
}

/* ── Card description ──────────────────────────────────────────── */
.cardDesc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-align: center;
  margin: var(--spacing-sm) 0 0;
  max-width: 160px;
  line-height: var(--leading-relaxed);
}

/* ── CTA ───────────────────────────────────────────────────────── */
.ctaWrap {
  display: flex;
  justify-content: center;
  position: relative;
}

@keyframes pulseRing {
  0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.5; }
  100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
}

.ctaPulse {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  max-width: 340px;
  height: 56px;
  border-radius: var(--radius-full);
  background: rgba(37,99,235,0.25);
  animation: pulseRing 2s ease-out infinite;
  pointer-events: none;
}

.ctaBtn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: white;
  font-size: var(--text-base);
  font-weight: 800;
  letter-spacing: 0.05em;
  padding: 18px 44px;
  border-radius: var(--radius-full);
  text-decoration: none;
  box-shadow: 0 8px 28px rgba(37,99,235,0.4);
  transition:
    transform 0.25s cubic-bezier(0.34,1.56,0.64,1),
    box-shadow 0.25s ease;
  z-index: 1;
}

.ctaBtn svg {
  transition: transform 0.3s ease;
}

.ctaBtn:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 16px 40px rgba(37,99,235,0.5);
}

.ctaBtn:hover svg {
  transform: translateX(4px);
}

/* ══════════════════════════════════════════════════════════════════
   RESPONSIVE
   ══════════════════════════════════════════════════════════════════ */
@media (max-width: 768px) {
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-xl) var(--spacing-lg);
    align-items: end;
    justify-items: center;
  }

  /* Profissionais: col 1 row 1 */
  .cardBlue   { order: 1; }

  /* Publicações: col 2 row 1 */
  .cardPurple { order: 2; }

  /* Serviços: second row full width, centered, slight lift */
  .cardFeatured {
    order: 3;
    grid-column: 1 / -1;
    transform: translateY(0) !important;
  }

  .cardFeatured.visible {
    transform: translateY(0) !important;
  }

  .featuredBadge {
    position: static;
    transform: none;
    display: inline-block;
    margin-bottom: var(--spacing-sm);
  }

  .ctaBtn {
    font-size: var(--text-sm);
    padding: 16px 28px;
    letter-spacing: 0.03em;
  }

  .ctaPulse {
    max-width: 280px;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 1.5rem;
  }

  .grid {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-lg) var(--spacing-sm);
  }

  .pill {
    min-width: 120px;
    padding: 10px 20px;
  }

  .cardDesc {
    font-size: 0.75rem;
    max-width: 130px;
  }
}
</style>
