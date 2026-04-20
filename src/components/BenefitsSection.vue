<template>
  <section :class="$style.benefits" ref="sectionRef">
    <div class="container">

      <div :class="$style.grid" role="list">

        <!-- Card 1 — Maleta + gráfico -->
        <article
          :class="[$style.card, visible ? $style.visible : '']"
          style="--delay: 0s; --hover-color: rgba(37,99,235,0.08); --hover-border: #2563eb"
          role="listitem"
        >
          <div :class="[$style.cardGlow, $style.glowBlue]" aria-hidden="true" />
          <div :class="[$style.iconArea]">
            <div :class="[$style.iconFloat, $style.floatA]" aria-hidden="true">
              <svg width="96" height="96" viewBox="0 0 80 80" fill="none">
                <ellipse cx="40" cy="76" rx="22" ry="4" fill="rgba(30,64,175,0.12)"/>
                <rect x="8" y="32" width="52" height="36" rx="7" fill="#1e293b"/>
                <rect x="8" y="32" width="52" height="16" rx="6" fill="#334155"/>
                <path d="M24 32 V24 Q24 18 32 18 H36 Q44 18 44 24 V32" fill="none" stroke="#64748b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="28" y="43" width="12" height="9" rx="3" fill="#64748b"/>
                <rect x="31" y="45" width="6" height="5" rx="2" fill="#94a3b8"/>
                <rect x="34" y="52" width="7" height="10" rx="2" fill="#fbbf24"/>
                <rect x="43" y="46" width="7" height="16" rx="2" fill="#f59e0b"/>
                <rect x="52" y="40" width="7" height="22" rx="2" fill="#d97706"/>
                <polyline points="34,51 44,45 53,39" stroke="#fef3c7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <polygon points="53,39 60,43 54,47" fill="#fef3c7"/>
              </svg>
            </div>
            <!-- Partículas decorativas -->
            <span :class="[$style.spark, $style.sparkBlue1]" aria-hidden="true" />
            <span :class="[$style.spark, $style.sparkBlue2]" aria-hidden="true" />
            <span :class="[$style.spark, $style.sparkBlue3]" aria-hidden="true" />
          </div>
          <div :class="$style.textBlock">
            <h3 :class="$style.cardTitle">Conquiste melhores posições de emprego</h3>
            <p :class="$style.cardDesc">Destaque suas habilidades e resultados onde recrutadores realmente buscam talentos.</p>
          </div>
        </article>

        <!-- Card 2 — Lâmpada + documento -->
        <article
          :class="[$style.card, $style.cardCenter, visible ? $style.visible : '']"
          style="--delay: 0.15s; --hover-color: rgba(245,158,11,0.07); --hover-border: #f59e0b"
          role="listitem"
        >
          <div :class="[$style.cardGlow, $style.glowAmber]" aria-hidden="true" />
          <div :class="$style.iconArea">
            <div :class="[$style.iconFloat, $style.floatB]" aria-hidden="true">
              <svg width="96" height="96" viewBox="0 0 80 80" fill="none">
                <ellipse cx="40" cy="76" rx="22" ry="4" fill="rgba(245,158,11,0.12)"/>
                <rect x="34" y="22" width="34" height="44" rx="6" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5"/>
                <line x1="41" y1="34" x2="61" y2="34" stroke="#93c5fd" stroke-width="2.5" stroke-linecap="round"/>
                <line x1="41" y1="42" x2="61" y2="42" stroke="#bfdbfe" stroke-width="2" stroke-linecap="round"/>
                <line x1="41" y1="49" x2="58" y2="49" stroke="#bfdbfe" stroke-width="2" stroke-linecap="round"/>
                <line x1="41" y1="56" x2="55" y2="56" stroke="#bfdbfe" stroke-width="2" stroke-linecap="round"/>
                <path d="M22 38 Q14 28 20 18 Q26 8 36 12 Q46 16 44 26 Q42 32 38 36 L38 46 L28 46 L28 36 Q24 34 22 38Z" fill="url(#ben-amberGrad)"/>
                <rect x="28" y="46" width="10" height="4" rx="2" fill="#d97706"/>
                <rect x="29" y="50" width="8" height="4" rx="2" fill="#d97706"/>
                <rect x="30" y="54" width="6" height="3" rx="1.5" fill="#b45309"/>
                <path d="M30 30 Q33 26 36 30 Q33 34 30 30Z" fill="#fef9c3" opacity="0.8"/>
                <line x1="18" y1="14" x2="14" y2="10" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
                <line x1="14" y1="22" x2="8" y2="20" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
                <line x1="22" y1="10" x2="20" y2="4" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
                <defs>
                  <linearGradient id="ben-amberGrad" x1="14" y1="8" x2="44" y2="54" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#fde68a"/>
                    <stop offset="100%" stop-color="#f59e0b"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span :class="[$style.spark, $style.sparkAmber1]" aria-hidden="true" />
            <span :class="[$style.spark, $style.sparkAmber2]" aria-hidden="true" />
            <span :class="[$style.spark, $style.sparkAmber3]" aria-hidden="true" />
          </div>
          <div :class="$style.textBlock">
            <h3 :class="$style.cardTitle">Transforme seu conhecimento em autoridade</h3>
            <p :class="$style.cardDesc">Compartilhe suas habilidades e experiências e seja reconhecido como referência na sua área.</p>
          </div>
        </article>

        <!-- Card 3 — Aperto de mão -->
        <article
          :class="[$style.card, visible ? $style.visible : '']"
          style="--delay: 0.3s; --hover-color: rgba(16,185,129,0.07); --hover-border: #10b981"
          role="listitem"
        >
          <div :class="[$style.cardGlow, $style.glowGreen]" aria-hidden="true" />
          <div :class="$style.iconArea">
            <div :class="[$style.iconFloat, $style.floatC]" aria-hidden="true">
              <svg width="96" height="96" viewBox="0 0 80 80" fill="none">
                <ellipse cx="40" cy="76" rx="22" ry="4" fill="rgba(16,185,129,0.12)"/>
                <path d="M4 52 Q8 44 14 42 L28 38 L36 46 L24 50 Q18 52 14 58 Z" fill="url(#ben-handBlue)"/>
                <path d="M76 52 Q72 44 66 42 L52 38 L44 46 L56 50 Q62 52 66 58 Z" fill="url(#ben-handGold)"/>
                <path d="M36 46 L44 38 Q48 34 52 38 L44 46 Z" fill="url(#ben-handBlue)"/>
                <path d="M30 42 L38 34 Q41 31 44 34 L36 42 Z" fill="#3b82f6"/>
                <path d="M25 39 L32 31 Q35 28 38 31 L31 39 Z" fill="#60a5fa"/>
                <path d="M44 46 L36 38 Q32 34 28 38 L36 46 Z" fill="url(#ben-handGold)"/>
                <path d="M50 42 L42 34 Q39 31 36 34 L44 42 Z" fill="#f59e0b"/>
                <path d="M55 39 L48 31 Q45 28 42 31 L49 39 Z" fill="#fbbf24"/>
                <ellipse cx="40" cy="44" rx="7" ry="5" fill="#2563eb"/>
                <ellipse cx="40" cy="44" rx="4" ry="3" fill="#fbbf24"/>
                <circle cx="62" cy="28" r="3" fill="#fbbf24" opacity="0.7"/>
                <circle cx="18" cy="26" r="2.5" fill="#93c5fd" opacity="0.6"/>
                <defs>
                  <linearGradient id="ben-handBlue" x1="4" y1="38" x2="44" y2="60" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#3b82f6"/>
                    <stop offset="100%" stop-color="#1e40af"/>
                  </linearGradient>
                  <linearGradient id="ben-handGold" x1="76" y1="38" x2="36" y2="60" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#fbbf24"/>
                    <stop offset="100%" stop-color="#d97706"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span :class="[$style.spark, $style.sparkGreen1]" aria-hidden="true" />
            <span :class="[$style.spark, $style.sparkGreen2]" aria-hidden="true" />
            <span :class="[$style.spark, $style.sparkGreen3]" aria-hidden="true" />
          </div>
          <div :class="$style.textBlock">
            <h3 :class="$style.cardTitle">Ofereça seus serviços e conquiste mais clientes</h3>
            <p :class="$style.cardDesc">Seja encontrado por quem precisa exatamente do que você oferece.</p>
          </div>
        </article>

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
    { threshold: 0.15 }
  )
  if (sectionRef.value) observer.observe(sectionRef.value)
})
</script>

<style module>
/* ══════════════════════════════════════════════════════════════════════════
   BenefitsSection
   ══════════════════════════════════════════════════════════════════════════ */

.benefits {
  padding: var(--spacing-xl) 0 var(--spacing-2xl);
  background-color: var(--bg-secondary);
}

/* ── Grid ─────────────────────────────────────────────────────────────── */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
}

/* ── Card ─────────────────────────────────────────────────────────────── */
.card {
  position: relative;
  overflow: hidden;
  background: white;
  border: 1.5px solid var(--border);
  border-radius: 20px;
  padding: var(--spacing-xl) var(--spacing-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  text-align: center;
  cursor: default;
  /* entrance */
  opacity: 0;
  transform: translateY(36px);
  transition:
    opacity 0.6s ease var(--delay, 0s),
    transform 0.65s cubic-bezier(0.34, 1.4, 0.64, 1) var(--delay, 0s),
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    background 0.3s ease;
}

.card.visible {
  opacity: 1;
  transform: translateY(0);
}

.card:hover {
  border-color: var(--hover-border, var(--primary));
  background: var(--hover-color, rgba(37,99,235,0.04));
  box-shadow: 0 16px 40px rgba(0,0,0,0.08), 0 0 0 1px var(--hover-border, var(--primary));
  transform: translateY(-6px);
}

.card.visible:hover {
  transform: translateY(-6px);
}

/* ── Glow background ──────────────────────────────────────────────────── */
.cardGlow {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
  filter: blur(40px);
}

.card:hover .cardGlow { opacity: 1; }

.glowBlue  { background: rgba(37, 99, 235, 0.15); }
.glowAmber { background: rgba(245, 158, 11, 0.18); }
.glowGreen { background: rgba(16, 185, 129, 0.15); }

/* ── Icon area ────────────────────────────────────────────────────────── */
.iconArea {
  position: relative;
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Float animations ─────────────────────────────────────────────────── */
@keyframes floatA {
  0%, 100% { transform: translateY(0)    rotate(-1.5deg); }
  50%       { transform: translateY(-10px) rotate(1.5deg); }
}
@keyframes floatB {
  0%, 100% { transform: translateY(-3px) rotate(1deg); }
  50%       { transform: translateY(-14px) rotate(-1.5deg); }
}
@keyframes floatC {
  0%, 100% { transform: translateY(-1px) rotate(2deg); }
  50%       { transform: translateY(-12px) rotate(-1deg); }
}

.iconFloat {
  filter: drop-shadow(0 8px 16px rgba(0,0,0,0.14));
  transition: filter 0.3s ease, transform 0.3s ease;
}

.floatA { animation: floatA 3.8s ease-in-out infinite; }
.floatB { animation: floatB 3.3s ease-in-out infinite; }
.floatC { animation: floatC 4.2s ease-in-out infinite; }

.card:hover .iconFloat {
  filter: drop-shadow(0 14px 24px rgba(0,0,0,0.2));
  animation-play-state: paused;
  transform: scale(1.1) translateY(-4px) !important;
}

/* ── Sparkles ─────────────────────────────────────────────────────────── */
.spark {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

@keyframes sparkPop {
  0%   { transform: scale(0) translate(0, 0);   opacity: 0; }
  40%  { opacity: 1; }
  100% { transform: scale(1) translate(var(--tx), var(--ty)); opacity: 0; }
}

.sparkBlue1  { width: 6px; height: 6px; background: #2563eb; --tx: -22px; --ty: -18px; top: 20%; left: 10%; animation: sparkPop 2.4s ease-out infinite; }
.sparkBlue2  { width: 5px; height: 5px; background: #fbbf24; --tx:  18px; --ty: -24px; top: 10%; right: 12%; animation: sparkPop 2.4s ease-out 0.8s infinite; }
.sparkBlue3  { width: 4px; height: 4px; background: #93c5fd; --tx:  24px; --ty:   8px; bottom: 20%; right: 8%; animation: sparkPop 2.4s ease-out 1.6s infinite; }

.sparkAmber1 { width: 6px; height: 6px; background: #f59e0b; --tx: -20px; --ty: -20px; top: 15%; left: 8%;  animation: sparkPop 2.2s ease-out infinite; }
.sparkAmber2 { width: 5px; height: 5px; background: #fde68a; --tx:  22px; --ty: -18px; top: 8%;  right: 10%; animation: sparkPop 2.2s ease-out 0.7s infinite; }
.sparkAmber3 { width: 4px; height: 4px; background: #d97706; --tx:  18px; --ty:  12px; bottom: 18%; right: 6%; animation: sparkPop 2.2s ease-out 1.4s infinite; }

.sparkGreen1 { width: 6px; height: 6px; background: #10b981; --tx: -18px; --ty: -22px; top: 18%; left: 6%;  animation: sparkPop 2.6s ease-out infinite; }
.sparkGreen2 { width: 5px; height: 5px; background: #fbbf24; --tx:  20px; --ty: -20px; top: 10%; right: 8%; animation: sparkPop 2.6s ease-out 0.9s infinite; }
.sparkGreen3 { width: 4px; height: 4px; background: #34d399; --tx:  22px; --ty:  10px; bottom: 22%; right: 5%; animation: sparkPop 2.6s ease-out 1.8s infinite; }

/* ── Text block ───────────────────────────────────────────────────────── */
.textBlock {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.cardTitle {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-primary);
  line-height: var(--leading-tight);
  margin: 0;
}

.cardDesc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin: 0;
}

/* ══════════════════════════════════════════════════════════════════════════
   RESPONSIVE
   ══════════════════════════════════════════════════════════════════════════ */
@media (max-width: 900px) {
  .benefits {
    padding: var(--spacing-3xl) 0;
  }
  .grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  .card {
    flex-direction: row;
    text-align: left;
    align-items: flex-start;
    gap: var(--spacing-lg);
  }
  .iconArea {
    flex-shrink: 0;
  }
  .cardGlow {
    display: none;
  }
}

@media (max-width: 480px) {
  .card {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: var(--spacing-lg);
  }
}
</style>
